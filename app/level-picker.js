const LevelPicker={
 open({page,current,max,onSelect,label='Level',description='Your attempts are kept when you switch levels.'}){
  const d=document.createElement('dialog');d.className='shared-dialog';
  const h=document.createElement('h2');h.textContent='Choose a '+label.toLowerCase();
  const p=document.createElement('p');p.textContent=description;
  const form=document.createElement('form'),field=document.createElement('label'),input=document.createElement('input');
  field.textContent=label+' (1–'+max+') ';input.type='number';input.min='1';input.max=String(max);input.step='1';input.required=true;input.inputMode='numeric';input.value=String(current);field.append(input);
  const play=document.createElement('button');play.type='submit';play.textContent='Play';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';cancel.onclick=()=>d.close();
  form.append(field,play,cancel);d.append(h,p,form);page.append(d);
  const previous=document.activeElement;
  d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus();});
  form.onsubmit=e=>{e.preventDefault();if(!input.checkValidity()){input.reportValidity();return;}const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>max)return;if(n!==current)onSelect(n);d.close();};
  d.showModal();input.focus();input.select();return d;
 }
};
