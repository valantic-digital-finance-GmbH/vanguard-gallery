/* SAP Roadmap Tracker — Board renderer */

let allItems = [];
let slipActive = true;
let slippedOnlyActive = false;
let searchQuery = "";

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
  const searchFiltered = !searchQuery
    ? productFiltered
    : productFiltered.filter(item =>
        // Match the item's own text only — NOT the enclosing group fields
        // (quarter column / capability group), which items are bucketed under.
        [item.title, item.status, item.product_display]
          .some(f => f && f.toLowerCase().includes(searchQuery))
      );

  const quarterMap = new Map();
  searchFiltered.forEach(item => {
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
      const slippedInGroup = slipActive ? items.filter(i => i.slipped_from).length : 0;
      const collapsed = defaultCollapsed ? ' collapsed' : '';
      const capCountClass = slippedInGroup > 0 ? ' slip-count' : '';
      const capHeaderSlipClass = slippedInGroup > 0 ? ' has-slipped' : '';
      const itemsHtml = items.map(item => {
        const sClass = statusClass(item.status);
        const isSlipped = slipActive && item.slipped_from;
        const visionClass = isVision ? ' vision' : '';
        const slipHtml = isSlipped
          ? '<div class="slip-badge">&#9888; Slipped from ' + escHtml(item.slipped_from) + '</div>'
          : '';
        const titleHtml = item.url
          ? '<a class="item-link" href="' + escHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + escHtml(item.title) + '</a>'
          : escHtml(item.title);
        return '<div class="item-card ' + sClass + visionClass + (isSlipped ? ' slipped' : '') + '">'
          + '<div class="item-status">' + escHtml(item.status || '') + '</div>'
          + '<div class="item-title">' + titleHtml + '</div>'
          + slipHtml
          + '<div class="item-product">' + escHtml(item.product_display || '') + '</div>'
          + '</div>';
      }).join('');
      return '<div class="cap-group' + collapsed + '">'
        + '<div class="cap-header' + collapsed + capHeaderSlipClass + '" onclick="toggleGroup(this)">'
        + '<span class="chevron"></span>'
        + escHtml(cap)
        + '<span class="cap-count' + capCountClass + '">' + items.length + '</span>'
        + '</div>'
        + '<div class="cap-items">' + itemsHtml + '</div>'
        + '</div>';
    }).join('');  // .filter already removed empty groups

    board.insertAdjacentHTML('beforeend',
      '<div class="col">'
      + '<div class="col-header' + (isVision ? ' vision' : '') + '" onclick="toggleColumn(this)">'
      + '<span class="col-chevron"></span>'
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

function toggleColumn(headerEl) {
  const col = headerEl.closest('.col');
  const isNowCollapsed = headerEl.classList.toggle('collapsed');
  col.querySelectorAll('.cap-group').forEach(g => g.classList.toggle('collapsed', isNowCollapsed));
  col.querySelectorAll('.cap-header').forEach(h => h.classList.toggle('collapsed', isNowCollapsed));
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

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabName + '-panel');
  });
  if (tabName !== 'board') {
    const inp = document.getElementById('search-input');
    if (inp) { inp.value = ''; }
    searchQuery = '';
  }
  document.getElementById('search-wrap').style.display = tabName === 'board' ? '' : 'none';

  if (tabName === 'board') {
    render();
  }
  if (tabName === 'shifts') {
    renderShifts();
  }
}

function renderShifts() {
  const productVal = document.getElementById('product-filter').value;
  const allShifts = window.__SHIFT_HISTORY__ || [];

  const filtered = productVal
    ? allShifts.filter(s => s.product === productVal)
    : allShifts;

  const tbody = document.getElementById('shifts-table-body');
  const empty = document.getElementById('shifts-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = filtered.map(shift => {
    const dirClass = shift.direction === 'forward' ? 'direction-forward' : 'direction-backward';
    const dirText = shift.direction === 'forward' ? '⬆ Forward' : '⬇ Backward';
    return '<tr>'
      + '<td>' + escHtml(shift.date) + '</td>'
      + '<td>' + escHtml(shift.title) + '</td>'
      + '<td>' + escHtml(shift.product_display) + '</td>'
      + '<td>' + escHtml(shift.old_quarter) + '</td>'
      + '<td>' + escHtml(shift.new_quarter) + '</td>'
      + '<td class="' + dirClass + '">' + dirText + '</td>'
      + '</tr>';
  }).join('');
}

function init() {
  try {
    allItems = (window.__LATEST_DATA__ || {}).items || [];
    document.getElementById('product-filter').addEventListener('change', () => {
      render();
      const activeTab = document.querySelector('.tab-btn.active');
      if (activeTab && activeTab.dataset.tab === 'shifts') {
        renderShifts();
      }
    });
    document.getElementById('slip-toggle').addEventListener('click', toggleSlip);
    document.getElementById('slip-toggle').classList.toggle('active', slipActive);
    document.getElementById('slipped-only-toggle').addEventListener('click', toggleSlippedOnly);
    document.getElementById('slipped-only-toggle').classList.toggle('active', slippedOnlyActive);
    document.getElementById('search-input').addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      render();
    });
    document.getElementById('search-input')
      .closest('.search-pill')
      .querySelector('.search-clear')
      .addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        searchQuery = '';
        render();
      });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    render();
  } catch (err) {
    document.getElementById('board').innerHTML =
      '<div class="empty-state"><p>Failed to load data: ' + escHtml(err.message) + '</p></div>';
  }
}

init();
