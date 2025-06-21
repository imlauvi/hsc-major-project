function getElement(id){
    return document.getElementById(id);
}

function escapePath(path){
    return path.replaceAll("\\", "\\\\");
}