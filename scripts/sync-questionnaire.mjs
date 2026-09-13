// The existing app is a compiled release. Keep its original layout and add one
// React-rendered link before the family binding card; questionnaire source lives
// in the standalone questionnaire folder. Safe to run again after editing data.
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
// Reuse the release's file-text icon, with the same size, stroke and wrapper as
// the backpack and social-story rows.
const invitation = '!a&&v.jsxs("a",{className:"trip-invitation",href:"./questionnaire/",children:[v.jsx("span",{className:"me-menu-icon","aria-hidden":true,children:v.jsx(w_,{size:20,strokeWidth:1.8})}),v.jsxs("span",{className:"trip-invitation-copy",children:[v.jsx("span",{className:"trip-invitation-title",children:"填写问卷"}),v.jsx("span",{className:"trip-invitation-desc",children:"行前感官问卷 · 17 题"})]}),v.jsx("span",{className:"trip-invitation-arrow","aria-hidden":true,children:"›"})]}),';
const binding = 'v.jsxs("div",{"code-path":"src\\\\pages\\\\Profile.tsx:115:9"';
if (bundle.split(anchor).length !== 2) throw new Error('Cannot locate a unique original profile body');
const entryStart = bundle.indexOf(anchor) + anchor.length;
const entryEnd = bundle.indexOf(binding, entryStart);
if (entryEnd === -1) throw new Error('Cannot locate the original family binding card');
const previousEntry = bundle.slice(entryStart, entryEnd);
if (previousEntry && !previousEntry.startsWith('!a&&v.jsxs("a",{className:"trip-invitation"')) {
  throw new Error('Unexpected content before the family binding card');
}
bundle = bundle.slice(0, entryStart) + invitation + bundle.slice(entryEnd);
await fs.writeFile(bundlePath, bundle, 'utf8');

const indexPath = path.join(release, 'index.html');
let html = await fs.readFile(indexPath, 'utf8');
if (!html.includes('./questionnaire/entry.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="./questionnaire/entry.css">\n  </head>');
}
// The original release has a fixed bundle filename. Version edited resources so
// existing preview tabs request the latest card after a refresh.
const assetVersion = content => createHash('sha256').update(content).digest('hex').slice(0, 12);
const entryCss = await fs.readFile(path.join(release, 'questionnaire/entry.css'), 'utf8');
html = html.replace(/src="\.\/assets\/index-BTDJbxyr\.js(?:\?[^"]*)?"/,
  'src="./assets/index-BTDJbxyr.js?v=' + assetVersion(bundle) + '"');
html = html.replace(/href="\.\/questionnaire\/entry\.css(?:\?[^"]*)?"/,
  'href="./questionnaire/entry.css?v=' + assetVersion(entryCss) + '"');
await fs.writeFile(indexPath, html, 'utf8');
console.log('Questionnaire data synchronized; child profile invitation installed.');
