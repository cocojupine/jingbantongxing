import { storageKey } from './model.mjs';
import { buildSensoryReport, supportNotes } from './report-model.mjs';
import { jbRead } from '../assets/ui-repairs.js?v=2';

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function savedQuestionnaire(account) {
  try { return localStorage.getItem(storageKey(account)); } catch { return null; }
}

function linkedPerson() {
  const role = localStorage.getItem('userRole');
  if (role !== 'parent') return null;
  const phone = localStorage.getItem('userPhone') || 'visitor';
  const bindings = jbRead('bindings', [], false, `parent:${phone}`);
  const serviceObjectRelations = ['陪伴对象', '我的服务对象', '其他服务对象'];
  return bindings.find(item => item && typeof item.phone === 'string' && serviceObjectRelations.includes(item.relation)) || null;
}

function reportAccount() {
  const role = localStorage.getItem('userRole');
  if (role === 'parent') return linkedPerson()?.phone || null;
  return localStorage.getItem('userPhone') || 'guest';
}

function radarSvg(scores) {
  const centre = 92;
  const radius = 59;
  const point = (index, ratio = 1) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / scores.length;
    return [centre + Math.cos(angle) * radius * ratio, centre + Math.sin(angle) * radius * ratio];
  };
  const polygon = ratio => scores.map((_, index) => point(index, ratio).map(value => value.toFixed(1)).join(',')).join(' ');
  const values = scores.map((score, index) => point(index, score.sensitivity / 100).map(value => value.toFixed(1)).join(',')).join(' ');
  const labels = scores.map((score, index) => {
    const [x, y] = point(index, 1.28);
    return `<text class="radar-label" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${escapeHtml(score.title)}</text>`;
  }).join('');
  return `<svg class="sensory-radar" viewBox="0 0 184 184" role="img" aria-label="五维感官敏感度雷达图">
    <polygon class="radar-bg" points="${polygon(1)}" />
    <polygon class="radar-grid" points="${polygon(1)}" />
    <polygon class="radar-grid" points="${polygon(.66)}" />
    <polygon class="radar-grid" points="${polygon(.33)}" />
    ${scores.map((_, index) => { const [x, y] = point(index); return `<line class="radar-axis" x1="${centre}" y1="${centre}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`; }).join('')}
    <polygon class="radar-area" points="${values}" />
    ${scores.map((score, index) => { const [x, y] = point(index, score.sensitivity / 100); return `<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" />`; }).join('')}
    ${labels}
  </svg>`;
}

function scoreRows(scores) {
  return `<div class="sensory-score-list">${scores.map(score => `<div class="sensory-score-row">
    <span>${escapeHtml(score.title)}</span>
    <strong>${score.average.toFixed(1)}<small>/5</small></strong>
  </div>`).join('')}</div>`;
}

function renderReport() {
  const body = document.querySelector('.me-body');
  if (!body || body.querySelector('.sensory-report-card')) return;
  const role = localStorage.getItem('userRole') || 'xinqingnian';
  const companion = role === 'parent';
  const person = linkedPerson();
  const account = reportAccount();
  const report = buildSensoryReport(account ? savedQuestionnaire(account) : null);
  const heading = companion ? '陪伴对象的五感测评' : '我的五感测评';
  const card = document.createElement('section');
  card.className = 'card sensory-report-card';

  if (companion && !person) {
    card.innerHTML = `<div class="sensory-report-heading"><div><p class="sensory-kicker">${heading}</p><h2>关联陪伴对象后查看</h2></div></div>
      <p class="sensory-empty-copy">关联心青年账号后，可在这里查看其完成问卷后的五感测评结果和陪伴关注要点。</p>`;
  } else if (!report.completed) {
    const title = companion ? `${escapeHtml(person.name || '陪伴对象')}的五感测评` : '完成问卷后查看结果';
    const copy = companion ? '对方完成行前感官问卷后，这里会生成可供陪伴参考的五感测评结果。' : '完成行前感官问卷后，这里会生成你的五感测评结果，帮助安排更舒适的游园节奏。';
    card.innerHTML = `<div class="sensory-report-heading"><div><p class="sensory-kicker">${heading}</p><h2>${title}</h2></div></div>
      <p class="sensory-empty-copy">${copy}</p>${companion ? '' : '<a class="sensory-edit-link" href="./questionnaire/">填写问卷 <span>›</span></a>'}`;
  } else {
    card.innerHTML = `<div class="sensory-report-heading"><p class="sensory-kicker">${heading}</p>${companion ? '<span class="sensory-share-tag">伴游参考</span>' : '<a class="sensory-edit-link compact" href="./questionnaire/">编辑问卷</a>'}</div>
      <div class="sensory-report-main">${radarSvg(report.scores)}${scoreRows(report.scores)}</div>
      <div class="companion-notes"><h3>伴游关注要点</h3><ul>${supportNotes.map(note => `<li>${note}</li>`).join('')}</ul></div>`;
  }
  const bindingCard = body.querySelector('.card');
  body.insertBefore(card, bindingCard || null);
}

function scheduleRender() { requestAnimationFrame(renderReport); }
new MutationObserver(scheduleRender).observe(document.querySelector('#root'), { childList: true, subtree: true });
window.addEventListener('storage', scheduleRender);
window.addEventListener('jingban-ui-change', scheduleRender);
scheduleRender();
