// A maintainable enhancement for the static React release. Reuse its profile form
// and the questionnaire's own state model; never infer completion from a click.
import { jbRead } from './ui-repairs.js?v=2';
import { answerCount, questions, readState, storageKey } from '../questionnaire/model.mjs';

const appRoot = document.querySelector('#root');
const profileFields = ['name', 'gender', 'birthday', 'region', 'emergencyPhone', 'avatar', 'sensory', 'interests', 'advice'];
const relations = ['陪伴对象', '我的服务对象', '其他服务对象'];
const fish = new URL('./guide-goldfish.svg', import.meta.url).href;
let dialog = null;
let profileVisit = null;
let framePending = false;
let lastScope = '';
let returnFocus = null;

function stored(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function route() {
  const [path, search = ''] = (location.hash.slice(1) || '/').split('?');
  return { path, params: new URLSearchParams(search) };
}
function progress() {
  const companion = stored('userRole') === 'parent';
  const phone = stored('userPhone') || 'visitor';
  const profile = jbRead('profile', {});
  const filled = profileFields.filter(key => Array.isArray(profile[key]) ? profile[key].length : Boolean(profile[key])).length;
  const person = companion ? jbRead('bindings', []).find(item => item && typeof item.phone === 'string' && relations.includes(item.relation)) : null;
  const account = companion ? person?.phone : stored('userPhone') || 'guest';
  const sensory = readState(account ? stored(storageKey(account)) : null);
  return {
    scope: `${companion ? 'parent' : 'xinqingnian'}:${phone}`,
    companion, person, profileSaved: typeof profile.name === 'string' && Boolean(profile.name.trim()),
    percentage: Math.round(filled / profileFields.length * 100),
    sensoryDone: Boolean(sensory.completedAt), answered: answerCount(sensory),
  };
}
function consumeRequest() {
  const current = route();
  current.params.delete('guide');
  const query = current.params.toString();
  history.replaceState(history.state, '', `${location.pathname}${location.search}#${current.path}${query ? `?${query}` : ''}`);
}
function stepMarkup(state, kind) {
  const profileStep = kind === 'profile';
  const done = profileStep ? state.profileSaved : state.sensoryDone;
  let action;
  if (profileStep) {
    action = done ? '查看档案' : '去填写';
  } else if (state.companion && !state.person) {
    action = '去关联';
  } else if (state.companion) {
    action = '查看测评';
  } else {
    action = done ? '查看测评' : state.answered ? '继续填写' : '去填写';
  }
  const status = profileStep ? done ? `已完成 · ${state.percentage}%` : '未完成'
    : done ? '已完成' : state.answered ? `${state.answered} / ${questions.length} 题` : state.companion && !state.person ? '未关联' : '未完成';
  return `<section class="jg-step ${done ? 'jg-step-done' : ''}">
    <div class="jg-step-heading"><span class="jg-step-number" aria-hidden="true">${done ? '✓' : profileStep ? '1' : '2'}</span><div><h2>${profileStep ? '完善心青年档案' : '完成感官测评'}</h2><p class="jg-status">${status}</p></div></div>
    <button type="button" class="jg-action" data-guide-action="${kind}">${action}<span aria-hidden="true">→</span></button>
  </section>`;
}
function showGuide() {
  if (dialog?.open) return;
  const state = progress();
  const completed = Number(state.profileSaved) + Number(state.sensoryDone);
  returnFocus = document.activeElement;
  dialog = document.createElement('dialog');
  dialog.className = 'jg-dialog';
  dialog.setAttribute('aria-labelledby', 'jg-title');
  dialog.setAttribute('aria-describedby', 'jg-intro');
  dialog.innerHTML = `<div class="jg-scroll">
    <div class="jg-topline"><span>填写指引</span><button type="button" class="jg-close" data-guide-action="dismiss" aria-label="关闭填写指引">×</button></div>
    <div class="jg-welcome"><img src="${fish}" alt="" width="96" height="80"><div><h1 id="jg-title" tabindex="-1">完成游园准备</h1><p id="jg-intro" class="jg-intro">完善档案，再完成感官测评。</p></div></div>
    <p class="jg-progress" role="status">已完成 ${completed} / 2 项</p>
    <div class="jg-steps">${stepMarkup(state, 'profile')}${stepMarkup(state, 'sensory')}</div>
  </div><div class="jg-footer"><button type="button" class="jg-later" data-guide-action="dismiss">返回首页</button></div>`;
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-guide-action]')?.dataset.guideAction;
    if (action === 'dismiss') dismissGuide();
    if (action === 'profile') visitProfile('profile');
    if (action === 'sensory') {
      if (state.companion) visitProfile(state.person ? 'sensory' : 'binding');
      else {
        closeGuide();
        location.href = new URL('../questionnaire/?guide=1', import.meta.url).href;
      }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismissGuide(); });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('#jg-title').focus({ preventScroll: true });
}
function syncHomeBanner(state) {
  const hero = appRoot.querySelector('.main-hero');
  if (!hero) return;
  const original = hero.querySelector(':scope > .show-banner');
  const ready = state.profileSaved && state.sensoryDone;
  let banner = appRoot.querySelector('.jg-home-banner');
  if (ready) {
    banner?.remove();
    return;
  }
  original?.remove();
  if (!banner) {
    banner = document.createElement('button');
    banner.type = 'button';
    banner.className = 'jg-home-banner';
    banner.addEventListener('click', showGuide);
    const anchor = hero.querySelector('.main-hero-row');
    if (anchor) anchor.after(banner);
    else hero.append(banner);
  }
  const completed = Number(state.profileSaved) + Number(state.sensoryDone);
  const summary = `${state.profileSaved ? '档案已完成' : '完善档案'} · ${state.sensoryDone ? '测评已完成' : '感官测评'}`;
  const signature = `${completed}:${summary}:${state.scope}`;
  if (banner.dataset.signature !== signature) {
    banner.dataset.signature = signature;
    banner.innerHTML = `<img src="${fish}" alt="" width="52" height="43"><span><strong>完成游园准备</strong><small>${summary}</small></span><span class="jg-home-cta">去填写</span>`;
  }
}
function closeGuide() {
  if (!dialog) return;
  dialog.close();
  dialog.remove();
  dialog = null;
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}
function dismissGuide() {
  closeGuide();
  location.hash = '/main';
}
function visitProfile(kind) {
  closeGuide();
  profileVisit = { kind, opened: false, sawModal: false };
  location.hash = '/profile';
  schedule();
}
function activeModal() {
  return [...document.querySelectorAll('.ant-modal')].find(node => node.getClientRects().length && node.closest('.ant-modal-wrap')?.style.display !== 'none');
}
function addVisitHint() {
  const body = appRoot.querySelector('.me-body');
  if (!body || body.querySelector('.jg-visit-hint')) return;
  const hint = document.createElement('section');
  hint.className = 'jg-visit-hint';
  const copy = profileVisit.kind === 'profile' ? '小金鱼提示：填写后点击「保存修改」，我会带你继续感官测评。'
    : profileVisit.kind === 'binding' ? '小金鱼提示：填写心青年的姓名和手机号，点击「确认绑定」。'
      : '小金鱼提示：在下方查看陪伴对象的五感测评。测评请由心青年登录本人账号填写。';
  hint.innerHTML = `<p>${copy}</p><button type="button">返回填写指引</button>`;
  hint.querySelector('button').addEventListener('click', () => { profileVisit = null; hint.remove(); showGuide(); });
  body.prepend(hint);
}
function sync() {
  framePending = false;
  const current = route();
  const state = progress();
  if ((lastScope && lastScope !== state.scope) || !['/main', '/profile'].includes(current.path)) {
    closeGuide();
    profileVisit = null;
  }
  lastScope = state.scope;
  if (current.path === '/main') syncHomeBanner(state);
  if (['/main', '/profile'].includes(current.path) && current.params.get('guide') === '1' && appRoot.querySelector(current.path === '/main' ? '.main-page' : '.me-page')) {
    consumeRequest();
    if (current.path === '/profile') showGuide();
  }
  if (!profileVisit || current.path !== '/profile') return;
  addVisitHint();
  if (profileVisit.kind === 'sensory') {
    if (!profileVisit.opened) {
      const card = appRoot.querySelector('.sensory-report-card');
      if (!card) return;
      profileVisit.opened = true;
      card.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    return;
  }
  if (!profileVisit.opened) {
    const target = profileVisit.kind === 'profile' ? appRoot.querySelector('.me-edit-btn')
      : [...appRoot.querySelectorAll('.me-body .btn-outline')].find(node => node.textContent.includes('绑定心青年账号'));
    if (!target) return;
    profileVisit.opened = true;
    target.click();
    schedule();
    return;
  }
  if (activeModal()) profileVisit.sawModal = true;
  else if (profileVisit.sawModal) {
    profileVisit = null;
    appRoot.querySelector('.jg-visit-hint')?.remove();
    showGuide();
  }
}
function schedule() {
  if (!framePending) { framePending = true; requestAnimationFrame(sync); }
}
if (appRoot) {
  // Observe portals as well as the root so returning from the existing modal
  // works after both saving and cancelling, including its close animation.
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('storage', schedule);
  window.addEventListener('jingban-ui-change', schedule);
  schedule();
}
