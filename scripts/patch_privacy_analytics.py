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
  <p>DoPop uses a small amount of anonymous technical telemetry to understand crashes and real-world performance. We do not use ads, marketing profiles, session replay or cross-site tracking.</p>
  <p>When analytics is enabled, a sampled portion of visits may send browser performance information and unhandled errors to Grafana Cloud. Game progress, saved boards, words you enter and other gameplay content are not sent.</p>
  <div class="privacy-state"><strong id="privacyAnalyticsState">Analytics enabled</strong><span id="privacyAnalyticsHint">Helps improve reliability</span></div>
  <div class="privacy-actions">
    <button type="button" class="soft-button" id="privacyAnalyticsToggle">Disable analytics</button>
    <form method="dialog"><button class="soft-button">Done</button></form>
  </div>
</dialog>
'''

script='''<script>
(function(){
  var KEY='dopop.analytics.disabled';
  var mounted=false;
  function disabled(){try{return localStorage.getItem(KEY)==='1';}catch(_){return false;}}
  function mount(){
    if(mounted||document.getElementById('privacyAnalyticsButton'))return true;
    var foot=document.querySelector('.home-foot');
    var dialog=document.getElementById('privacyAnalyticsDialog');
    if(!foot||!dialog)return false;
    var button=document.createElement('button');
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
    var state=document.getElementById('privacyAnalyticsState');
    var hint=document.getElementById('privacyAnalyticsHint');
    var toggle=document.getElementById('privacyAnalyticsToggle');
    function render(){
      var off=disabled();
      state.textContent=off?'Analytics disabled':'Analytics enabled';
      hint.textContent=off?'No Faro telemetry is loaded':'10% sampled technical telemetry';
      toggle.textContent=off?'Enable analytics':'Disable analytics';
    }
    button.addEventListener('click',function(){render();dialog.showModal();});
    dialog.addEventListener('close',function(){button.focus();});
    toggle.addEventListener('click',function(){
      try{if(disabled())localStorage.removeItem(KEY);else localStorage.setItem(KEY,'1');}catch(_){}
      location.reload();
    });
    render();
    mounted=true;
    return true;
  }
  if(!mount()){
    var observer=new MutationObserver(function(){if(mount())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
    setTimeout(function(){if(mount())observer.disconnect();},0);
  }
})();
</script>'''

s=s.replace('</head>',css+'</head>',1)
s=s.replace('</body>',markup+script+'</body>',1)
p.write_text(s)
print('Added privacy and analytics footer control')
