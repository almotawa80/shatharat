// Link-preview images for chosen sayings: og/<id>.jpg (1200x630). Skips images whose text has not changed.
// Usage: node tools/og.js <ids.json>   run from the folder that has seed.js, fonts/ and icons/
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ids=JSON.parse(fs.readFileSync(process.argv[2],'utf8')).ids;
const seed=JSON.parse(fs.readFileSync('seed.js','utf8').split('=').slice(1).join('=').trim().replace(/;$/,''));
const by=Object.fromEntries(seed.map(x=>[x.id,x]));fs.mkdirSync('og',{recursive:true});
const idxF='og/index.json',idx=fs.existsSync(idxF)?JSON.parse(fs.readFileSync(idxF)):{};
const sadu=fs.readFileSync('tools/sadu.css','utf8').replace('.sadu{','.sadu{position:absolute;inset-inline:0;margin:0;');
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
const base='file://'+path.resolve('.')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});let n=0;
for(const id of ids){const x=by[id];if(!x)continue;const hsh=crypto.createHash('sha1').update(x.text).digest('hex').slice(0,10);
 if(idx[id]===hsh&&fs.existsSync('og/'+id+'.jpg'))continue;
 const L=x.text.length,fs1=L<50?66:L<80?58:L<110?50:44;
 fs.writeFileSync('og/_t.html',`<!doctype html><html dir="rtl"><head><style>
 @font-face{font-family:A;font-weight:700;src:url(../fonts/amiri-arabic-700-normal.woff2)}@font-face{font-family:R;font-weight:700;src:url(../fonts/aref-ruqaa-arabic-700-normal.woff2)}
 html{overflow:hidden}body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;background:radial-gradient(circle at 70% 40%,#fffaf0,#f1e6d2 75%);font-family:A}
 ${sadu}.t{top:0}.b{bottom:0}
 .q{position:absolute;inset-inline-start:80px;top:60px;bottom:60px;width:720px;display:flex;flex-direction:column;justify-content:center}
 .q p{margin:0;font-size:${fs1}px;line-height:1.75;color:#22202b;font-weight:700;text-wrap:balance}
 .q .by{margin-top:18px;font-family:R;font-size:36px;color:#9b2c1f}
 .st{position:absolute;inset-inline-end:70px;top:50%;width:300px;height:300px;transform:translateY(-50%);mix-blend-mode:multiply}
 .u{position:absolute;inset-inline-end:110px;bottom:48px;font:600 26px system-ui,sans-serif;color:#86611a;direction:ltr}
 </style></head><body><div class="sadu t"></div><div class="q"><p>${esc(x.text)}</p><div class="by">— د. عبدالعزيز فيصل المطوع</div></div><img class="st" src="../icons/icon-512.png"><div class="u">shatharaat.com</div><div class="sadu b"></div></body></html>`);await p.goto(base+'og/_t.html');
 await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'og/'+id+'.jpg',type:'jpeg',quality:82});idx[id]=hsh;n++}
fs.writeFileSync(idxF,JSON.stringify(idx));try{fs.unlinkSync('og/_t.html')}catch(e){}await b.close();console.log('og images made',n)})();
