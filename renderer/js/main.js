const exttolang = {
    ".py": "python",
    ".js": "javascript",
    ".cpp": "clike",
    ".c": "clike",
    ".cs": "clike",
    ".css": "css",
    ".html": "htmlmixed",
}

async function openFolder(){
    const dialogConfig = {
        title: 'Select a folder',
        buttonLabel: 'Select folder',
        properties: ['openDirectory']
    };
    electron.openDialog('showOpenDialog', dialogConfig)
        .then(async (result) => {
            if(!result.canceled){
                closeAllTabs();
                rootDir = result.filePaths[0];
                getElement("folder-tab").innerHTML = "";
                if(document.body.hasAttribute("dropdown-active")){
                    document.body.removeAttribute("dropdown-active");
                    for(let trigger of document.querySelectorAll(".dropdown-trigger")){
                        if(trigger.hasAttribute("active")){
                            trigger.removeAttribute("active");
                        }
                    }
                }
                electron.loadPath(rootDir, true)
                    .then(async (pathloaded) => {
                        await electron.loadTerm(pathloaded.path);
                        getElement("folder-tab").innerHTML = constructDir(pathloaded, 0, true, []);
                        tasks = await electron.loadTasks(rootDir);
                        loadTasks();
                    })
            }
        });
}

function constructDir(dir, padding, root, openedFolders){
    if(root){
        dirhtml = `
            <div class="directory root-directory path-container" path="${dir.path}" ondragover="dragoverFile(event)" ondrop="dropFile(event, this)" ${openedFolders.includes(dir.path) ? "opened='null'" : ""}>
                <span class="path-info-wrapper">
                    <span class="path-info directory-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px - 40px);">
                        <span class="info-wrapper" onclick="toggleDir(this)">
                            <i class="dir-indicator bx bx-chevron-right"></i>
                            <span class="info-name">
                                ${dir.path.split("\\").pop()}
                            </span>
                        </span>
                    </span>
                    <span class="root-buttons">
                        <i class="create-icon bx bx-file" onclick="createNew(this, 'file')"></i>
                        <i class="create-icon bx bx-folder" onclick="createNew(this, 'dir')"></i>
                    </span>
                </span>
                <div class="directory-content">
        `
    }
    else{
        dirhtml = `
            <div class="directory path-container" path="${dir.path}" ondragover="dragoverFile(event)" ondrop="dropFile(event, this)" ${openedFolders.includes(dir.path) ? "opened='null'" : ""}>
                <div class="context-menu">
                    <span class="context-menu-item" onclick="createNew(this, 'file')">Create file</span>
                    <span class="context-menu-item" onclick="createNew(this, 'dir')">Create folder</span>
                    <hr class="menu-separator context-menu-separator">
                    <span class="context-menu-item" onclick="openRename(this)">Rename</span>
                    <span class="context-menu-item" onclick="deletePath(this)">Delete</span>
                </div>
                <span class="path-info directory-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px);" oncontextmenu="openFileMenu(event, this)" ondragstart="beginFileDrag(event)" ondragend="endFileDrag()" draggable="true">
                    <span class="info-wrapper" onclick="toggleDir(this)">
                        <i class="dir-indicator bx bx-chevron-right"></i>
                        <span class="info-name">
                            ${dir.path.split("\\").pop()}
                        </span>
                        <span class="rename">
                            <input type="text" class="rename-input" style="width:calc(100% - ${padding}px - 14px)" onkeyup="triggerRename(event, this)" onfocusout="rename(this)">
                            <div class="rename-warning" style="width:calc(var(--sidetab-width) - ${padding}px - 19px)">
                                test
                            </div>
                        </span>
                    </span>
                </span>
                <div class="directory-content">
        `
    }
    for(let content of dir.content){
        if(content.type == "file"){
            dirhtml += constructFile(content, padding + 10);
        }
        else{
            dirhtml += constructDir(content, padding + 10, false, openedFolders);
        }
    }
    dirhtml += "</div></div>";
    return dirhtml;
}

function constructFile(file, padding){
    filehtml = `
        <div class="file path-container" path="${file.path}" ext="${file.ext}">
            <div class="context-menu">
                <span class="context-menu-item" onclick="openRename(this)">Rename</span>
                <span class="context-menu-item" onclick="deletePath(this)">Delete</span>
            </div>
            <span class="path-info file-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px);" oncontextmenu="openFileMenu(event, this)" ondragstart="beginFileDrag(event)" ondragend="endFileDrag()" draggable="true">
                <span class="info-wrapper">
                    <span class="info-name" onclick="constructTab(this.parentElement.parentElement)">
                        ${file.path.split("\\").pop()}
                    </span>
                    <span class="rename">
                        <input type="text" class="rename-input" style="width:calc(100% - 6px)" onkeyup="triggerRename(event, this)" onfocusout="rename(this)">
                        <div class="rename-warning" style="width:calc(var(--sidetab-width) - ${padding}px - 2px)">
                            test
                        </div>
                    </span>
                </span>
            </span>
        </div>
    `
    return filehtml;
}

function toggleDir(trigger){
    let dir = trigger.closest(".directory");
    let indicator = trigger.querySelector(".dir-indicator");
    if(dir.hasAttribute("opened")){
        dir.removeAttribute("opened");
        indicator.className = "dir-indicator bx bx-chevron-right";
    }
    else{
        dir.setAttribute("opened", null);
        indicator.className = "dir-indicator bx bx-chevron-down";
    }
}

function constructTab(trigger){
    let path = trigger.closest(".path-container").getAttribute("path");
    let ext = trigger.closest(".path-container").getAttribute("ext");
    if(getElement("codearea").getAttribute("opened") == "00"){
        getElement("codearea").setAttribute("opened", "10");
        getElement("codearea-left").setAttribute("opened", null);
        getElement("codearea-left").setAttribute("main", null);
    }
    if(document.querySelector(`.tab[tabpath="${escapePath(path)}"]`)){
        openTab(document.querySelector(`.tab[tabpath="${escapePath(path)}"]`));
        return;
    }
    let name = path.split("\\").pop();
    let codeareaMain = document.querySelector(".codearea-group[main]");
    let tabGroup = codeareaMain.querySelector(".tabs");
    let tabcontent = codeareaMain.querySelector(".tab-content");
    let newTab = `
        <div class="tab" tabpath="${path}" ondragstart="beginDrag(event)" ondragend="endDrag()" onmousedown="openTab(this)" draggable="true">
            <div class="tab-name">
                ${name}
            </div>
            <div class="close-tab" onclick="closeTab(this)">
                &#10005;
            </div>
        </div>
    `
    let newTabContent = `
        <div class="window" tabpath="${path}">
            <div class="window-info">
                ${path.replace(rootDir+"\\", "")}
            </div>
            <div class="code-wrapper" onkeydown="editCode(event)">
                <textarea class="code-editor"></textarea>
            </div>
        </div>
    `
    tabGroup.insertAdjacentHTML("beforeend", newTab);
    tabcontent.insertAdjacentHTML("beforeend", newTabContent);
    electron.loadPath(path, false)
        .then((res) => {
            let view = CodeMirror.fromTextArea(
                document.querySelector(`.window[tabpath="${escapePath(path)}"] .code-editor`), 
                {
                    lineNumbers: true
                }
            );
            view.getDoc().setValue(res);
            view.on("dragover", function(editor, evt){
                evt.preventDefault();
            });
            view.on("drop", function(editor, evt){
                evt.preventDefault();
            })
            view.setSize("100%", "100%");
            view.setOption("styleActiveLine", true);
            view.setOption("autoCloseBrackets", true);
            view.setOption("matchBrackets", true);
            view.setOption("theme", settings.editorTheme);
            if(ext in exttolang){
                view.setOption("mode", exttolang[ext]);
            }
            view.getWrapperElement().style.fontSize = `${settings.fontSize}px`;
            view.refresh();
            openTab(document.querySelector(`.tab[tabpath="${escapePath(path)}"]`));
        })
}

document.addEventListener("DOMContentLoaded", async function(){
    closeAllTabs();
    getElement("folder-tab").innerHTML = "";
})

function reloadRoot(reload){
    electron.loadPath(rootDir, true)
        .then(async (pathloaded) => {
            if(reload){
                electron.loadTerm(pathloaded.path);
            }
            let currentDirs = document.querySelectorAll(".directory[opened]");
            let openedPaths = [];
            for(let dir of currentDirs){
                openedPaths.push(dir.getAttribute("path"));
            }
            getElement("folder-tab").innerHTML = constructDir(pathloaded, 0, true, openedPaths);
            let tabs = document.querySelectorAll(".tab");
            for(let tab of tabs){
                if(!document.querySelector(`.path-container[path="${escapePath(tab.getAttribute("tabpath"))}"]`)){
                    closeTab(tab.querySelector(".close-tab"));
                }
            }
        })
}

function editCode(event){
    let editFile = event.target.closest(".window");
    let path = editFile.getAttribute("tabpath");
    let corrTab = document.querySelector(`.tab[tabpath="${escapePath(path)}"]`)
    if(event.ctrlKey && event.key == "s"){
        save(editFile);
    }
    else if(/^.$/u.test(event.key) || event.key === "Backspace" || event.key === "Delete" || event.key === "Enter"){
        editFile.setAttribute("edited", null);
        corrTab.setAttribute("edited", null);
    }
}

function saveAll(){
    for(let window of document.querySelectorAll(".window")){
        save(window);
    }
}

function saveActive(){
    let mainWindow = document.querySelector(".codearea-group[main] .window[active]");
    if(mainWindow){
        save(mainWindow);
    }
}

function save(saveWindow){
    let path = saveWindow.getAttribute("tabpath");
    let corrTab = document.querySelector(`.tab[tabpath="${escapePath(path)}"]`)
    if(saveWindow.hasAttribute("edited")){
        saveWindow.removeAttribute("edited");
    }
    if(corrTab.hasAttribute("edited")){
        corrTab.removeAttribute("edited");
    }
    let cm = saveWindow.querySelector(".CodeMirror").CodeMirror;
    let content = cm.getValue();
    electron.writeFile(path, content);
}