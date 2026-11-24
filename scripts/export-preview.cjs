const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const project = path.resolve(__dirname, '..');
const sourcePath = path.join(project, 'design', 'midnight-collaborative-review-v6.html');
const destination = path.join(project, 'deploy', 'sabrina-portfolio');
const source = fs.readFileSync(sourcePath, 'utf8');
const rootId = source.match(/^<div id="([^"]+)"/)[1];
const cssMatch = source.match(/<style>([\s\S]*?)<\/style>/);
const reviewStart = source.indexOf('  <div class="mc-review-tools">');
if (!cssMatch || reviewStart < 0) throw new Error('Review source structure changed; inspect before exporting.');

// Retain the approved portfolio, excluding the in-chat editor and host bridge.
let content = source.slice(0, reviewStart).trimEnd() + '\n</div>';
content = content.replace(/src="data:image\/jpeg;base64,[A-Za-z0-9+/=]+"/g, 'src="pfp.jpg"');
content = content.replace(/\sdata-copy="[^"]*"/g, '');
function pageContent(view) {
  let page = content.replace(/<section\b([^>]*\bdata-panel="([^"]+)"[^>]*)>([\s\S]*?)<\/section>/g, (_, attrs, panel, body) => {
    if ((view === 'cv') !== (panel === 'resume')) return '';
    attrs = attrs.replace(/\s+hidden\b/g, '').replace(/\s+id="[^"]*"/g, '');
    return `<section${attrs} id="${panel === 'resume' ? 'cv' : panel}">${body}</section>`;
  });
  page = page.replace(`<div id="${rootId}">`, `<div id="${rootId}" data-site-view="${view}">`);
  page = page.replace(/<button\b([^>]*\bdata-(page|go)="([^"]+)"[^>]*)>([\s\S]*?)<\/button>/g, (_, attrs, kind, panel, text) => {
    const href = panel === 'resume' ? 'cv.html' : (view === 'cv' ? 'index.html' : '') + '#' + panel;
    attrs = attrs.replace(/\s*type="button"/g, '').replace(/\s*aria-pressed="[^"]*"/g, '');
    const current = kind === 'page' && panel === (view === 'cv' ? 'resume' : 'home');
    return `<a${attrs} href="${href}"${current ? ` aria-current="${view === 'cv' ? 'page' : 'location'}"` : ''}>${text}</a>`;
  });
  return page.replace(/(<span[^>]+id="mc-location"[^>]*>)[^<]*(<\/span>)/, '$1' + (view === 'cv' ? 'CV' : 'Home') + '$2');
}

let stylesheet = cssMatch[1].replaceAll('.mc-nav button', '.mc-nav a').replaceAll('.mc-nav a[aria-pressed=true]', '.mc-nav a[aria-current]');
stylesheet += `
html{color-scheme:dark;scroll-behavior:smooth}
body{margin:0;background:#102438;color:#f2e9d5}
#${rootId}{display:block;max-width:1280px;margin:0 auto}
#${rootId} .mc-preview{border-radius:0;min-height:100svh;overflow:clip}
#${rootId} .mc-header{position:sticky;top:0;z-index:10;background:var(--mc-navy)}
#${rootId} .mc-nav a,#${rootId} .mc-primary,#${rootId} .mc-link{text-decoration:none}
#${rootId} a:focus-visible{outline:3px solid #e7aaa0;outline-offset:5px}
#${rootId} button,#${rootId} summary{cursor:pointer}
#${rootId} .mc-art-dots button{cursor:pointer}
@media(max-width:650px){#${rootId} .mc-page{scroll-margin-top:160px}}
.site-preview-note{font:12px/1.6 'Trebuchet MS',sans-serif;color:#c0cccf;padding:20px 28px;max-width:1280px;margin:0 auto;border-top:1px solid #516b79}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}}
`;

function pageDocument(view) { return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Computer science graduate exploring AI and cybersecurity. Web design, automation, and traditional art.">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#102438">
<title>${view === 'cv' ? 'CV — Sabrina' : 'Sabrina — Computer science & creative work'}</title>
<link rel="stylesheet" href="site.css">
<script src="site.js" defer></script>
</head>
<body>
<main>${pageContent(view)}</main>
<footer class="site-preview-note">Sabrina · Design preview</footer>
</body>
</html>
`; }
const document = pageDocument('portfolio');
const cvDocument = pageDocument('cv');

const runtime = `(()=>{
  'use strict';
  const root=document.getElementById('${rootId}');
  const names={home:'Home',projects:'Projects',art:'Art',skills:'Skills',resume:'CV',blog:'Blog'};
  const navigation=[...root.querySelectorAll('[data-page]')];
  const slides=[...root.querySelectorAll('[data-slide]')];
  let artIndex=0;
  function renderRoute(){
    const requested=location.hash.replace(/^#\\/?/,'').toLowerCase();
    const cv=root.dataset.siteView==='cv';
    const active=cv?'resume':Object.hasOwn(names,requested)&&requested!=='resume'?requested:'home';
    navigation.forEach(link=>{if(link.dataset.page===active)link.setAttribute('aria-current',cv?'page':'location');else link.removeAttribute('aria-current');});
    root.querySelector('#mc-location').textContent=names[active];
  }
  window.addEventListener('hashchange',renderRoute);
  renderRoute();
  if(root.dataset.siteView==='cv'||!slides.length)return;
  function renderGallery(){
    slides.forEach((slide,index)=>{slide.hidden=index!==artIndex;});
    root.querySelectorAll('[data-art-dot]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.artDot)===artIndex)));
    root.querySelector('#mc-art-counter').textContent=(artIndex+1)+' of '+slides.length;
  }
  function changeSlide(index){artIndex=((index%slides.length)+slides.length)%slides.length;renderGallery();}
  root.querySelector('#mc-art-previous').addEventListener('click',()=>changeSlide(artIndex-1));
  root.querySelector('#mc-art-next').addEventListener('click',()=>changeSlide(artIndex+1));
  root.querySelectorAll('[data-art-dot]').forEach(button=>button.addEventListener('click',()=>changeSlide(Number(button.dataset.artDot))));
  root.querySelector('.mc-art-carousel').addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const targets={ArrowRight:artIndex+1,ArrowLeft:artIndex-1,Home:0,End:slides.length-1};
    if(Object.hasOwn(targets,event.key)){event.preventDefault();changeSlide(targets[event.key]);}
  });
  let swipe=null;
  const stage=root.querySelector('#mc-art-stage');
  stage.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.pointerType==='pen')swipe={x:event.clientX,y:event.clientY,id:event.pointerId};});
  stage.addEventListener('pointerup',event=>{
    if(!swipe||swipe.id!==event.pointerId)return;
    const dx=event.clientX-swipe.x;const dy=event.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.2)changeSlide(artIndex+(dx<0?1:-1));
  });
  stage.addEventListener('pointercancel',()=>{swipe=null;});
  renderGallery();
})();
`;
new vm.Script(runtime);
if (/window\.openai|globalThis\.Tweak|mc-review-tools|__PROFILE_DATA__/.test(document + cvDocument + runtime)) throw new Error('Host-only code leaked into export.');
if (/<button[^>]+data-(?:page|go)=/.test(document + cvDocument)) throw new Error('Navigation was not converted to links.');

fs.mkdirSync(destination, {recursive:true});
fs.writeFileSync(path.join(destination,'index.html'), document);
fs.writeFileSync(path.join(destination,'cv.html'), cvDocument);
fs.writeFileSync(path.join(destination,'site.css'), stylesheet);
fs.writeFileSync(path.join(destination,'site.js'), runtime);
fs.copyFileSync(path.join(project,'pfp.jpg'),path.join(destination,'pfp.jpg'));
fs.writeFileSync(path.join(destination,'robots.txt'),'User-agent: *\nDisallow: /\n');
const info={source:path.relative(project,sourcePath).replaceAll('\\','/'),sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),output:'deploy/sabrina-portfolio',type:'static-design-preview'};
fs.mkdirSync(path.join(project,'.tools'),{recursive:true});
fs.writeFileSync(path.join(project,'.tools','preview-build.json'),JSON.stringify(info,null,2));
console.log('Exported standalone design preview: deploy/sabrina-portfolio (HTML, CSS, JS, profile image, robots.txt).');
