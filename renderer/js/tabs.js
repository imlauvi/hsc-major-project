let dragging = true;
let withinDisplayDrop = true;
let withinTabDrop = 0;
let dropTabGroup;
let dropTabRef;
let dropTabType = 0;

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
            type = 1;
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
            type = 1;
        }
        else{
            left = 0;
            width = codeareaWidth;
            type = 2;
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

    posX = event.clientX - tabGroup.getBoundingClientRect().left;

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
        dropTabType = getDropTab(event);
    })

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

    let tabDrops = document.querySelectorAll(".tabs");
    let tabContents = document.querySelectorAll(".tab-content");
    for(let i = 0; i < tabDrops.length; i++){
        tabDrops[i].addEventListener("dragover", (ev) => {
            ev.preventDefault();
        });
        tabDrops[i].addEventListener("drop", function(event){
            let droppedTab = document.querySelector(`.tab[tabpath="${escapePath(event.dataTransfer.getData("text"))}"]`);
            if(!dropTabRef){
                tabDrops[i].appendChild(droppedTab);
            }
            else{
                tabDrops[i].insertBefore(droppedTab, dropTabRef);
            }
            moveContent(tabContents[i], droppedTab.getAttribute("tabpath"));
            openTab(droppedTab);

            let otherTabGroup = tabDrops[(i+1)%2].children;
            let replaceOpenTab = null;
            for(let j = 0; j < otherTabGroup.length; j++){
                if(otherTabGroup[j].matches(".tab")){
                    replaceOpenTab = otherTabGroup[j];
                }
            }
            if(replaceOpenTab){
                openTab(replaceOpenTab);
            }

            getElement("codearea").setAttribute("opened", getOpenedWindows());

            setMain(droppedTab.closest(".codearea-group"));
        })
    }

    for(let i = 0; i < tabContents.length; i++){
        tabContents[i].addEventListener("dragover", (ev) => {
            ev.preventDefault();
        });
        tabContents[i].addEventListener("drop", function(event){
            let initialWindows = getOpenedWindows();
            let droppedTab = document.querySelector(`.tab[tabpath="${escapePath(event.dataTransfer.getData("text"))}"]`);
            if(dropTabType == 2){
                if(!tabDrops[i].contains(droppedTab)){
                    tabDrops[i].appendChild(droppedTab);
                    moveContent(tabContents[i], droppedTab.getAttribute("tabpath"));
                    openTab(droppedTab);
                }
            }
            else{
                if(getElement("codearea").getAttribute("opened") == "11" || !needsSwap(dropTabType)){
                    if(!tabDrops[dropTabType].contains(droppedTab)){
                        tabDrops[dropTabType].appendChild(droppedTab);
                        moveContent(tabContents[dropTabType], droppedTab.getAttribute("tabpath"));

                        openTab(droppedTab);

                        let otherTabGroup = tabDrops[(dropTabType + 1)%2].children;
                        let replaceOpenTab = null;

                        for(let j = 0; j < otherTabGroup.length; j++){
                            if(otherTabGroup[j].matches(".tab")){
                                replaceOpenTab = otherTabGroup[j];
                            }
                        }

                        if(replaceOpenTab){
                            openTab(replaceOpenTab);
                        }
                    }
                }
                else{
                    getElement("codearea").setAttribute("opened", "11");
                    moveChildren(tabDrops[dropTabType], tabDrops[(dropTabType + 1)%2], ".tab", "tabpath", escapePath(droppedTab.getAttribute("tabpath")));
                    moveChildren(tabContents[dropTabType], tabContents[(dropTabType + 1)%2], ".window", "tabpath", escapePath(droppedTab.getAttribute("tabpath")));
                    let otherTabGroup = tabDrops[(dropTabType + 1)%2].children;
                    let replaceOpenTab = null;

                    for(let j = 0; j < otherTabGroup.length; j++){
                        if(otherTabGroup[j].matches(".tab")){
                            replaceOpenTab = otherTabGroup[j];
                        }
                    }

                    if(replaceOpenTab){
                        openTab(replaceOpenTab);
                    }
                }
            }
            
            getElement("codearea").setAttribute("opened", getOpenedWindows());
            if(getOpenedWindows() != initialWindows){
                document.documentElement.style.setProperty("--codearea-left-width", "0.5");
                adjustCodeareaResize();
            }

            setMain(droppedTab.closest(".codearea-group"));
        })
    }
})

function beginDrag(event){
    dragging = true;
    document.body.style.userSelect = "none";
    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/plain", event.target.getAttribute("tabpath"));
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
    let tabsList = tab.parentElement.querySelectorAll(".tab");
    let tabpath = tab.getAttribute("tabpath");
    for(let i = 0; i < tabsList.length; i++){
        if(tabsList[i] === tab){
            tabsList[i].setAttribute("selected", null);
            document.querySelector(`.window[tabpath="${escapePath(tabpath)}"]`).setAttribute("active", null);
        }
        else{
            if(tabsList[i].hasAttribute("selected")){
                tabsList[i].removeAttribute("selected");
            }
            let tabcontent = document.querySelector(`.window[tabpath="${escapePath(tabsList[i].getAttribute("tabpath"))}"]`);
            if(tabcontent.hasAttribute("active")){
                tabcontent.removeAttribute("active");
            }
        }
    }
}

function moveContent(newParent, tabpath){
    elem = document.querySelector(`.window[tabpath="${escapePath(tabpath)}"]`);
    if(!newParent.contains(elem)){
        newParent.appendChild(elem);
    }
}

function getOpenedWindows(){
    let tabDrops = document.querySelectorAll(".tabs");
    let openedWindows = "";
    for(let i = 0; i < tabDrops.length; i++){
        let tabCodearea = tabDrops[i].closest(".codearea-group");
        if(tabDrops[i].querySelector(".tab")){
            tabCodearea.setAttribute("opened", null);
            openedWindows += "1";
        }
        else{
            if(tabCodearea.hasAttribute("opened")){
                tabCodearea.removeAttribute("opened");
            }
            openedWindows += "0";
        }
    }

    return openedWindows;
}

function moveChildren(from, to, classType, identifier, exception){
    let toTransfer = from.querySelectorAll(`${classType}:not([${identifier}="${exception}"])`);
    let newParent = to;
    for(let i = 0; i < toTransfer.length; i++){
        newParent.appendChild(toTransfer[i]);
    }
}

function needsSwap(dropType){
    let openedWindows = getElement("codearea").getAttribute("opened");
    if(openedWindows == "10" && dropType == 0){
        return true
    }
    if(openedWindows == "01" && dropType == 1){
        return true
    }
    return false;
}

function closeTab(tabtrigger){
    let tab = tabtrigger.closest(".tab");
    let tabPath = tab.getAttribute("tabpath"); 
    let tabCorrContent = document.querySelector(`.window[tabpath="${escapePath(tabPath)}"]`);
    let adjTab = getAdjSibling(tab, ".tab");

    tab.remove();
    tabCorrContent.remove();

    if(adjTab != null){
        openTab(adjTab);
    }

    getElement("codearea").setAttribute("opened", getOpenedWindows());
}

function closeAllTabs(){
    for(let tabtrigger of document.querySelectorAll(".close-tab")){
        closeTab(tabtrigger);
    }
}

function getAdjSibling(elem, selector) {
	let sibling = elem.previousElementSibling;
	if (!selector) return sibling;
	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.previousElementSibling;
	}
    sibling = elem.nextElementSibling;
	if (!selector) return sibling;
	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling;
	}
    return null;
};

function setMain(codeareaClick){
    codeareaClick.setAttribute("main", null);
    let codeareaOther = document.querySelector(`.codearea-group:not([id="${codeareaClick.id}"])`);
    if(codeareaOther.hasAttribute("main")){
        codeareaOther.removeAttribute("main");
    }
}