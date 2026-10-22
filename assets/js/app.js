(window.NPOTG_READY||Promise.resolve()).then(function(){

const asset=n=>new URL("assets/img/"+n,document.baseURI).href;
const LOGO=asset("logo.webp");
const MARK=asset("mark.webp");
const IMG=Object.fromEntries(["ba_lip_a", "ba_lip_b", "ba_tox_a", "ba_tox_b", "ed_neck", "ed_profile", "ed_smile", "h_iv2", "h_shield", "h_steth", "h_steth2", "h_syr_purple", "h_van", "h_vial_purple", "h_vial_teal", "ph_consult", "ph_face2", "ph_glow", "ph_inject", "ph_ivchair", "ph_jaw", "ph_np", "ph_pain", "ph_sclero", "ph_weight", "ph_woman", "tex"].map(n=>[n,asset(n+".webp")]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* ---------- NPOTG content engine: makes every text, image and list editable from /admin ---------- */
const CMS=(function(){
  const PREVIEW=!!window.NPOTG_PREVIEW||/[?&]preview=1/.test(location.search);
  let C={};
  try{if(PREVIEW&&window.parent!==window&&window.parent.NPOTG_DRAFT)C=JSON.parse(JSON.stringify(window.parent.NPOTG_DRAFT))}catch(e){}
  if(!PREVIEW&&window.NPOTG_CONTENT)C=window.NPOTG_CONTENT;
  C=C&&typeof C==='object'?C:{};C.t=C.t||{};C.i=C.i||{};C.hidden=C.hidden||[];
  const D={t:{},i:{},sections:[],col:{}};
  const SKIP='#cards,#svcRows,#whyList,#aboutPillars,#rvTrack,#hrs,.map-wrap,#tabs,form,.faq,.ftabs,#hTitle,#intro,.crumbs,.ba-tag,.rating,.toast,.qbook,.tarr,.burger';
  const SEL='h1,h2,h3,h4,p,li,.kicker,a.btn,button.btn,figcaption b,figcaption span,.badge b,.badge small,.vp-tag,.chipx,.creds span,.aes-list a,.why-h,.fbar span,.irow small,.irow b,a.nl,.mnav a,footer ul:not(.fcontact) a';
  const INL=new Set(['SPAN','B','STRONG','EM','BR','SMALL']);
  const slug=s=>(s||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,32)||'section';
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const isKeep=n=>n.nodeType===1&&!(INL.has(n.tagName)&&!n.querySelector('svg,img,i'));
  function read(el){let out='';el.childNodes.forEach(n=>{if(n.nodeType===3)out+=n.nodeValue;else if(n.nodeType===1&&!isKeep(n)){if(n.tagName==='BR')out+='\n';else{const acc=n.tagName==='SPAN'&&(n.classList.contains('s')||n.hasAttribute('style'));const tx=n.textContent;out+=acc?'*'+tx+'*':tx}}});
    return out.replace(/[ \t\r]*\n[ \t\r]*/g,'\n').replace(/[ \t\r]+/g,' ').replace(/ /g,' ').trim()}
  function accOpen(el){const s=[...el.children].find(n=>n.tagName==='SPAN'&&(n.classList.contains('s')||n.hasAttribute('style'))&&!isKeep(n));return s?s.outerHTML.slice(0,s.outerHTML.indexOf('>')+1):'<span class="s">'}
  function write(el,v){const acc=el._acc||(el._acc=accOpen(el));const kids=[...el.childNodes];
    const firstMeaning=kids.find(n=>n.nodeType===1||(n.nodeType===3&&n.nodeValue.trim()));
    const keep=kids.filter(isKeep);const keepFirst=!!firstMeaning&&isKeep(firstMeaning);
    const t=document.createElement('template');t.innerHTML=esc(v).replace(/\*([^*]+)\*/g,(m,x)=>acc+x+'</span>').replace(/\n/g,'<br>');
    kids.forEach(n=>{if(!isKeep(n))n.remove()});
    if(!keep.length)el.appendChild(t.content);
    else if(keepFirst)keep[keep.length-1].after(t.content);
    else{el.insertBefore(t.content,keep[0]);el.insertBefore(document.createTextNode(' '),keep[0])}}
  function labelFor(el){const tg=el.tagName;
    if(el.matches('.kicker'))return 'Small label';if(el.matches('.why-h'))return 'Big heading';
    if(el.matches('a.btn,button.btn'))return 'Button text';if(el.matches('a.nl,.mnav a,footer a'))return 'Menu link';
    if(el.matches('.lead'))return 'Intro text';if(el.matches('.sub'))return 'Subheading';if(el.matches('.quote'))return 'Quote';
    if(tg==='H1')return 'Page title';if(tg==='H2')return 'Heading';if(tg==='H3'||tg==='H4')return 'Title';if(tg==='P')return 'Paragraph';if(tg==='LI')return 'List item';
    if(el.matches('.creds span'))return 'Credential';if(el.matches('.chipx'))return 'Floating label';if(el.matches('.aes-list a'))return 'Treatment link';
    if(el.matches('.fbar span'))return 'Footer note';if(el.matches('figcaption b'))return 'Caption title';if(el.matches('figcaption span'))return 'Caption text';
    return 'Text'}
  function sectionLabel(el,page){
    if(el.matches('header'))return 'Header & menu';if(el.matches('footer'))return 'Footer';
    if(el.matches('.hero'))return 'Hero';if(el.matches('.banner'))return 'Page banner';if(el.matches('.tabs'))return null;if(el.id==='svcRows')return null;
    const k=el.querySelector('.kicker,h1,h2,h3');if(k)return k.textContent.replace(/\s+/g,' ').trim().slice(0,40);
    return el.getAttribute('aria-label')||'Section'}
  function tag(){
    const regions=[{el:$('header.site'),page:'global'}];
    $$('.page').forEach(p=>[...p.children].forEach(ch=>regions.push({el:ch,page:p.dataset.page})));
    regions.push({el:$('footer'),page:'global'});
    const used={};
    regions.forEach(({el,page})=>{if(!el||el.matches('.qbook'))return;const label=sectionLabel(el,page);if(!label)return;
      let id=page+'.'+slug(label);if(used[id])id+='-'+(++used[id]);else used[id]=1;
      el.dataset.cs=id;
      const NAMES={'home.nurse-practitioner-on-the-go':'Why NPOTG','home.whole-person-care':'About preview','home.wellness-aesthetics':'Closing banner','services.book-a-house-call':'Bottom banner','contact.your-wellness-journey':'Bottom banner','about.meet-your-nurse-practitioner':'Meet your NP','about.medical-eye-personal-care':'Beauty with a medical eye',"contact.let-s-get-in-touch":'Contact form & info'};
      const sec={id,page,label:NAMES[id]||label,fields:[],hideable:!el.matches('header,footer,.hero,.banner')};
      const counts={};const add=(f)=>{const n=counts[f.label]=(counts[f.label]||0)+1;f.key=id+'.'+slug(f.label)+n;f.n=n;sec.fields.push(f);return f.key};
      if(el.matches('.hero')){const h=$('#hTitle');
        ['l1','l2'].forEach((c,ix)=>{const sp=h.querySelector('.'+c);const v=sp.textContent.replace(/\s+/g,' ').trim();const key=id+'.title-line-'+(ix+1);sp.dataset.ck=key;D.t[key]=v;sec.fields.push({key,label:ix?'Title line 2 (accent)':'Title line 1',type:'text',el:'hero'})})}
      const cands=[...el.querySelectorAll(SEL)].filter(x=>!x.closest(SKIP)&&!x.closest('[data-ck]'));
      cands.filter(x=>!cands.some(o=>o!==x&&x.contains(o))).forEach(x=>{const v=read(x);if(!v)return;
        const label=labelFor(x);const key=add({label,type:v.length>90||x.tagName==='P'?'long':'text'});x.dataset.ck=key;x._acc=accOpen(x);D.t[key]=v;sec.fields[sec.fields.length-1].hint=/\*/.test(v)});
      el.querySelectorAll('img[data-img],img[data-logo]').forEach(im=>{if(im.closest(SKIP)&&!im.closest('.qbook'))return;if(im.hasAttribute('data-logo')){im.dataset.ci='global.logo';return}
        const key=add({label:'Image',type:'image'});im.dataset.ci=key;D.i[key]=im.dataset.img});
      if(sec.fields.length||sec.hideable)D.sections.push(sec)});
    D.sections.unshift({id:'global.brand',page:'global',label:'Logo',fields:[{key:'global.logo',label:'Logo',type:'image'},{key:'global.mark',label:'Butterfly icon',type:'image'}]});
    D.i['global.logo']='logo';D.i['global.mark']='mark';
    D.faqs=$$('.faq details').map(d=>({q:d.querySelector('summary').textContent.trim(),a:d.querySelector('.a').textContent.trim()}));
  }
  function applyHero(){const h=$('#hTitle');['l1','l2'].forEach((c,ix)=>{const key=$('[data-cs="home.hero"]').dataset.cs+'.title-line-'+(ix+1);const v=C.t[key];if(v==null)return;
    h.querySelector('.'+c).innerHTML=esc(v.replace(/\*/g,'')).split(/\s+/).filter(Boolean).map(w=>`<span class="w">${w}</span>`).join(' ')})}
  function applyText(){$$('[data-ck]').forEach(el=>{const v=C.t[el.dataset.ck];if(v==null||el.closest('#hTitle'))return;write(el,v)})}
  function applyHidden(){$$('[data-cs]').forEach(el=>{el.hidden=C.hidden.includes(el.dataset.cs)&&!el.matches('header,footer,.hero,.banner')})}
  const isUrl=v=>/^(https?:|data:|blob:|\/)/.test(v||'');
  function img(v,IMG){return isUrl(v)?v:(IMG[v]||'')}
  function applyTheme(){const th=C.theme||{};const r=document.documentElement.style;
    const mix=(h,w,p)=>{const a=h.match(/\w\w/g).map(x=>parseInt(x,16)),b=w.match(/\w\w/g).map(x=>parseInt(x,16));return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*p).toString(16).padStart(2,'0')).join('')};
    const ok=v=>/^#[0-9a-f]{6}$/i.test(v||'');
    if(ok(th.teal)){r.setProperty('--teal',th.teal);r.setProperty('--teal-2',mix(th.teal,'#ffffff',.22));r.setProperty('--teal-deep',mix(th.teal,'#000000',.38))}
    if(ok(th.gold)){r.setProperty('--gold',th.gold);r.setProperty('--gold-soft',mix(th.gold,'#ffffff',.38))}
    if(ok(th.lilac)){r.setProperty('--lilac',th.lilac);r.setProperty('--lilac-soft',mix(th.lilac,'#ffffff',.75))}
    if(ok(th.ink))r.setProperty('--ink',th.ink)}
  function applySeo(){const s=C.seo||{};if(s.title)document.title=s.title;if(s.description){const m=document.querySelector('meta[name="description"]');if(m)m.content=s.description}}
  const DEF_CONTACT={phone:'(555) 123-4567',email:'hello@npotg.com',instagram:'https://instagram.com',facebook:'https://facebook.com',tiktok:'https://tiktok.com'};
  function applyContact(){const c=Object.assign({},DEF_CONTACT,C.contact||{});
    const tel='tel:'+(c.phone.replace(/[^\d+]/g,'').replace(/^(\d{10})$/,'+1$1'));
    $$('a[href^="tel:"]').forEach(a=>a.href=tel);
    $$('a[href^="mailto:"]').forEach(a=>a.href='mailto:'+c.email);
    if(c.phone!==DEF_CONTACT.phone||c.email!==DEF_CONTACT.email){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(n.parentNode.closest('script,style'))continue;let v=n.nodeValue;if(v.includes(DEF_CONTACT.phone))v=v.split(DEF_CONTACT.phone).join(c.phone);if(v.includes(DEF_CONTACT.email))v=v.split(DEF_CONTACT.email).join(c.email);if(v!==n.nodeValue)n.nodeValue=v}}
    [['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok']].forEach(([k,l])=>$$(`a[aria-label="${l}"]`).forEach(a=>{if(c[k])a.href=c[k];a.parentNode&&(a.style.display=c[k]===''?'none':'')}))}
  function faqs(){const f=C.faqs;if(!Array.isArray(f))return;$('.faq').innerHTML=f.filter(x=>x&&x.q).map((x,i)=>`<details${i?'':' open'}><summary>${esc(x.q)}<i></i></summary><p class="a">${esc(x.a||'')}</p></details>`).join('')}
  function col(name,def){D.col[name]=JSON.parse(JSON.stringify(def));const v=C[name];return Array.isArray(v)&&v.length?v:(v&&!Array.isArray(v)&&typeof v==='object'&&!Array.isArray(def)?Object.assign({},def,v):def)}
  function early(){tag();applyTheme();applySeo();applyHidden();applyHero();applyText();faqs();
    if(PREVIEW){document.body.classList.add('cms-preview');try{sessionStorage.setItem('npotg-intro','1')}catch(e){}const it=document.getElementById('intro');if(it)it.classList.add('skip')}}
  function late(){applyContact();
    if(PREVIEW){
      document.addEventListener('click',e=>{const t=e.target.closest('[data-ck],[data-ci]');const secEl=e.target.closest('[data-cs]');if(!t&&!secEl)return;
        e.preventDefault();e.stopPropagation();
        parent.postMessage({npotg:'focus',key:t?(t.dataset.ck||t.dataset.ci):null,section:secEl?secEl.dataset.cs:null},'*')},true);
      addEventListener('message',e=>{const m=e.data||{};if(m.npotg==='text'){const v=m.value;$$(`[data-ck="${CSS.escape(m.key)}"]`).forEach(el=>{if(el.closest('#hTitle')){el.innerHTML=esc(v.replace(/\*/g,'')).split(/\s+/).filter(Boolean).map(w=>`<span class="w" style="opacity:1;transform:none;filter:none">${w}</span>`).join(' ')}else write(el,v)})}
        if(m.npotg==='flash'){const el=$(`[data-ck="${CSS.escape(m.key)}"],[data-ci="${CSS.escape(m.key)}"]`)||$(`[data-cs="${CSS.escape(m.key)}"]`);if(el){const pg=el.closest('.page');if(pg&&pg.hidden&&pg.dataset.page)location.hash=pg.dataset.page;setTimeout(()=>{el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('cms-flash');void el.offsetWidth;el.classList.add('cms-flash')},pg&&pg.hidden?350:0)}}});
      parent.postMessage({npotg:'ready'},'*')}}
  return {C,D,early,late,col,img,isUrl,PREVIEW,write,read};
})();
window.NPOTG=CMS;

CMS.early();
/* opening logo animation: once per visit, then hero animations start */
(function(){const intro=document.getElementById('intro');if(!intro)return;
  let seen=false;try{seen=sessionStorage.getItem('npotg-intro')==='1';sessionStorage.setItem('npotg-intro','1')}catch(e){}
  if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches){intro.classList.add('skip');return}
  document.body.classList.add('loading');document.documentElement.style.overflow='hidden';
  const done=()=>{document.body.classList.remove('loading');document.documentElement.style.overflow='';intro.classList.add('skip')};
  setTimeout(()=>{document.body.classList.remove('loading');document.documentElement.style.overflow=''},2250);
  setTimeout(done,2950);
})();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2800)};
const ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* ---------- content ---------- */
const SERVICES=CMS.col('services',[
 {id:'wellness',cat:'well',t:'Wellness Exams & Primary Care',s:'Annual physicals, sick visits and ongoing care for everyday health.',img:'ph_consult',pos:'38% 50%',
  p:['As a board-certified nurse practitioner, I provide the everyday care you\'d expect from a primary care office, without the waiting room.','Visits are unhurried, so there\'s time to talk through symptoms, review your history and plan next steps together.'],
  li:['Annual wellness exams & physicals','Sick visits & minor illness','Chronic condition check-ins','Lab draws & health screenings','Prescriptions & referrals when needed','Medication reviews']},
 {id:'iv',cat:'well',t:'IV Therapy & Vitamin Injections',s:'Hydration, vitamin drips and B12 shots for energy and recovery.',img:'ph_ivchair',pos:'50% 35%',
  p:['IV therapy delivers fluids, electrolytes and vitamins directly into the bloodstream for fast, effective rehydration and recovery.','Every drip starts with a quick health screening, and your NP stays with you while it runs.'],
  li:['Hydration & electrolyte drips','Myers\' cocktail & immunity support','Recovery after travel, illness or events','B12 & vitamin injections']},
 {id:'weight',cat:'well',t:'Medical Weight Loss',s:'Medically guided plans, including GLP-1 options when appropriate.',img:'ph_weight',pos:'50% 25%',
  p:['Sustainable weight loss starts with understanding your health. We begin with a medical evaluation and build a plan that fits your body and your life.','When appropriate, plans can include prescription GLP-1 medications with regular check-ins to track progress and side effects.'],
  li:['Medical evaluation & lab review','GLP-1 medication options when appropriate','Nutrition & lifestyle guidance','Regular progress check-ins']},
 {id:'pain',cat:'well',t:'Pain Management',s:'Evaluation and treatment plans for muscle, joint and chronic pain.',img:'ph_pain',pos:'62% 40%',
  p:['Pain can affect every part of your day. We start with a thorough evaluation to understand where your pain comes from, then build a plan to help you move and feel better.','Care is coordinated with your other providers and specialists when needed.'],
  li:['Pain evaluation & treatment plans','Trigger point injections','Joint & muscle pain support','Coordination with specialists']},
 {id:'sclero',cat:'aes',t:'Sclerotherapy',s:'Reduce the look of spider veins with targeted injections.',img:'ph_sclero',pos:'45% 55%',
  p:['Sclerotherapy is a minimally invasive treatment that reduces the appearance of spider veins, most often on the legs.','A fine needle delivers a solution into the vein, which gradually fades over the following weeks.'],
  li:['Spider vein treatment','Quick in-home sessions','Most clients need 2–3 sessions','Compression & aftercare guidance']},
 {id:'botox',cat:'aes',t:'Botox & Neurotoxins',s:'Soften lines and wrinkles for a refreshed, natural look.',img:'ph_face2',pos:'62% 35%',row:'ph_inject',rowpos:'40% 40%',
  p:['Neurotoxin treatments smooth fine lines and wrinkles on the forehead, between the brows and around the eyes.','Dosing is tailored to your facial anatomy for results that look natural and still let you be expressive.'],
  li:['Forehead lines, frown lines & crow\'s feet','Lip flip & brow lift','Masseter / jaw slimming','Free two-week follow-up']},
 {id:'fillers',cat:'aes',t:'Dermal Fillers',s:'Restore volume to lips, cheeks and jawline with natural results.',img:'ph_jaw',pos:'50% 30%',row:'ph_glow',rowpos:'50% 30%',
  p:['Hyaluronic acid fillers restore lost volume and enhance your natural features, from fuller lips to lifted cheeks and a defined jawline.','We build gradually, with a plan designed around your goals.'],
  li:['Lips, cheeks, chin & jawline','Under-eye & smile lines','Premium hyaluronic acid fillers','Reversible if ever needed']}
]);
const TXOPTS=CMS.col('txopts',['Wellness exam','IV therapy','Weight loss','Pain management','Sclerotherapy','Botox','Dermal fillers','Not sure yet']);
const REVIEWS=CMS.col('reviews',[
 ['Wellness exam','My annual physical happened at my kitchen table. She took her time, reviewed my labs with me and actually listened.','heart'],
 ['Botox','The whole visit took 30 minutes at home. My forehead looks smooth but I can still move my brows.','star'],
 ['IV therapy','Booked a hydration drip after a rough week of travel. She arrived on time, set up quickly and I felt better by lunch.','drop'],
 ['Medical weight loss','I appreciate that it started with a real medical evaluation. The check-ins keep me on track.','heart'],
 ['Dermal fillers','I was nervous about looking overdone. She went slowly and the result looks completely natural.','star'],
 ['Sclerotherapy','Easy, quick and comfortable. The veins on my legs have faded so much after two sessions.','drop']
]);
const ICON={heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.2 5.5L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.5z"/></svg>',drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>'};
const ZONES=CMS.col('zones',{1:{eta:'Same day',lbl:'Zone 1',name:'Within 10 miles',col:'#13596A'},2:{eta:'Next day',lbl:'Zone 2',name:'10–20 miles',col:'#23818F'},3:{eta:'2–3 days',lbl:'Zone 3',name:'20–30 miles',col:'#8E7FC0'}});

/* ---------- images ---------- */
$$('img[data-logo]').forEach(i=>i.src=CMS.C.i['global.logo']||LOGO);
$$('img[data-mark]').forEach(i=>i.src=CMS.C.i['global.mark']||MARK);
CMS.IMG=Object.assign({},IMG,{logo:LOGO,mark:MARK});
const setImgs=root=>$$('img[data-img]',root).forEach(i=>{if(!i.src)i.src=CMS.img((i.dataset.ci&&CMS.C.i[i.dataset.ci])||i.dataset.img,IMG)});
document.documentElement.style.setProperty('--tex',`url(${IMG.tex})`);
$$('.tex,.hero').forEach(el=>el.style.backgroundImage=`url(${IMG.tex})`);

/* ---------- home: service cards ---------- */
const wellTag='<span class="tag">Wellness</span>',aesTag='<span class="tag aes">Aesthetics</span>';
$('#cards').innerHTML=SERVICES.map(s=>`<a class="card rv" href="#services" data-cat="${s.cat}" data-svc="${s.id}">${s.prod?`<div class="ph prod ${s.bg} ${s.wide?'wide':''}"><img data-img="${s.prod[0]}" alt=""></div>`:`<div class="ph"><img data-img="${s.img}" alt="${s.t}"></div>`}${s.cat==='well'?wellTag:aesTag}<div class="cb"><h3>${s.t}</h3><p>${s.s}</p><span class="more">Learn more <span>→</span></span></div></a>`).join('');
(function(){const tabs=$('#ftabs'),knob=$('.knob',tabs);
  const place=()=>{const b=$('[aria-pressed="true"]',tabs);knob.style.width=b.offsetWidth+'px';knob.style.transform=`translateX(${b.offsetLeft-5}px)`};
  tabs.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',tabs).forEach(x=>x.setAttribute('aria-pressed',x===b));place();const f=b.dataset.f;
    $$('#cards .card').forEach(c=>{const show=f==='all'||c.dataset.cat===f||c.dataset.cat==='all';if(show&&c.classList.contains('hide')){c.classList.remove('hide');if(!reduce)c.animate([{opacity:0,transform:'translateY(20px) scale(.97)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.2,.7,.2,1)'})}else if(!show)c.classList.add('hide')})});
  window.placeKnob=place;addEventListener('resize',place);
})();
/* 3D tilt on cards */
if(!reduce)document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card');$$('.card.tilt').forEach(x=>{if(x!==c){x.classList.remove('tilt');x.style.transform=''}});if(!c||e.pointerType!=='mouse')return;const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.classList.add('tilt');c.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`});
document.addEventListener('click',e=>{const a=e.target.closest('[data-svc]');if(a){pending='s-'+a.dataset.svc}});

/* ---------- services page ---------- */
(function(){
  const groups=[['well','Wellness & Medical Care','Everyday health care and wellness treatments, from the same provider who knows your history.','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M6 12h3l1.5-3 3 6 1.5-3h3"/></svg>'],['aes','Aesthetics','Medical aesthetic treatments with natural, refreshed results.','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2.2 5.5L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.5z"/></svg>']];
  let html='',i=0;
  groups.forEach(([cat,title,intro,ico])=>{
    html+=`<div class="wrap ghead" id="g-${cat}"><div class="head rv" style="margin-bottom:0"><span class="gico">${ico}</span><span class="kicker">${cat==='well'?'Wellness':'Aesthetics'}</span><h2 class="h2">${title}</h2><p class="lead">${intro}</p></div></div>`;
    SERVICES.filter(s=>s.cat===cat).forEach(s=>{const rev=i%2===1;i++;
      const media=s.prod?`<div class="media rv ${rev?'l':'r'}"><div class="pframe ${s.bg}"><img class="${s.lipframe?'lip':'a'}" data-img="${s.prod[0]}" alt=""><img class="${s.lipframe?'ls':'b'}" data-img="${s.prod[1]}" alt=""></div></div>`:`<div class="media rv ${rev?'l':'r'}"><div class="frame"><img data-img="${s.row||s.img}" alt="${s.t}" style="object-position:${s.rowpos||s.pos||'50% 30%'}"></div></div>`;
      html+=`<section class="row-sec ${rev?'alt':''}" id="s-${s.id}"><div class="wrap split ${rev?'rev':''}"><div class="copy rv ${rev?'r':'l'}"><span class="kicker">${cat==='well'?'Wellness':'Aesthetics'}</span><h2 class="h2">${s.t}</h2>${s.p.map(x=>`<p>${x}</p>`).join('')}<ul class="ticks ${s.li.length>4?'two':''}">${s.li.map(x=>`<li>${x}</li>`).join('')}</ul><div class="btns"><a class="btn btn-teal" href="#contact" data-book="${s.id}">Book ${s.t.split(' & ')[0].replace('Wellness Exams','a Wellness Exam')} ${ARROW}</a></div></div>${media}</div></section>`});
  });
  $('#svcRows').innerHTML=html;
  const TICO={wellness:'<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',iv:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',weight:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 10a3 3 0 0 1 6 0"/><path d="M12 10l1.5-1.5"/>',pain:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',sclero:'<path d="M4 12c2.5-4 5.5-4 8 0s5.5 4 8 0"/><path d="M4 18c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity=".5"/><path d="M4 6c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity=".5"/>',botox:'<path d="M18 2l4 4M16 4l4 4M14.5 5.5l4 4L9 19H5v-4z"/><path d="M5 19l-3 3"/>',fillers:'<path d="M3 12c2-3 5-5 9-2 4-3 7-1 9 2-2 4-5 6-9 6s-7-2-9-6z"/><path d="M3 12h18"/>'};
  const tbtn=s=>`<button role="tab" aria-selected="false" data-t="s-${s.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${TICO[s.id]||''}</svg><span>${s.t.split(' & ')[0]}</span></button>`;
  $('#tabs').innerHTML=`<span class="tind" aria-hidden="true"></span><span class="tgrp" data-t="g-well">Wellness</span>`+SERVICES.filter(s=>s.cat==='well').map(tbtn).join('')+`<span class="tsep" aria-hidden="true"></span><span class="tgrp ta" data-t="g-aes">Aesthetics</span>`+SERVICES.filter(s=>s.cat==='aes').map(tbtn).join('');
  const tbar=$('#tabs'),tind=$('#tabs .tind');
  function setTab(b,scrollBar){$$('#tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));if(!b){tind.style.opacity=0;return}
    tind.style.opacity=1;tind.style.width=b.offsetWidth+'px';tind.style.transform=`translateX(${b.offsetLeft}px)`;
    if(scrollBar){const l=b.offsetLeft-(tbar.clientWidth-b.offsetWidth)/2;tbar.scrollTo({left:l,behavior:'smooth'})}}
  tbar.addEventListener('click',e=>{const b=e.target.closest('button,.tgrp');if(!b)return;if(b.tagName==='BUTTON')setTab(b,true);scrollToId(b.dataset.t)});
  const tabsEl=$('.tabs'),tl=$('.tarr.l'),tr=$('.tarr.r');
  function arrows(){const ov=tbar.scrollWidth>tbar.clientWidth+4;tabsEl.classList.toggle('ovf',ov);const ov2=tbar.scrollWidth>tbar.clientWidth+4;
    tl.classList.toggle('on',ov2&&tbar.scrollLeft>4);tr.classList.toggle('on',ov2&&tbar.scrollLeft<tbar.scrollWidth-tbar.clientWidth-4);const act=$('#tabs button[aria-selected="true"]');if(act&&ov!==tabsEl._ov){tabsEl._ov=ov;setTab(act,false)}}
  tl.addEventListener('click',()=>tbar.scrollBy({left:-tbar.clientWidth*.6,behavior:'smooth'}));
  tr.addEventListener('click',()=>tbar.scrollBy({left:tbar.clientWidth*.6,behavior:'smooth'}));
  tbar.addEventListener('scroll',arrows,{passive:true});addEventListener('resize',arrows);addEventListener('hashchange',()=>setTimeout(arrows,120));setTimeout(arrows,350);
  let spyLock=0;
  function spy(){if($('.page[data-page="services"]').hidden)return;const off=($('#hdr').offsetHeight||80)+90;let cur=null;
    $$('#svcRows .row-sec').forEach(r=>{if(r.getBoundingClientRect().top<=off+40)cur=r.id});
    const b=cur?$(`#tabs button[data-t="${cur}"]`):$('#tabs button');const prev=$('#tabs button[aria-selected="true"]');if(b!==prev)setTab(b,true)}
  addEventListener('scroll',()=>{if(!spyLock){spyLock=1;requestAnimationFrame(()=>{spyLock=0;spy()})}},{passive:true});
  addEventListener('resize',()=>{const b=$('#tabs button[aria-selected="true"]');if(b)setTab(b,false)});
  addEventListener('hashchange',()=>setTimeout(()=>{spy();$('#tabs').classList.remove('go');void $('#tabs').offsetWidth;$('#tabs').classList.add('go')},60));
  setTimeout(()=>{spy();$('#tabs').classList.add('go')},300);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-book]');if(!b)return;const s=SERVICES.find(x=>x.id===b.dataset.book);const map={wellness:0,iv:1,weight:2,pain:3,sclero:4,botox:5,fillers:6};$$('#txc input').forEach((c,k)=>c.checked=k===map[s.id])});
})();

/* why list + about values */
const WHY=CMS.col('why',[['Certified','Board-certified family nurse practitioner with advanced training in medical aesthetics.'],['Experienced','Clinical judgment for your health, and a careful eye for natural-looking results.'],['Passionate','Unhurried visits that put your comfort, safety and confidence first.'],['Mobile','We come to your home, office, hotel or event, on your schedule.']]);
$('#whyList').innerHTML=WHY.map(([t,d])=>`<div class="wi rv r"><span class="wl">${t.toUpperCase()}</span><p>${d}</p></div>`).join('');
$('#aboutPillars').innerHTML=WHY.map(([t,d])=>`<div class="vcard rv"><span class="wl">${t.toUpperCase()}</span><p>${d}</p></div>`).join('');
(function(){if(!('IntersectionObserver' in window)){$('#why').classList.add('in');return}
  const o=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');o.unobserve(en.target)}}),{threshold:.3});o.observe($('#why'));
  const vs=$('#vanStage');if(reduce)return;const o2=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){vs.classList.remove('go');void vs.offsetWidth;vs.classList.add('go')}}),{threshold:.4});o2.observe(vs)})();

/* ---------- router ---------- */
const PAGES=['home','services','about','contact'];
let pending=null;
function route(){
  const raw=(location.hash||'#home').slice(1);const page=PAGES.includes(raw)?raw:'home';
  document.body.dataset.page=page;
  $$('.page').forEach(p=>{const on=p.dataset.page===page;if(on&&p.hidden){p.hidden=false;p.style.animation='none';p.offsetHeight;p.style.animation=''}else if(!on)p.hidden=true});
  setImgs($(`.page[data-page="${page}"]`));
  $$('[data-nav]').forEach(a=>a.dataset.nav===page?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  closeMenu();
  if(pending){const id=pending;pending=null;setTimeout(()=>scrollToId(id),80)}else window.scrollTo({top:0,behavior:'instant'});
  document.title=((CMS.C.seo&&CMS.C.seo.title)||'NPOTG Wellness & Aesthetics')+(page==='home'?'':' · '+{services:'Services',about:'About Us',contact:'Contact Us'}[page]);
  topState();
  requestAnimationFrame(()=>{prepReveal();initMaps();if(window.placeKnob)placeKnob()});
}
function scrollToId(id){const el=document.getElementById(id);if(!el)return;const off=$('#hdr').offsetHeight+($('.tabs')&&!$('.page[data-page="services"]').hidden?52:10);window.scrollTo({top:el.getBoundingClientRect().top+scrollY-off,behavior:'smooth'})}
addEventListener('hashchange',route);
const burger=$('#burger'),mnav=$('#mnav');
function closeMenu(){mnav.classList.remove('open');burger.setAttribute('aria-expanded','false')}
burger.addEventListener('click',()=>{const o=mnav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
const hdr=$('#hdr');
function setH(){if(!hdr.classList.contains('scrolled'))document.documentElement.style.setProperty('--hdr-h',hdr.offsetHeight+'px')}
function topState(){const home=!$('.page[data-page="home"]').hidden;document.body.classList.toggle('home-top',home&&scrollY<40);const hh=$('#hero');document.body.classList.toggle('mb-off',home&&!!hh&&scrollY<hh.offsetHeight-innerHeight*.5)}
let ticking=false;
addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;
  hdr.classList.toggle('scrolled',scrollY>40);topState();$('#totop').classList.toggle('show',scrollY>700);
  if(!reduce)$$('.page:not([hidden]) .parallax').forEach(img=>{const r=img.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const p=(r.top+r.height/2-innerHeight/2)/innerHeight;img.style.transform=`translateY(${p*-60}px)`});
})},{passive:true});
$('#totop').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* ---------- reveal + counters ---------- */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const el=en.target;const sibs=[...el.parentElement.children].filter(x=>x.classList.contains('pre'));el.style.transitionDelay=Math.min(sibs.indexOf(el),5)*90+'ms';el.classList.remove('pre');setTimeout(()=>el.style.transitionDelay='',1400);io.unobserve(el)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'}):null;
function prepReveal(){if(!io||reduce)return;$$('.page:not([hidden]) .rv:not(.seen)').forEach(el=>{el.classList.add('seen');if(el.getBoundingClientRect().top>innerHeight*0.92){el.classList.add('pre');io.observe(el)}})}
const cio='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target,to=+el.dataset.count,suf=el.dataset.suffix||'';cio.unobserve(el);if(reduce)return;const t0=performance.now();const tick=t=>{const p=Math.min(1,(t-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-p,3)))+suf;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}),{threshold:.6}):null;
if(cio)$$('[data-count]').forEach(el=>cio.observe(el));

/* ---------- hero ---------- */
(function(){
  const hero=$('#hero');
  $$('#hTitle .w').forEach((w,i)=>w.style.setProperty('--i',i));
  const bub=$('#hBub');for(let i=0;i<18;i++){const s=document.createElement('span');const z=4+Math.random()*10;s.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;--o:${(.35+Math.random()*.45).toFixed(2)};--dx:${(Math.random()*80-40).toFixed(0)}px;animation-duration:${(12+Math.random()*12).toFixed(1)}s;animation-delay:${(-Math.random()*22).toFixed(1)}s`;bub.appendChild(s)}
  const title=$('#hTitle');
  function fit(){title.style.fontSize='';if(getComputedStyle(title).whiteSpace!=='nowrap')return;let fs=parseFloat(getComputedStyle(title).fontSize),n=0;while(title.scrollWidth>title.clientWidth+1&&fs>16&&n++<80){fs-=1;title.style.fontSize=fs+'px'}}
  fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{fit();setH()});addEventListener('resize',()=>{fit();setH()});
  setH();
  if(reduce)return;
  const fls=$$('#hStage .fl');let tx=0,ty=0,cx=0,cy=0;
  hero.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=(e.clientY-r.top)/r.height*2-1});
  hero.addEventListener('pointerleave',()=>{tx=0;ty=0});
  const mob=matchMedia('(max-width:900px)');
  (function loop(){
    if(mob.matches){fls.forEach(f=>{if(f.style.transform)f.style.transform=''})}
    else if(hero.offsetParent!==null&&scrollY<1100){cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;const sy=scrollY;
      fls.forEach(f=>{const d=+f.dataset.d;const s=f.dataset.noscroll?0:sy*d*.35;f.style.transform=`translate3d(${(cx*d*44).toFixed(2)}px,${(cy*d*30-s).toFixed(2)}px,0) rotateY(${(cx*d*14).toFixed(2)}deg) rotateX(${(-cy*d*10).toFixed(2)}deg)`})}
    requestAnimationFrame(loop)})();
})();

/* ---------- before / after sliders ---------- */
$$('[data-ba]').forEach(ba=>{const rng=$('.ba-range',ba);const set=v=>{v=Math.max(0,Math.min(100,v));ba.style.setProperty('--p',v+'%');rng.value=v};
  rng.addEventListener('input',()=>set(+rng.value));
  const fromEv=e=>{const r=ba.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)};
  ba.addEventListener('pointerdown',e=>{ba.classList.add('drag');fromEv(e);ba.setPointerCapture(e.pointerId)});
  ba.addEventListener('pointermove',e=>{if(ba.classList.contains('drag'))fromEv(e)});
  ['pointerup','pointercancel'].forEach(k=>ba.addEventListener(k,()=>ba.classList.remove('drag')));
  if(reduce||!('IntersectionObserver' in window))return;
  const o=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;o.unobserve(ba);const keys=[[0,50],[700,12],[1600,88],[2400,50]];const t0=performance.now();
    const tick=t=>{if(ba.classList.contains('drag'))return;const dt=t-t0;let i=0;while(i<keys.length-1&&dt>keys[i+1][0])i++;if(i>=keys.length-1){set(50);return}const [a,va]=keys[i],[b,vb]=keys[i+1];const k=(dt-a)/(b-a),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;set(va+(vb-va)*e);requestAnimationFrame(tick)};
    setTimeout(()=>requestAnimationFrame(tick),300)}),{threshold:.5});o.observe(ba)});

/* ---------- 3D aesthetics stage ---------- */
(function(){const st=$('#stage3d'),rig=$('#rig');if(!st||reduce)return;let tx=0,ty=0,cx=0,cy=0;
  const sec=$('#aesShow');
  sec.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=st.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))});
  sec.addEventListener('pointerleave',()=>{tx=0;ty=0});
  const mq=matchMedia('(max-width:900px)');
(function loop(){if(mq.matches){rig.style.transform=''}else if(st.offsetParent!==null){const r=st.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const sp=(r.top+r.height/2-innerHeight/2)/innerHeight;cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;
    rig.style.transform=`rotateY(${(cx*16+sp*-14).toFixed(2)}deg) rotateX(${(-cy*10+sp*6).toFixed(2)}deg)`}}requestAnimationFrame(loop)})();
})();

/* ---------- quick booking ---------- */
const tmr=new Date();tmr.setDate(tmr.getDate()+1);const iso=d=>d.toISOString().slice(0,10);
$('#qs').innerHTML=TXOPTS.map(t=>`<option>${t}</option>`).join('');
$('#qd').value=iso(tmr);$('#qd').min=iso(new Date());
const digits5=e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,5)};
$('#qc').addEventListener('input',digits5);
$('#qform').addEventListener('submit',e=>{e.preventDefault();
  const zp=$('#qc').value.trim();if(!/^\d{5}$/.test(zp)){$('#qc').focus();toast('Enter a 5-digit ZIP code');return}
  const want=$('#qs').value;$$('#txc input').forEach(i=>i.checked=i.value===want);
  $('#ct').value=zp;$('#dt').value=$('#qd').value;
  toast('Almost done. Finish your request and we\'ll confirm availability by text.');
  location.hash='contact'});

/* ---------- reviews ---------- */
(function(){const tr=$('#rvTrack'),dots=$('#rvDots');
  tr.innerHTML=REVIEWS.map(([s,t,ic])=>`<article class="review"><div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p>${t}</p><div class="who"><span class="av">${ICON[ic]}</span><div><b>${s} client</b><small>Verified visit · Google</small></div></div></article>`).join('');
  let i=0,timer;const per=()=>innerWidth<=620?1:innerWidth<=960?2:3;const pages=()=>Math.ceil(REVIEWS.length/per());
  function draw(){const p=pages();i=(i+p)%p;dots.innerHTML=Array.from({length:p},(_,k)=>`<button aria-label="Show reviews ${k+1}" aria-current="${k===i}"></button>`).join('');const w=tr.children[0].getBoundingClientRect().width+24;tr.style.transform=`translateX(${-i*per()*w}px)`}
  const restart=()=>{clearInterval(timer);if(!reduce)timer=setInterval(()=>{i++;draw()},6000)};
  const go=d=>{i+=d;draw();restart()};
  $('#rvPrev').onclick=()=>go(-1);$('#rvNext').onclick=()=>go(1);
  dots.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;i=[...dots.children].indexOf(b);draw();restart()});
  tr.addEventListener('mouseenter',()=>clearInterval(timer));tr.addEventListener('mouseleave',restart);
  let sx=null;tr.addEventListener('pointerdown',e=>sx=e.clientX);tr.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)go(dx<0?1:-1)});
  addEventListener('resize',draw);draw();restart();
})();

/* ---------- service-area map ---------- */
const maps={};
function initMaps(){$$('.page:not([hidden]) [data-map]').forEach(h=>{if(!maps[h.dataset.map])maps[h.dataset.map]=buildMap(h,h.dataset.map)})}
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
function mapSVG(){
  const W=900,H=640,cx=450,cy=320,r=rng(5);let s='';
  s+=`<defs><filter id="shd" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#16313A" flood-opacity=".25"/></filter><radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset="60%" stop-color="#F3F5F4" stop-opacity="0"/><stop offset="100%" stop-color="#F3F5F4" stop-opacity=".9"/></radialGradient></defs>`;
  s+=`<rect width="${W}" height="${H}" fill="#F3F5F4"/>`;
  s+=`<g transform="rotate(-7 ${cx} ${cy})" opacity=".9">`;
  const xs=[],ys=[];for(let x=-260;x<W+260;x+=46+r()*22)xs.push(x);for(let y=-260;y<H+260;y+=42+r()*20)ys.push(y);
  for(let a=0;a<xs.length-1;a++)for(let b=0;b<ys.length-1;b++){const x=xs[a]+3,y=ys[b]+3,w=xs[a+1]-xs[a]-6,h=ys[b+1]-ys[b]-6,k=r();
    s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${k<.05?'#DDEBDD':'#E9ECEA'}"/>`}
  xs.forEach((x,i)=>{if(i%4==1)s+=`<line x1="${x}" y1="-260" x2="${x}" y2="${H+260}" stroke="#fff" stroke-width="8"/>`});
  ys.forEach((y,i)=>{if(i%4==2)s+=`<line x1="-260" y1="${y}" x2="${W+260}" y2="${y}" stroke="#fff" stroke-width="8"/>`});
  s+=`</g>`;
  s+=`<path d="M-40 470C160 420 300 520 470 480S760 400 960 450L960 492C760 444 640 522 470 524S170 466 -40 512Z" fill="#CFE3EC"/>`;
  s+=`<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  [[250,3],[170,2],[90,1]].forEach(([rad,z])=>s+=`<circle class="zring" data-z="${z}" cx="${cx}" cy="${cy}" r="${rad}" fill="${ZONES[z].col}" fill-opacity=".07" stroke="${ZONES[z].col}" stroke-opacity=".55" stroke-width="1.5"/>`);
  [[90,'10 mi'],[170,'20 mi'],[250,'30 mi']].forEach(([rad,t])=>s+=`<text x="${cx}" y="${cy-rad-8}" text-anchor="middle" font-size="12" font-weight="600" fill="#4A5F67" font-family="Inter Tight,Arial,sans-serif" paint-order="stroke" stroke="#F3F5F4" stroke-width="4">${t}</text>`);
  s+=`<g transform="translate(${cx} ${cy})"><circle r="26" fill="#13596A" opacity=".14"><animate attributeName="r" values="18;44;18" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".22;0;.22" dur="3s" repeatCount="indefinite"/></circle><g filter="url(#shd)"><path d="M0 0C-12-16-21-25-21-37a21 21 0 0 1 42 0c0 12-9 21-21 37z" fill="#13596A" stroke="#fff" stroke-width="2.5"/><circle cy="-37" r="14" fill="#fff"/></g><image href="${MARK}" x="-11" y="-50" width="22" height="26"/></g>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of our 30-mile service area">${s}</svg>`;
}
function buildMap(host,key){
  const SUB={1:'Same-day visits',2:'Next-day visits',3:'Within 2–3 days'};
  const MSG={1:'Great news. We can usually see you the same day.',2:'We can usually see you the next day.',3:'We can usually see you within 2–3 days.'};
  host.innerHTML=`<div class="map-side">
      <div><label class="mlbl" for="zip-${key}">Your ZIP code</label><div class="zip-row"><input id="zip-${key}" inputmode="numeric" maxlength="5" placeholder="5-digit ZIP" autocomplete="postal-code"><button class="btn btn-teal" type="button">Check</button></div></div>
      <div class="zlist" role="group" aria-label="Distance from us">${[1,2,3].map(z=>`<button type="button" data-z="${z}"><i style="background:${ZONES[z].col}"></i><span><b>${ZONES[z].name}</b><small>${SUB[z]}</small></span></button>`).join('')}</div>
      <div class="zres" aria-live="polite"></div>
      <a class="btn btn-teal zbook" href="#contact" data-goto="contact:formWrap">Book a House Call</a>
      <p class="fine">More than 30 miles away? Send a request and we'll let you know.</p>
    </div>
    <div class="gmap">${mapSVG()}<span class="gtop"><span class="dot"></span>Home base · we come to you</span></div>`;
  const svg=$('svg',host),res=$('.zres',host),zip=$('input',host);
  function show(z){$$('.zlist button',host).forEach(b=>b.classList.toggle('on',+b.dataset.z===z));$$('.zring',svg).forEach(c=>c.classList.toggle('on',+c.dataset.z===z));res.textContent=MSG[z]}
  $('.zlist',host).addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(+b.dataset.z)});
  const check=()=>{const v=zip.value.trim();if(!/^\d{5}$/.test(v)){zip.focus();toast('Enter a 5-digit ZIP code');return}
    $('#ct').value=v;$$('.zlist button',host).forEach(b=>b.classList.remove('on'));$$('.zring',svg).forEach(c=>c.classList.add('on'));
    res.textContent=`Thanks! We'll confirm travel to ${v} when you book. Pick your distance above for usual timing.`};
  $('.zip-row .btn',host).addEventListener('click',check);
  zip.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check()}});
  zip.addEventListener('input',digits5);
  show(1);return true;
}

/* ---------- contact ---------- */
$('#txc').innerHTML=TXOPTS.map((t,i)=>`<input type="checkbox" id="t${i}" value="${t}"><label for="t${i}">${t}</label>`).join('');
$('#ct').addEventListener('input',digits5);
$('#dt').value=iso(tmr);$('#dt').min=iso(new Date());
$('#bookForm').addEventListener('submit',e=>{e.preventDefault();let ok=true;
  [['fn','Please enter your first name.'],['ln','Please enter your last name.'],['em','Enter a valid email, like name@example.com.'],['ph','Enter a 10-digit phone number.'],['ct','Enter your 5-digit ZIP code.']].forEach(([id,msg])=>{
    const el=$('#'+id),f=el.closest('.f');let bad=!el.value.trim();if(id==='em'&&!bad)bad=!/^\S+@\S+\.\S+$/.test(el.value);if(id==='ph'&&!bad)bad=el.value.replace(/\D/g,'').length<10;if(id==='ct'&&!bad)bad=!/^\d{5}$/.test(el.value.trim());
    f.classList.remove('err');void f.offsetWidth;f.classList.toggle('err',bad);f.querySelector('.em').textContent=bad?msg:'';if(bad&&ok){el.focus();ok=false}});
  if(ok&&!$('#cs').checked){toast('Please confirm you are 18 or older to continue');ok=false}
  if(!ok)return;
  const tx=$$('#txc input:checked').map(i=>i.value),win=$('input[name=win]:checked').value;
  const d=$('#dt').value?new Date($('#dt').value+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}):'your preferred day';
  const name=$('#fn').value.trim().replace(/[<>&"]/g,'');
  $('#bookForm').outerHTML=`<div class="done"><div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div><h3>Thank you, ${name}!</h3><p>We received your request for ${tx.length?tx.join(', ').toLowerCase():'a consultation'} at ZIP ${$('#ct').value} on ${d}, ${win.toLowerCase()}. We'll text you to confirm.</p><a class="btn btn-line" href="#home">Back to Home</a></div>`;
  scrollToId('formWrap');
});
$$('.cp').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('Copied '+v),()=>toast(v))}));
(function(){const H=CMS.col('hours',[['Monday','9 AM – 8 PM'],['Tuesday','9 AM – 8 PM'],['Wednesday','9 AM – 8 PM'],['Thursday','9 AM – 8 PM'],['Friday','9 AM – 8 PM'],['Saturday','9 AM – 6 PM'],['Sunday','11 AM – 5 PM']]);const t=(new Date().getDay()+6)%7;$('#hrs').innerHTML=H.map((h,i)=>`<div class="${i===t?'today':''}"><span>${h[0]}${i===t?' · Today':''}</span><span>${h[1]}</span></div>`).join('')})();

route();
CMS.late();

});
