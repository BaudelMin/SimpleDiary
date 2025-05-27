const { contextBridge, ipcRenderer } = require('electron/renderer')

const WINDOW_API = {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  addUser : (username, password) => ipcRenderer.invoke('add-user', username, password),
  login : (username, password) => ( console.log('username === ', username), ipcRenderer.invoke('login', username, password)),
  loadHomePage : () => ipcRenderer.send('homepage'),
  logout : () => ipcRenderer.send('logout'),
  navigate : (path) => ipcRenderer.send('navigate', path),
  socialLogin : (provider) => ipcRenderer.send('social-login', provider),
  entryAdded : (callback) => ipcRenderer.on('entry-added', callback),
  getEntries: (userId) => ipcRenderer.send('get-entries', userId),
  entries: (callback) => ipcRenderer.on('entries', callback),
  pages: (pageId, userId) => ipcRenderer.invoke('pages', pageId, userId),
  getPageContent: (pageId) => ipcRenderer.invoke('get-page-content', pageId),
}

contextBridge.exposeInMainWorld('api', WINDOW_API)
