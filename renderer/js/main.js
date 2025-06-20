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
                getElement("sidetab-content").innerHTML = "";
                pathloaded = await loadPath(rootDir);
                for(let path of pathloaded){
                    if(path.type == "dir"){
                        getElement("sidetab-content").innerHTML += constructDir(path);
                    }
                    else{
                        getElement("sidetab-content").innerHTML += constructFile(path);
                    }
                }
            }
        });
}

async function loadPath(dirName){
    let res = await electron.loadPath(dirName)
    return res;
}

function constructDir(dir){
    dirhtml = `
        <div class="directory path-container" path="${dir.path}">
            <span class="path-name directory-name">${dir.path.split("/").pop()}</span>
            <div class="directory-content">
    `
    for(let content of dir.content){
        if(content.type == "file"){
            dirhtml += constructFile(content);
        }
        else{
            dirhtml += constructDir(content);
        }
    }
    dirhtml += "</div></div>";
    return dirhtml;
}

function constructFile(file){
    filehtml = `
        <div class="file path-container" path="${file.path}" ext=${file.ext}>
            <span class="path-name file-name">${file.path.split("/").pop()}</span>
        </div>
    `
    return filehtml;
}