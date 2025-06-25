const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
    loadPath: (path) => ipcRenderer.invoke('loadPath', path),
    renamePath: (oldPath, newPath) => ipcRenderer.invoke('renamePath', oldPath, newPath),
    writeFile: (path, content) => ipcRenderer.invoke('writeFile', path, content),
    createFile: (path) => ipcRenderer.invoke('writeFile', path, ""),
    createDir: (path) => ipcRenderer.invoke('createDir', path),
    deletePath: (path) => ipcRenderer.invoke('deletePath', path),
    sendTermKeystroke: (key) => ipcRenderer.invoke('term.keystroke', key),
    loadTerm: (path) => ipcRenderer.invoke('term.reload', path),
    resizeTerm: (termX, termY) => ipcRenderer.invoke('term.resize', termX, termY),
    onTermIncoming: (callback) => ipcRenderer.on("term.incoming", (event, data) => callback(data)),
});