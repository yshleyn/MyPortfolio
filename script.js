const categories = ['activities', 'quizzes', 'exams', 'projects'];

// Load saved items on page load
document.addEventListener('DOMContentLoaded', () => {
  categories.forEach(cat => renderCategoryItems(cat));
  setupDragAndDrop();
});

// Switch between work category tabs
function switchTab(event, category) {
  document.querySelectorAll('.works-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const targetPanel = document.getElementById(`panel-${category}`);
  if (targetPanel) targetPanel.classList.add('active');
  event.currentTarget.classList.add('active');
}

// Trigger file browser window
function triggerFileInput(category) {
  document.getElementById(`file-${category}`).click();
}

// Auto-upload files on input change
function autoUploadFiles(event, category) {
  const files = event.target.files;
  if (!files.length) return;
  processAndSaveFiles(files, category);
  event.target.value = ''; // Reset input
}

// Process file list & convert to base64 for persistent localStorage
function processAndSaveFiles(files, category) {
  let savedItems = JSON.parse(localStorage.getItem(`ayesha_works_${category}`)) || [];
  let loadedCount = 0;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const newItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'file',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dataUrl: e.target.result
      };

      savedItems.push(newItem);
      loadedCount++;

      if (loadedCount === files.length) {
        try {
          localStorage.setItem(`ayesha_works_${category}`, JSON.stringify(savedItems));
          renderCategoryItems(category);
          showToast(`Auto-uploaded ${files.length} file(s) to ${category.toUpperCase()}!`);
        } catch (err) {
          showToast('Storage full! Try uploading smaller files.');
        }
      }
    };
    reader.readAsDataURL(file);
  });
}

// Render cards from stored data
function renderCategoryItems(category) {
  const container = document.getElementById(`list-${category}`);
  const savedItems = JSON.parse(localStorage.getItem(`ayesha_works_${category}`)) || [];
  
  container.innerHTML = '';

  savedItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.id = item.id;
    card.innerHTML = `
      <div class="work-card-info">
        <div class="work-file-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="work-file-details">
          <div class="work-file-name" title="${item.name}">${item.name}</div>
          <div class="work-file-meta">
            <span>${item.size}</span>
            <span>•</span>
            <span>${item.date}</span>
          </div>
        </div>
      </div>
      <div class="work-card-actions">
        <a href="${item.dataUrl}" download="${item.name}" target="_blank" class="btn-action view">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View / Open
        </a>
        <button class="btn-action delete" onclick="deleteWorkItem('${category}', '${item.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Remove single work item
function deleteWorkItem(category, itemId) {
  let savedItems = JSON.parse(localStorage.getItem(`ayesha_works_${category}`)) || [];
  savedItems = savedItems.filter(item => item.id !== itemId);
  localStorage.setItem(`ayesha_works_${category}`, JSON.stringify(savedItems));
  renderCategoryItems(category);
  showToast('Item deleted successfully.');
}

// Configure drag & drop listeners
function setupDragAndDrop() {
  categories.forEach(cat => {
    const dropzone = document.getElementById(`dropzone-${cat}`);

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length) {
        processAndSaveFiles(files, cat);
      }
    }, false);
  });
}

// Display status toast message
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}