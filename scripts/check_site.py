"""Read-only deployment smoke check. Run after publishing; does not submit indexing requests."""
import argparse,json,re,sys,urllib.request,urllib.error,xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit
parser=argparse.ArgumentParser();parser.add_argument('--base-url',default='https://www.dopop.fun');args=parser.parse_args();base=args.base_url.rstrip('/')
parts=urlsplit(base)
if parts.scheme not in ('http','https')or not parts.netloc or parts.query or parts.fragment:parser.error('Use an HTTP(S) origin without query or fragment')
errors=[]
def read(path):
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,headers={'User-Agent':'DoPop deployment check'}),timeout=20)as response:
   if response.status!=200:raise ValueError('HTTP '+str(response.status))
   return response.read().decode()
 except Exception as error:errors.append(path+': '+str(error));return ''
robots=read('/robots.txt');sitemap=read('/sitemap.xml');html=read('/')
if not robots or not sitemap or not html:
 if not errors:errors.append('A required search document is empty')
 print('\n'.join('FAIL '+error for error in errors));sys.exit(1)
if 'Sitemap: https://www.dopop.fun/sitemap.xml'not in robots:errors.append('robots.txt sitemap declaration missing')
try:urls=[e.text for e in ET.fromstring(sitemap).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
except ET.ParseError:urls=[];errors.append('Invalid sitemap XML')
games=json.loads((Path(__file__).resolve().parent.parent/'seo/games.json').read_text())
expected=['/','/games']+['/games/'+g['slug']for g in games]
if set(urls)!={'https://www.dopop.fun'+p for p in expected}:errors.append('Sitemap URLs differ from the 24-game catalogue')
for path in expected:
 body=html if path=='/'else read(path)
 if 'rel="canonical" href="https://www.dopop.fun'+path+'"'not in body:errors.append(path+': canonical URL missing')
 if 'content="noindex' in body:errors.append(path+': noindex is present')
 if not re.search(r'<title>[^<]+</title>',body):errors.append(path+': title missing')
try:urllib.request.urlopen(base+'/games/this-game-does-not-exist',timeout=20);errors.append('Unknown game returned success instead of 404')
except urllib.error.HTTPError as error:
 if error.code!=404:errors.append('Unknown game returned HTTP '+str(error.code))
except Exception as error:errors.append('Unknown-route check: '+str(error))
if errors:
 print('\n'.join('FAIL '+error for error in errors));sys.exit(1)
print('PASS: production root, directory, 24 guides, canonical metadata, robots/sitemap and real 404 behavior.')
