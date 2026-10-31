// Reject accidental severe terms in rows, columns and diagonals, in both directions.
function searchHasSensitiveSequence(grid) {
  const n=grid.length;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[-1,1]]) {
    for(let y=0;y<n;y++)for(let x=0;x<n;x++) {
      const px=x-dx,py=y-dy;
      if(px>=0&&px<n&&py>=0&&py<n)continue;
      let line='';
      for(let xx=x,yy=y;xx>=0&&xx<n&&yy>=0&&yy<n;xx+=dx,yy+=dy)line+=grid[yy][xx];
      const reverse=[...line].reverse().join('');
      if(SEARCH_BLOCKED_SEQUENCES.some(word=>line.includes(word)||reverse.includes(word)))return true;
    }
  }
  return false;
}

function makeSafeSearch(words,puzzle,fallbackIndex) {
  // Keep an existing clean seed unchanged. The second seed family is a tested
  // fallback for each theme, so a rare difficult seed cannot stall the game.
  for(const base of [puzzle,fallbackIndex])for(let attempt=0;attempt<128;attempt++) {
    const N=10,dirs=[[1,0],[0,1],[1,1],[-1,1],[-1,0],[0,-1],[-1,-1],[1,-1]];
    const rng=wordRng(3907+base*97+Math.imul(attempt,0x9e3779b1));
    const grid=Array.from({length:N},()=>Array(N).fill('')),placed=[];
    for(const word of words) {
      for(let t=0;t<300;t++) {
        const [dx,dy]=dirs[Math.floor(rng()*dirs.length)],x=Math.floor(rng()*N),y=Math.floor(rng()*N);
        const ex=x+dx*(word.length-1),ey=y+dy*(word.length-1);
        if(ex<0||ex>=N||ey<0||ey>=N)continue;
        const cells=Array.from(word,(_,i)=>[x+dx*i,y+dy*i]);
        if(cells.some(([xx,yy],i)=>grid[yy][xx]&&grid[yy][xx]!==word[i]))continue;
        cells.forEach(([xx,yy],i)=>grid[yy][xx]=word[i]);placed.push({word,cells});break;
      }
    }
    if(placed.length!==words.length)continue;
    const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x])grid[y][x]=letters[Math.floor(rng()*letters.length)];
    if(!searchHasSensitiveSequence(grid))return {grid,placed};
  }
  throw Error('Reviewed Word Search theme could not be placed');
}
