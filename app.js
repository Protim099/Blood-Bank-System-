// ─────────────────────────────────────────────────────────────
//  Blood Bank Management System — frontend (vanilla JS)
// ─────────────────────────────────────────────────────────────
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LOW_STOCK = 5;
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let token = localStorage.getItem('bb_token');
let username = localStorage.getItem('bb_user');

// ── API ─────────────────────────────────────────────────────
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') { signOut(); throw new Error('Session expired. Please sign in again.'); }
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

let toastTimer;
function toast(msg, bad = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (bad ? ' bad' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = 'toast'), 3200);
}
const guard = fn => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, true); } };

// ── Generic form dialog ─────────────────────────────────────
// fields: [{name, label, type?, options?, required?, min?, max?, half?}]
function openForm({ title, fields, values = {}, submitLabel = 'Save', onSubmit }) {
  const dlg = $('#dlg'), form = $('#dlg-form');
  const input = f => {
    const v = values[f.name] ?? '';
    if (f.options) {
      return `<select name="${f.name}" ${f.required ? 'required' : ''}>
        <option value="">Select…</option>
        ${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    }
    return `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" ${f.required ? 'required' : ''}
      ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''}>`;
  };
  const cells = fields.map(f => `<label>${esc(f.label)} ${input(f)}</label>`);
  form.innerHTML = `<h3>${esc(title)}</h3>
    <div class="row2">${cells.join('')}</div>
    <p class="error" id="dlg-error" role="alert"></p>
    <div class="form-actions">
      <button type="button" class="btn" id="dlg-cancel">Cancel</button>
      <button type="submit" class="btn primary">${esc(submitLabel)}</button>
    </div>`;
  // Long fields (address) go full width
  fields.forEach((f, i) => { if (f.full) form.querySelectorAll('.row2 > label')[i].style.gridColumn = '1 / -1'; });
  $('#dlg-cancel').onclick = () => dlg.close();
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      await onSubmit(Object.fromEntries(new FormData(form)));
      dlg.close();
    } catch (err) { $('#dlg-error').textContent = err.message; }
  };
  dlg.showModal();
}

function confirmBox(message, confirmLabel, onConfirm) {
  const dlg = $('#dlg'), form = $('#dlg-form');
  form.innerHTML = `<h3>${esc(message)}</h3>
    <div class="form-actions">
      <button type="button" class="btn" id="dlg-cancel">Cancel</button>
      <button type="submit" class="btn primary">${esc(confirmLabel)}</button>
    </div>`;
  $('#dlg-cancel').onclick = () => dlg.close();
  form.onsubmit = guard(async e => { e.preventDefault(); dlg.close(); await onConfirm(); });
  dlg.showModal();
}

// ── Views ───────────────────────────────────────────────────
const view = () => $('#view');
const bagHTML = ({ blood_group, units }) => {
  const pct = Math.min(100, (units / 20) * 100);
  const cls = units === 0 ? 'empty-bag' : units < LOW_STOCK ? 'low' : '';
  return `<div class="bag ${cls}">
    <div class="bag-body"><div class="bag-fill" style="height:${pct}%"></div><div class="bag-group">${esc(blood_group)}</div></div>
    <div class="bag-units">${units} unit${units === 1 ? '' : 's'}<small>${units === 0 ? 'Out of stock' : units < LOW_STOCK ? 'Running low' : 'In stock'}</small></div>
  </div>`;
};
const statusBadge = s => `<span class="badge ${s === 'approved' ? 'ok' : s === 'rejected' ? 'bad' : 'warn'}">${s}</span>`;

const views = {
  async dashboard() {
    const d = await api('/dashboard');
    view().innerHTML = `
      <div class="page-head"><div><h2>Dashboard</h2><p class="muted">Where the blood bank stands today.</p></div></div>
      <div class="panel"><h3>Blood in stock</h3><div class="bags">${d.inventory.map(bagHTML).join('')}</div></div>
      <div class="stats" style="margin-top:18px">
        <div class="stat"><b>${d.totalUnits}</b>Units available</div>
        <div class="stat"><b>${d.donors}</b>Registered donors</div>
        <div class="stat ${d.pendingRequests ? 'alert' : ''}"><b>${d.pendingRequests}</b>Pending requests</div>
        <div class="stat ${d.expiringSoon ? 'alert' : ''}"><b>${d.expiringSoon}</b>Units expiring in 7 days</div>
      </div>
      <div class="panel"><h3>Latest requests</h3>
        ${d.recentRequests.length ? `<div class="table-wrap"><table>
          <tr><th>Patient</th><th>Hospital</th><th>Group</th><th>Units</th><th>Status</th></tr>
          ${d.recentRequests.map(r => `<tr><td>${esc(r.patient_name)}</td><td>${esc(r.hospital)}</td>
            <td><span class="badge group">${esc(r.blood_group)}</span></td><td>${r.units}</td><td>${statusBadge(r.status)}</td></tr>`).join('')}
        </table></div>` : '<div class="empty">No requests yet. Add one from the Requests page.</div>'}
      </div>
      ${d.expired ? `<p class="muted" style="margin-top:14px">${d.expired} expired unit(s) are still on record. Discard them from the Stock page.</p>` : ''}`;
  },

  async donors() {
    view().innerHTML = `
      <div class="page-head"><div><h2>Donors</h2><p class="muted">Register donors and record their donations.</p></div>
        <button class="btn primary" id="add-donor">Add donor</button></div>
      <div class="toolbar">
        <input id="q" type="search" placeholder="Search name, phone or address">
        <select id="g"><option value="">All blood groups</option>${GROUPS.map(g => `<option>${g}</option>`).join('')}</select>
      </div>
      <div id="donor-table"></div>`;
    const load = guard(async () => {
      const rows = await api(`/donors?q=${encodeURIComponent($('#q').value)}&group=${encodeURIComponent($('#g').value)}`);
      $('#donor-table').innerHTML = rows.length ? `<div class="table-wrap"><table>
        <tr><th>Name</th><th>Group</th><th>Age</th><th>Phone</th><th>Last donation</th><th>Eligibility</th><th></th></tr>
        ${rows.map(d => `<tr>
          <td><b>${esc(d.name)}</b><br><span class="muted">${esc(d.address)}</span></td>
          <td><span class="badge group">${esc(d.blood_group)}</span></td>
          <td>${d.age} · ${esc(d.gender)}</td><td>${esc(d.phone)}</td>
          <td>${d.last_donation_date || '—'}</td>
          <td>${d.eligible ? '<span class="badge ok">Can donate</span>' : `<span class="badge warn">From ${d.eligible_on}</span>`}</td>
          <td><div class="actions">
            <button class="btn small" data-act="donate" data-id="${d.id}" ${d.eligible ? '' : 'disabled'}>Record donation</button>
            <button class="btn small" data-act="edit" data-id="${d.id}">Edit</button>
            <button class="btn small danger" data-act="del" data-id="${d.id}">Delete</button>
          </div></td></tr>`).join('')}
      </table></div>` : '<div class="panel empty">No donors match. Add your first donor to get started.</div>';
      $('#donor-table').onclick = e => {
        const b = e.target.closest('button[data-act]'); if (!b) return;
        const d = rows.find(r => r.id == b.dataset.id);
        if (b.dataset.act === 'edit') donorForm(d);
        if (b.dataset.act === 'del') confirmBox(`Delete ${d.name}?`, 'Delete donor', async () => { await api('/donors/' + d.id, { method: 'DELETE' }); toast('Donor deleted'); load(); });
        if (b.dataset.act === 'donate') openForm({
          title: `Record donation — ${d.name} (${d.blood_group})`, submitLabel: 'Add to stock',
          fields: [{ name: 'units', label: 'Units collected', type: 'number', min: 1, max: 2, required: true }],
          values: { units: 1 },
          onSubmit: async v => { await api('/donations', { method: 'POST', body: { donor_id: d.id, units: v.units } }); toast('Donation recorded'); load(); },
        });
      };
    });
    const donorForm = d => openForm({
      title: d ? 'Edit donor' : 'Add donor', values: d || {},
      fields: [
        { name: 'name', label: 'Full name', required: true, full: true },
        { name: 'blood_group', label: 'Blood group', options: GROUPS, required: true },
        { name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'], required: true },
        { name: 'age', label: 'Age', type: 'number', min: 18, max: 65, required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'address', label: 'Address', full: true },
      ],
      onSubmit: async v => {
        await api(d ? '/donors/' + d.id : '/donors', { method: d ? 'PUT' : 'POST', body: v });
        toast(d ? 'Donor updated' : 'Donor added'); load();
      },
    });
    $('#add-donor').onclick = () => donorForm();
    let t; $('#q').oninput = () => { clearTimeout(t); t = setTimeout(load, 250); };
    $('#g').onchange = load;
    load();
  },

  async stock() {
    const [dash, rows] = await Promise.all([api('/dashboard'), api('/donations')]);
    view().innerHTML = `
      <div class="page-head"><div><h2>Stock</h2><p class="muted">Whole blood keeps for 35 days. Oldest units are issued first.</p></div>
        <button class="btn" id="purge">Discard expired units</button></div>
      <div class="panel"><div class="bags">${dash.inventory.map(bagHTML).join('')}</div></div>
      <h3 style="margin:24px 0 12px">Donation log</h3>
      ${rows.length ? `<div class="table-wrap"><table>
        <tr><th>Donor</th><th>Group</th><th>Collected</th><th>Units left</th><th>Expires</th><th>Status</th></tr>
        ${rows.map(r => `<tr><td>${esc(r.donor_name || 'Removed donor')}</td>
          <td><span class="badge group">${esc(r.blood_group)}</span></td><td>${r.collected_on}</td>
          <td>${r.units} of ${r.units_collected}</td><td>${r.expires_on}</td>
          <td>${r.expired ? '<span class="badge bad">Expired</span>' : r.units === 0 ? '<span class="badge">Used</span>' : '<span class="badge ok">Available</span>'}</td></tr>`).join('')}
      </table></div>` : '<div class="panel empty">Nothing recorded yet. Record a donation from the Donors page.</div>'}`;
    $('#purge').onclick = () => confirmBox('Discard all expired units?', 'Discard', async () => {
      const r = await api('/donations/expired', { method: 'DELETE' });
      toast(`${r.removed} record(s) removed`); views.stock().catch(e => toast(e.message, true));
    });
  },

  async requests() {
    view().innerHTML = `
      <div class="page-head"><div><h2>Requests</h2><p class="muted">Approving a request takes the units out of stock.</p></div>
        <button class="btn primary" id="add-req">New request</button></div>
      <div class="toolbar"><select id="st">
        <option value="">All statuses</option><option value="pending">Pending</option>
        <option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
      <div id="req-table"></div>`;
    const load = guard(async () => {
      const rows = await api('/requests?status=' + $('#st').value);
      $('#req-table').innerHTML = rows.length ? `<div class="table-wrap"><table>
        <tr><th>Patient</th><th>Hospital</th><th>Contact</th><th>Group</th><th>Units</th><th>Status</th><th></th></tr>
        ${rows.map(r => `<tr><td><b>${esc(r.patient_name)}</b><br><span class="muted">${esc(r.created_at.slice(0, 10))}</span></td>
          <td>${esc(r.hospital)}</td><td>${esc(r.contact)}</td>
          <td><span class="badge group">${esc(r.blood_group)}</span></td>
          <td>${r.units}${r.status === 'pending' ? `<br><span class="muted">${r.in_stock} in stock</span>` : ''}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${r.status === 'pending' ? `<div class="actions">
            <button class="btn small" data-act="approve" data-id="${r.id}">Approve</button>
            <button class="btn small danger" data-act="reject" data-id="${r.id}">Reject</button></div>` : ''}</td></tr>`).join('')}
      </table></div>` : '<div class="panel empty">No requests here. Use “New request” when a hospital calls.</div>';
    });
    $('#req-table').onclick = guard(async e => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      await api(`/requests/${b.dataset.id}/${b.dataset.act}`, { method: 'POST' });
      toast(b.dataset.act === 'approve' ? 'Approved — stock updated' : 'Rejected'); load();
    });
    $('#st').onchange = load;
    $('#add-req').onclick = () => openForm({
      title: 'New blood request', submitLabel: 'Save request',
      fields: [
        { name: 'patient_name', label: 'Patient name', required: true },
        { name: 'hospital', label: 'Hospital', required: true },
        { name: 'blood_group', label: 'Blood group', options: GROUPS, required: true },
        { name: 'units', label: 'Units needed', type: 'number', min: 1, max: 20, required: true },
        { name: 'contact', label: 'Contact number', type: 'tel', required: true, full: true },
      ],
      values: { units: 1 },
      onSubmit: async v => { await api('/requests', { method: 'POST', body: v }); toast('Request saved'); load(); },
    });
    load();
  },
};

// ── Routing & auth ──────────────────────────────────────────
async function route() {
  const name = (location.hash.slice(1) in views) ? location.hash.slice(1) : 'dashboard';
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === name));
  try { await views[name](); } catch (e) { if (token) toast(e.message, true); }
}

function showApp() {
  $('#login').hidden = true; $('#app').hidden = false;
  $('#who').textContent = 'Signed in as ' + username;
  route();
}
function signOut() {
  token = null; localStorage.removeItem('bb_token'); localStorage.removeItem('bb_user');
  $('#app').hidden = true; $('#login').hidden = false;
}

$('#login-form').onsubmit = async e => {
  e.preventDefault();
  $('#login-error').textContent = '';
  try {
    const r = await api('/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
    token = r.token; username = r.username;
    localStorage.setItem('bb_token', token); localStorage.setItem('bb_user', username);
    showApp();
  } catch (err) { $('#login-error').textContent = err.message; }
};
$('#logout-btn').onclick = signOut;
$('#pw-btn').onclick = () => openForm({
  title: 'Change password', submitLabel: 'Update password',
  fields: [
    { name: 'current', label: 'Current password', type: 'password', required: true, full: true },
    { name: 'next', label: 'New password (6+ characters)', type: 'password', required: true, full: true },
  ],
  onSubmit: async v => { await api('/auth/password', { method: 'POST', body: v }); toast('Password updated'); },
});
window.addEventListener('hashchange', () => token && route());

token ? showApp() : ($('#login').hidden = false);
