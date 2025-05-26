const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { db } = require('./database/db')
const dbUser = require('./database/user')
const dbModel = require('./database/models')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
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
}

// Handle navigation
ipcMain.on('navigate', (event, page) => {
    mainWindow.loadFile(page)
})

ipcMain.handle('add-user', (_, username, password) => {
  return dbUser.addUser(username, password);
})


app.whenReady().then(() => {
    dbModel.databaseModelMigration()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Handle user registration
ipcMain.handle('register', async (event, { username, password, profileImage }) => {
    try {
        const result = await dbUser.addUser(username, password);
        if (result.status) {
            return { 
                success: true,
                userId: result.userId
            };
        } else {
            return { 
                success: false, 
                error: result.message 
            };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Handle user login
ipcMain.handle('login', async (event, username, password) => {
    console.log(`Login attempt for user: ${username}`);
    try {
        const result = await dbUser.validateUser(username, password);
        if (result.validation) {
            return { 
                success: true, 
                user: { 
                    id: result.user_id,
                    username: username
                } 
            };
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Handle entry creation
ipcMain.on('add-entry', (event, entry) => {
    try {
        const stmt = db.prepare('INSERT INTO page (title, create_at, user_id) VALUES (?, datetime("now"), ?)')
        const result = stmt.run(entry.content, entry.userId)
        
        if (result.changes > 0) {
            const pageId = result.lastInsertRowid
            const paragraphStmt = db.prepare('INSERT INTO paragraphs (paragraph, page_id) VALUES (?, ?)')
            paragraphStmt.run(entry.content, pageId)
            event.reply('entry-added')
        }
    } catch (error) {
        event.reply('error', error.message)
    }
})

// Get entries for a user
ipcMain.on('get-entries', (event, userId) => {
    try {
        const stmt = db.prepare(`
            SELECT p.page_id, p.title, p.create_at as date, pg.paragraph as content
            FROM page p
            LEFT JOIN paragraphs pg ON p.page_id = pg.page_id
            WHERE p.user_id = ?
            ORDER BY p.create_at DESC
        `)
        const entries = stmt.all(userId)
        event.reply('entries', entries)
    } catch (error) {
        event.reply('error', error.message)
    }
})

// Handle social login
ipcMain.on('social-login', (event, provider) => {
    // Implement social login logic here
    console.log(`Social login requested for provider: ${provider}`)
})

