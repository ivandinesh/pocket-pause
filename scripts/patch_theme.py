"""Tokenize presentation colors without changing game engines, levels or save contracts."""
from pathlib import Path
import json,re,subprocess
p=Path('index.html');s=p.read_text()
assert 'id="dopopThemeInit"' not in s
# Use the same JS palette for generated CSS and colors created by games at runtime.
styles=re.findall(r'(<style\b[^>]*>)(.*?)(</style>)',s,re.S)
styles.append(('',Path('pwa/style.css').read_text(),''))
js=Path('app/theme-colors.js').read_text()+r'''
const fs=require('fs'),input=JSON.parse(fs.readFileSync(0,'utf8')),palette={};
const output=input.map(css=>css.replace(/(--[\w-]+|[\w-]+)\s*:\s*([^;{}]+)/g,(all,property,value)=>property+':'+DoPopThemeColors.transform(value,DoPopThemeColors.role(property),(key,value)=>palette[key]=value)));
process.stdout.write(JSON.stringify({output,palette}));
'''
compiled=json.loads(subprocess.run(['node','-e',js],input=json.dumps([style[1] for style in styles]),capture_output=True,text=True,check=True).stdout)
index=iter(compiled['output'][:-1])
s=re.sub(r'(<style\b[^>]*>)(.*?)(</style>)',lambda m:m[1]+next(index)+m[3],s,flags=re.S)
Path('pwa/style.css').write_text(compiled['output'][-1])
palette=':root[data-theme="dark"]{'+''.join(k+':'+v+';' for k,v in compiled['palette'].items())+'}'
s=s.replace('</head>','<style id="dopopThemeStyles">'+palette+Path('app/theme.css').read_text()+'</style></head>')
init='<script id="dopopThemeInit">'+Path('app/theme-colors.js').read_text()+'\n'+Path('app/theme.js').read_text()+'</script>\n'
s=s.replace('  <style>',init+'  <style>',1)
# Repaint static canvas boards on OS/theme changes, without advancing their clocks.
repaint="\ndocument.addEventListener('dopop-theme-change',()=>{if(currentPage==='snake')drawSnake();if(currentPage==='tetris')drawTetris();if(currentPage==='zipLine')zipDraw();});\n"
pos=s.index('<script type="module">')
end=s.index('</script>',pos)
s=s[:end]+repaint+s[end:]
needle="$('pacBack').onclick="
assert needle in s
s=s.replace(needle,"document.addEventListener('dopop-theme-change',draw);"+needle,1)
p.write_text(s)
