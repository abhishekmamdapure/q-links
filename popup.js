// 1. Elements
const addBtn     = document.getElementById('add-btn');
const formCt     = document.getElementById('form-container');
const saveBtn    = document.getElementById('save-btn');
const cancelBtn  = document.getElementById('cancel-btn');
const nameInput  = document.getElementById('display-name');
const urlInput   = document.getElementById('profile-url');
const iconSelect = document.getElementById('icon-select');
const linksList  = document.getElementById('links-list');
const snackbar   = document.getElementById('snackbar');

let links = [], editIdx = null;

// 2. Icon Library (add more SVGs into icons/ if needed)
const iconFiles = [
  'facebook.svg','x.svg','instagram.svg',
  'linkedin.svg','youtube.svg','default.svg'
];
iconFiles.forEach(f => {
  const opt = document.createElement('option');
  opt.value = f;
  opt.text  = f === 'default.svg'
    ? 'Other'
    : f.replace('.svg','').charAt(0).toUpperCase() + f.slice(1,-4);
  iconSelect.append(opt);
});

// 3. Show Add Form
addBtn.addEventListener('click', () => {
  editIdx = null;
  nameInput.value = '';
  urlInput.value  = '';
  iconSelect.value= 'default.svg';
  formCt.classList.remove('hidden');
});

// 4. Cancel
cancelBtn.addEventListener('click', () => {
  formCt.classList.add('hidden');
});

// 5. Save (Add/Edit)
saveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const url  = urlInput.value.trim();
  const icon = iconSelect.value;
  if (!name || !url) return alert('Both fields are required.');

  const entry = { name, url, icon };
  if (editIdx !== null) links[editIdx] = entry;
  else {
    links.push(entry);
  }
  chrome.storage.sync.set({ links }, () => {
    formCt.classList.add('hidden');
    renderList();
  });
});

// 6. Load on Open
chrome.storage.sync.get('links', data => {
  links = data.links || [];
  renderList();
});

// 7. Render List
function renderList() {
  linksList.innerHTML = '';
  links.forEach((lnk, i) => {
    const li = document.createElement('li');
    li.className = 'link-item _anim-slide-in';

    // Icon
    const img = document.createElement('img');
    img.src = `icons/${lnk.icon}`;
    img.title = 'Copy URL';
    img.addEventListener('click', () => copyFeedback(lnk.url));
    li.append(img);

    // Name
    const nameEl = document.createElement('span');
    nameEl.className = 'name';
    nameEl.textContent = lnk.name;
    nameEl.addEventListener('click', () => copyFeedback(lnk.url));
    li.append(nameEl);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.title = 'Edit';
    editBtn.onclick = () => startEdit(i);
    actions.append(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.title = 'Delete';
    delBtn.onclick = () => deleteLink(i);
    actions.append(delBtn);

    li.append(actions);
    linksList.append(li);
  });
}

// 8. Copy + Snackbar Feedback
function copyFeedback(text) {
  navigator.clipboard.writeText(text).then(() => {
    snackbar.classList.add('show');
    setTimeout(() => snackbar.classList.remove('show'), 1200);
  });
}

// 9. Edit
function startEdit(i) {
  editIdx = i;
  const { name, url, icon } = links[i];
  nameInput.value = name;
  urlInput.value  = url;
  iconSelect.value= icon;
  formCt.classList.remove('hidden');
}

// 10. Delete
function deleteLink(i) {
  if (!confirm('Delete this link?')) return;
  links.splice(i,1);
  chrome.storage.sync.set({ links }, renderList);
}
