// Deterministic mechanics. No DOM, storage, network, clock or audio dependencies.
const WGCore = (() => {
  const DAY = 86400000;
  function feedback(answer, guess) {
    const result = Array(5).fill(0), remaining = {};
    for (let i=0;i<5;i++) {
      if (answer[i]===guess[i]) result[i]=2;
      else remaining[answer[i]]=(remaining[answer[i]]||0)+1;
    }
    for (let i=0;i<5;i++) if (!result[i] && remaining[guess[i]]>0) {
      result[i]=1; remaining[guess[i]]--;
    }
    return result;
  }
  function hardError(answer, guesses, next) {
    for (const guess of guesses) {
      const marks=feedback(answer,guess), required={};
      for(let i=0;i<5;i++) {
        if(marks[i]===2 && next[i]!==guess[i]) return 'Keep '+guess[i]+' in position '+(i+1)+'.';
        if(marks[i]>0) required[guess[i]]=(required[guess[i]]||0)+1;
        if(marks[i]===1 && next[i]===guess[i]) return 'Move '+guess[i]+' to a different position.';
      }
      for(const [letter,count] of Object.entries(required))
        if([...next].filter(c=>c===letter).length<count) return 'Use '+count+' '+letter+(count>1?' letters.':' in your guess.');
    }
    return '';
  }
  function dayNumber(date) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN;
    const t=Date.parse(date+'T00:00:00Z');
    return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===date?t/DAY:NaN;
  }
  function localDate(now=new Date()) {
    return now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  }
  function answerIndex(id) {
    if(/^l:\d{4}$/.test(id)) {const n=Number(id.slice(2));return n>=1&&n<=1000?n-1:-1;}
    if(id.startsWith('d:')) {const day=dayNumber(id.slice(2));return Number.isFinite(day)?((day-20752)*7919%1000+1000)%1000:-1;}
    return -1;
  }
  function fresh(hard=false) {return {guesses:[],input:'',hard:!!hard};}
  function outcome(round,answer) {return round.guesses.includes(answer)?'won':round.guesses.length===6?'lost':'playing';}
  function validRound(round,answer,dictionary) {
    if(!round||!Array.isArray(round.guesses)||round.guesses.length>6||typeof round.hard!=='boolean'||
      typeof round.input!=='string'||!/^([A-Z]{0,5})$/.test(round.input)) return false;
    for(let i=0;i<round.guesses.length;i++){
      const g=round.guesses[i];
      if(!dictionary.has(g)||round.guesses.slice(0,i).includes(g)||round.guesses.slice(0,i).includes(answer))return false;
      if(round.hard&&hardError(answer,round.guesses.slice(0,i),g))return false;
    }
    return outcome(round,answer)==='playing'||round.input==='';
  }
  function submit(round,answer,guess,dictionary) {
    if(outcome(round,answer)!=='playing')return {error:'This puzzle is complete.'};
    if(!/^[A-Z]{5}$/.test(guess))return {error:'Enter five letters.'};
    if(!dictionary.has(guess))return {error:'Not in our word list. Try another word.'};
    if(round.guesses.includes(guess))return {error:'You already tried that word.'};
    const error=round.hard?hardError(answer,round.guesses,guess):'';
    return error?{error}:{round:{...round,guesses:[...round.guesses,guess],input:''}};
  }
  function keyMarks(round,answer) {
    const keys={};
    for(const guess of round.guesses)feedback(answer,guess).forEach((m,i)=>keys[guess[i]]=Math.max(keys[guess[i]]??-1,m));
    return keys;
  }
  function stats(rounds,answers,mode,today) {
    let played=0,wins=0;const distribution=Array(6).fill(0),wonDays=new Set();
    for(const [id,round] of Object.entries(rounds)){
      if(!id.startsWith(mode==='daily'?'d:':'l:')||!round.guesses.length)continue;
      played++;if(outcome(round,answers[answerIndex(id)])==='won'){
        wins++;distribution[round.guesses.length-1]++;
        if(id.startsWith('d:'))wonDays.add(dayNumber(id.slice(2)));
      }
    }
    let end=dayNumber(today);if(!wonDays.has(end))end--;
    let streak=0;while(wonDays.has(end--))streak++;
    let best=0,run=0,prev=-Infinity;
    for(const day of [...wonDays].sort((a,b)=>a-b)){run=day===prev+1?run+1:1;best=Math.max(best,run);prev=day;}
    return {played,wins,percent:played?Math.round(wins/played*100):0,distribution,streak,best};
  }
  return {feedback,hardError,dayNumber,localDate,answerIndex,fresh,outcome,validRound,submit,keyMarks,stats};
})();
