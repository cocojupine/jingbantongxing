// The existing app is a compiled release. Questionnaire data and the profile
// report are kept as independent modules so they remain maintainable.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = path.join(root, '鲸伴同行-demo-发布包');
const data = await fs.readFile(path.join(root, 'file/questionnaire.js'), 'utf8');
await fs.writeFile(path.join(release, 'questionnaire/data.mjs'), data, 'utf8');

const bundlePath = path.join(release, 'assets/index-BTDJbxyr.js');
let bundle = await fs.readFile(bundlePath, 'utf8');
const anchor = 'className:"me-body",children:[';
const binding = 'v.jsxs("div",{"code-path":"src\\\\pages\\\\Profile.tsx:115:9"';
if (bundle.split(anchor).length !== 2) throw new Error('Cannot locate a unique original profile body');
const entryStart = bundle.indexOf(anchor) + anchor.length;
const entryEnd = bundle.indexOf(binding, entryStart);
if (entryEnd === -1) throw new Error('Cannot locate the original family binding card');
const previousEntry = bundle.slice(entryStart, entryEnd);
if (previousEntry && !previousEntry.startsWith('!a&&v.jsxs("a",{className:"trip-invitation"')) {
  throw new Error('Unexpected content before the family binding card');
}
// The report module inserts a richer card for both the heart-youth and the
// companion view, so remove the former one-role questionnaire-only entry.
bundle = bundle.slice(0, entryStart) + bundle.slice(entryEnd);

const wording = [
  ['children:"家长"', 'children:"伴游人员"'],
  ['children:"我是心青年的家长"', 'children:"我是陪同心青年游园的伴游人员"'],
  ['请先选择您是「心青年」还是「家长」，以便我们为您提供更好的服务。', '请先选择您是「心青年」还是「伴游人员」，以便我们为您提供更好的服务。'],
  ['r.get("role")==="parent"?"家长":"心青年"', 'r.get("role")==="parent"?"伴游人员":"心青年"'],
  ['children:a?"家长视角":"心青年"', 'children:a?"伴游人员视角":"心青年"'],
  ['a?"我守护的心青年":"守护我的家长"', 'a?"我陪伴的心青年":"我的伴游人员"'],
  ['a?"还没有绑定心青年账号":"还没有绑定家长账号"', 'a?"还没有绑定心青年账号":"还没有绑定伴游人员账号"'],
  ['a?"绑定后可查看 TA 的档案，游园提醒更贴心":"绑定后，家长可陪同管理你的游园信息"', 'a?"绑定后可查看 TA 的档案，游园提醒更贴心":"绑定后，伴游人员可了解你的游园支持需求"'],
  ['a?"心青年":"家长"', 'a?"心青年":"伴游人员"'],
  ['placeholder:a?"心青年的姓名":"家长的姓名"', 'placeholder:a?"心青年的姓名":"伴游人员的姓名"'],
  ['填写需要关联的家人信息，确认后显示在当前列表', '填写需要关联的人员信息，确认后显示在当前列表'],
  [['xD=["我的孩子","其他监护对象"],vD=["爸爸","妈妈","其他监护人"]', 'xD=["我的服务对象","其他服务对象"],vD=["伴游人员","志愿者","场馆工作人员"]'], 'xD=["陪伴对象","我的服务对象","其他服务对象"],vD=["志愿者","场馆工作人员","伴游人员"]'],
  [['yD=["爸爸","妈妈","其他监护人"]', 'yD=["伴游人员","志愿者","场馆工作人员"]'], 'yD=["志愿者","场馆工作人员"]'],
  ['const z=a?xD:vD,T=', 'const z=yD,T='],
  ['children:"您是 TA 的"', 'children:"我的伴游身份"'],
  ['children:"TA 与我的关系"', 'children:a?"关联对象":"伴游人员类型"'],
  ['if(!E){e.warning("请选择关系");return}', 'if(!a&&!E){e.warning("请选择伴游人员类型");return}'],
  ['name:b.trim(),phone:$,relation:E,time:', 'name:b.trim(),phone:$,relation:a?"陪伴对象":E,time:'],
  ['children:[j.relation," · ",j.phone.replace', 'children:[a?"陪伴对象":j.relation," · ",j.phone.replace'],
  ['children:z.map(j=>v.jsx("span",', 'children:a?v.jsx("span",{className:"tag-option active",children:"心青年（陪伴对象）"}):z.map(j=>v.jsx("span",'],
  ['填写孩子的信息，小白会给出更贴心的游园建议', '可协助填写心青年的信息，便于了解 TA 的游园需求'],
  ['解除后，这位家人将从关联列表中移除。', '解除后，对方将从关联列表中移除。'],
  ['a.success("档案已保存，小白会按这份档案照顾你")', 'a.success(f?"心青年档案已保存":"个人档案已保存")'],
  ['为感官敏感的孩子免费准备', '为有感官支持需求的心青年准备'],
  ['🙂 声音适中，大部分孩子可轻松适应', '🙂 声音适中，可根据自己的感受选择'],
  ['如果和家人走散了，记住三步：', '如果和伴游人员走散了，记住三步：'],
  ['和家人走散了怎么办', '和伴游人员走散了怎么办'],
  ['可以带孩子提前读一读', '可以和伴游人员一起提前读一读'],
  ['人太多走散了不要慌，记住这三步，很快就能找到家人。', '人多时走散了，先停下来，再向工作人员求助。'],
  ['发现走散了，先站在原地不要跑，这样家人更容易找到我。', '发现走散了，先站在原地不要跑，这样伴游人员更容易找到我。'],
  ['告诉他们爸爸妈妈的电话号码，工作人员会帮忙联系。', '告诉他们伴游人员的电话号码，工作人员会帮忙联系。'],
  ['园区还有家庭卫生间，爸爸妈妈可以陪我一起进去。', '园区还有家庭卫生间，我需要协助时可以请伴游人员帮忙。'],
  ['告诉他们家长的电话', '告诉他们伴游人员的电话'],
];
for (const [sources, to] of wording) {
  for (const from of [sources].flat()) {
    if (bundle.includes(from)) bundle = bundle.split(from).join(to);
  }
  if (!bundle.includes(to)) throw new Error(`Cannot update wording: ${JSON.stringify(sources)}`);
}
// Feedback uses the same menu row and icon style as the adjacent profile links.
const storyAnchor = '{icon:v.jsx(Hy,{"code-path":"src\\\\pages\\\\Profile.tsx:80:13"';
const feedbackRow = '{icon:v.jsx(w_,{size:20,strokeWidth:1.8}),label:"反馈问卷",desc:"分享这次游园的感受",onClick:()=>{window.location.href="./feedback/"}},';
if (!bundle.includes('label:"反馈问卷"')) {
  if (bundle.split(storyAnchor).length !== 2) throw new Error('Cannot locate a unique social-story menu row');
  bundle = bundle.replace(storyAnchor, feedbackRow + storyAnchor);
}
await fs.writeFile(bundlePath, bundle, 'utf8');

const indexPath = path.join(release, 'index.html');
let html = await fs.readFile(indexPath, 'utf8');
if (!html.includes('./questionnaire/entry.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="./questionnaire/entry.css">\n  </head>');
}
if (!html.includes('./questionnaire/profile-report.mjs')) {
  html = html.replace('</body>', '    <script type="module" src="./questionnaire/profile-report.mjs"></script>\n  </body>');
}
// The original release has a fixed bundle filename. Version edited resources so
// existing preview tabs request the latest card after a refresh.
const assetVersion = content => createHash('sha256').update(content).digest('hex').slice(0, 12);
const entryCss = await fs.readFile(path.join(release, 'questionnaire/entry.css'), 'utf8');
const reportModule = await fs.readFile(path.join(release, 'questionnaire/profile-report.mjs'), 'utf8');
html = html.replace(/src="\.\/assets\/index-BTDJbxyr\.js(?:\?[^"]*)?"/,
  'src="./assets/index-BTDJbxyr.js?v=' + assetVersion(bundle) + '"');
html = html.replace(/href="\.\/questionnaire\/entry\.css(?:\?[^"]*)?"/,
  'href="./questionnaire/entry.css?v=' + assetVersion(entryCss) + '"');
html = html.replace(/src="\.\/questionnaire\/profile-report\.mjs(?:\?[^"]*)?"/,
  'src="./questionnaire/profile-report.mjs?v=' + assetVersion(reportModule) + '"');
await fs.writeFile(indexPath, html, 'utf8');
console.log('Questionnaire data synchronized; sensory report and companion wording installed.');
