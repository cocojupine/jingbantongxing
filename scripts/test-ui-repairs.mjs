import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
}
const local = storage(), session = storage();
globalThis.window = Object.assign(new EventTarget(), {
  localStorage: local, sessionStorage: session,
  location: { hash: '#/profile' }, history: { state: null }
});
globalThis.CustomEvent ??= class extends Event { constructor(type, options) { super(type); this.detail=options?.detail; } };
local.setItem('userRole','parent');
local.setItem('userPhone','13800000001');
local.setItem('userProfile',JSON.stringify({name:'Original demo'}));
local.setItem('backpackBooking',JSON.stringify({code:'LEGACY'}));
const code = await readFile(new URL('../鲸伴同行-demo-发布包/assets/ui-repairs.js',import.meta.url),'utf8');
const ui = await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
function identity(role,phone) { local.setItem('userRole',role); local.setItem('userPhone',phone); }

test('legacy data imports only for its original demo identity',()=>{
  assert.equal(ui.jbRead('profile',{}).name,'Original demo');
  identity('parent','13800000002');
  assert.deepEqual(ui.jbRead('profile',{}),{});
  assert.deepEqual(ui.jbRead('bindings',[]),[]);
  assert.equal(ui.jbRead('booking',null),null);
  identity('parent','13800000001');
  assert.equal(ui.jbRead('profile',{}).name,'Original demo');
});
test('profile, bindings and bookings are isolated by phone AND role',()=>{
  for(const key of ['profile','bindings','booking']) ui.jbWrite(key,key==='bindings'?[{name:'Family'}]:{name:'Owner'});
  identity('xinqingnian','13800000001');
  assert.deepEqual(ui.jbRead('profile',{}),{});
  assert.deepEqual(ui.jbRead('bindings',[]),[]);
  assert.equal(ui.jbRead('booking',null),null);
  identity('parent','13800000001');
  assert.equal(ui.jbRead('booking',null).name,'Owner');
});
test('cancelling an imported booking cannot resurrect legacy data',()=>{
  ui.jbWrite('booking',null);
  assert.equal(ui.jbRead('booking',null),null);
  assert.equal(local.getItem('backpackBooking'),' {"code":"LEGACY"}'.trim());
});
test('favorites synchronize across reads and distinguish story / venue IDs',()=>{
  assert.equal(ui.jbToggleFavorite('story:first-visit'),true);
  assert.equal(ui.jbFavorite('story:first-visit'),true);
  assert.equal(ui.jbFavorite('venue:first-visit'),false);
  identity('parent','13800000002');
  assert.equal(ui.jbFavorite('story:first-visit'),false);
  identity('parent','13800000001');
  assert.equal(ui.jbToggleFavorite('story:first-visit'),false);
});
test('list navigation records the source, detail back pops the history entry',()=>{
  const calls=[], navigate=(...args)=>calls.push(args);
  window.location.hash='#/stories?q=whale';
  ui.jbOpen(navigate,'/stories/first-visit');
  assert.deepEqual(calls.pop(),['/stories/first-visit',{state:{jbFrom:'/stories'}}]);
  window.history.state={idx:2,usr:{jbFrom:'/stories'}};
  ui.jbBack(navigate,'/stories','/stories');
  assert.deepEqual(calls.pop(),[-1]);
  window.history.state={idx:1,usr:{jbFrom:'/profile'}};
  ui.jbBack(navigate,'/main');
  assert.deepEqual(calls.pop(),[-1]);
});
test('direct links and foreign history use safe in-app replacement',()=>{
  const calls=[], navigate=(...args)=>calls.push(args);
  for(const state of [null,{idx:0,usr:{jbFrom:'/stories'}},{idx:3,usr:{jbFrom:'/unexpected'}}]) {
    window.history.state=state;
    ui.jbBack(navigate,'/stories','/stories');
    assert.deepEqual(calls.pop(),['/stories',{replace:true}]);
  }
});
test('returning from a call preserves messages, appends once, accepts distinct calls',()=>{
  const prior=[{key:'q1',role:'user',content:'Where is the backpack?'}];
  const summary={id:'call-a',duration:5,exchanges:[{q:'Question',a:'Answer'}]};
  const once=ui.jbAppendSummary(prior,summary,'summary-a');
  assert.equal(once.length,2);
  assert.equal(once[0],prior[0]);
  assert.match(once[1].content,/5 秒/);
  assert.match(once[1].content,/Answer/);
  assert.equal(ui.jbAppendSummary(once,summary,'repeat'),once);
  assert.equal(ui.jbAppendSummary(once,{...summary,id:'call-b'},'summary-b').length,3);
});
test('chat refresh restores messages and resolves interrupted loading states',()=>{
  ui.jbWrite('chat',[{key:'q',role:'user',content:'Hello'},{key:'a',role:'ai',content:'',loading:true}],true);
  const restored=ui.jbRestoreChat();
  assert.equal(restored.length,2);
  assert.equal(restored[0].content,'Hello');
  assert.equal(restored[1].loading,false);
  assert.match(restored[1].content,/已中断/);
  identity('parent','13800000002');
  assert.deepEqual(ui.jbRestoreChat(),[]);
  identity('parent','13800000001');
});
test('malformed and mismatched stored values fall back safely',()=>{
  const prefix='jingban.ui.v2:'+ui.jbScope()+':';
  local.setItem(prefix+'bad','not-json');
  local.setItem(prefix+'array','{}');
  local.setItem(prefix+'object','[]');
  assert.deepEqual(ui.jbRead('bad',{}),{});
  assert.deepEqual(ui.jbRead('array',[]),[]);
  assert.deepEqual(ui.jbRead('object',{}),{});
});
test('the static demo remains usable when browser storage is unavailable',()=>{
  const old=window.localStorage;
  Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('disabled');}});
  ui.jbWrite('test',{ok:true});
  assert.equal(ui.jbRead('test',{}).ok,true);
  Object.defineProperty(window,'localStorage',{configurable:true,writable:true,value:old});
});
test('logout clears the demo session but preserves identity-specific profile data',()=>{
  ui.jbWrite('profile',{name:'Keep this profile'});
  ui.jbWrite('chat',[{content:'Clear this conversation'}],true);
  ui.jbWrite('pendingCall',{id:'old-call'},true);
  const calls=[];
  ui.jbLogout((...args)=>calls.push(args));
  assert.deepEqual(calls,[['/',{replace:true}]]);
  assert.equal(local.getItem('userPhone'),null);
  identity('parent','13800000001');
  assert.deepEqual(ui.jbRestoreChat(),[]);
  assert.equal(ui.jbRead('pendingCall',null,true),null);
  assert.equal(ui.jbRead('profile',{}).name,'Keep this profile');
});
