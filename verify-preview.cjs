const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const directory=path.resolve(__dirname,'../deploy/sabrina-portfolio');
const html=fs.readFileSync(path.join(directory,'index.html'),'utf8');
const code=fs.readFileSync(path.join(directory,'site.js'),'utf8');
const mainPages=['home','projects','art','skills','blog'];
const initialPanels=[...html.matchAll(/<section\b([^>]*\bdata-panel="([^"]+)"[^>]*)>/g)];
assert.deepEqual(initialPanels.map(match=>match[2]),mainPages,'The homepage must contain all five main sections in order. CV belongs in its own document.');
assert.ok(initialPanels.every(match=>! /\bhidden\b/.test(match[1])),'Main sections must be visible without selecting a tab.');
assert.ok(fs.existsSync(path.join(directory,'cv.html')),'A separate CV document is required.');
const cv=fs.readFileSync(path.join(directory,'cv.html'),'utf8');
assert.deepEqual([...cv.matchAll(/data-panel="([^"]+)"/g)].map(match=>match[1]),['resume']);
function element(dataset={}){return {dataset,attributes:{},hidden:false,textContent:'',handlers:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},addEventListener(type,handler){this.handlers[type]=handler;}};}
const panels=[...html.matchAll(/data-panel="([^"]+)"/g)].map(match=>element({panel:match[1]}));
const navigation=[...html.matchAll(/data-page="([^"]+)"/g)].map(match=>element({page:match[1]}));
const slides=[...html.matchAll(/data-slide="([^"]+)"/g)].map(match=>element({slide:match[1]}));
const dots=[...html.matchAll(/data-art-dot="([^"]+)"/g)].map(match=>element({artDot:match[1]}));
const groups={'[data-panel]':panels,'[data-page]':navigation,'[data-slide]':slides,'[data-art-dot]':dots};
const controls=Object.fromEntries(['#mc-location','#mc-art-counter','#mc-art-previous','#mc-art-next','#mc-art-stage','.mc-art-carousel'].map(selector=>[selector,element()]));
const root={dataset:{siteView:'portfolio'},querySelectorAll(selector){assert.ok(groups[selector],'Unexpected collection '+selector);return groups[selector];},querySelector(selector){assert.ok(controls[selector],'Missing control '+selector);return controls[selector];}};
const location={hash:''};const listeners={};
const rootId=html.match(/<div id="([^"]+)"/)[1];
const document={title:'',getElementById(id){assert.equal(id,rootId);return root;}};
const context={document,location,history:{replaceState(_,__,hash){location.hash=hash;}},window:{addEventListener(type,handler){listeners[type]=handler;},scrollTo(){}}};
new vm.Script(code).runInNewContext(context);
function visible(){return panels.filter(panel=>!panel.hidden).map(panel=>panel.dataset.panel);}
assert.deepEqual(visible(),mainPages);
for(const section of mainPages){
  location.hash='#'+section;listeners.hashchange();assert.deepEqual(visible(),mainPages,'Section navigation must not hide the other sections.');
  assert.equal(navigation.filter(link=>link.attributes['aria-current']==='location')[0].dataset.page,section);
  assert.ok(html.includes('href="#'+section+'"'),'Missing native section link '+section);
  assert.ok(html.includes('id="'+section+'"'),'Missing section anchor '+section);
  assert.ok(cv.includes('href="index.html#'+section+'"'),'CV must link back to the homepage section '+section);
}
assert.ok(html.includes('href="cv.html"'));
location.hash='#unknown';listeners.hashchange();assert.deepEqual(visible(),mainPages);
controls['#mc-art-next'].handlers.click();assert.equal(controls['#mc-art-counter'].textContent,'2 of 3');
assert.equal(dots[1].attributes['aria-pressed'],'true');
controls['#mc-art-previous'].handlers.click();controls['#mc-art-previous'].handlers.click();assert.equal(controls['#mc-art-counter'].textContent,'3 of 3');
let prevented=false;controls['.mc-art-carousel'].handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(controls['#mc-art-counter'].textContent,'1 of 3');
const stage=controls['#mc-art-stage'];stage.handlers.pointerdown({pointerType:'touch',pointerId:1,clientX:300,clientY:50});stage.handlers.pointerup({pointerId:1,clientX:100,clientY:55});assert.equal(controls['#mc-art-counter'].textContent,'2 of 3');
stage.handlers.pointerdown({pointerType:'touch',pointerId:2,clientX:100,clientY:50});stage.handlers.pointerup({pointerId:2,clientX:90,clientY:230});assert.equal(controls['#mc-art-counter'].textContent,'2 of 3');
for(const page of [html,cv])for(const match of page.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){const asset=match[1].split('#')[0];assert.ok(fs.existsSync(path.join(directory,asset)),'Missing asset '+asset);}
root.dataset.siteView='cv';location.hash='';new vm.Script(code).runInNewContext(context);
assert.equal(navigation.find(link=>link.dataset.page==='resume').attributes['aria-current'],'page');
assert.equal(navigation.filter(link=>link.attributes['aria-current']).length,1);
assert.equal(panels.length,5);assert.equal(slides.length,3);
assert.ok(!/window\.openai|Tweak|mc-review-tools/.test(html+cv+code));
assert.ok(!/fetch\(|WebSocket|XMLHttpRequest/.test(code));
assert.deepEqual(fs.readFileSync(path.join(directory,'pfp.jpg')),fs.readFileSync(path.resolve(__dirname,'../pfp.jpg')));
console.log('PASS: all five homepage sections remain visible; native anchor links; separate CV document and return links; CV navigation state; carousel next/previous/wrap, keyboard and swipe; assets and profile image. Logic checked with a minimal DOM fixture; visual browser review remains separate.');
