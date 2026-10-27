// Shared input ownership and explicit arcade resume. Puzzle boards remain static.
const GameSession=(()=>{
 const paused=new Set(),arcade=new Set(['snake','tetris','pac']);
 const current=()=>document.querySelector('.page.active')?.id.replace(/Page$/,'');
 const dialogOpen=()=>!!document.querySelector('dialog[open]');
 function pause(id=current()){
  if(!arcade.has(id))return;paused.add(id);
  const page=document.getElementById(id+'Page');if(!page||page.querySelector('[data-resume]'))return;
  const button=document.createElement('button');button.dataset.resume='';button.className='soft-button';button.textContent='Resume';
  button.onclick=()=>{if(document.hidden||dialogOpen())return;paused.delete(id);button.remove();};
  page.querySelector('.game-heading').append(button);
 }
 function canPlay(id){return !document.hidden&&!dialogOpen()&&!paused.has(id);}
 function blocksInput(target){return document.hidden||dialogOpen()||paused.has(current())||!!target?.closest?.('input,textarea,select,[contenteditable="true"]');}
 document.addEventListener('keydown',e=>{if(blocksInput(e.target)&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){if(dialogOpen())return;e.stopImmediatePropagation();}else if(blocksInput(e.target))e.stopImmediatePropagation();},true);
 // Dialog keyboard events must keep browser defaults but never reach game listeners.
 document.addEventListener('keydown',e=>{if(dialogOpen())e.stopImmediatePropagation();},true);
 const open=HTMLDialogElement.prototype.showModal;
 HTMLDialogElement.prototype.showModal=function(){pause();return open.call(this);};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 return {pause,canPlay,blocksInput};
})();
