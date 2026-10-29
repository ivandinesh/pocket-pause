"""Generate a complete, hash-verified offline release using only the Python standard library."""
import hashlib,json,struct,zlib
from pathlib import Path
root=Path('dist');root.mkdir(exist_ok=True)
def png(size):
    # Original dopop dot-mark; generous maskable-icon safe area.
    dots=[(x,y) for y in range(3) for x in range(3) if (x,y)!=(0,0)]
    rows=[]
    for y in range(size):
        row=bytearray()
        for x in range(size):
            hit=any((x/size-(.32+dx*.18))**2+(y/size-(.32+dy*.18))**2<.066**2 for dx,dy in dots)
            row.extend((79,120,236,255) if hit else (249,251,255,255))
        rows.append(b'\0'+row)
    def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows),9))+chunk(b'IEND',b'')
for size in (180,192,512):(root/f'icon-{size}.png').write_bytes(png(size))
manifest={'id':'/','name':'dopop — little games, good moments','short_name':'dopop','description':'Calm little games, ready to play offline.','start_url':'/','scope':'/','display':'standalone','background_color':'#ffffff','theme_color':'#ffffff','lang':'en','icons':[{'src':f'/icon-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'any maskable'}for n in (192,512)]}
(root/'manifest.webmanifest').write_text(json.dumps(manifest))
p=root/'index.html';s=p.read_text();assert 'id="offlineTools"' not in s and 'Preparing offline play' not in s
head='<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="dopop"><meta name="apple-mobile-web-app-status-bar-style" content="default">'
s=s.replace('</head>',head+'<style>'+Path('pwa/style.css').read_text()+'</style></head>')
s=s.replace('</body>','<script type="module">'+Path('pwa/client.js').read_text()+'</script></body>');p.write_text(s)
assets=[{'url':'/','sha':hashlib.sha256(p.read_bytes()).hexdigest()}]
for name in ('manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'):assets.append({'url':'/'+name,'sha':hashlib.sha256((root/name).read_bytes()).hexdigest()})
template=Path('pwa/sw.js').read_text();release=hashlib.sha256((json.dumps(assets)+template).encode()).hexdigest()[:20]
(root/'sw.js').write_text(template.replace('__RELEASE__',json.dumps(release)).replace('__ASSETS__',json.dumps(assets)))
(root/'offline-release.json').write_text(json.dumps({'release':release,'assets':assets},indent=2))
print(f'Offline release {release}: {len(assets)} verified assets, {sum((root/("index.html" if a["url"]=="/" else a["url"][1:])).stat().st_size for a in assets)} bytes')
