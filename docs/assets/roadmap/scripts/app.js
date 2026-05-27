/* SAP Roadmap Tracker — Board renderer */

let allItems = [];
let slipActive = true;
let slippedOnlyActive = false;

function quarterSortKey(q) {
  if (!q || q === 'null' || q === 'undefined') return 999999;
  if (q === 'Product Vision') return 999998;
  const m = q.match(/Q(\d)\s+(\d{4})/);
  if (!m) return 999997;
  return parseInt(m[2]) * 10 + parseInt(m[1]);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusClass(status) {
  if (!status) return '';
  const s = status.toUpperCase();
  if (s === 'PLANNED') return 'status-planned';
  if (s === 'DELIVERED') return 'status-delivered';
  if (s.includes('PROGRESS')) return 'status-inprogress';
  return '';
}

function render() {
  const productVal = document.getElementById('product-filter').value;
  const productFiltered = productVal ? allItems.filter(i => i.product === productVal) : allItems;

  const quarterMap = new Map();
  productFiltered.forEach(item => {
    const q = item.quarter || 'Product Vision';
    if (!quarterMap.has(q)) quarterMap.set(q, new Map());
    const capMap = quarterMap.get(q);
    const cap = item.capability || 'Other';
    if (!capMap.has(cap)) capMap.set(cap, []);
    capMap.get(cap).push(item);
  });

  const quarters = [...quarterMap.keys()].sort((a, b) => quarterSortKey(a) - quarterSortKey(b));
  const board = document.getElementById('board');
  board.innerHTML = '';

  if (quarters.length === 0) {
    board.innerHTML = '<div class="empty-state"><p>No items match the selected filter.</p></div>';
    return;
  }

  quarters.forEach(quarter => {
    const capMap = quarterMap.get(quarter);
    const isVision = quarter === 'Product Vision';
    const renderedCaps = [...capMap.keys()].sort().map(cap => {
      const allCapItems = capMap.get(cap);
      return { cap, items: slippedOnlyActive ? allCapItems.filter(i => i.slipped_from) : allCapItems };
    }).filter(g => g.items.length > 0);
    const defaultCollapsed = renderedCaps.length > 3;

    let totalVisible = 0;
    const groupsHtml = renderedCaps.map(({ cap, items }) => {
      totalVisible += items.length;
      const collapsed = defaultCollapsed ? ' collapsed' : '';
      const itemsHtml = items.map(item => {
        const sClass = statusClass(item.status);
        const isSlipped = slipActive && item.slipped_from;
        const visionClass = isVision ? ' vision' : '';
        const slipHtml = isSlipped
          ? '<div class="slip-badge">&#9888; Slipped from ' + escHtml(item.slipped_from) + '</div>'
          : '';
        return '<div class="item-card ' + sClass + visionClass + (isSlipped ? ' slipped' : '') + '">'
          + '<div class="item-status">' + escHtml(item.status || '') + '</div>'
          + '<div class="item-title">' + escHtml(item.title) + '</div>'
          + slipHtml
          + '<div class="item-product">' + escHtml(item.product_display || '') + '</div>'
          + '</div>';
      }).join('');
      return '<div class="cap-group' + collapsed + '">'
        + '<div class="cap-header' + collapsed + '" onclick="toggleGroup(this)">'
        + '<span class="chevron">&#9660;</span>'
        + escHtml(cap)
        + '<span class="cap-count">' + items.length + '</span>'
        + '</div>'
        + '<div class="cap-items">' + itemsHtml + '</div>'
        + '</div>';
    }).join('');  // .filter already removed empty groups

    board.insertAdjacentHTML('beforeend',
      '<div class="col">'
      + '<div class="col-header' + (isVision ? ' vision' : '') + '">'
      + escHtml(quarter) + '<span class="count">' + totalVisible + '</span>'
      + '</div>'
      + '<div class="col-body">' + groupsHtml + '</div>'
      + '</div>'
    );
  });
}

function toggleGroup(headerEl) {
  const group = headerEl.closest('.cap-group');
  const isNowCollapsed = group.classList.toggle('collapsed');
  headerEl.classList.toggle('collapsed', isNowCollapsed);
}

function toggleSlip() {
  slipActive = !slipActive;
  document.getElementById('slip-toggle').classList.toggle('active', slipActive);
  render();
}

function toggleSlippedOnly() {
  slippedOnlyActive = !slippedOnlyActive;
  document.getElementById('slipped-only-toggle').classList.toggle('active', slippedOnlyActive);
  render();
}

function init() {
  try {
    allItems = (window.__LATEST_DATA__ || {}).items || [];
    document.getElementById('product-filter').addEventListener('change', render);
    document.getElementById('slip-toggle').addEventListener('click', toggleSlip);
    document.getElementById('slip-toggle').classList.toggle('active', slipActive);
    document.getElementById('slipped-only-toggle').addEventListener('click', toggleSlippedOnly);
    document.getElementById('slipped-only-toggle').classList.toggle('active', slippedOnlyActive);
    render();
  } catch (err) {
    document.getElementById('board').innerHTML =
      '<div class="empty-state"><p>Failed to load data: ' + escHtml(err.message) + '</p></div>';
  }
}

init();
