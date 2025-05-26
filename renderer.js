const { ipcRenderer } = require('electron');

// DOM Elements
const diaryForm = document.getElementById('diaryForm');
const entriesList = document.getElementById('entriesList');

// Load entries when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
});

// Handle form submission
diaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    const entry = {
        title,
        content,
        date: new Date().toISOString()
    };

    // Send to main process to save in database
    ipcRenderer.send('add-entry', entry);
    
    // Clear form
    diaryForm.reset();
});

// Listen for entry added confirmation
ipcRenderer.on('entry-added', () => {
    loadEntries();
});

// Listen for entry deleted confirmation
ipcRenderer.on('entry-deleted', () => {
    loadEntries();
});

// Load entries from database
function loadEntries() {
    ipcRenderer.send('get-entries');
}

// Receive entries from main process
ipcRenderer.on('entries', (event, entries) => {
    displayEntries(entries);
});

// Display entries in the UI
function displayEntries(entries) {
    entriesList.innerHTML = '';
    
    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        
        const date = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        entryElement.innerHTML = `
            <div class="entry-date">${date}</div>
            <div class="entry-title">${entry.title}</div>
            <div class="entry-content">${entry.content}</div>
            <div class="actions">
                <button class="btn btn-delete" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;
        
        entriesList.appendChild(entryElement);
    });
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        ipcRenderer.send('delete-entry', id);
    }
} 