//use npm drag-tabs?

const { ipcMain, dialog, app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require("fs-extra")
const pty = require("node-pty");
const os = require("os");
const { defaults, set, get, hasSync } = require('electron-settings');

let win;
let settingsPages = new Map();
let ptyProcess;
let shell = os.platform() === "win32" ? "powershell.exe" : "bash"

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

function createSettings(){
    let child = new BrowserWindow({
        parent: win,
        frame: false,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { 
            titleBarOverlay: {
                color: '#1e1e1e',
                symbolColor: '#ffffff',
                height: 30,
            } 
        } : {}),
        width: 400,
        height: 300,
        icon: path.join(__dirname, 'renderer/icons/icon.png'),
        webPreferences: {
            contextIsolation: true,
            devTools: true,
            preload: path.join(__dirname, "preload.js")
        },
        acceptFirstMouse: true,
    });

    child.loadFile(path.join(__dirname, './renderer/settings.html'));
    let id = 0;
    while(settingsPages.has(id)){
        id++;
    }
    settingsPages.set(id, child);
    child.on('closed', () => {
        settingsPages.delete(id);
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

    ipcMain.handle('loadPath', async (event, pathstr, root) => {       
        if(!fs.existsSync(pathstr)){
            throw Error("Path not found")
        }

        if(root){
            if(fs.existsSync(pathstr + "\\.bscode")){
                if(fs.statSync(pathstr + "\\.bscode").isFile()){
                    fs.unlinkSync(pathstr + "\\.bscode");
                    fs.mkdir(pathstr + "\\.bscode");
                }
            }
            else{
                fs.mkdir(pathstr + "\\.bscode");
            }

            if(fs.existsSync(pathstr + "\\.bscode\\tasks.json")){
                if(fs.statSync(pathstr + "\\.bscode\\tasks.json").isDirectory()){
                    fs.rmSync(pathstr + "\\.bscode\\tasks.json", {recursive: true, force: true});
                    await fs.writeFile(pathstr + "\\.bscode\\tasks.json", "", "utf8");
                    fs.writeFileSync(pathstr + "\\.bscode\\tasks.json", "[]", "utf8");
                }
            }
            else{
                await fs.writeFile(pathstr + "\\.bscode\\tasks.json", "", "utf8");
                fs.writeFileSync(pathstr + "\\.bscode\\tasks.json", "[]", "utf8");
            }
        }

        if(fs.statSync(pathstr).isDirectory()){
            return {
                path: pathstr, 
                type: "dir", 
                content: await loadDir(pathstr)
            };
        }
        else{
            return fs.readFileSync(pathstr, "utf8");
        }
    });

    ipcMain.handle('renamePath', (event, oldPath, newPath) => {
        if(!fs.existsSync(oldPath)){
            throw Error("Path not found");
        }
        if(fs.existsSync(newPath)){
            throw Error("Path already exists");
        }

        try{
            fs.moveSync(oldPath, newPath);
        }
        catch(err){
            throw err
        }
    })

    ipcMain.handle('writeFile', (event, pathstr, content) => {
        if(fs.existsSync(pathstr)){
            if(fs.statSync(pathstr).isDirectory()){
                throw Error("Cannot write to directory")
            }
        }

        try{
            fs.writeFileSync(pathstr, content, "utf8");
        } 
        catch(err){
            throw err
        }
    })

    ipcMain.handle('createDir', (event, pathstr) => {
        try{
            fs.mkdirSync(pathstr);
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

    ipcMain.handle('loadTasks', (event, pathstr) => {
        try{
            return JSON.parse(fs.readFileSync(pathstr + "\\.bscode\\tasks.json", "utf8"));
        }
        catch{
            return []
        }
    })

    ipcMain.handle('editTasks', (event, pathstr, contents) => {
        fs.writeFileSync(pathstr + "\\.bscode\\tasks.json", JSON.stringify(contents), "utf8");
    })

    ipcMain.handle('openSettings', (event) => {
        createSettings();
    })

    ipcMain.handle('updateSettings', async (event, settings) => {
        for(let [key, value] of Object.entries(settings)){
            await set(key, value);
        }
        win.webContents.send("settingsChange", await getSettings());
        settingsPages.forEach(async (child, key) => {
            child.webContents.send("settingsChange", await getSettings());
        })
    })

    ipcMain.handle('fetchSettings', async (event) => {
        win.webContents.send("settingsChange", await getSettings());
        settingsPages.forEach(async (child, key) => {
            child.webContents.send("settingsChange", await getSettings());
        })
    })

    ptyProcess = pty.spawn(shell, [], {
        cwd: process.env.HOME,
        env: process.env
    })

    ptyProcess.on("data", function(data){
        win.webContents.send("term.incoming", data);
    })

    ipcMain.handle("term.keystroke", (event, key) => {
        ptyProcess.write(key);
    })

    ipcMain.handle("term.reload", (event, pathstr) => {
        let cdpath = pathstr.replace("C:\\", "");
        ptyProcess.write("\r");
        ptyProcess.write("cd /\r");
        ptyProcess.write(`cd ${cdpath}\r`);
        ptyProcess.write("\r");
    })

    ipcMain.handle("term.resize", (event, termX, termY) => {
        ptyProcess.resize(termX, termY);
    })
});

async function loadDir(pathstr){
    let dir = await fs.promises.readdir(pathstr);
    let dircontents = [];
    for(let contentpath of dir){
        if(contentpath == ".bscode"){
            continue;
        }
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
                    content: await loadDir(fullpath)
                }
            );
        }
    }
    return dircontents;
}

async function getSettings(){
    return {
        editorFont: await get("editorFont") ?? "monospace",
        fontSize: await get("fontSize") ?? 14,
        editorTheme: await get("editorTheme") ?? "monokai"
    }
}