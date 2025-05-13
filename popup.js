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


    const copyBtn = document.createElement('button');
    copyBtn.title = 'Copy URL';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>`;
    copyBtn.onclick = () => copyFeedback(lnk.url);
    actions.append(copyBtn);

    const openBtn = document.createElement('button');
    openBtn.title = 'Open in new tab';
    openBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
    <path d="M14 3v2h3.59L10 12.59 11.41 14 19 6.41V10h2V3h-7z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4h-2v4H5V5z"/>
    </svg>`;
    openBtn.onclick = () => {
    const absoluteUrl = lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`;
    window.open(absoluteUrl, '_blank');
    };
    actions.append(openBtn);

    const editBtn = document.createElement('button');
    editBtn.title = 'Edit';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
    <path d="M3 17.25V21h3.75l11.07-11.07-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
    </svg>`;
    editBtn.onclick = () => startEdit(i);
    actions.append(editBtn);

    const delBtn = document.createElement('button');
    delBtn.title = 'Delete';
    delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
    </svg>`;
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
