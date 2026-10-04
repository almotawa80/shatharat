import json
FILES=['/mnt/project-files/sayings/sayings.json','/mnt/project-files/sayings/sayings_batch2.json']
KIND_TOPICS={'طرفة':'tarfa','غزل':'ghazal'}
items=[]
for f in FILES:
    for x in json.load(open(f))['items']:
        y={k:x[k] for k in ('text','kind','topic','note','source') if x.get(k)}
        k=KIND_TOPICS.get(x.get('topic')) or next((KIND_TOPICS[t] for t in x.get('tags',[]) if t in KIND_TOPICS),None)
        if k:
            y['kind']=k
            if y.get('topic') in KIND_TOPICS: y.pop('topic')
        items.append(y)
# keep each saying's id stable across rebuilds (shared links and favourites use it): reuse the id the same text had before, new texts get the next free number
import os,re
old={}
if os.path.exists('seed.js'):
    prev=json.loads(open('seed.js').read().split('=',1)[1].strip().rstrip(';'))
    for i,x in enumerate(prev): old.setdefault(x['text'],x.get('id') or f'm{i+1}')
nxt=max([int(v[1:]) for v in old.values() if re.fullmatch(r'm\d+',v)]+[0])+1
for y in items:
    if y['text'] in old: y['id']=old.pop(y['text'])
    else: y['id']=f'm{nxt}';nxt+=1
items=[{'id':y['id'],**{k:v for k,v in y.items() if k!='id'}} for y in items]
seed='window.HIKAM_SEED='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';'
open('seed.js','w').write(seed)
s=open('index.html').read()
marker='<script>\n(function(){'
assert marker in s
open('preview.html','w').write(s.replace(marker,'<script>'+seed+'</script>\n'+marker,1))
from collections import Counter
print(len(items),Counter(x['kind'] for x in items))
