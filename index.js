//use npm drag-tabs?

const { app, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        frame: false,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { 
            titleBarOverlay: {
                color: '#1e1e1e',
                symbolColor: '#ffffff',
                height: 30,
            } 
        } : {}),
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'renderer/icons/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            devTools: true,
            preload: path.join(__dirname, "preload.js")
        },
        acceptFirstMouse: true,
    })

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, './renderer/index.html'))
    //win.loadURL('https://google.com/')

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})