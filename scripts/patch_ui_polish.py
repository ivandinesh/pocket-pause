from pathlib import Path
import json
from urllib.parse import urlparse
p=Path('index.html');s=p.read_text()
s=s.replace('</head>','<style id="uiPolishStyles">'+Path('games/ui-polish.css').read_text()+'</style></head>')
config=json.loads(Path('feedback-config.json').read_text())
url=config.get('formUrl','')
parsed=urlparse(url)
allowed=(parsed.hostname=='docs.google.com' and parsed.path.startswith('/forms/d/e/') and parsed.path.endswith('/viewform')) or (parsed.hostname=='forms.gle' and len(parsed.path)>1) or (parsed.hostname=='tally.so' and parsed.path.startswith('/r/'))
if url and (parsed.scheme!='https' or parsed.username or parsed.password or parsed.port or not allowed):
    raise ValueError('Feedback URL must be an HTTPS Google Forms or Tally responder URL')
if url:
    code="const feedback=document.createElement('a');feedback.id='feedbackLink';feedback.textContent='Feedback & game requests';feedback.href="+json.dumps(url)+";feedback.target='_blank';feedback.rel='noopener noreferrer';document.querySelector('.home-foot').append(feedback);"
    s=s.replace('</script>',code+'\n</script>',1)
p.write_text(s)
