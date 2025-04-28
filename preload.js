const { contextBridge, ipcRenderer } = require('electron/renderer')

const WINDOW_API = {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  addUser : (username, password) => ipcRenderer.invoke('add-user', username, password),
  login : (username, password) => ipcRenderer.invoke('login', username, password),
  loadHomePage : () => ipcRenderer.send('homepage'),
  logout : () => ipcRenderer.send('logout')
}

contextBridge.exposeInMainWorld('api', WINDOW_API)
