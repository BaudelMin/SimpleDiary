document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    console.log('username: ', username);
    console.log('password: ', password);
    console.log('remember: ', remember);
    try {
        const result = await window.api.login(username, password);
        console.log(result);
        if (result.success) {
            // Store user data if remember me is checked
            localStorage.setItem('user', JSON.stringify({
                username,
                name: username,
                id: result.user.id,
                remember: true
            }));
            
            // Redirect to dashboard
            window.api.navigate('src/html/dashboard.html');
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
});

// Handle social login buttons
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const provider = button.textContent.trim().toLowerCase();
        let result = await window.api.socialLogin(provider)

    });
});

// Theme toggle
document.querySelector('.mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    this.textContent = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '�� Light Mode';
}); 