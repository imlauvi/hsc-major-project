function getElement(id){
    return document.getElementById(id);
}

let resizing = false;

document.addEventListener('selectstart', function(e) {
    if(resizing){
        e.preventDefault();
        return false;
    }
    else{
        return true;
    }
});

document.addEventListener('dragstart', function(e) {
    if(resizing){
        e.preventDefault();
        return false;
    }
    else{
        return true;
    }
});


function sideTabResize(){ //maybe add mobile support
    const sideTabResize = getElement("sidetab-resize");

    sideTabResize.addEventListener("mousedown", startResize);

    function startResize(){
        resizing = true;
        sideTabResize.setAttribute("resizing", null);
        document.body.setAttribute("resizing", null);

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", endResize);
    }

    function resize(event){
        let style = window.getComputedStyle(document.body);

        if(!resizing){
            return;
        }
        
        document.documentElement.style.setProperty("--sidetab-width-max", `${getElement("content").clientWidth - getElement("sidenav").clientWidth - 100}px`)

        document.body.style.cursor = "ew-resize";
        
        let size = event.clientX - parseInt(style.getPropertyValue("--side-bar-width"));
        sizeClamp = Math.max(parseInt(style.getPropertyValue("--sidetab-width-min")), Math.min(size, parseInt(style.getPropertyValue("--sidetab-width-max"))))
        if(size < sizeClamp - 50){
            sizeClamp = 0;
            getElement("sidetab").setAttribute("isHidden", true);
        }
        else{
            getElement("sidetab").setAttribute("isHidden", false);
        }
        document.documentElement.style.setProperty("--sidetab-width", `${sizeClamp}px`);

        adjustCodeareaResize();
    }

    function endResize(){
        resizing = false;
        if(sideTabResize.hasAttribute("resizing")){
            sideTabResize.removeAttribute("resizing");
        }

        if(document.body.hasAttribute("resizing")){
            document.body.removeAttribute("resizing");
        }

        document.body.style.cursor = "default";

        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", endResize);
    }
}

function terminalResize(){ //maybe add mobile support
    const terminalResize = getElement("terminal-resize");

    terminalResize.addEventListener("mousedown", startResize);

    function startResize(){
        resizing = true;
        terminalResize.setAttribute("resizing", null);
        document.body.setAttribute("resizing", null);

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", endResize);
    }

    function resize(event){
        style = window.getComputedStyle(document.body);

        if(!resizing){
            return;
        }

        document.documentElement.style.setProperty("--terminal-height-max", `${getElement("main").clientHeight - 100}px`)
        
        document.body.style.cursor = "ns-resize";

        let size = window.innerHeight - event.clientY - parseInt(style.getPropertyValue("--bottom-bar-height"));
        sizeClamp = Math.max(parseInt(style.getPropertyValue("--terminal-height-min")), Math.min(size, parseInt(style.getPropertyValue("--terminal-height-max"))))
        getElement("terminal").setAttribute("full", false);
        if(size < sizeClamp - 50){
            sizeClamp = 6;
            getElement("terminal").setAttribute("isHidden", true);
        }
        else{
            getElement("terminal").setAttribute("isHidden", false);
            if(size > sizeClamp + 50){
                getElement("codearea").setAttribute("isHidden", true);
                getElement("terminal").setAttribute("full", true);
                document.documentElement.style.setProperty("--terminal-height", `${getElement("main").clientHeight + 6}px`);
                return;
            }
            else{
                getElement("codearea").setAttribute("isHidden", false);
            }
        }
        document.documentElement.style.setProperty("--terminal-height", `${sizeClamp}px`);
    }

    function endResize(){
        resizing = false;
        if(terminalResize.hasAttribute("resizing")){
            terminalResize.removeAttribute("resizing");
        }

        if(document.body.hasAttribute("resizing")){
            document.body.removeAttribute("resizing");
        }

        document.body.style.cursor = "default";

        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", endResize);
    }
}

function codeAreaResize(){ //maybe add mobile support
    const codeAreaResize = getElement("codearea-left-resize");

    codeAreaResize.addEventListener("mousedown", startResize);

    function startResize(){
        resizing = true;
        codeAreaResize.setAttribute("resizing", null);
        document.body.setAttribute("resizing", null);

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", endResize);
    }

    function resize(event){
        let style = window.getComputedStyle(document.body);

        if(!resizing){
            return;
        }

        document.body.style.cursor = "ew-resize";
        
        let size = event.clientX - parseInt(style.getPropertyValue("--side-bar-width")) - parseInt(style.getPropertyValue("--sidetab-width"));
        sizeClamp = Math.min(getElement("codearea").clientWidth - 50, Math.max(size, 50));
        sizeProportion = (sizeClamp / getElement("codearea").clientWidth) * 100;
        document.documentElement.style.setProperty("--codearea-left-width", `${sizeProportion}%`);

        adjustCodeareaResize();
    }

    function endResize(){
        resizing = false;
        if(codeAreaResize.hasAttribute("resizing")){
            codeAreaResize.removeAttribute("resizing");
        }

        if(document.body.hasAttribute("resizing")){
            document.body.removeAttribute("resizing");
        }

        document.body.style.cursor = "default";

        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", endResize);
    }
}

function adjustCodeareaResize(){
    let style = window.getComputedStyle(document.body);
    getElement("codearea-left-resize").style.setProperty("margin-left", `${getElement("codearea-left").clientWidth - 2}px`);
}

document.addEventListener('DOMContentLoaded', function(){
    sideTabResize();
    terminalResize();
    codeAreaResize();
    adjustCodeareaResize();

    addEventListener("resize", function(){
        adjustCodeareaResize();
    })
})

