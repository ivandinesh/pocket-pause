// Movement is an explicit start/resume gesture. Dialogs and background tabs pause.
const GameSession=(()=>{
 const paused=new Set(),arcade=new Set(['snake','tetris','pac']);
 const current=()=>document.querySelector('.page.active')?.id.replace(/Page$/,'');
 const dialogOpen=()=>!!document.querySelector('dialog[open]');
 const editable=target=>!!target?.closest?.('input,textarea,select,[contenteditable="true"]');
 function pause(id=current()){if(arcade.has(id))paused.add(id);}
 function resume(id){
  if(current()!==id||document.hidden||dialogOpen())return false;
  if(paused.delete(id))document.dispatchEvent(new CustomEvent('dopop-resume',{detail:id}));
  return true;
 }
 function canPlay(id){return !document.hidden&&!dialogOpen()&&!paused.has(id);}
 function blocksInput(target){return document.hidden||dialogOpen()||paused.has(current())||editable(target);}
 document.addEventListener('keydown',e=>{
  if(document.hidden||dialogOpen()||editable(e.target)){e.stopImmediatePropagation();return;}
  const id=current(),movement=id==='snake'?/^(Arrow(Up|Down|Left|Right)|[wasd])$/.test(e.key):id==='tetris'?/^(Arrow(Up|Down|Left|Right)| )$/.test(e.key):id==='pac'?/^Arrow(Up|Down|Left|Right)$/.test(e.key):false;
  if(paused.has(id)){
   if(!movement||e.repeat){if(movement)e.preventDefault();e.stopImmediatePropagation();return;}
   resume(id);
  }
 },true);
 const open=HTMLDialogElement.prototype.showModal;
 HTMLDialogElement.prototype.showModal=function(){pause();if(this.querySelector('input[type=number]'))this.classList.add('shared-dialog');return open.call(this);};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 return {pause,resume,canPlay,blocksInput};
})();
