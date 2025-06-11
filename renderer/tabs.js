let dragging = true;
let withinDisplayDrop = true;
let withinTabDrop = 0;
let dropTabGroup;
let dropTabRef;

function getDropTab(event){
    let left = 0;
    let width = 0;
    let type = 0;
    let style = window.getComputedStyle(document.body);
    let pos = event.clientX - parseInt(style.getPropertyValue("--side-bar-width")) - parseInt(style.getPropertyValue("--sidetab-width"));
    codeareaWidth = parseInt(getElement("codearea").clientWidth);

    if(getElement("codearea").getAttribute("opened") == "11"){
        leftWidth = getElement("codearea-left").clientWidth;
        rightWidth = getElement("codearea-right").clientWidth;
        if(pos < leftWidth){
            left = 0;
            width = leftWidth;
            type = 0;
        }
        else{
            left = leftWidth;
            width = rightWidth;
            type = 2;
        }
    }
    else{
        if(pos < codeareaWidth / 4){
            left = 0;
            width = codeareaWidth / 2;
            type = 0;
        }
        else if(pos > codeareaWidth * 3 / 4){
            left = codeareaWidth / 2;
            width = codeareaWidth / 2;
            type = 2;
        }
        else{
            left = 0;
            width = codeareaWidth;
            type = 1;
        }
    }
    
    getElement("drop-indicator").style.setProperty("margin-left", `${left}px`);
    getElement("drop-indicator").style.setProperty("width", `${width}px`);
    return type;
}

function setDropIndicatorVisible(){
    if(dragging && withinDisplayDrop){
        if(getElement("drop-indicator").hasAttribute("ishidden")){
            getElement("drop-indicator").removeAttribute("ishidden");
        }
    }
    else{
        getElement("drop-indicator").setAttribute("ishidden", null);
    }
}

function setTabDropIndicator(event){
    let style = window.getComputedStyle(document.body);
    let posX = event.clientX - parseInt(style.getPropertyValue("--side-bar-width")) - parseInt(style.getPropertyValue("--sidetab-width"));
    let indicator;
    let tabGroup;
    if(withinTabDrop == 0){
        getElement("tab-drop-indicator-left").setAttribute("ishidden", null);
        getElement("tab-drop-indicator-right").setAttribute("ishidden", null);
        return;
    }
    else if(withinTabDrop == 1){
        indicator = getElement("tab-drop-indicator-left");
        tabGroup = getElement("tabs-left");
        getElement("tab-drop-indicator-right").setAttribute("ishidden", null);
    }
    else if(withinTabDrop == 2){
        indicator = getElement("tab-drop-indicator-right");
        tabGroup = getElement("tabs-right");
        getElement("tab-drop-indicator-left").setAttribute("ishidden", null);
    }

    if(indicator.hasAttribute("ishidden")){
        indicator.removeAttribute("ishidden");
    }

    let indicatorPos = 0;
    let dropRef = null;

    let tabsList = tabGroup.children;
    for(let i = 0; i < tabsList.length; i++){
        let tab = tabsList[i];
        if(!tab.classList.contains("tab")){
            continue;
        }

        tabRect = tab.getBoundingClientRect();
        tabPosX = (tabRect.left + tabRect.right) / 2 - tabGroup.getBoundingClientRect().left;

        if(tabPosX > posX){
            indicatorPos = tabRect.left - tabGroup.getBoundingClientRect().left;
            dropRef = tab;
            break;
        }
        else{
            indicatorPos = tabRect.right - tabGroup.getBoundingClientRect().left;
        }
    }

    dropTabGroup = tabGroup;
    dropTabRef = dropRef;
    indicator.style.setProperty("margin-left", `${indicatorPos}px`);
}

document.addEventListener('DOMContentLoaded', function(){
    getElement("codearea").addEventListener("dragover", function(event){
        getDropTab(event);
    })

    // getElement("codearea").addEventListener("click", function(event){
    //     if(getElement("drop-indicator").hasAttribute("ishidden")){
    //         getElement("drop-indicator").removeAttribute("ishidden");
    //     }
    //     else{
    //         getElement("drop-indicator").setAttribute("ishidden", null);
    //     }
    // }) //testing

    // getElement("drop-indicator").setAttribute("ishidden", null);
    document.addEventListener("dragover", function(event){
        let style = window.getComputedStyle(document.body);
        let posX = event.clientX - parseInt(style.getPropertyValue("--side-bar-width")) - parseInt(style.getPropertyValue("--sidetab-width"));
        let posY = event.clientY - parseInt(style.getPropertyValue("--top-bar-height"));
        if(posX < 0 || posY < 0 || posY > document.clientHeight - parseInt(style.getPropertyValue("--bottom-bar-height")) - parseInt(style.getPropertyValue("--terminal-height")) - parseInt(style.getPropertyValue("--top-bar-height"))){
            withinDisplayDrop = false;
            withinTabDrop = 0;
        }
        else if(posY < parseInt(style.getPropertyValue("--tabs-height"))){
            withinDisplayDrop = false;
            if(posX < getElement("codearea-left").clientWidth){
                withinTabDrop = 1;
            }
            else{
                withinTabDrop = 2;
            }
        }
        else{
            withinDisplayDrop = true;
            withinTabDrop = 0;
        }
        setDropIndicatorVisible();
    })

    document.addEventListener("dragover", function(event){
        setTabDropIndicator(event);
    });
})

function beginDrag(event){
    dragging = true;
    document.body.style.userSelect = "none";
}

function endDrag(){
    dragging = false;
    setDropIndicatorVisible();
    if(dropTabGroup){
        dropTabGroup.querySelector(".tab-drop-indicator").setAttribute("ishidden", null);
    }
    document.body.style.userSelect = "auto";
}

function openTab(tab){
    tabsList = tab.parentElement.querySelectorAll(".tab");
    for(let i = 0; i < tabsList.length; i++){
        if(tabsList[i] === tab){
            tabsList[i].setAttribute("selected", null);
        }
        else{
            if(tabsList[i].hasAttribute("selected")){
                tabsList[i].removeAttribute("selected");
            }
        }
    }
}