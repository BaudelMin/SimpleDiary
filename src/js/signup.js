const signupForm = document.getElementById('signupForm');
const profileUpload = document.getElementById('profileUpload');
let profileImage = null;

// Handle profile image upload
profileUpload.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage = e.target.result;
                profileUpload.innerHTML = `<img src="${profileImage}" alt="Profile">`;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
});

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const result = await window.api.addUser(username, password);

        console.log('User registered successfully:', result);
        if (result.status) {
            // Store user data
            localStorage.setItem('user', JSON.stringify({
                username,
                name: username,
                id: result.userId
            }));
            
            // Redirect to dashboard
            window.api.navigate('src/html/dashboard.html');
        } else {
            alert(result.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        alert('An error occurred during registration. Please try again.');
    }
}); 