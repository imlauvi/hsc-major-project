// sort the files
let fileDrag = false;

const validateFilename = /^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$/;

function beginFileDrag(event){
    fileDrag = true;
    document.body.style.userSelect = "none";
    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/plain", event.target.closest(".path-container").getAttribute("path"));
    document.body.setAttribute("dragfile", null);
}

function endFileDrag(){
    fileDrag = false;
    document.body.style.userSelect = "auto";

    let currOver = document.querySelector(".directory[isover]");
    if(currOver){
        currOver.removeAttribute("isover");
    }

    if(document.body.hasAttribute("dragfile")){
        document.body.removeAttribute("dragfile");
    }
}

function dropFile(event, dir){
    let folderDrop = event.target.closest(".directory");
    let path = event.dataTransfer.getData("text");
    if(folderDrop){
        if(folderDrop != dir){
            return;
        }

        let folderDropChildren = folderDrop.querySelector(".directory-content").children;
        let fileName = path.split("\\").pop();

        for(let child of folderDropChildren){
            let childFile = child.getAttribute("path").split("\\").pop();
            if(fileName == childFile){
                return;
            }
        }

        let dropContent = document.querySelector(`.path-container[path="${escapePath(path)}"]`);
        if(dropContent.contains(folderDrop)){
            return;
        }

        let currDirPath = dropContent.parentElement.closest(".directory").getAttribute("path");
        let newPath = folderDrop.getAttribute("path");
        let newInd = parseInt(folderDrop.querySelector(".path-info").style.paddingLeft) + 10;
        if(dropContent.matches(".directory")){
            renameDir(path, currDirPath, newPath, newInd);
        }
        else{
            renameFile(path, currDirPath, newPath, newInd);
        }
        electron.renamePath(path, path.replace(currDirPath, newPath));
        folderDrop.querySelector(".directory-content").appendChild(dropContent);
    }
}

function dragoverFile(event){
    if(fileDrag){
        let triggerEl = document.elementFromPoint(event.clientX, event.clientY);
        let folderDrop = triggerEl.closest(".directory");
        let currOver = document.querySelector(".directory[isover]");
        if(folderDrop != currOver){
            if(currOver){
                currOver.removeAttribute("isover");
            }
            if(folderDrop){
                folderDrop.setAttribute("isover", null);
            }
        }
    }
    event.preventDefault();
}

function renameFile(path, oldPathSeg, newPathSeg, newInd){
    let fileEl = document.querySelector(`.path-container[path="${escapePath(path)}"]`);

    fileEl.querySelector(".path-info").style.paddingLeft = `${newInd}px`;
    fileEl.querySelector(".path-info").style.width = `calc(100% - ${newInd}px)`;
    fileEl.querySelector(".rename-warning").style.width = `calc(var(--sidetab-width) - ${newInd}px - 2px)`;

    fileEl.setAttribute("path", path.replace(oldPathSeg, newPathSeg));

    let openedTab = document.querySelector(`.tab[tabpath="${escapePath(path)}"]`);
    let openedWindow = document.querySelector(`.window[tabpath="${escapePath(path)}"]`);

    if(openedTab && openedWindow){
        openedTab.setAttribute("tabpath", path.replace(oldPathSeg, newPathSeg));
        openedTab.querySelector(".tab-name").textContent = path.replace(oldPathSeg, newPathSeg).split("\\").pop();
        openedWindow.setAttribute("tabpath", path.replace(oldPathSeg, newPathSeg));
        openedWindow.querySelector(".window-info").textContent = path.replace(oldPathSeg, newPathSeg).replace(rootDir+"\\", "");
    }
}

function renameDir(path, oldPathSeg, newPathSeg, newInd){
    let dirEl = document.querySelector(`.path-container[path="${escapePath(path)}"]`);
    
    dirEl.querySelector(".path-info").style.paddingLeft = `${newInd}px`;
    dirEl.querySelector(".path-info").style.width = `calc(100% - ${newInd}px)`;
    dirEl.querySelector(".rename-warning").style.width = `calc(var(--sidetab-width) - ${newInd}px - 19px)`;
    dirEl.querySelector(".rename-input").style.width = `calc(100% - ${newInd}px - 14px)`;

    dirEl.setAttribute("path", path.replace(oldPathSeg, newPathSeg));
    dirElContents = dirEl.querySelector(".directory-content").children;
    for(let content of dirElContents){
        let contentPath = content.getAttribute("path");
        if(content.matches(".directory")){
            renameDir(contentPath, oldPathSeg, newPathSeg, newInd + 10);
        }
        else{
            renameFile(contentPath, oldPathSeg, newPathSeg, newInd + 10);
        }
    }
}

document.addEventListener("DOMContentLoaded", function(){
    document.addEventListener("dragover", function(event){
        dragoverFile(event);
    })

    document.documentElement.addEventListener("mousedown", function(event){
        if(event.target.closest(".context-menu")){
            return;
        }
        if(document.querySelector(".context-menu[opened]")){
            document.querySelector(".context-menu[opened]").removeAttribute("opened");
        }
    });

    document.documentElement.addEventListener("contextmenu", function(event){
        if(event.target.closest(".context-menu")){
            return;
        }
        if(!event.target.closest(".path-container") && document.querySelector(".context-menu[opened]")){
            document.querySelector(".context-menu[opened]");
        }
    })
})

function openFileMenu(event, trigger){
    let menu = trigger.parentElement.querySelector(".context-menu");
    let currOpen = document.querySelector(".context-menu[opened]");
    if(menu == currOpen){
        menu.removeAttribute("opened");
    }
    else{
        if(currOpen){
            currOpen.removeAttribute("opened");
        }
        menu.setAttribute("opened", null);
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
    }
}

function openRename(trigger){
    let currOpen = document.querySelector(".context-menu[opened]");
    if(currOpen){
        currOpen.removeAttribute("opened");
    }
    let pathContainer = trigger.closest(".path-container");
    pathContainer.setAttribute("renaming", null);
    let fileName = pathContainer.getAttribute("path").split("\\").pop();
    let renameInput = pathContainer.querySelector(".rename-input");
    let renameWrapper = pathContainer.querySelector(".rename");
    if(renameWrapper.hasAttribute("iserror")){
        renameWrapper.removeAttribute("iserror");
    }
    renameInput.value = fileName;
    renameInput.focus();
}

function deletePath(trigger){
    let currOpen = document.querySelector(".context-menu[opened]");
    if(currOpen){
        currOpen.removeAttribute("opened");
    }
    let pathContainer = trigger.closest(".path-container");
    let path = pathContainer.getAttribute("path");
    let tabOpen = document.querySelector(`.tab[tabpath="${escapePath(path)}"]`);
    if(tabOpen){
        closeTab(tabOpen.querySelector(".close-tab"));
    }

    electron.deletePath(pathContainer.getAttribute("path"));
    pathContainer.remove();
}

function triggerRename(event, trigger){
    if(event.key === "Enter"){
        event.preventDefault();
        document.activeElement.blur();
    }
    else{
        let renameError = getValidRename(trigger);
        let renameWrapper = trigger.closest(".rename");
        if(renameError){
            let warning = renameWrapper.querySelector(".rename-warning");
            warning.textContent = renameError;
            renameWrapper.setAttribute("iserror", null);
        }
        else{
            if(renameWrapper.hasAttribute("iserror")){
                renameWrapper.removeAttribute("iserror");
            }
        }
    }
}

function rename(trigger){
    let pathContainer = trigger.closest(".path-container");
    pathContainer.removeAttribute("renaming");
    let renameWrapper = trigger.closest(".rename");
    if(renameWrapper.hasAttribute("iserror")){
        renameWrapper.removeAttribute("iserror");
        return;
    }
    if(pathContainer.querySelector(".info-name").textContent.trim() == trigger.value){
        return;
    }

    let newPath = pathContainer.parentElement.closest(".path-container").getAttribute("path");
    let pathInfo = pathContainer.querySelector(".path-info");
    newPath += `\\${trigger.value}`;
    let currPath = pathContainer.getAttribute("path");
    if(pathContainer.matches(".directory")){
        renameDir(currPath, currPath, newPath, parseInt(pathInfo.style.paddingLeft));
    }
    else{
        renameFile(currPath, currPath, newPath, parseInt(pathInfo.style.paddingLeft));
    }
    pathContainer.querySelector(".info-name").textContent = trigger.value;
    electron.renamePath(currPath, newPath);
}

function getValidRename(renameInput){
    let newName = renameInput.value;
    if(newName === ""){
        return "New file/folder name must not be empty"
    }
    if(!validateFilename.test(newName) && !(/^[a-zA-Z]+$/.test(newName))){
        return "Invalid file/folder name"
    }
    let renameContainer = renameInput.closest(".path-container");
    let dirContents = renameContainer.parentElement.children;
    for(let content of dirContents){
        if(content == renameContainer){
            continue;
        }

        if(!content.matches(".path-container")){
            continue;
        }

        let contentName = content.getAttribute("path").split("\\").pop();
        if(contentName == newName){
            return "Path already taken"
        }
    }
}

function createNew(trigger, type){
    let dirFrom = trigger.closest(".directory");
    if(trigger.parentElement.hasAttribute("opened")){
        trigger.parentElement.removeAttribute("opened");
    }
    dirFrom.setAttribute("opened", null);
    let padding = dirFrom.querySelector(".path-info").style.paddingLeft;
    let htmlString;
    htmlString = `
        <span class="create-new" style="padding-left:calc(${padding} + 10px)" iserror>
            <span class="create-new-input-wrapper">
                <input type="text" createType="${type}" class="create-new-input" style="width:calc(var(--sidetab-width) - ${padding} - 21px)" onkeyup="checkNewPath(event, this)" onfocusout="createNewPath(this, '${type}', ${parseInt(padding) + 10})">
            </span>
            <div class="create-new-warning" style="width:calc(var(--sidetab-width) - ${padding} - 17px)">
                New file/folder name must not be empty
            </div>
        </span>
    `
    let createdForm = createElementFromHTML(htmlString);
    dirFrom.querySelector(".directory-content").prepend(createdForm);
    createdForm.querySelector(".create-new-input").focus();
}

function checkNewPath(event, trigger){
    if(event.key === "Enter"){
        event.preventDefault;
        document.activeElement.blur();
    }
    else{
        let nameError = getValidNew(trigger);
        let creatorWrapper = trigger.closest(".create-new");
        if(nameError){
            let warning = creatorWrapper.querySelector(".create-new-warning");
            warning.textContent = nameError;
            creatorWrapper.setAttribute("iserror", null);
        }
        else{
            if(creatorWrapper.hasAttribute("iserror")){
                creatorWrapper.removeAttribute("iserror");
            }
        }
    }
}

function createNewPath(trigger, type, padding){
    let pathname = trigger.value;
    let creatorWrapper = trigger.closest(".create-new");
    let parentPath = trigger.closest(".path-container").getAttribute("path");
    let path = parentPath + `\\${pathname}`
    if(creatorWrapper.hasAttribute("iserror")){
        creatorWrapper.remove();
        return;
    }
    else{
        if(type == "dir"){
            let newdir = {
                path: path,
                type: "dir",
                content: []
            }
            let htmlString = constructDir(newdir, padding, false, []);
            let dirEl = createElementFromHTML(htmlString);
            trigger.closest(".path-container").querySelector(".directory-content").appendChild(dirEl);
            electron.createDir(path);
        }
        else{
            let newfile = {
                path: path,
                type: "file", 
                ext: path.split(".").pop()
            }
            let htmlString = constructFile(newfile, padding);
            let fileEl = createElementFromHTML(htmlString);
            trigger.closest(".path-container").querySelector(".directory-content").appendChild(fileEl);
            electron.createFile(path);
        }
    }
    creatorWrapper.remove();
}

function getValidNew(nameInput){
    let newName = nameInput.value;
    if(newName === ""){
        return "New file/folder name must not be empty"
    }
    if(!validateFilename.test(newName) && !/^[a-zA-Z]+$/.test(newName)){
        return "Invalid file/folder name"
    }
    let container = nameInput.closest(".path-container");
    let dirContents = container.querySelector(".directory-content").children;
    for(let content of dirContents){
        if(content == container){
            continue;
        }

        if(!content.matches(".path-container")){
            continue;
        }

        let contentName = content.getAttribute("path").split("\\").pop();
        if(contentName == newName){
            return "Path already taken"
        }
    }
}