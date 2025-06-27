let term;
let isenter;
document.addEventListener("DOMContentLoaded", () => {
    let style = window.getComputedStyle(document.body);
    let termCol = style.getPropertyValue("--clr-surface-a10");
    electron.loadTerm("");
    
    term = new Terminal({
        cursorBlink: "block",
        fontFamily: 'Monospace',
        fontSize: 14, 
        lineHeight: 1,
    });
    term.setOption("theme", {
        foreground: "#eeeeee",
        background: termCol
    })
    term.open(getElement("terminal-content"));
    setTermWidth();

    electron.onTermIncoming((data) => {
        term.write(data);
        if(isenter){
            setTimeout(reloadRoot, 500, false);
            isenter = false;
        }
    })

    term.onData(e => {
        if(e === "\r"){
            isenter = true;
        }
        electron.sendTermKeystroke(e);
    })
})

function setTermWidth(){
    let terminal = getElement("terminal");
    let width = terminal.clientWidth;
    let height = terminal.clientHeight;
    let widthCells = Math.floor(width / 8);
    let heightCells = Math.floor(height / 16);
    term.resize(widthCells, heightCells);
}