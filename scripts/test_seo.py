"""Check the crawlable link graph and factual metadata, independent of JS rendering."""
from pathlib import Path
from html.parser import HTMLParser
import json,struct,xml.etree.ElementTree as ET,os
root=Path('dist');games=json.loads(Path('seo/games.json').read_text());origin='https://www.dopop.fun'
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.links=[];self.metas=[];self.h1=[];self.title='';self.scripts=[];self.current=None;self.feed(text)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag in ('a','link'):self.links.append((tag,attrs))
  if tag=='meta':self.metas.append(attrs)
  if tag in ('h1','title','script'):self.current=(tag,attrs,'')
 def handle_data(self,data):
  if self.current:self.current=(self.current[0],self.current[1],self.current[2]+data)
 def handle_endtag(self,tag):
  if self.current and self.current[0]==tag:
   _,attrs,text=self.current
   if tag=='title':self.title=text
   if tag=='h1':self.h1.append(text)
   if tag=='script':self.scripts.append((attrs,text))
   self.current=None
paths={'/':root/'index.html','/games':root/'games.html',**{'/games/'+g['slug']:root/'games'/(g['slug']+'.html')for g in games}}
assert len(games)==24 and len({g['id']for g in games})==24 and len({g['slug']for g in games})==24
assert len({g['summary']for g in games})==24
index=Page(paths['/'].read_text());assert index.title.startswith('DoPop — Free')
assert any(attrs.get('href')=='/games'for tag,attrs in index.links if tag=='a')
directory=Page(paths['/games'].read_text());targets={a.get('href')for tag,a in directory.links if tag=='a'}
assert all('/games/'+g['slug']in targets for g in games)
titles=set()
for path,file in paths.items():
 text=file.read_text();page=Page(text);assert page.title not in titles; titles.add(page.title)
 assert page.h1 if path=='/'else len(page.h1)==1,(path,page.h1)
 canonical=[attrs['href']for tag,attrs in page.links if tag=='link'and attrs.get('rel')=='canonical'];assert canonical==[origin+path],path
 descriptions=[m['content']for m in page.metas if m.get('name')=='description'];assert len(descriptions)==1 and len(descriptions[0])>50,path
 robots=[m['content']for m in page.metas if m.get('name')=='robots'];assert robots==[('noindex,follow'if os.environ.get('VERCEL_ENV')=='preview'else'index,follow')]
 assert any(m.get('property')=='og:image'and m['content']==origin+'/social-card.png'for m in page.metas)
 schemas=[json.loads(content)for attrs,content in page.scripts if attrs.get('type')=='application/ld+json'];assert schemas,path
 assert 'aggregateRating'not in json.dumps(schemas)and'reviewRating'not in json.dumps(schemas)
 if path.startswith('/games/'):
  game=next(g for g in games if path.endswith('/'+g['slug']));assert page.h1==[game['name']]
  assert any(attrs.get('href')=='/?game='+game['id']for tag,attrs in page.links if tag=='a'),path
  assert 'How to play'in text and 'Controls and progress'in text
  assert file.stat().st_size<30000,(path,'Guide exceeded lightweight HTML budget')
 for tag,attrs in page.links:
  href=attrs.get('href','')
  if tag=='a'and href.startswith('/games'):assert href in paths,(path,href)
urls={e.text for e in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert urls=={origin+path for path in paths}
assert 'Sitemap: '+origin+'/sitemap.xml'in(root/'robots.txt').read_text()
assert 'Disallow: /'not in(root/'robots.txt').read_text()
png=(root/'social-card.png').read_bytes();assert png.startswith(b'\x89PNG');assert struct.unpack('!2I',png[16:24])==(1200,630)
for name in ('guide.css','guide-client.js','theme.js','theme-colors.js'):assert(root/name).is_file()
assert 'cleanUrls'in json.loads(Path('vercel.json').read_text())
print('PASS: 26 indexable routes, unique metadata, raw-HTML guide links/content, valid JSON-LD, no invented ratings, sitemap/robots, lightweight pages and social card.')
