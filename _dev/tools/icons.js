const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});const ctx=await b.newContext();await require('./route.js')(ctx);const p=await ctx.newPage();
await p.goto('file://'+process.cwd()+'/icons.html');await p.waitForFunction(()=>window.OUT,null,{timeout:30000});const o=await p.evaluate(()=>window.OUT);
for(const k in o)require('fs').writeFileSync('/home/claude/hikam/dist/icons/'+k+'.png',Buffer.from(o[k].split(',')[1],'base64'));await b.close()})();
