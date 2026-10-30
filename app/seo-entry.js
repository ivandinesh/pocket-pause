// Direct Play links use a validated game ID. Normal home/game navigation stays unchanged.
(() => {
 const catalogue=globalThis.DoPopGameCatalogue,byID=new Map(catalogue.map(g=>[g.id,g])),byPath=new Map(catalogue.map(g=>['/games/'+g.slug,g.id]));
 function openFromLocation(){const url=new URL(location.href),id=url.pathname==='/'?url.searchParams.get('game'):byPath.get(url.pathname.replace(/\/$/,''));if(!byID.has(id))return;const page=document.getElementById(id+'Page');if(!page)return;const card=[...document.querySelectorAll('.game-card')].find(c=>c.dataset.gameId===id);if(card){card.click();url.searchParams.delete('game');if(byPath.has(url.pathname.replace(/\/$/,'')))url.pathname='/';history.replaceState(null,'',url.pathname+url.search+url.hash);}}
 function markCards(){const cards=[...document.querySelectorAll('.game-card')];for(const game of catalogue){const card=cards.find(c=>(c.querySelector('.card-copy b')?.textContent||'').trim()===game.name);if(card)card.dataset.gameId=game.id;}}
 markCards();openFromLocation();
 const settingsURL=new URL(location.href);if(settingsURL.searchParams.get('privacy')==='1'){document.getElementById('privacyAnalyticsDialog')?.showModal();settingsURL.searchParams.delete('privacy');history.replaceState(null,'',settingsURL.pathname+settingsURL.search+settingsURL.hash);}
 addEventListener('popstate',openFromLocation);
})();
