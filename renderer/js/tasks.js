function openSideTab(trigger){
    let sideIcons = document.querySelectorAll(".side-icon");
    for(let sideIcon of sideIcons){
        if(sideIcon.hasAttribute("focused")){
            sideIcon.removeAttribute("focused");
        }
    }
    trigger.setAttribute("focused", null);
    let tabTo = getElement(trigger.getAttribute("to"));
    let sideTabs = document.querySelectorAll(".sidetab-tab");
    for(let sideTab of sideTabs){
        if(sideTab.hasAttribute("isopen")){
            sideTab.removeAttribute("isopen");
        }
    }
    tabTo.setAttribute("isopen", null);
}

function openHoverMsg(event, trigger){
    let msg = trigger.querySelector(".hover-msg");
    msg.setAttribute("shown", null);
    let triggerRect = trigger.getBoundingClientRect();
    msg.style.top = `${triggerRect.bottom + 2}px`;
    msg.style.left = `${(triggerRect.left + triggerRect.right - msg.clientWidth) / 2}px`;
}

function closeHoverMsg(trigger){
    let msg = trigger.querySelector(".hover-msg");
    if(msg.hasAttribute("shown")){
        msg.removeAttribute("shown");
    }
}

function newTask(){

}

function toggleTaskBreakdown(){
    let style = window.getComputedStyle(document.body);
    let breakdownButton = getElement("toggle-task-breakdown");
    if(breakdownButton.hasAttribute("isopen")){
        breakdownButton.removeAttribute("isopen");
        document.documentElement.style.setProperty("--task-breakdown-width", "1px");
        getElement("task-breakdown").style.setProperty("display", "none");
    }
    else{
        breakdownButton.setAttribute("isopen", null);
        document.documentElement.style.setProperty("--task-breakdown-width", style.getPropertyValue("--task-breakdown-width-default"));
        getElement("task-breakdown").style.setProperty("display", "block");
    }
}