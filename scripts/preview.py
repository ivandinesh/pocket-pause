"""Local-only static preview, including Vercel's clean HTML URLs."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import os
root=Path(__file__).resolve().parent.parent/'dist'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def translate_path(self,path):
        file=super().translate_path(path)
        return file+'.html'if Path(file+'.html').is_file()else file
ThreadingHTTPServer(('127.0.0.1',int(os.environ.get('DOPOP_PREVIEW_PORT','8765'))),Handler).serve_forever()
