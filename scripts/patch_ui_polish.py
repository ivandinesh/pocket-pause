from pathlib import Path
import json
p=Path('index.html');s=p.read_text()
s=s.replace('</head>','<style id="uiPolishStyles">'+Path('games/ui-polish.css').read_text()+'</style></head>')
config=json.loads(Path('feedback-config.json').read_text())
url=config.get('formUrl','')
if url and not url.startswith('https://tally.so/r/'):
    raise ValueError('Feedback URL must be a Tally form HTTPS URL')
if url:
    code="const feedback=document.createElement('a');feedback.id='feedbackLink';feedback.textContent='Feedback & game requests';feedback.href="+json.dumps(url)+";feedback.target='_blank';feedback.rel='noopener noreferrer';document.querySelector('.home-foot').append(feedback);"
    s=s.replace('</script>',code+'\n</script>',1)
p.write_text(s)
