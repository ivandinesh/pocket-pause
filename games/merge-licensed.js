// DoPop adapter: keep flat boards, seeded spawning, undo and persistence unchanged.
function dopopMerge(board,direction){return licensed2048Engine().move(board,direction);}
function dopopCanMove(board){return licensed2048Engine().canMove(board);}
function licensed2048Engine(){
 if(licensed2048Engine.instance)return licensed2048Engine.instance;
 // Vendor classes are scoped here, with no DOM/input/storage manager constructed.
 /* UPSTREAM_SOURCE */
 function manager(board){
  const game=Object.create(GameManager.prototype);
  game.size=4;game.grid=new Grid(4);game.score=0;game.over=false;game.won=false;game.keepPlaying=true;
  board.forEach((value,index)=>{if(value)game.grid.insertTile(new Tile({x:index%4,y:Math.floor(index/4)},value));});
  // DoPop owns deterministic spawning and rendering; upstream move stays unchanged.
  game.addRandomTile=()=>{};game.actuate=()=>{};
  return game;
 }
 licensed2048Engine.instance={
  move(board,direction){
   const game=manager(board),result=Array(16).fill(0),tracks=[];
   game.move({up:0,right:1,down:2,left:3}[direction]);
   game.grid.eachCell((x,y,tile)=>{
    if(!tile)return;
    const to=y*4+x;result[to]=tile.value;
    for(const source of tile.mergedFrom||[tile]){
     const from=source.previousPosition;
     tracks.push({from:from.y*4+from.x,to,value:source.value});
    }
   });
   return{board:result,gain:game.score,tracks,changed:result.some((v,i)=>v!==board[i])};
  },
  canMove(board){return manager(board).movesAvailable();}
 };
 return licensed2048Engine.instance;
}
