from pathlib import Path

p=Path('index.html')
s=p.read_text()
assert 'id="privacyAnalyticsDialog"' not in s

css='''<style>
#privacyAnalyticsDialog{box-sizing:border-box;width:min(560px,calc(100% - 24px));max-height:85dvh;overflow:auto;padding:24px;border:1px solid #dfe7f8;border-radius:24px;background:#fff;color:#33415e}
#privacyAnalyticsDialog::backdrop{background:#26334d66}#privacyAnalyticsDialog h2{margin:0 0 12px;font-size:24px}#privacyAnalyticsDialog p{line-height:1.6}#privacyAnalyticsDialog .privacy-state{margin:18px 0;padding:14px 16px;border-radius:14px;background:#f5f7fb;display:flex;align-items:center;justify-content:space-between;gap:16px}#privacyAnalyticsDialog .privacy-state strong{font-size:14px}#privacyAnalyticsDialog .privacy-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}#privacyAnalyticsDialog button{min-height:44px;padding:10px 18px}#privacyAnalyticsButton{display:inline-flex;align-items:center;min-height:44px;padding:0 8px;color:#315ec7}#privacyAnalyticsDialog :focus-visible,#privacyAnalyticsButton:focus-visible{outline:2px solid #315ec7;outline-offset:3px}
</style>'''

markup='''
<dialog id="privacyAnalyticsDialog" aria-labelledby="privacyAnalyticsTitle">
  <h2 id="privacyAnalyticsTitle" tabindex="-1" autofocus>Privacy &amp; analytics</h2>
  <p>We collect anonymous error and usage analytics to help improve DoPop.</p>
  <div class="privacy-state"><strong id="privacyAnalyticsState">Analytics enabled</strong><span id="privacyAnalyticsHint">Helps improve DoPop</span></div>
  <div class="privacy-actions">
    <button type="button" class="soft-button" id="privacyAnalyticsToggle">Disable analytics</button>
    <form method="dialog"><button class="soft-button">Done</button></form>
  </div>
</dialog>
'''

script='''<script>
(function(){
  var KEY='dopop.analytics.disabled';
  var dialog=document.getElementById('privacyAnalyticsDialog');
  var state=document.getElementById('privacyAnalyticsState');
  var hint=document.getElementById('privacyAnalyticsHint');
  var toggle=document.getElementById('privacyAnalyticsToggle');
  if(!dialog||!state||!hint||!toggle)return;

  function disabled(){try{return localStorage.getItem(KEY)==='1';}catch(_){return false;}}
  function render(){
    var off=disabled();
    state.textContent=off?'Analytics disabled':'Analytics enabled';
    hint.textContent=off?'No analytics are collected':'Helps improve DoPop';
    toggle.textContent=off?'Enable analytics':'Disable analytics';
  }
  function wire(button){
    if(button.dataset.privacyWired==='1')return;
    button.dataset.privacyWired='1';
    button.addEventListener('click',function(){render();dialog.showModal();});
  }
  function mount(){
    var foot=document.querySelector('.home-foot');
    if(!foot)return false;
    var button=document.getElementById('privacyAnalyticsButton');
    if(!button||button.parentNode!==foot){
      if(button)button.remove();
      button=document.createElement('button');
      button.id='privacyAnalyticsButton';
      button.type='button';
      button.className='text-button';
      button.textContent='Privacy & analytics';
      var credits=document.getElementById('creditsLicensesButton');
      if(credits&&credits.parentNode===foot){
        credits.after(document.createTextNode(' · '),button);
      }else{
        if(foot.childNodes.length)foot.append(document.createTextNode(' · '));
        foot.append(button);
      }
    }
    wire(button);
    return true;
  }

  render();
  mount();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  var observer=new MutationObserver(function(){mount();});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',mount);

  dialog.addEventListener('close',function(){
    var button=document.getElementById('privacyAnalyticsButton');
    if(button)button.focus();
  });
  toggle.addEventListener('click',function(){
    try{if(disabled())localStorage.removeItem(KEY);else localStorage.setItem(KEY,'1');}catch(_){}
    location.reload();
  });
})();
</script>'''

s=s.replace('</head>',css+'</head>',1)
s=s.replace('</body>',markup+script+'</body>',1)
p.write_text(s)
print('Added privacy and analytics footer control')
