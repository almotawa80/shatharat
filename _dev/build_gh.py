import json,os,shutil,re
OUT='dist'; os.makedirs(OUT+'/icons',exist_ok=True)
URL='https://shatharaat.com/'
frag=open('index.html').read()
i=frag.index('<div id="app">')
head,body=frag[:i],frag[i:]
desc='شذرات: حكم وأمثال وطرائف من أقوال د. عبدالعزيز فيصل المطوع، تُقرأ وتُشارَك في بطاقات مزخرفة.'
meta=f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta property="og:type" content="website"><meta property="og:locale" content="ar_AR"><meta property="og:title" content="شذرات"><meta property="og:description" content="{desc}"><meta property="og:site_name" content="شذرات"><meta property="og:url" content="{URL}"><meta property="og:image" content="{URL}icons/og-image.png?v=3"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{URL}icons/og-image.png?v=3">
<link rel="canonical" href="{URL}"><link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#9b2c1f"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="شذرات"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="64x64" href="icons/favicon-64.png">
<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<script src="config.js"></script>
<script src="seed.js"></script>
<script>window.HIKAM_STATIC=true</script>
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "519420ff1f074d8d8b0c7c8aeeff84ca"}}'></script>
<script>if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',function(){{navigator.serviceWorker.register('sw.js').catch(function(){{}})}});</script>
'''
head=head.replace('<meta name="description" content="شذرات: حكم وأمثال تُقرأ وتُشارَك في بطاقات مزخرفة.">',f'<meta name="description" content="{desc}">')
open(OUT+'/index.html','w').write(meta+head+'</head>\n<body>\n'+body+'\n</body>\n</html>\n')
shutil.copy('seed.js',OUT+'/seed.js')
if not os.path.exists(OUT+'/config.js'):
    open(OUT+'/config.js','w').write('''// بعد تجهيز Supabase ضع الرابط والمفتاح العام (anon) هنا. لا تضع مفتاح service_role أبدًا.
window.HIKAM_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  DEMO_LOGIN: false
};
''')
open(OUT+'/.nojekyll','w').write('')
open(OUT+'/sw.js','w').write('''// Network first, cache as fallback, so the app opens offline with the last version seen.
const C='hikam-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));
});
''')
json.dump({"name":"شذرات","short_name":"شذرات","lang":"ar","dir":"rtl","start_url":"./","scope":"./","display":"standalone","background_color":"#f4efe7","theme_color":"#9b2c1f",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},
 open(OUT+'/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
# data SQL
seed=json.loads(open('seed.js').read()[len('window.HIKAM_SEED='):-1])
q=lambda v:"'"+str(v).replace("'","''")+"'"
rows=[]
for i,x in enumerate(seed):
    rows.append(f"({q('m'+str(i+1))},{q(x['text'])},{q(x['kind'])},{q(x.get('topic',''))},{q(x.get('note',''))},{q(x.get('source',''))},{1759500000000-i*60000})")
open(OUT+'/supabase-data.sql','w').write('-- شذرات: إدخال الحكم ('+str(len(rows))+') بعد تشغيل supabase-setup.sql\ninsert into public.hikam_sayings (id,text,kind,topic,note,source,created) values\n'+',\n'.join(rows)+'\non conflict (id) do nothing;\n')
print(len(rows))

# one small static page per saying, so a shared link previews the saying itself
import html as _h
os.makedirs(OUT+'/s',exist_ok=True)
seed=json.loads(open('seed.js').read().split('=',1)[1].strip().rstrip(';'))
for n,x in enumerate(seed):
    t=x['text'].strip();short=t if len(t)<=110 else t[:108].rsplit(' ',1)[0]+'…'
    T=_h.escape(short,quote=True);full=_h.escape(t);i=x.get('id') or f'm{n+1}'
    open(OUT+f'/s/{i}.html','w').write(f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{T} | شذرات</title><meta name="description" content="من أقوال د. عبدالعزيز فيصل المطوع · شذرات">
<meta property="og:type" content="article"><meta property="og:site_name" content="شذرات"><meta property="og:title" content="{T}"><meta property="og:description" content="من أقوال د. عبدالعزيز فيصل المطوع · شذرات"><meta property="og:url" content="{URL}s/{i}.html"><meta property="og:image" content="{URL}icons/og-image.png?v=3"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{URL}s/{i}.html"><link rel="icon" href="../icons/favicon-64.png"><meta http-equiv="refresh" content="0;url=../#s/{i}"><script>location.replace('../#s/{i}')</script></head>
<body style="font-family:serif;text-align:center;padding:40px"><p style="font-size:1.4rem">{full}</p><p><a href="../#s/{i}">افتح في شذرات</a></p></body></html>
''')
print('static pages',len(seed))
