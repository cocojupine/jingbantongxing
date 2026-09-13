import { questions, readState, answerCount, complete, validAnswer, setAnswer, submit, storageKey } from './model.mjs';

const content = document.querySelector('#content');
const actions = document.querySelector('#actions');
const warning = document.querySelector('#save-warning');
let account = 'guest';
try { account = localStorage.getItem('userPhone') || 'guest'; } catch { /* In-memory fallback. */ }
const key = storageKey(account);
let serialized = null;
try { serialized = localStorage.getItem(key); } catch { /* In-memory fallback. */ }
const state = readState(serialized);
let stage = state.completedAt ? 'done' : 'intro';
let saved = true;

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const questionText = q => {
  const split = q.text.indexOf('（');
  return split < 0 ? { title: q.text, example: '' } : { title: q.text.slice(0, split), example: q.text.slice(split + 1).replace(/）$/, '') };
};
function persist() {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    saved = true;
    warning.hidden = true;
  } catch {
    saved = false;
    warning.hidden = false;
    warning.textContent = '当前浏览器无法保存进度。你仍可填写，但离开页面后答案可能丢失。';
  }
}
function show(next) {
  stage = next;
  render();
  content.scrollTop = 0;
  content.focus({ preventScroll: true });
}
function navigateQuestion(index) {
  state.index = Math.max(0, Math.min(questions.length - 1, index));
  persist();
  show('question');
}
function footer(markup) { actions.innerHTML = markup; }
function button(label, action, cls = 'primary', disabled = false) {
  return `<button class="${cls}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
}
function renderIntro() {
  const count = answerCount(state);
  content.innerHTML = `
    <section class="start-page">
      <p class="start-count">共 ${questions.length} 题</p>
      <h1>行前感官问卷</h1>
      <p class="start-description">按平时的真实感受选择，没有对错。</p>
      ${count ? `<p class="draft-note">已填写 ${count} / ${questions.length} 题</p>` : ''}
    </section>`;
  footer(`${button(count ? '继续填写' : '开始填写', 'start')}<p class="footer-hint">进度保存在当前设备，可随时继续</p>`);
}
function renderQuestion() {
  const q = questions[state.index];
  const { title, example } = questionText(q);
  const count = answerCount(state);
  content.innerHTML = `
    <section class="question-progress">
      <div class="progress-heading"><span>第 <strong>${state.index + 1}</strong> / ${questions.length} 题</span><span id="answered">已答 ${count} 题</span></div>
      <div class="progress-track" role="progressbar" aria-label="已完成题目" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${count}"><div id="progress-fill" style="width:${count / questions.length * 100}%"></div></div>
    </section>
    <section class="question-panel">
      <div class="question-meta"><span class="pill" data-dimension="${q.dimension}">${q.dimensionTitle}</span><span>本维度第 ${q.dimensionIndex + 1} / ${q.dimensionCount} 题</span></div>
      <fieldset><legend>${escapeHtml(title)}</legend>
        ${example ? `<p class="example">${escapeHtml(example)}</p>` : ''}
        <div class="options">${q.options.map(option => `<label class="option"><input type="radio" name="answer" value="${option.value}" ${state.answers[q.id] === option.value ? 'checked' : ''}><span class="option-score">${option.value}</span><span class="option-label">${escapeHtml(option.label)}</span><span class="radio-mark" aria-hidden="true"></span></label>`).join('')}</div>
      </fieldset>
    </section>`;
  footer(`<div class="button-row">${button('上一题', 'previous', 'secondary', state.index === 0)}${button(state.index === questions.length - 1 ? '完成' : '下一题', 'next', 'primary', !validAnswer(state.answers[q.id]))}</div>`);
}
function renderDone() {
  const date = new Date(state.completedAt).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  content.innerHTML = `<section class="done-hero"><div class="done-check" aria-hidden="true">✓</div><span class="eyebrow">${questions.length} / ${questions.length} 题已完成</span><h1>谢谢你告诉小白<br>你的感受</h1><p>行前感官问卷已完成。<br>${saved ? '答案已保存在当前设备，可以随时回来查看或修改。' : '答案暂时保留在本页，请留意上方保存提示。'}</p><img class="done-mascot" src="../assets/xiaobai.png" alt="小白陪着你"></section><section class="completion-card"><span>本次填写</span><strong>五感 · ${questions.length} 题</strong><span>完成时间</span><strong>${escapeHtml(date)}</strong></section>`;
  footer(`<a class="primary" href="../#/profile">返回我的</a>${button('修改答案', 'edit', 'text-button')}`);
}
function render() {
  document.querySelector('.device').dataset.stage = stage;
  ({ intro: renderIntro, question: renderQuestion, done: renderDone })[stage]();
  const home = document.querySelector('#home');
  home.textContent = stage === 'question' ? '稍后继续' : '我的';
  home.setAttribute('aria-label', stage === 'question' ? '保存进度并返回我的' : '返回我的');
  document.querySelector('#back').setAttribute('aria-label', stage === 'intro' || stage === 'done' ? '返回我的' : '返回问卷首页');
}

document.addEventListener('change', event => {
  if (stage !== 'question' || !event.target.matches('input[name="answer"]')) return;
  setAnswer(state, questions[state.index].id, Number(event.target.value));
  persist();
  const count = answerCount(state);
  document.querySelector('#answered').textContent = `已答 ${count} 题`;
  document.querySelector('#progress-fill').style.width = `${count / questions.length * 100}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', count);
  actions.querySelector('[data-action="next"]').disabled = false;
});
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'start') navigateQuestion(state.index);
  if (action === 'edit') navigateQuestion(0);
  if (action === 'previous' && state.index > 0) navigateQuestion(state.index - 1);
  if (action === 'next' && validAnswer(state.answers[questions[state.index].id])) {
    if (state.index === questions.length - 1) {
      if (complete(state)) { submit(state); persist(); show('done'); }
      else navigateQuestion(questions.findIndex(q => !validAnswer(state.answers[q.id])));
    } else navigateQuestion(state.index + 1);
  }
});
document.querySelector('#home').addEventListener('click', persist);
document.querySelector('#back').addEventListener('click', () => {
  if (stage === 'intro' || stage === 'done') location.href = '../#/profile';
  else { persist(); show('intro'); }
});
render();
