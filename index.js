//use npm drag-tabs?

const { ipcMain, dialog, app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require("node:fs")

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

app.whenReady().then(() => {
    ipcMain.handle('dialog', (event, method, params) => {       
        return dialog[method](params);
    });

    ipcMain.handle('loadPath', async (event, pathstr) => {       
        if(!fs.existsSync(pathstr)){
            throw Error("Path not found")
        }

        if(fs.statSync(pathstr).isDirectory()){
            return loadDir(pathstr);
        }
        else{
            return fs.readFileSync(pathstr);
        }
    });

    ipcMain.handle('renamePath', (event, oldPath, newPath) => {
        if(!fs.existsSync(oldPath)){
            throw Error("Path not found");
        }
        if(fs.existsSync(newPath)){
            throw Error("Path already exists");
        }

        if(fs.statSync(oldPath).isFile()){
            try{
                fs.renameSync(oldPath, newPath);
            }
            catch(err){
                throw err
            }
        }
        else{

        }
    })

    ipcMain.handle('writeFile', (event, pathstr, content) => {
        if(!fs.existsSync(pathstr)){
            throw Error("Path not found");
        }

        if(fs.statSync(pathstr).isDirectory()){
            throw Error("Cannot write to directory")
        }

        try{
            fs.writeFileSync(pathstr, content);
        } 
        catch(err){
            throw err
        }
    })

    ipcMain.handle('deletePath', (event, pathstr) => {
        if(!fs.existsSync(pathstr)){
            throw Error("Path not found");
        }

        if(fs.statSync(pathstr).isDirectory()){
            fs.rmSync(pathstr, {recursive: true, force: true});
        }
        else{
            fs.unlinkSync(pathstr);
        }
    })
});

function loadDir(pathstr){
    let dir = fs.readdirSync(pathstr);
    let dircontents = [];
    for(let contentpath of dir){
        fullpath = path.join(pathstr, contentpath);
        if(fs.lstatSync(fullpath).isFile()){
            dircontents.push(
                {
                    path: fullpath,
                    type: "file", 
                    ext: path.extname(fullpath)
                }
            );
        }
        else{
            
            dircontents.push(
                {
                    path: fullpath, 
                    type: "dir", 
                    content: loadDir(fullpath)
                }
            );
        }
    }
    return dircontents;
}