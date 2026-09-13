const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function introMarkup({ title, description, total, answered, kind }) {
  const icon = kind === 'feedback'
    ? '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/><path d="M8 10h8M8 14h5"/>'
    : '<rect x="5" y="4" width="14" height="17" rx="3"/><rect x="9" y="2" width="6" height="4" rx="1.5"/><path d="m9 13 2 2 4-4"/>';
  return '<section class="start-page"><div class="start-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
    + icon + '</svg></div><h1>' + escapeHtml(title) + '</h1><p class="start-description">'
    + escapeHtml(description) + '</p><p class="start-count">'
    + (answered ? '已填写 ' + answered + ' / ' + total + ' 题' : '共 ' + total + ' 题')
    + '</p></section>';
}
