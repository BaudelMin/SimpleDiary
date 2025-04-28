
const H = () => window.open('../html/home.html', '_self');

const onClickUserLogin = async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    console.log('username, value : ', username, password);
    const result = await window.api.login(username, password);
    (result && result.validation) ? window.api.loadHomePage() : console.log('result = ', result);
}

document.getElementById("login-btn")
.addEventListener('click', onClickUserLogin);

document.getElementById('set-sign-up-ui')
.addEventListener('click', async () => {
    let loginElement = document.getElementById('login');
    let addUserElement = document.getElementById('new-user');
    loginElement.classList.add('no-display');
    addUserElement.classList.remove('no-display');
});

document.getElementById('addUser')
.addEventListener('click', async () => {
    let loginElement = document.getElementById('login');
    let addUserElement = document.getElementById('new-user');
    loginElement.classList.remove('no-display');
    addUserElement.classList.add('no-display');
});
