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

// State management
let currentPageIndex = 0, currentPageNumber = 0, positionCount = 1;
let pages = [];
let min_page_number = 0, pageContent = null, currentPageId = null, pageCreateAt = null;

// Load user data
const userData = JSON.parse(localStorage.getItem('user'));
if (!userData) {
    window.api.navigate('src/html/login.html');
} else {
    username.textContent = userData.name;
}

// Handle sidebar navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');

        if (item.dataset.page === 'view') {
            viewPageContent.classList.remove('hidden');
            editPageContent.classList.add('hidden');
        } else if (item.dataset.page === 'edit') {
            viewPageContent.classList.add('hidden');
            editPageContent.classList.remove('hidden');
        } else if (item.textContent.includes('Settings')) {
            // Handle settings navigation
        } else if (item.textContent.includes('Profile')) {
            // Handle profile navigation
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


// Create new paragraph section
function createNewParagraphSection() {
    const section = document.createElement('div');
    section.className = 'paragraph-section';
    section.innerHTML = `
        <button class="btn remove-paragraph-btn">×</button>
        <input type="text" class="subtitle-input" placeholder="Subtitle (optional)">
        <textarea class="paragraph-input" placeholder="Enter paragraph content"></textarea>
        <input hidden id="position-input" min="1" max="4" value="${positionCount + 1}">
    `;

    // Add remove button functionality
    section.querySelector('.remove-paragraph-btn').addEventListener('click', () => {
        section.remove();
        updateParagraphControls();
    });

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
    }
});

// Handle new page submission
editForm.querySelector('.save-page-btn').addEventListener('click', () => {
    const title = document.getElementById('pageTitle').value;
    const paragraphContents = [];
    
    document.querySelectorAll('.paragraph-section').forEach(section => {
        paragraphContents.push({
            subtitle: section.querySelector('.subtitle-input').value,
            content: section.querySelector('.paragraph-input').value
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
        date: new Date().toISOString()
    };

    // Send to main process to save in database
    // window.api.savePage(page);
    
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
        <input type="text" class="subtitle-input" placeholder="Subtitle (optional)" value="${subtitle}">
        <textarea class="paragraph-input" placeholder="Enter paragraph content">${content}</textarea>
        <button class="btn remove-paragraph-btn">Remove</button>
        
    `;
    
    section.querySelector('.remove-paragraph-btn').addEventListener('click', () => {
        section.remove();
    });
    section.id = `paragraph-1`; // Unique ID for each section
    return section;
}

// Handle edit button click
editCurrentPageBtn.addEventListener('click', () => {
    const currentPageData = pages.pageContent[currentPageIndex];
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
            subtitle: section.querySelector('.subtitle-input').value,
            paragraph: section.querySelector('.paragraph-input').value,
            sub_title_pos: position,
            paragraph_pos: position
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
        user_id: userData.id
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
        currentPage.innerHTML = '<p>No pages available.</p>';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }

    // Format the date
    const formattedDate = new Date(pageCreateAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    let pageHtml = `<div class="page-create-date">Created on ${formattedDate}</div>`;
    pageHtml += `<h2>${pages.pageContent[currentPageIndex].title}</h2>`;
    
    for (let i = 0; i < pageContent.length; i++) {
        if (pageContent[i].sub_title) {
            pageHtml += `<h3>${pageContent[i].sub_title}</h3>`;
        }
        pageHtml += `<p>${pageContent[i].paragraph}</p>`;
    }

    currentPage.innerHTML = pageHtml;
    
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
});


