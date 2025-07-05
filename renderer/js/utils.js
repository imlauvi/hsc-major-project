function getElement(id){
    return document.getElementById(id);
}

function escapePath(path){
    return path.replaceAll("\\", "\\\\");
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function example(){
    return 175
}