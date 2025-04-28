const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const dbUser = require('./database/user')
const dbModel = require('./database/models')
const dbHelper = require('./helpers/dbHelpers')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true, // Recommended for security
      contextIsolation: true, // Recommended for security
      contentSecurityPolicy: `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https:; // Allow self & HTTPS scripts (adjust as needed)
        style-src 'self' 'unsafe-inline'; // Allow inline styles (if needed)
        img-src 'self' data:; // Allow self & data URLs for images
        connect-src 'self' https:; // Allow API calls to your domain & HTTPS
        font-src 'self'; 
        object-src 'none'; // Disallow plugins (Flash, etc.)
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
      `.replace(/\s+/g, ' '), // Minify CSP string
    }
  })
  mainWindow.loadFile('index.html')
  ipcMain.on('homepage', (event) => {
    mainWindow.loadFile('./src/html/home.html')
  })
  
  ipcMain.on('logout', (event) => {
    mainWindow.loadFile('index.html')
  })
}

app.whenReady().then(() => {
  dbModel.databaseModelMigration()
  createWindow()
  // dbUser.validateUser('test user', 'password')
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('set-title', (event, title) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
})

ipcMain.handle('add-user', (_, username, password) => {
  return dbUser.addUser(username, password);
})

ipcMain.handle('login', async (_, username, password) => {
  return dbUser.validateUser(username, password);
})

