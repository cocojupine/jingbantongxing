import { contentReady } from './data.mjs?v=2';
import { questions, readState, activeQuestions, answerCount, complete, validAnswer, setAnswer, submit, storageKey, commentLimit, setXiaobaiComment } from './model.mjs?v=3';
import { introMarkup } from '../questionnaire/intro.mjs?v=4';

if (contentReady) startApp();

function startApp() {
  const content = document.querySelector('#content');
  const actions = document.querySelector('#actions');
  const warning = document.querySelector('#save-warning');
  let account = 'guest', role = 'xinqingnian';
  try {
    account = localStorage.getItem('userPhone') || 'guest';
    role = localStorage.getItem('userRole') || 'xinqingnian';
  } catch { /* Continue in memory when storage is unavailable. */ }
  const key = storageKey(account, role);
  let serialized = null;
  try { serialized = localStorage.getItem(key); } catch { /* In-memory fallback. */ }
  const state = readState(serialized);
  let stage = new URLSearchParams(location.search).has('intro') ? 'intro' : state.completedAt ? 'done' : 'intro';
  let saved = true;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const current = () => activeQuestions(state).find(q => q.id === state.currentId);
  const button = (label, action, css = 'primary', disabled = false) =>
    '<button class="' + css + '" data-action="' + action + '"' + (disabled ? ' disabled' : '') + '>' + label + '</button>';
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
  function navigate(id) {
    state.currentId = id;
    persist();
    show('question');
  }
  function renderIntro() {
    const count = answerCount(state);
    content.innerHTML = introMarkup({
      title: '反馈问卷', description: '按这次游园的真实感受填写。',
      total: activeQuestions(state).length, answered: count, kind: 'feedback',
    });
    actions.innerHTML = button(count ? '继续填写' : '开始填写', 'start')
      + '<p class="footer-hint">进度保存在当前设备，可随时继续</p>';
  }
  function renderOptions(q) {
    if (q.type === 'rating') {
      const selected = state.answers[q.id] || 0;
      return '<div class="rating-options">' + Array.from({ length: q.ratingMax }, (_, i) => {
        const value = i + 1;
        return '<label class="rating-choice" data-filled="' + (value <= selected)
          + '"><input type="radio" name="answer" value="' + value + '" aria-label="' + value + ' 星"'
          + (selected === value ? ' checked' : '')
          + '><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.78 5.64 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.93 1.06-6.2L3 9.54l6.22-.9Z"/></svg></span></label>';
      }).join('') + '</div><p class="rating-value" aria-live="polite">'
        + (selected ? selected + ' / ' + q.ratingMax + ' 星' : '') + '</p>'
        + '<div class="optional-feedback"><label for="xiaobai-comment">想补充的话<span>选填</span></label>'
        + '<textarea id="xiaobai-comment" class="feedback-comment" name="xiaobaiComment" maxlength="'
        + commentLimit + '" placeholder="有什么想对小白说的？">' + escapeHtml(state.xiaobaiComment)
        + '</textarea></div>';
    }
    if (q.type === 'text') return '<textarea class="feedback-text" name="answer" aria-label="你的反馈" maxlength="1000">'
      + escapeHtml(state.answers[q.id] || '') + '</textarea>';
    const multiple = q.type === 'multi';
    return '<div class="options">' + q.options.map(option => {
      const selected = multiple ? state.answers[q.id]?.includes(option.value) : state.answers[q.id] === option.value;
      return '<label class="option"><input type="' + (multiple ? 'checkbox' : 'radio')
        + '" name="answer" value="' + escapeHtml(option.value) + '"' + (selected ? ' checked' : '')
        + '><span class="option-score">' + escapeHtml(option.value) + '</span><span class="option-label">'
        + escapeHtml(option.label) + '</span><span class="radio-mark" aria-hidden="true"></span></label>';
    }).join('') + '</div>';
  }
  function renderQuestion() {
    const active = activeQuestions(state), q = current(), index = active.findIndex(item => item.id === q.id);
    const count = answerCount(state);
    content.innerHTML = '<section class="question-progress"><div class="progress-heading"><span>第 <strong>'
      + (index + 1) + '</strong> / <span id="question-total">' + active.length + '</span> 题</span><span id="answered">已答 '
      + count + ' 题</span></div><div class="progress-track" role="progressbar" aria-label="已完成题目" aria-valuemin="0" aria-valuemax="'
      + active.length + '" aria-valuenow="' + count + '"><div id="progress-fill" style="width:'
      + (count / active.length * 100) + '%"></div></div></section><section class="question-panel"><div class="question-meta feedback-meta"><span>'
      + escapeHtml(q.section) + '</span>' + (q.type === 'multi' ? '<span>可多选</span>' : '')
      + '</div><fieldset><legend>' + escapeHtml(q.text) + '</legend>' + renderOptions(q) + '</fieldset></section>';
    actions.innerHTML = '<div class="button-row">' + button('上一题', 'previous', 'secondary', index === 0)
      + button(index === active.length - 1 ? '完成' : '下一题', 'next', 'primary', !validAnswer(q, state.answers[q.id])) + '</div>';
  }
  function refreshAnswer() {
    const active = activeQuestions(state), q = current(), count = answerCount(state);
    document.querySelector('#question-total').textContent = active.length;
    document.querySelector('#answered').textContent = '已答 ' + count + ' 题';
    document.querySelector('#progress-fill').style.width = (count / active.length * 100) + '%';
    const progress = document.querySelector('[role="progressbar"]');
    progress.setAttribute('aria-valuemax', active.length);
    progress.setAttribute('aria-valuenow', count);
    actions.querySelector('[data-action="next"]').disabled = !validAnswer(q, state.answers[q.id]);
    if (q.type === 'multi') {
      for (const input of content.querySelectorAll('input[name="answer"]')) input.checked = !!state.answers[q.id]?.includes(input.value);
    }
    if (q.type === 'rating') {
      for (const label of content.querySelectorAll('.rating-choice')) {
        label.dataset.filled = Number(label.querySelector('input').value) <= state.answers[q.id];
      }
      content.querySelector('.rating-value').textContent = state.answers[q.id] + ' / ' + q.ratingMax + ' 星';
    }
  }
  function renderDone() {
    content.innerHTML = '<section class="done-hero feedback-done"><div class="done-check" aria-hidden="true">✓</div>'
      + '<h1>谢谢你的反馈</h1><p>反馈问卷已完成。<br>'
      + (saved ? '答案已保存在当前设备，可随时查看或修改。' : '答案暂时保留在本页，请留意上方保存提示。') + '</p></section>';
    actions.innerHTML = '<a class="primary" href="../#/profile">返回我的</a>' + button('修改答案', 'edit', 'text-button');
  }
  function render() {
    document.querySelector('.device').dataset.stage = stage;
    ({ intro: renderIntro, question: renderQuestion, done: renderDone })[stage]();
    document.querySelector('#back').setAttribute('aria-label', stage === 'question' ? '返回问卷首页' : '返回我的');
  }
  document.addEventListener('change', event => {
    if (stage !== 'question' || !event.target.matches('input[name="answer"]')) return;
    const q = current();
    let answer = event.target.value;
    if (q.type === 'rating') answer = Number(answer);
    if (q.type === 'multi') {
      const prior = state.answers[q.id] || [];
      if (!event.target.checked) answer = prior.filter(value => value !== answer);
      else if (q.exclusive?.includes(answer)) answer = [answer];
      else answer = [...prior.filter(value => !q.exclusive?.includes(value) && value !== answer), answer];
    }
    setAnswer(state, q.id, answer);
    persist();
    refreshAnswer();
  });
  document.addEventListener('input', event => {
    if (stage === 'question' && event.target.matches('textarea[name="xiaobaiComment"]')) {
      setXiaobaiComment(state, event.target.value);
      persist();
      return;
    }
    if (stage !== 'question' || !event.target.matches('textarea[name="answer"]')) return;
    setAnswer(state, current().id, event.target.value);
    persist();
    refreshAnswer();
  });
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    const active = activeQuestions(state), index = active.findIndex(q => q.id === state.currentId);
    if (action === 'start') navigate(state.currentId);
    if (action === 'edit') navigate(active[0].id);
    if (action === 'previous' && index > 0) navigate(active[index - 1].id);
    if (action === 'next' && validAnswer(current(), state.answers[state.currentId])) {
      if (index < active.length - 1) navigate(active[index + 1].id);
      else if (complete(state)) { submit(state); persist(); show('done'); }
      else navigate(active.find(q => !validAnswer(q, state.answers[q.id])).id);
    }
  });
  document.querySelector('#back').addEventListener('click', event => {
    if (stage === 'question') { event.preventDefault(); persist(); show('intro'); }
  });
  render();
}
