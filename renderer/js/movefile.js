// sort the files

let fileDrag = false;

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

        if(folderDrop.querySelector(`.path-container[path="${escapePath(path)}"]`)){
            return;
        }
        let dropContent = document.querySelector(`.path-container[path="${escapePath(path)}"]`);
        let currDirPath = dropContent.parentElement.closest(".directory").getAttribute("path");
        let newPath = folderDrop.getAttribute("path");
        let newInd = parseInt(folderDrop.querySelector(".path-info").style.paddingLeft) + 10;
        if(dropContent.matches(".directory")){
            if(dropContent == folderDrop){
                console.log("path already exists");
                return;
            }
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
    fileEl.setAttribute("path", path.replace(oldPathSeg, newPathSeg));

    let openedTab = document.querySelector(`.tab[tabpath="${escapePath(path)}"]`);
    let openedWindow = document.querySelector(`.window[tabpath="${escapePath(path)}"]`);

    if(openedTab && openedWindow){
        openedTab.setAttribute("tabpath", path.replace(oldPathSeg, newPathSeg));
        openedWindow.setAttribute("tabpath", path.replace(oldPathSeg, newPathSeg));
    }
}

function renameDir(path, oldPathSeg, newPathSeg, newInd){
    let dirEl = document.querySelector(`.path-container[path="${escapePath(path)}"]`);
    dirEl.querySelector(".path-info").style.paddingLeft = `${newInd}px`;
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
})