async function openFolder(){
    const dialogConfig = {
        title: 'Select a folder',
        buttonLabel: 'Select folder',
        properties: ['openDirectory']
    };
    electron.openDialog('showOpenDialog', dialogConfig)
        .then(async (result) => {
            if(!result.canceled){
                rootDir = result.filePaths[0];
                getElement("folder-tab").innerHTML = "";
                loadPath(rootDir)
                    .then(async (pathloaded) => {
                        getElement("folder-tab").innerHTML = constructDir(pathloaded, 0, true);
                        if(document.body.hasAttribute("dropdown-active")){
                            document.body.removeAttribute("dropdown-active");
                            for(let trigger of document.querySelectorAll(".dropdown-trigger")){
                                if(trigger.hasAttribute("active")){
                                    trigger.removeAttribute("active");
                                }
                            }
                        }
                        closeAllTabs();
                    })
            }
        });
}

async function loadPath(dirName){
    let res = await electron.loadPath(dirName)
    return res;
}

function constructDir(dir, padding, root){
    if(root){
        dirhtml = `
            <div class="directory root-directory path-container" path="${dir.path}">
                <span class="path-info directory-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px);">
                    <i class="bx bx-chevron-right" onclick="toggleDir(this)"></i>
                    ${dir.path.split("\\").pop()}
                </span>
                <div class="directory-content">
        `
    }
    else{
        dirhtml = `
            <div class="directory path-container" path="${dir.path}">
                <span class="path-info directory-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px);">
                    <i class="bx bx-chevron-right" onclick="toggleDir(this)"></i>
                    ${dir.path.split("\\").pop()}
                </span>
                <div class="directory-content">
        `
    }
    for(let content of dir.content){
        if(content.type == "file"){
            dirhtml += constructFile(content, padding + 10);
        }
        else{
            dirhtml += constructDir(content, padding + 10, false);
        }
    }
    dirhtml += "</div></div>";
    return dirhtml;
}

function constructFile(file, padding){
    filehtml = `
        <div class="file path-container" path="${file.path}" ext="${file.ext}" onclick="constructTab(this)">
            <span class="path-info file-info" style="padding-left:${padding}px; width:calc(100% - ${padding}px);">${file.path.split("\\").pop()}</span>
        </div>
    `
    return filehtml;
}

function toggleDir(trigger){
    let dir = trigger.closest(".directory");
    if(dir.hasAttribute("opened")){
        dir.removeAttribute("opened");
        trigger.className = "bx bx-chevron-right";
    }
    else{
        dir.setAttribute("opened", null);
        trigger.className = "bx bx-chevron-down";
    }
}

function constructTab(trigger){
    let path = trigger.getAttribute("path");
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
            <div class="code-wrapper"">
                <textarea class="code-editor"></textarea>
            </div>
        </div>
    `
    tabGroup.insertAdjacentHTML("beforeend", newTab);
    tabcontent.insertAdjacentHTML("beforeend", newTabContent);
    electron.loadPath(path)
        .then((res) => {
            let view = CodeMirror.fromTextArea(document.querySelector(`.window[tabpath="${escapePath(path)}"] .code-editor`));
            view.getDoc().setValue(res);
            view.on("dragover", function(editor, evt){
                evt.preventDefault();
            });
            view.on("drop", function(editor, evt){
                evt.preventDefault();
            })
            view.setSize("100%", "100%");
            openTab(document.querySelector(`.tab[tabpath="${escapePath(path)}"]`));
        })
}
