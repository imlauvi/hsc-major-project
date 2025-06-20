const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
    loadPath: (path) => ipcRenderer.invoke('loadPath', path),
    renamePath: (oldPath, newPath) => ipcRenderer.invoke('renamePath', oldPath, newPath),
    writeFile: (path, content) => ipcRenderer.invoke('writeFile', path, content),
    createFile: (path) => ipcRenderer.invoke('writeFile', path, ""),
    deletePath: (path) => ipcRenderer.invoke('deletePath', path),
});