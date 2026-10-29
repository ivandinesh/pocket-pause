// Run explicitly when authoring a new level pack; builds consume the pinned JSON.
const fs=require('fs'),vm=require('vm');
vm.runInThisContext(fs.readFileSync('games/puzzle-set-core.js','utf8'));
const C=PuzzleSetCore,levels={version:1,rotateNetwork:[],loop:[],pictureGrid:[],colorCode:[]};
for(let level=1;level<=30;level++){
  for(const [id,generate] of [['rotateNetwork',C.network],['loop',C.loop],['pictureGrid',C.picture],['colorCode',C.code]])levels[id].push(generate(level));
  process.stdout.write('Generated level '+level+' / 30\n');
}
fs.writeFileSync('games/puzzle-set-levels.json',JSON.stringify(levels)+'\n');

// Updating pinned content is an explicit authoring operation. Review level-ID changes.
if(fs.existsSync('games/puzzle-set-manifest.json')){const path='games/puzzle-set-manifest.json',manifest=JSON.parse(fs.readFileSync(path,'utf8'));manifest.levels_sha256=require('crypto').createHash('sha256').update(fs.readFileSync('games/puzzle-set-levels.json')).digest('hex');fs.writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');}
