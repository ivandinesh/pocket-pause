const fs = require('fs');
const html = require('./release_source.cjs').html();

function must(text, message) {
  if (!html.includes(text)) throw new Error(message);
}
function mustNot(text, message) {
  if (html.includes(text)) throw new Error(message);
}

must('<!-- DOPOP_FARO_BASELINE -->', 'Faro baseline marker missing');
must("host !== 'dopop.fun' && host !== 'www.dopop.fun'", 'Faro must be production-host gated');
must("localStorage.getItem('dopop.analytics.disabled') === '1'", 'Faro must respect analytics opt-out before loading');
must('@grafana/faro-web-sdk@2.13.0/dist/bundle/faro-web-sdk.iife.js', 'Faro SDK must be pinned');
must('samplingRate: 1.0', 'Faro sampling must stay at 100% for now');
must('captureConsole: false', 'Console capture must stay disabled');
must('faro-collector-prod-us-central-0.grafana.net/collect/0bcb5bd4ff070ee3b3f5631842db8da4', 'Faro collector URL missing');
must('id="privacyAnalyticsDialog"', 'Privacy dialog missing');
must('We collect error, performance and limited usage analytics to help improve DoPop.', 'Simple analytics disclosure missing');
must("button.textContent='Privacy & analytics'", 'Privacy footer button missing');
must("document.getElementById('homeLegal')||document.querySelector('.home-foot')", 'Privacy control must use the shared legal row');
must("credits.after(button)", 'Privacy and credits remain together');
mustNot("document.createTextNode(' · ')", 'Footer mounting must not add stray separator dots');
must('new MutationObserver', 'Privacy control must tolerate a footer created after its script runs');
must("document.addEventListener('DOMContentLoaded',mount,{once:true})", 'Privacy control must retry after DOM ready');
must("var KEY='dopop.analytics.disabled'", 'Privacy toggle storage key missing');
must('No analytics are collected', 'Privacy disabled-state explanation missing');
mustNot('FARO_API_KEY', 'FARO_API_KEY must never be exposed in browser output');
mustNot('TracingInstrumentation', 'Tracing must stay disabled in baseline');
mustNot('ReplayInstrumentation', 'Session replay must stay disabled in baseline');

console.log('PASS: Faro is production-only, 100% sampled, non-secret, opt-out aware, with delayed footer mounting and privacy controls present.');

must("script.integrity='sha384-bjae8Oy0Fku2zDeCzCQLszzUFKofMfaN2Cz/K/j7zQFoUK/omScLytTOsbtQ+ZW0'", 'Faro SDK requires a verified integrity hash');
must("script.crossOrigin='anonymous'", 'Cross-origin integrity requires CORS');
