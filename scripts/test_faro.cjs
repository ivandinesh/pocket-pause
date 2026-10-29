const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

function must(text, message) {
  if (!html.includes(text)) throw new Error(message);
}
function mustNot(text, message) {
  if (html.includes(text)) throw new Error(message);
}

must('<!-- DOPOP_FARO_BASELINE -->', 'Faro baseline marker missing');
must("host !== 'dopop.fun' && host !== 'www.dopop.fun'", 'Faro must be production-host gated');
must('@grafana/faro-web-sdk@2.13.0/dist/bundle/faro-web-sdk.iife.js', 'Faro SDK must be pinned');
must('samplingRate: 0.1', 'Faro sampling must stay at 10%');
must('captureConsole: false', 'Console capture must stay disabled');
must('faro-collector-prod-us-central-0.grafana.net/collect/0bcb5bd4ff070ee3b3f5631842db8da4', 'Faro collector URL missing');
mustNot('FARO_API_KEY', 'FARO_API_KEY must never be exposed in browser output');
mustNot('TracingInstrumentation', 'Tracing must stay disabled in baseline');
mustNot('ReplayInstrumentation', 'Session replay must stay disabled in baseline');

console.log('PASS: Faro is production-only, sampled, non-secret, and has tracing/replay/console capture disabled.');
