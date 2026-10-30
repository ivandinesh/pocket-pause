// Release integration gates for the responsive layer and its theme compilation.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=require('./release_source.cjs').html(),source=fs.readFileSync('app/responsive.js','utf8');
const css=html.match(/<style id="responsiveStyles">([\s\S]*?)<\/style>/)?.[1];assert(css,'responsive presentation is bundled offline');
// Descendant whitespace before :is() is significant: removing it silently
// collapses nested boards even though the CSS and JS remain syntactically valid.
assert(css.includes('.play-stage :is('),'theme compilation must preserve the descendant combinator');
assert(css.includes('.play-tools :is('),'tool-group descendants survive theme compilation');
assert(!css.includes('.play-stage:is('),'board styles must not target the wrapper itself');
const map=source.match(/const boards=(\{[^;]+\});/);assert(map);
const boards=vm.runInNewContext('('+map[1]+')'),catalogue=JSON.parse(fs.readFileSync('seo/games.json','utf8'));
assert.deepEqual(Object.keys(boards).sort(),catalogue.map(g=>g.id).sort(),'every shipped game has a responsive board assignment');
assert.equal((html.match(/id="responsiveStyles"/g)||[]).length,1);
console.log('PASS: responsive release wiring covers every catalogue game; theme compilation preserves nested board/control selectors.');
