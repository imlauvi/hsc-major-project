function getElement(id){
    return document.getElementById(id);
}

function sideTabResize(){ //maybe add mobile support
    let sideTabAdjusting = false;

    const sideTabResize = getElement("sidetab-resize");

    sideTabResize.addEventListener("mousedown", startResize);

    function startResize(){
        sideTabAdjusting = true;
        sideTabResize.setAttribute("resizing", null);

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", endResize);
    }

    function resize(event){
        if(!sideTabAdjusting){
            return;
        }
        
        document.body.style.cursor = "ew-resize";

        let size = event.clientX - parseInt(window.getComputedStyle(document.body).getPropertyValue("--side-bar-width"));
        let sidetab = window.getComputedStyle(getElement("sidetab"));
        size = Math.max(parseInt(sidetab.getPropertyValue("min-width")), Math.min(size, parseInt(sidetab.getPropertyValue("max-width"))))
        document.documentElement.style.setProperty("--sidetab-width", `${size}px`);
    }

    function endResize(){
        sideTabAdjusting = false;
        if(sideTabResize.hasAttribute("resizing")){
            sideTabResize.removeAttribute("resizing");
        }

        document.body.style.cursor = "default";

        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", endResize);
    }
}

function terminalResize(){ //maybe add mobile support
    let terminalAdjusting = false;

    const terminalResize = getElement("terminal-resize");

    terminalResize.addEventListener("mousedown", startResize);

    function startResize(){
        sideTabAdjusting = true;
        terminalResize.setAttribute("resizing", null);

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", endResize);
    }

    function resize(event){
        if(!sideTabAdjusting){
            return;
        }
        
        document.body.style.cursor = "ns-resize";

        let size = window.innerHeight - event.clientY;
        let terminal = window.getComputedStyle(getElement("terminal"));
        size = Math.max(parseInt(terminal.getPropertyValue("min-height")), Math.min(size, parseInt(terminal.getPropertyValue("max-height"))))
        document.documentElement.style.setProperty("--terminal-height", `${size}px`);
    }

    function endResize(){
        terminalAdjusting = false;
        if(terminalResize.hasAttribute("resizing")){
            terminalResize.removeAttribute("resizing");
        }

        document.body.style.cursor = "default";

        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", endResize);
    }
}

document.addEventListener('DOMContentLoaded', function(){
    sideTabResize();
    terminalResize();
})

