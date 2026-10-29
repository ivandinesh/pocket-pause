// One Home entry; full notice markup is embedded by patch_credits.py.
(()=>{
 const foot=document.querySelector('.home-foot');
 if(!foot||document.getElementById('creditsLicensesButton'))return;
 const button=document.createElement('button');
 button.id='creditsLicensesButton';button.className='mit-credit-link';
 button.type='button';button.textContent='Credits & licenses';
 button.setAttribute('aria-haspopup','dialog');
 button.setAttribute('aria-controls','creditsDialog');
 foot.insertAdjacentElement('afterend',button);
 const dialog=document.getElementById('creditsDialog');
 button.addEventListener('click',()=>dialog.showModal());
 dialog.addEventListener('close',()=>button.focus());
})();
