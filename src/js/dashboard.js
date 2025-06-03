// DOM Elements
const username = document.querySelector('.username');
const viewPageContent = document.getElementById('viewPageContent');
const editPageContent = document.getElementById('editPageContent');
const currentPage = document.getElementById('currentPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const editForm = document.querySelector('.edit-form');
const pageSelect = document.getElementById('pageSelect');
const editCurrentPageBtn = document.getElementById('editCurrentPage');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const editPageTitle = document.getElementById('editPageTitle');
const editParagraphContainer = document.getElementById('editParagraphContainer');
const addParagraphBtn = document.getElementById('addParagraph');
const saveEditBtn = document.getElementById('saveEdit');
const addNewParagraphBtn = document.getElementById('addNewParagraph');
const paragraphContainer = document.querySelector('.paragraph-container');

// Settings Elements
const settingsContent = document.getElementById('settingsContent');
const fontSizeSlider = document.getElementById('fontSize');
const fontFamilySelect = document.getElementById('fontFamily');
const lineSpacingSelect = document.getElementById('lineSpacing');
const showWordCountToggle = document.getElementById('showWordCount');
const spellCheckToggle = document.getElementById('spellCheck');
const autoCorrectToggle = document.getElementById('autoCorrect');

// State management
let currentPageIndex = 0, currentPageNumber = 0, positionCount = 1;
let pages = {};
let min_page_number = 0, pageContent = null, currentPageId = null, pageCreateAt = null;
let selectedTheme = 'clean-white';
let selectedPattern = 'none';

// Global UI Settings
let uiSettingDetails = {
    theme: {
        name: 'clean-white',
        colors: {
            background: '#ffffff',
            text: '#333333',
            headings: '#1a1a1a',
            subtext: '#666666'
        }
    },
    pattern: {
        type: 'none',
        opacity: 0.1
    },
    text: {
        fontSize: '16',
        fontFamily: 'sans-serif',
        lineSpacing: '1.5'
    },
    editing: {
        showWordCount: true,
        spellCheck: true,
        autoCorrect: false
    }
};

// Load user data
const userData = JSON.parse(localStorage.getItem('user'));
if (!userData) {
    window.api.navigate('src/html/login.html');
} else {
    username.textContent = userData.name;
}

const createFirstPage = () => {
    document.querySelector('[data-page=\'edit\']').click();
}

// Handle sidebar navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');

        // Hide all content sections
        [viewPageContent, editPageContent, settingsContent].forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        if (item.dataset.page === 'view') {
            viewPageContent.classList.remove('hidden');
            // loadCurrentPage();
        } else if (item.dataset.page === 'edit') {
            editPageContent.classList.remove('hidden');
        } else if (item.dataset.page === 'settings') {
            settingsContent.classList.remove('hidden');
            loadSettings();
        }
    });
});

const findPageIndexByNumber = (pageNumber) => {
    for (let i = 0; i < pages.pageContent.length; i++) {
        if (pages.pageContent[i].page_number === pageNumber) {
            return i;
        }
    }
    return -1; // Not found
}

const findPageIdByNumber = (pageNumber) => {
    const page = pages.pageContent.find(page => page.page_number === pageNumber);
    return page ? page.page_id : null;
}

const getPageNumbers = () => {
  return pages.pageContent.map(page => page.page_number);
}

const setSelectOptions = () => {
    pageSelect.value = currentPageNumber;
}

// Handle page navigation
prevPageBtn.addEventListener('click', async () => {
    let pageNoArray = getPageNumbers();
    if (currentPageNumber > min_page_number) {
        currentPageNumber--;
        while(!pageNoArray.includes(currentPageNumber)){
            currentPageNumber--;
        }
        currentPageId = findPageIdByNumber(currentPageNumber);
        currentPageIndex = findPageIndexByNumber(currentPageNumber);
        pageContent = await window.api.getPageContent(currentPageId);
        displayCurrentPage();
        setSelectOptions()
    }
});

nextPageBtn.addEventListener('click', async () => {
    let pageNoArray = getPageNumbers();
    if (currentPageNumber < pages.max_page_number) {
        currentPageNumber++;
        while(!pageNoArray.includes(currentPageNumber)){
            currentPageNumber--;
        }
        currentPageId = findPageIdByNumber(currentPageNumber);
        currentPageIndex = findPageIndexByNumber(currentPageNumber);
        pageContent = await window.api.getPageContent(currentPageId);
        displayCurrentPage();
        setSelectOptions()
    }
});

// Handle input validation
function handleInput(input) {
    const maxChars = parseInt(input.dataset.maxChars);
    
    // Handle all input events including paste
    input.addEventListener('input', (e) => {
        if (input.value.length > maxChars) {
            input.value = input.value.substring(0, maxChars);
        }
    });

    // Handle paste event
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        
        // Only take what we can fit
        const remainingSpace = maxChars - input.value.length;
        const textToInsert = pastedText.substring(0, remainingSpace);
        
        // Insert at cursor position
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        const textBefore = input.value.substring(0, startPos);
        const textAfter = input.value.substring(endPos);
        
        input.value = textBefore + textToInsert + textAfter;
        
        // Set cursor position after inserted text
        const newCursorPos = startPos + textToInsert.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
    });
}

// Update position inputs to maintain continuous numbering
function updatePositionInputs() {
    const sections = document.querySelectorAll('.paragraph-section');
    sections.forEach((section, index) => {
        const position = index + 1;
        // Find any position input with class starting with 'position-input-'
        const oldInput = section.querySelector('input[class^="position-input-"]');
        if (oldInput) {
            // Get the current class number
            const currentClass = oldInput.className;
            const classNumber = currentClass.split('-')[2];
            
            // Only update if the numbers don't match
            if (classNumber !== position.toString()) {
                oldInput.className = `position-input-${position}`;
            }
            // Always ensure value matches the class number
            oldInput.value = position;
            console.log('oldInput : ', oldInput, oldInput.value)
        }
    });
    // Update positionCount to reflect current number of sections
    positionCount = sections.length;
}

// Create new paragraph section
function createNewParagraphSection() {
    const section = document.createElement('div');
    section.className = 'paragraph-section';
    const newPosition = positionCount + 1;
    
    section.innerHTML = `
        <button class="btn remove-paragraph-btn">×</button>
        <input type="text" class="subtitle-input" 
            placeholder="Subtitle (optional)" 
            maxlength="255" 
            data-max-chars="255">
        <textarea class="paragraph-input" 
            placeholder="Enter paragraph content" 
            maxlength="800" 
            data-max-chars="800"></textarea>
        <input hidden class="position-input-${newPosition}" min="1" max="4" value="${newPosition}">
    `;

    // Add remove button functionality
    section.querySelector('.remove-paragraph-btn').addEventListener('click', () => {
        section.remove();
        updateParagraphControls();
        updatePositionInputs(); // Update positions after removal
    });

    // Initialize input handlers
    const subtitle = section.querySelector('.subtitle-input');
    const paragraph = section.querySelector('.paragraph-input');
    handleInput(subtitle);
    handleInput(paragraph);

    positionCount++;
    return section;
}

// Update paragraph controls
function updateParagraphControls() {
    const paragraphCount = paragraphContainer.querySelectorAll('.paragraph-section').length;
    addNewParagraphBtn.disabled = paragraphCount >= 4;
    
    // Show/hide remove buttons
    const removeButtons = paragraphContainer.querySelectorAll('.remove-paragraph-btn');
    removeButtons.forEach(button => {
        button.style.display = paragraphCount > 1 ? 'block' : 'none';
    });
}

// Handle new paragraph button
addNewParagraphBtn.addEventListener('click', () => {
    const paragraphCount = paragraphContainer.querySelectorAll('.paragraph-section').length;
    if (paragraphCount < 4) {
        const newSection = createNewParagraphSection();
        paragraphContainer.appendChild(newSection);
        updateParagraphControls();
        updatePositionInputs(); // Ensure positions are correct after adding
    }
});

// Handle new page submission
editForm.querySelector('.save-page-btn').addEventListener('click', async () => {
    const title = document.getElementById('pageTitle').value;
    const paragraphContents = [];
    
    document.querySelectorAll('.paragraph-section').forEach((section, index) => {
        const position = index + 1;
        const positionInput = section.querySelector(`input[class^="position-input-"]`);
        paragraphContents.push({
            sub_title: section.querySelector('.subtitle-input').value,
            paragraph: section.querySelector('.paragraph-input').value,
            sub_title_pos: position,
            paragraph_pos: position
        });
    });

    if (!title.trim()) {
        alert('Please enter a title for the page.');
        return;
    }

    const page = {
        title,
        paragraphContents,
        user_id: userData.id,
        create_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
        page_number: (pages.max_page_number) ? pages.max_page_number + 1 : 1
    };
    console.log('Page:', page);
    let result = await window.api.savePage(page);
    // Clear form
    clearEditForm();
});

// Populate page select dropdown
function populatePageSelect() {
    pageSelect.innerHTML = '';
    pages.pageContent.forEach((page, index) => {
        const option = document.createElement('option');
        option.value = page.page_number;
        option.textContent = `Page ${page.page_number}`;
        if (option.value === currentPageNumber) {
            option.selected = true;
        }
        pageSelect.appendChild(option);
    });
}

// Handle page select change
pageSelect.addEventListener('change', async (e) => {
    currentPageNumber = parseInt(e.target.value);
    currentPageId = findPageIdByNumber(currentPageNumber);
    currentPageIndex = findPageIndexByNumber(currentPageNumber);
    pageContent = await window.api.getPageContent(currentPageId);
    displayCurrentPage();
});

// Create paragraph section for edit modal
function createParagraphSection(subtitle = '', content = '') {
    const section = document.createElement('div');
    section.className = 'paragraph-section';
    section.innerHTML = `
        <input type="text" class="subtitle-input" 
            placeholder="Subtitle (optional)" 
            maxlength="255" 
            data-max-chars="255" 
            value="${subtitle}">
        <textarea class="paragraph-input" 
            placeholder="Enter paragraph content" 
            maxlength="800" 
            data-max-chars="800">${content}</textarea>
        <button class="btn remove-paragraph-btn">Remove</button>
    `;
    
    section.querySelector('.remove-paragraph-btn').addEventListener('click', () => {
        section.remove();
    });

    // Initialize input handlers
    const subtitleInput = section.querySelector('.subtitle-input');
    const paragraphInput = section.querySelector('.paragraph-input');
    handleInput(subtitleInput);
    handleInput(paragraphInput);

    return section;
}

// Handle edit button click
editCurrentPageBtn.addEventListener('click', () => {
    const currentPageData = pages.pageContent[currentPageIndex];
    if (currentPageData === null || currentPageData === undefined) { return; }
    editPageTitle.value = currentPageData.title;
    
    // Clear existing paragraphs
    editParagraphContainer.innerHTML = '';
    
    // Add current paragraphs
    pageContent.forEach(section => {
        const paragraphSection = createParagraphSection(section.sub_title || '', section.paragraph || '');
        editParagraphContainer.appendChild(paragraphSection);
    });
    
    // Disable add paragraph button if there are 4 or more paragraphs
    addParagraphBtn.disabled = pageContent.length >= 4;
    
    editModal.classList.remove('hidden');
});

// Handle add paragraph button
addParagraphBtn.addEventListener('click', () => {
    const newSection = createParagraphSection();
    editParagraphContainer.appendChild(newSection);
    
    // Disable add paragraph button if there are now 4 paragraphs
    const currentParagraphs = editParagraphContainer.querySelectorAll('.paragraph-section');
    addParagraphBtn.disabled = currentParagraphs.length >= 4;
});

// Handle close modal
closeModalBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

// Handle save edit
saveEditBtn.addEventListener('click', async () => {
    const title = editPageTitle.value;
    const paragraphContents = [];
    
    editParagraphContainer.querySelectorAll('.paragraph-section').forEach(section => {
        let position = section.querySelector('.position-input').value
        paragraphContents.push({
            sub_title: section.querySelector('.subtitle-input').value,
            paragraph: section.querySelector('.paragraph-input').value,
            sub_title_pos: position,
            paragraph_pos: position,
        });
    });

    if (!title.trim()) {
        alert('Please enter a title for the page.');
        return;
    }

    const updatedPage = {
        page_id: currentPageId,
        title,
        paragraphContents,
        user_id: userData.id,
        page_number: currentPageNumber,
        create_at: pages.pageContent[currentPageIndex].create_at,
        update_at: new Date().toISOString()
    };
    console.log('Updated Page:', updatedPage);

    // Send to main process to update in database
    // await window.api.updatePage(updatedPage);
    
    // Refresh the page content
    // pageContent = await window.api.getPageContent(currentPageId);
    // displayCurrentPage();
    
    // Close the modal
    editModal.classList.add('hidden');
    positionCount = 1
});

// Display current page
function displayCurrentPage() {
    if ((pages.pageContent.length === 0) || pageContent === null) {
        currentPage.innerHTML = `
            <div class="empty-state">
                <p>No pages available.</p>
                <button class="btn create-first-page-btn">
                    Create Your First Page ✨
                </button>
            </div>`;

        currentPage.querySelector('.create-first-page-btn').addEventListener('click', () => {
            createFirstPage();
        });
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }

    // Format the date
    const formattedDate = new Date(pageCreateAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    let pageHtml = `<div class="page-date">${formattedDate}</div>`;
    pageHtml += `<h2>${pages.pageContent[currentPageIndex].title}</h2>`;
    
    // Sort content by position
    const sortedContent = [...pageContent].sort((a, b) => a.sub_title_pos - b.sub_title_pos);
    
    // Create content based on positions
    sortedContent.forEach(content => {
        if (content.sub_title) {
            pageHtml += `<h3 class="diary-subtitle">${content.sub_title}</h3>`;
        }
        if (content.paragraph) {
            pageHtml += `<p class="diary-paragraph">${content.paragraph}</p>`;
        }
    });

    currentPage.innerHTML = pageHtml;
    
    // Apply current settings to the page
    applySettings();
    
    // Update navigation buttons and page select
    prevPageBtn.disabled = currentPageIndex === 0;
    nextPageBtn.disabled = currentPageIndex === pages.pageContent.length - 1;
}

// Clear edit form
function clearEditForm() {
    document.getElementById('pageTitle').value = '';
    paragraphContainer.innerHTML = '';
    
    // Add one initial paragraph section
    const initialSection = createNewParagraphSection();
    paragraphContainer.appendChild(initialSection);
    updateParagraphControls();
    positionCount = 1; // Reset position count
}

// Handle logout
document.querySelector('.log-out').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.api.navigate('index.html');
}); 

document.addEventListener('DOMContentLoaded', async () => {
    pages = await window.api.pages(userData.id);
    min_page_number = pages.max_page_number;
    for (let i = 0; i < pages.pageContent.length; i++) {
        min_page_number = Math.min(min_page_number, pages.pageContent[i].page_number);
    }
    for (let i = 0; i < pages.pageContent.length; i++) {
        if (pages.pageContent[i].page_number === min_page_number) {
            currentPageId = pages.pageContent[i].page_id;
            currentPageIndex = i;
            pageCreateAt = pages.pageContent[i].create_at;
            currentPageNumber = pages.pageContent[i].page_number;
            break;
        }
    }
    pageContent = await window.api.getPageContent(currentPageId);
    displayCurrentPage();
    populatePageSelect();

    // Initialize input handlers for existing inputs
    document.querySelectorAll('input[data-max-chars], textarea[data-max-chars]').forEach(input => {
        handleInput(input);
    });
});

// Settings Management
function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('journalSettings'));
    if (savedSettings) {
        uiSettingDetails = savedSettings;
    }

    // Apply settings to controls
    fontSizeSlider.value = uiSettingDetails.text.fontSize;
    fontFamilySelect.value = uiSettingDetails.text.fontFamily;
    lineSpacingSelect.value = uiSettingDetails.text.lineSpacing;
    showWordCountToggle.checked = uiSettingDetails.editing.showWordCount;
    spellCheckToggle.checked = uiSettingDetails.editing.spellCheck;
    autoCorrectToggle.checked = uiSettingDetails.editing.autoCorrect;
    selectedTheme = uiSettingDetails.theme.name;
    selectedPattern = uiSettingDetails.pattern.type;

    // Apply settings to page
    applySettings();
}

function saveSettings() {
    // Update global settings object
    uiSettingDetails = {
        theme: {
            name: selectedTheme,
            colors: getThemeColors(selectedTheme)
        },
        pattern: {
            type: selectedPattern,
            opacity: 0.1
        },
        text: {
            fontSize: fontSizeSlider.value,
            fontFamily: fontFamilySelect.value,
            lineSpacing: lineSpacingSelect.value
        },
        editing: {
            showWordCount: showWordCountToggle.checked,
            spellCheck: spellCheckToggle.checked,
            autoCorrect: autoCorrectToggle.checked
        }
    };

    // Save to localStorage
    localStorage.setItem('journalSettings', JSON.stringify(uiSettingDetails));
    
    // Apply settings
    applySettings();
}

function getThemeColors(themeName) {
    const themeColors = {
        'clean-white': {
            background: '#ffffff',
            text: '#333333',
            headings: '#1a1a1a',
            subtext: '#666666'
        },
        'calm-blue': {
            background: '#f0f4ff',
            text: '#2c3e50',
            headings: '#1a237e',
            subtext: '#546e7a'
        },
        'sunset': {
            background: '#fff0f5',
            text: '#4a4a4a',
            headings: '#ad1457',
            subtext: '#795548'
        },
        'dark-mode': {
            background: '#1a1f36',
            text: '#ffffff',
            headings: '#e0e0e0',
            subtext: '#b0bec5'
        }
    };
    return themeColors[themeName] || themeColors['clean-white'];
}

function applySettings() {
    const currentPage = document.getElementById('currentPage');
    const pageDate = currentPage.querySelector('.page-date');
    const pageTitle = currentPage.querySelector('h2');
    const subtitles = currentPage.querySelectorAll('.diary-subtitle');
    const paragraphs = currentPage.querySelectorAll('.diary-paragraph');
    
    // Apply theme colors
    currentPage.style.backgroundColor = uiSettingDetails.theme.colors.background;
    currentPage.style.color = uiSettingDetails.theme.colors.text;
    
    if (pageDate) pageDate.style.color = uiSettingDetails.theme.colors.subtext;
    if (pageTitle) pageTitle.style.color = uiSettingDetails.theme.colors.headings;
    
    subtitles.forEach(subtitle => {
        subtitle.style.color = uiSettingDetails.theme.colors.headings;
    });
    
    paragraphs.forEach(paragraph => {
        paragraph.style.color = uiSettingDetails.theme.colors.text;
    });

    // Apply text settings
    currentPage.style.fontSize = `${uiSettingDetails.text.fontSize}px`;
    currentPage.style.fontFamily = uiSettingDetails.text.fontFamily;
    currentPage.style.lineHeight = uiSettingDetails.text.lineSpacing;

    // Apply pattern
    let patternStyle = '';
    if (uiSettingDetails.pattern.type === 'dots') {
        patternStyle = `radial-gradient(${uiSettingDetails.theme.colors.text} 1px, transparent 1px)`;
        currentPage.style.backgroundImage = patternStyle;
        currentPage.style.backgroundSize = '20px 20px';
    } else if (uiSettingDetails.pattern.type === 'lines') {
        patternStyle = `linear-gradient(${uiSettingDetails.theme.colors.text} 1px, transparent 1px)`;
        currentPage.style.backgroundImage = patternStyle;
        currentPage.style.backgroundSize = '100% 2rem';
        currentPage.style.backgroundPosition = '0 1.2rem';
    } else {
        currentPage.style.backgroundImage = 'none';
    }

    // Apply editing settings
    document.querySelectorAll('textarea, input[type="text"]').forEach(input => {
        input.spellcheck = uiSettingDetails.editing.spellCheck;
    });
}

// Settings Event Listeners
document.getElementById('saveSettings').addEventListener('click', () => {
    saveSettings();
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Settings saved successfully!';
    document.querySelector('.settings-actions').prepend(successMessage);
    
    // Navigate to View Page after 1 second
    setTimeout(() => {
        // Hide settings section
        settingsContent.classList.add('hidden');
        
        // Show view page section
        viewPageContent.classList.remove('hidden');
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-page="view"]').classList.add('active');
    }, 1000);
});

// Theme and Pattern Selection
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.classList.remove('selected');
        });
        option.querySelector('.theme-preview').classList.add('selected');
        selectedTheme = option.querySelector('.theme-preview').classList[1];
        saveSettings();
    });
});

document.querySelectorAll('.pattern-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.pattern-preview').forEach(preview => {
            preview.classList.remove('selected');
        });
        option.querySelector('.pattern-preview').classList.add('selected');
        selectedPattern = option.querySelector('.pattern-preview').classList[1];
        saveSettings();
    });
});

// Settings Control Event Listeners
fontSizeSlider.addEventListener('input', () => {
    const currentPage = document.getElementById('currentPage');
    currentPage.style.fontSize = `${fontSizeSlider.value}px`;
});

[fontFamilySelect, lineSpacingSelect, showWordCountToggle, spellCheckToggle, autoCorrectToggle].forEach(control => {
    control.addEventListener('change', saveSettings);
});
