let settings = {
    editorFont: "monospace",
    fontSize: 14,
    editorTheme: "monokai"
};

function openSettings(){
    electron.openSettings();
}

function updateSettings(event, form){
    event.preventDefault();
    let newSettings = new FormData(form);
    let settingsObj = {
        editorFont: newSettings.get("font-select"),
        fontSize: parseInt(newSettings.get("font-size")),
        editorTheme: newSettings.get("theme-select")
    };
    electron.updateSettings(settingsObj);
}

document.addEventListener("DOMContentLoaded", () => {
    electron.fetchSettings();
})

electron.onSettingsChange((newSettings) => {
    settings = newSettings;
    setSelectedSettings();
})

function setSelectedSettings(){
    if(document.querySelector(`.settings-form`)){
        document.querySelector(`.settings-select-input[name="font-select"]`).value = settings.editorFont;
        document.querySelector(`.settings-select-input[name="theme-select"]`).value = settings.editorTheme;
        document.querySelector(`input[name="font-size"]`).value = settings.fontSize;
    }
    let cms = document.querySelectorAll(".CodeMirror");
    for(let cmEl of cms){
        let cm = cmEl.CodeMirror;
        cm.setOption("theme", settings.editorTheme);
        cmEl.style.fontSize = `${settings.fontSize}px`;
        cm.refresh();
    }
    document.documentElement.style.setProperty("--editor-font", settings.editorFont);
}
