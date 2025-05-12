// popup.js

// 1. Grab UI elements
const addBtn = document.getElementById('add-btn');
const formContainer = document.getElementById('form-container');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const displayNameInput = document.getElementById('display-name');
const profileUrlInput = document.getElementById('profile-url');
const iconSelect = document.getElementById('icon-select');
const linksList = document.getElementById('links-list');

let links = [];
let editIndex = null;

// 2. Utility to load icons into the <select>
const iconFiles = ['facebook.svg','x.svg','instagram.svg','linkedin.svg','youtube.svg','default.svg'];
iconFiles.forEach(file => {
  const opt = document.createElement('option');
  opt.value = file;
  // give default.svg a friendly label
  opt.text = file === 'default.svg' 
    ? 'Other (default icon)' 
    : file.replace('.svg','').charAt(0).toUpperCase() + file.replace('.svg','').slice(1);
  iconSelect.appendChild(opt);
});


// 3. Show form
addBtn.addEventListener('click', () => {
  editIndex = null;
  displayNameInput.value = '';
  profileUrlInput.value = '';
  iconSelect.value = 'default.svg';
  formContainer.classList.remove('hidden');
});

// 4. Cancel
cancelBtn.addEventListener('click', () => {
  formContainer.classList.add('hidden');
});

// 5. Save (Add or Edit)
saveBtn.addEventListener('click', () => {
  const name = displayNameInput.value.trim();
  const url  = profileUrlInput.value.trim();
  const icon = iconSelect.value;

  if (!name || !url) {
    alert('Please fill in both fields.');
    return;
  }

  const entry = { name, url, icon };
  if (editIndex !== null) {
    links[editIndex] = entry;
  } else {
    links.push(entry);
  }

  chrome.storage.sync.set({ links }, () => {
    formContainer.classList.add('hidden');
    renderList();
  });
});

// 6. Load existing links from storage on popup open
chrome.storage.sync.get('links', data => {
  links = data.links || [];
  renderList();
});

// 7. Render list helper
function renderList() {
  linksList.innerHTML = '';
  links.forEach((link, idx) => {
    const li = document.createElement('li');
    li.className = 'link-item';

    // Icon (click to copy)
    const img = document.createElement('img');
    img.src = `icons/${link.icon}`;
    img.title = 'Copy URL';
    img.addEventListener('click', () => copyToClipboard(link.url, img));
    li.appendChild(img);

    // Name (also copy)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = link.name;
    nameSpan.addEventListener('click', () => copyToClipboard(link.url, nameSpan));
    li.appendChild(nameSpan);

    // Edit / Delete controls
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => startEdit(idx));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => deleteLink(idx));
    actions.appendChild(delBtn);

    li.appendChild(actions);
    linksList.appendChild(li);
  });
}

// 8. Copy helper with feedback
function copyToClipboard(text, anchorEl) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = anchorEl.textContent;
    anchorEl.textContent = 'Copied!';
    setTimeout(() => anchorEl.textContent = orig, 1000);
  });
}

// 9. Edit flow
function startEdit(idx) {
  editIndex = idx;
  const { name, url, icon } = links[idx];
  displayNameInput.value = name;
  profileUrlInput.value = url;
  iconSelect.value = icon;
  formContainer.classList.remove('hidden');
}

// 10. Delete flow
function deleteLink(idx) {
  if (!confirm('Delete this link?')) return;
  links.splice(idx, 1);
  chrome.storage.sync.set({ links }, renderList);
}
