import json
import os
from pathlib import Path

path = Path('index.html')
html = path.read_text()
marker = '<!-- DOPOP_FARO_BASELINE -->'
if marker in html:
    raise SystemExit('Faro baseline already injected')

commit = (os.environ.get('VERCEL_GIT_COMMIT_SHA') or '1.0.0').strip()
version = commit[:12] if commit != '1.0.0' else commit

snippet = f'''{marker}
<script>
(function(){{
  var host = window.location.hostname;
  if (host !== 'dopop.fun' && host !== 'www.dopop.fun') return;
  try {{
    if (localStorage.getItem('dopop.analytics.disabled') === '1') return;
  }} catch (_) {{}}

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://unpkg.com/@grafana/faro-web-sdk@2.13.0/dist/bundle/faro-web-sdk.iife.js';
  script.onload = function(){{
    try {{
      var sdk = window.GrafanaFaroWebSdk;
      if (!sdk || !sdk.initializeFaro || !sdk.getWebInstrumentations) return;
      sdk.initializeFaro({{
        url: 'https://faro-collector-prod-us-central-0.grafana.net/collect/0bcb5bd4ff070ee3b3f5631842db8da4',
        app: {{
          name: 'dopop',
          version: {json.dumps(version)},
          environment: 'production'
        }},
        sessionTracking: {{
          samplingRate: 1.0
        }},
        instrumentations: sdk.getWebInstrumentations({{
          captureConsole: false
        }})
      }});
    }} catch (_) {{
      // Observability must never interfere with gameplay.
    }}
  }};
  script.onerror = function(){{
    // Faro is optional. DoPop remains fully functional if the CDN is unavailable.
  }};
  document.head.appendChild(script);
}})();
</script>
'''

needle = '</head>'
if needle not in html:
    raise SystemExit('Missing </head> in index.html')
path.write_text(html.replace(needle, snippet + needle, 1))
print('Added production-only Grafana Faro baseline')
