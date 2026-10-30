"""Test-only view of packaged executable source; never used to serve a page."""
from pathlib import Path
from html_scripts import Scripts
from html import escape
def html():
    root=Path('dist').resolve();source=(root/'index.html').read_text()
    for script in reversed(Scripts(source).scripts):
        attrs=dict(script.attrs);url=attrs.get('src','')
        if not url.startswith('/'):continue
        file=(root/url[1:]).resolve()
        if not file.is_relative_to(root):raise ValueError('Script outside release directory')
        attributes=''.join(' '+key+(''if value is None else '="'+escape(value,quote=True)+'"')for key,value in script.attrs if key!='src')
        source=source[:script.start]+'<script'+attributes+'>'+file.read_text()+'</script>'+source[script.end:]
    return source
