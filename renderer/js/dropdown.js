let rootDir = null;

document.addEventListener("DOMContentLoaded", function(){
    let dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
    for(let dropdownTrigger of dropdownTriggers){
        dropdownTrigger.addEventListener("mousedown", function(event){ setDropdown(this, event) });
    }

    document.documentElement.addEventListener("mousemove", updateDropdown);

    document.documentElement.addEventListener("mousedown", function(event){
        if(!event.target.closest(".dropdown-trigger")){
            if(document.body.hasAttribute("dropdown-active")){
                document.body.removeAttribute("dropdown-active");
            }
        }
    });
})

function setDropdown(dropdownTrigger, event){
    if(event.target.closest(".dropdown")){
        return;
    }
    let dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
    if(document.body.hasAttribute("dropdown-active")){
        document.body.removeAttribute("dropdown-active");
        for(let trigger of dropdownTriggers){
            if(trigger.hasAttribute("active")){
                trigger.removeAttribute("active");
            }
        }
    }
    else{
        document.body.setAttribute("dropdown-active", null);
        for(let trigger of dropdownTriggers){
            if(trigger === dropdownTrigger){
                trigger.setAttribute("active", null);
            }
            else if(trigger.hasAttribute("active")){
                trigger.removeAttribute("active");
            }
        }
    }
}

function updateDropdown(event){
    let corrDropdown = event.target.closest(".dropdown-trigger");
    let dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
    if(corrDropdown){
        for(let trigger of dropdownTriggers){
            if(trigger === corrDropdown){
                trigger.setAttribute("active", null);
            }
            else if(trigger.hasAttribute("active")){
                trigger.removeAttribute("active");
            }
        }
    }
}