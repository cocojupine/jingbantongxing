const OLD_NAME = '长乔海洋极地公园';
const OFFICIAL_NAME = '杭州长乔极地海洋公园';

function replaceBrandCopy(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.nodeValue?.includes(OLD_NAME)) {
      root.nodeValue = root.nodeValue.replaceAll(OLD_NAME, OFFICIAL_NAME);
    }
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    if (node.nodeValue?.includes(OLD_NAME)) {
      node.nodeValue = node.nodeValue.replaceAll(OLD_NAME, OFFICIAL_NAME);
    }
  }
}

replaceBrandCopy(document);

new MutationObserver(records => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      replaceBrandCopy(node);
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
