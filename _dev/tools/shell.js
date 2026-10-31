// Prerender the home masthead into dist/index.html so the first paint shows real content before seed.js (1 MB) arrives.
// Usage: node tools/shell.js dist   (needs Playwright; build_gh.py skips this step when it is missing)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]||'dist');const F=OUT+'/index.html';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});
 await c.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
 await c.addInitScript(()=>{try{localStorage.setItem('hikam-welcome','1')}catch(e){}});
 const p=await c.newPage();await p.goto('file://'+F);await p.waitForSelector('#app .hero',{timeout:20000});
 const html=await p.evaluate(()=>{const a=document.querySelector('#app'),out=[];for(const n of a.children){out.push(n.outerHTML);if(n.classList.contains('hero'))break}return out.join('')});
 const c2=await b.newContext({viewport:{width:390,height:844}});await c2.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
 const p2=await c2.newPage();await p2.goto('file://'+F);await p2.waitForSelector('#wel',{timeout:20000});
 const wel=await p2.evaluate(()=>{const w=document.querySelector('#wel').cloneNode(true);const q=w.querySelector('q');if(q)q.textContent='';return w.outerHTML});
 await b.close();
 const src=fs.readFileSync(F,'utf8'),empty=/<main id="app">[\s\S]*?<\/main>/;
 if(!empty.test(src))throw new Error('no #app');
 const fill='<script>var __W='+JSON.stringify(wel).replace(/</g,'\\u003c')+';(function(){var a=document.getElementById("app");if(location.hash.length>1){a.innerHTML="";return}var d=new Date(),k=d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(),v=(window.HIKAM_VOTD||{})[k],s=a.querySelector(".votd");if(!s)return;if(!v){s.style.visibility="hidden";return}s.querySelector("q").textContent=v[2];var seen=null;try{seen=localStorage.getItem("hikam-welcome")}catch(e){seen=1}if(seen)return;var t=document.createElement("div");t.innerHTML=__W;var w=t.firstChild,wq=w.querySelector("q");if(wq&&v[2].length<=110)wq.textContent=v[2];else{if(wq)wq.remove();var wp=w.querySelector(".welp");if(wp)wp.remove()}document.body.appendChild(w);w.addEventListener("click",function(e){if(!e.target.closest("[data-act=welcomeclose]"))return;try{localStorage.setItem("hikam-welcome","1")}catch(x){}w.classList.add("out");setTimeout(function(){w.remove()},450)})})()</script>';
 fs.writeFileSync(F,src.replace(empty,'<main id="app">'+html.replace(/\$/g,'$$$$')+'</main>'+fill));
 console.log('shell',html.length,'chars');
})().catch(e=>{console.error('shell skipped:',e.message);process.exit(0)});
