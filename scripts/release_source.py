"""Test-only view of packaged executable source; never used to serve a page."""
from pathlib import Path
import re
def html():
    root=Path('dist')
    return re.sub(r'<script\b([^>]*?)\s+src="(/[^"?]+)"([^>]*)></script>',lambda m:'<script'+m[1]+m[3]+'>'+(root/m[2][1:]).read_text()+'</script>',(root/'index.html').read_text())
