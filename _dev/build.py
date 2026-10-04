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
seed='window.HIKAM_SEED='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';'
open('seed.js','w').write(seed)
s=open('index.html').read()
marker='<script>\n(function(){'
assert marker in s
open('preview.html','w').write(s.replace(marker,'<script>'+seed+'</script>\n'+marker,1))
from collections import Counter
print(len(items),Counter(x['kind'] for x in items))
