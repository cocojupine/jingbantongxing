"""Reproducible, guarded edits to the supplied compiled demo (original source unavailable).

Run from any directory. Always derives from the reviewed original commit, so reruns
are idempotent. Assertions guard each exact fragment before either file is written.
Readable state/layout logic lives in assets/ui-repairs.js and ui-repairs.css.
"""
from pathlib import Path
import subprocess
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
BASE = '3ab2daa401418875775dd53ad73db44dc4454aa7'
APP = '鲸伴同行-demo-发布包'
BUNDLE = APP + '/assets/index-BTDJbxyr.js'

def original(path):
    return subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT).decode('utf-8')

source = original(BUNDLE)
baseline = source

def replace(text, old, new, count=1):
    assert text.count(old) == count, (old[:150], text.count(old), count)
    return text.replace(old, new)

def component(name, transform):
    global source
    start = source.index('function ' + name + '(')
    end = source.find('function ', start + 10)
    if end == -1:
        end = len(source)
    source = source[:start] + transform(source[start:end]) + source[end:]

component('$c', lambda s: replace(s, 'JSON.parse(localStorage.getItem("userProfile")??"{}")', 'jbRead("profile",{})'))
component('bD', lambda s: replace(s, 'JSON.parse(localStorage.getItem("bindings")??"[]")', 'jbRead("bindings",[]).filter(j=>j&&typeof j.name==="string"&&typeof j.phone==="string"&&(localStorage.getItem("userRole")==="parent"?xD:vD).includes(j.relation))'))

def profile_modal(s):
    s = replace(s, 'open:e,role:t,onDone:r', 'open:e,role:t,onDone:r,editing:jbEditing=!1')
    s = replace(s, 'localStorage.setItem("userProfile",JSON.stringify(i))', 'jbWrite("profile",i)')
    s = replace(s, ';return v.jsxs(Tr,', ';d.useEffect(()=>{if(e)u($c())},[e]);return v.jsxs(Tr,')
    footer = 'v.jsxs("div",{className:"jb-modal-actions",children:[v.jsx("button",{className:"btn-primary",onClick:b,children:jbEditing?"保存修改":"保存档案"}),v.jsx("button",{className:"setup-skip",onClick:r,children:jbEditing?"取消":"稍后填写"})]})'
    s = replace(s, 'open:e,footer:null,closable:!1', 'open:e,className:"jb-profile-modal",onCancel:r,footer:'+footer+',closable:!1')
    s = replace(s, 'children:f?"完善心青年档案":"完善个人档案"', 'children:jbEditing?(f?"编辑心青年档案":"编辑个人档案"):(f?"完善心青年档案":"完善个人档案")')
    s = replace(s, ',v.jsx("button",{"code-path":"src\\\\components\\\\ProfileModal.tsx:179:7",className:"btn-primary",onClick:b,children:"保存档案，开始游园"}),v.jsx("div",{"code-path":"src\\\\components\\\\ProfileModal.tsx:180:7",className:"setup-skip",onClick:r,children:"稍后再填"})', '')
    return s
component('aR', profile_modal)

def profile(s):
    s = replace(s, 'const{message:e}=zl.useApp()', 'const{message:e,modal:jbModal}=zl.useApp()')
    s = replace(s, 'if(!E){', 'if($===M){e.warning("不能绑定当前账号");return}if(p.some(j=>j.phone===$)){e.warning("这个手机号已绑定");return}if(!E){')
    s = replace(s, 'localStorage.setItem("bindings",JSON.stringify(D))', 'jbWrite("bindings",D)', 2)
    s = replace(s, 'O=j=>{const D=p.filter(H=>H.id!==j);m(D),jbWrite("bindings",D),e.success("已解除绑定")}', 'O=j=>jbModal.confirm({title:"解除绑定？",content:"解除后，这位家人将从关联列表中移除。",okText:"解除绑定",cancelText:"保留绑定",onOk:()=>{const D=p.filter(H=>H.id!==j);m(D),jbWrite("bindings",D),e.success("已解除绑定")}})')
    s = replace(s, 'open:u,role:r,onDone:', 'open:u,role:r,editing:!0,onDone:')
    s = replace(s, '输入对方注册时使用的手机号，对方确认后即完成绑定', '填写需要关联的家人信息，确认后显示在当前列表')
    s = replace(s, 'children:"发起绑定"', 'children:"确认绑定"')
    s = replace(s, 'children:a?"家长":"心青年"', 'children:a?"家长视角":"心青年"')
    s = replace(s, 'children:[l.name||"未设置昵称",', 'children:[a?(l.name?l.name+"的档案":"未填写心青年档案"):(l.name||"未设置昵称"),')
    s = replace(s, 'className:"me-logout",onClick:()=>t("/")', 'className:"me-logout",onClick:()=>jbLogout(t)')
    for path in ['backpack', 'stories', 'venues', 'chat']:
        s = replace(s, f't("/{path}")', f'jbOpen(t,"/{path}")')
    return s
component('SD', profile)

def main(s):
    for path in ['backpack', 'stories', 'venues']:
        s = replace(s, f'e("/{path}")', f'jbOpen(e,"/{path}")')
    s = replace(s, 'C==="ai"?e("/chat")', 'C==="ai"?jbOpen(e,"/chat")')
    s = replace(s, 'className:"ai-mascot-fab",onClick:()=>e("/chat")', 'className:"ai-mascot-fab",onClick:()=>jbOpen(e,"/chat")')
    return s
component('LH', main)

def favorite(s):
    s = replace(s, 'className:e="",size:t=18', 'className:e="",size:t=18,itemId:jbItem')
    s = replace(s, 'const[r,a]=d.useState(!1)', 'const jbFavs=jbUseFavorites(d),r=!!jbFavs[jbItem]')
    return replace(s, 'a(i=>!i)', 'jbToggleFavorite(jbItem)')
component('Hf', favorite)

def listing(s, kind, collection, title):
    s = replace(s, '[t,r]=d.useState(""),[a,l]=d.useState("全部")', f'[t,r]=jbUseState(d,"{kind}.search","",!0),[a,l]=jbUseState(d,"{kind}.category","全部",!0),[jbOnly,jbSetOnly]=jbUseState(d,"{kind}.onlyFavorites",!1,!0),jbFavs=jbUseFavorites(d),jbScroll=jbUseListScroll(d,"{kind}")')
    s = replace(s, f'{collection}.filter(f=>(a===', f'{collection}.filter(f=>(!jbOnly||jbFavs["{kind}:"+f.id])&&(a===')
    s = replace(s, '[t,a])', '[t,a,jbOnly,jbFavs])')
    s = replace(s, f'title:"{title}",dark:!0', f'title:"{title}",dark:!0,onBack:()=>jbBack(e,"/main")')
    s = replace(s, 'className:"list-body",children:[', 'className:"list-body",ref:jbScroll,children:[')
    s = replace(s, f'e(`/{kind+"s"}/${{f.id}}`)', f'jbOpen(e,`/{kind+"s"}/${{f.id}}`)', 2) if kind=='venue' else replace(s, 'e(`/stories/${f.id}`)', 'jbOpen(e,`/stories/${f.id}`)', 2)
    s = replace(s, 'className:"feat-fav"', f'className:"feat-fav",itemId:"{kind}:"+f.id')
    # Keep recommendations for the normal list; hide them when filtering favorites.
    filter_control = 'v.jsx("button",{className:`list-chip jb-favorites-filter ${jbOnly?"active":""}`,"aria-pressed":jbOnly,onClick:()=>jbSetOnly(!jbOnly),children:jbOnly?"已收藏 · 显示全部":"只看已收藏"}),'
    marker = f'v.jsx("div",{{"code-path":"src\\\\pages\\\\{"Stories" if kind=="story" else "Venues"}.tsx:39:9"'
    s = replace(s, marker, filter_control+'!jbOnly&&'+marker)
    marker = f'v.jsx("div",{{"code-path":"src\\\\pages\\\\{"Stories" if kind=="story" else "Venues"}.tsx:40:9"'
    s = replace(s, marker, '!jbOnly&&'+marker)
    return s
component('EH', lambda s: listing(s, 'story', 'H0', '社交故事'))
component('OH', lambda s: listing(s, 'venue', 'I0', '场馆'))
for name, kind, path in [('wH','story','stories'), ('jH','venue','venues')]:
    component(name, lambda s, k=kind,p=path: replace(replace(s, f'onClick:()=>t("/{p}")', f'onClick:()=>jbBack(t,"/{p}","/{p}")'), 'className:"d-fav",size:20', f'className:"d-fav",size:20,itemId:"{k}:"+r.id'))

def backpack(s):
    s = replace(s, 'const{message:e}=zl.useApp()', 'const{message:e,modal:jbModal}=zl.useApp(),jbNavigate=Mr()')
    s = replace(s, 'try{const $=localStorage.getItem("backpackBooking");$&&g(JSON.parse($))}catch{}', 'g(jbRead("booking",null))')
    s = replace(s, '},[]);const b=', '},[]);d.useEffect(()=>{if(m)jbShowBooking()},[m]);const b=')
    s = replace(s, 'localStorage.setItem("backpackBooking",JSON.stringify(C))', 'jbWrite("booking",C)')
    s = replace(s, 'S=()=>{localStorage.removeItem("backpackBooking"),g(null),e.success("已取消预约")}', 'S=()=>jbModal.confirm({title:"取消书包预约？",content:"取消后可以重新填写预约信息。",okText:"取消预约",cancelText:"保留预约",onOk:()=>{jbWrite("booking",null),g(null),e.success("已取消预约")}})')
    s = replace(s, 'title:"感官友好书包",dark:!0', 'title:"感官友好书包",dark:!0,onBack:()=>jbBack(jbNavigate,"/main")')
    return s
component('SH', backpack)

def chat(s):
    s = replace(s, '[a,l]=d.useState([])', '[a,l]=d.useState(jbRestoreChat)')
    s = replace(s, '[a,l]=d.useState(jbRestoreChat),[i,u]', '[a,l]=d.useState(jbRestoreChat),jbRestored=d.useRef(new Set(a.map(j=>j.key))),[i,u]')
    start = s.index('const _=t.state?.callSummary;')
    end = s.index('},[t.state])', start)
    s = s[:start]+'const _=t.state?.callSummary||jbRead("pendingCall",null,!0);if(!_)return;l(F=>jbAppendSummary(F,_,Vh()));jbWrite("pendingCall",null,!0);if(t.state?.callSummary)e(t.pathname,{replace:!0,state:{jbFrom:t.state?.jbFrom}})'+s[end:]
    s = replace(s, '},[t.state]),d.useEffect(', '},[t.state]),d.useEffect(()=>{jbWrite("chat",a,!0)},[a]),d.useEffect(')
    s = replace(s, 'onClick:()=>e("/chat/call")', 'onClick:()=>jbOpen(e,"/chat/call")')
    # Chat has its own header rather than the shared PhoneFrame header.
    s = replace(s, 'onClick:()=>e(-1)', 'onClick:()=>jbBack(e,"/main")')
    s = replace(s, 'typing:_.role==="ai"&&!_.loading?', 'typing:_.role==="ai"&&!_.loading&&!_.summaryId&&!jbRestored.current.has(_.key)?')
    return s
component('mH', chat)
component('gH', lambda s: replace(s, 'const O={duration:S.current,exchanges:x.current};e("/chat",{state:{callSummary:O}})', 'const O={id:Vh(),duration:S.current,exchanges:x.current};jbWrite("pendingCall",O,!0),jbBack(e,"/chat","/chat")'))

# Guard untouched exclusions: login, router, map and time data/handlers.
def part(text,name):
    start=text.index('function '+name+'(')
    end=text.find('function ',start+10)
    return text[start:end if end!=-1 else len(text)]
for name in ['pD','HH']:
    assert part(source,name)==part(baseline,name), name
for fragment in ['className:"d-cta",onClick:()=>{}', 'className:"tab-map",onClick:()=>$("map")', 'className:"show-banner",onClick:()=>e("/chat")', 'className:"section-more",onClick:()=>e("/chat")']:
    assert source.count(fragment)==baseline.count(fragment)==1, fragment
source='import {jbRead,jbWrite,jbUseState,jbUseFavorites,jbToggleFavorite,jbOpen,jbBack,jbLogout,jbUseListScroll,jbShowBooking,jbRestoreChat,jbAppendSummary} from "./ui-repairs.js?v=2";\n'+source
html = original(APP + '/index.html')
html = replace(html, './assets/index-BTDJbxyr.js', './assets/index-BTDJbxyr.js?v=2')
html = replace(html, '  </head>', '    <link rel="stylesheet" href="./assets/ui-repairs.css?v=2">\n  </head>')
outputs = [(BUNDLE,source),(APP+'/index.html',html)]
manifest_path = ROOT/'scripts/ui-repairs-state.json'
previous = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
hashes = {path:hashlib.sha256(content.encode('utf-8')).hexdigest() for path,content in outputs}
# Refuse to overwrite a collaborator's edits, including edits merged into this branch.
# The previous generated hash permits deliberate maintenance of this patch script.
for path, content in outputs:
    current = hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
    allowed = {hashes[path], previous.get(path), hashlib.sha256(original(path).encode('utf-8')).hexdigest()}
    # Windows checkouts may use CRLF; compare normalized content for the baseline too.
    unchanged_baseline = (ROOT/path).read_text(encoding='utf-8') == original(path).replace('\r\n','\n')
    assert current in allowed or unchanged_baseline, f'Unrecognized edits in {path}; reconcile manually before rebuilding.'
for path, content in outputs:
    dest=ROOT/path
    temp=dest.with_suffix(dest.suffix+'.pending')
    temp.write_text(content,encoding='utf-8',newline='')
    temp.replace(dest)
manifest_path.write_text(json.dumps(hashes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='')
print('Applied approved UI repairs; exclusions checked; main untouched.')
