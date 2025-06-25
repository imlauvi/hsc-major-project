let term;
document.addEventListener("DOMContentLoaded", () => {
    electron.loadTerm("");
    
    term = new Terminal({
        cursorBlink: "block",
        fontFamily: 'Monospace',
        fontSize: 14, 
        lineHeight: 1,
    });
    term.open(getElement("terminal-content"));
    setTermWidth();

    electron.onTermIncoming((data) => {
        term.write(data);
    })

    term.onData(e => {
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