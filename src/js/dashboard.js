// DOM Elements
const entriesList = document.getElementById('entriesList');
const entryForm = document.querySelector('.entry-form');
const logoutButton = document.querySelector('.log-out');
const username = document.querySelector('.username');

// Load user data
const userData = JSON.parse(localStorage.getItem('user'));
if (!userData) {
    window.api.navigate('src/html/login.html');
} else {
    username.textContent = userData.name;
}

// Load entries when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // loadEntries();
});

// Handle new entry submission
entryForm.querySelector('button').addEventListener('click', () => {
    const content = entryForm.querySelector('textarea').value;
    
    if (!content.trim()) {
        alert('Please write something before saving.');
        return;
    }

    const entry = {
        content,
        userId: userData.id
    };

    // Send to main process to save in database
    // ipcRenderer.send('add-entry', entry);
    
    // Clear form
    entryForm.querySelector('textarea').value = '';
});

// Listen for entry added confirmation
window.api.entryAdded(() => {
    // loadEntries();
});
window.api.getEntries(userData.id);

window.api.entries((event, entries) => {
    displayEntries(entries);
});
// Display entries in the UI
function displayEntries(entries) {
    entriesList.innerHTML = '';
    
    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-card';
        
        const date = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        entryElement.innerHTML = `
            <div class="entry-date">${date}</div>
            <div class="entry-content">${entry.content || entry.title}</div>
        `;
        
        entriesList.appendChild(entryElement);
    });
}

// Handle sidebar navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        if (item.textContent.includes('Settings')) {
            // Handle settings navigation
        } else if (item.textContent.includes('Profile')) {
            // Handle profile navigation
        }
    });
});

// Handle logout
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.api.navigate('index.html');
}); 