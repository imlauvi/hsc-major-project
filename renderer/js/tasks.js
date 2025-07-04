let tasks = [];
let breakdown = {
    overall: [0, 0],
    planning: [0, 0],
    design: [0, 0],
    development: [0, 0],
    debugging: [0, 0],
    other: [0, 0]
};
let warningTimeouts = [];

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

function createTask(event, form){
    event.preventDefault();
    let isValid = true;
    let newTask = new FormData(form);
    removeWarning(getElement("due-date-input"));
    removeWarning(getElement("task-name-input"));
    for(let timeout of warningTimeouts){
        clearTimeout(timeout);
    }
    warningTimeouts = [];
    if(!newTask.get("task-name")){
        setWarning(document.querySelector("[id='task-name-input'] .task-warning"), "Task name must not be empty");
        isValid = false;
    }
    if(checkTaskExists(newTask.get("task-name"))){
        setWarning(document.querySelector("[id='task-name-input'] .task-warning"), "Task name taken");
        isValid = false;
    }
    if(!newTask.get("task-due")){
        setWarning(document.querySelector("[id='due-date-input'] .task-warning"), "Due date required");
        isValid = false;
    }
    let newTaskObj = {
        name: newTask.get("task-name"), 
        priority: newTask.get("task-priority"),
        type: newTask.get("task-type"),
        date: new Date(newTask.get("task-due")),
        complete: false
    };
    if(isValid){
        form.reset();
        tasks.push(newTaskObj);
        loadTasks();
    }
}

function setWarning(warning, content){
    warning.textContent = content;
    let inputRect = warning.closest(".task-input").querySelector("input").getBoundingClientRect();
    warning.style.top = `${inputRect.bottom + 4}px`;
    warning.style.left = `${(inputRect.left + inputRect.right) / 2}px`;
    try {
        warning.classList.remove("fade-in-out");
    }
    catch {
        
    }
    warning.classList.add("fade-in-out");
    warningTimeouts.push(setTimeout(() => {
        try {
            warning.classList.remove("fade-in-out");
        }
        catch {
            
        }
    }, 5000));
}

function removeWarning(input){
    let warning = input.querySelector(".task-warning");
    try {
        warning.classList.remove("fade-in-out");
    }
    catch {
        
    }
}

function loadTasks(){
    if(!rootDir){
        getElement("tasks-wrapper").innerHTML = "Open a folder to edit tasks";
        return;
    }
    sortTasks();
    electron.editTasks(rootDir, tasks);
    let taskscontent = "";
    for(let task of tasks){
        taskscontent += genTask(task);
    }
    getElement("tasks-wrapper").innerHTML = taskscontent;
    displayBreakdown();
}

function checkTaskExists(taskname){
    for(let task of tasks){
        if(task.name == taskname){
            return true;
        }
    }
    return false;
}

function genTask(task){
    taskhtml = `
        <span class="task" taskname="${task.name}">
            <span class="task-component-wrapper">
                <span class="task-name">
                    ${task.name}
                </span>
            </span>
            <span class="task-component-wrapper">
                <i class="priority-level priority-${task.priority}" onmouseenter="openHoverMsg(event, this)" onmouseleave="closeHoverMsg(this)">
                    <span class="hover-msg">
                        Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                </i>
            </span>
            <span class="task-component-wrapper">
                <span class="task-type task-type-${task.type}" onmouseenter="openHoverMsg(event, this)" onmouseleave="closeHoverMsg(this)">
                    ${task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                    <span class="hover-msg">
                        Task type
                    </span>
                </span>
            </span>
            <span class="task-component-wrapper">
                <span class="task-date task-${timeUntil(task)[1]}" onmouseenter="openHoverMsg(event, this)" onmouseleave="closeHoverMsg(this)">
                    ${toReadableDate(task.date)}
                    <span class="hover-msg">
                        ${timeUntil(task)[0]}
                    </span>
                </span>
            </span>
            <span class="task-component-wrapper">
                <i class="bx bx-trash task-button delete-task" onmouseenter="openHoverMsg(event, this)" onmouseleave="closeHoverMsg(this)" onclick="deleteTask(this)">
                    <span class="hover-msg">
                        Delete task
                    </span>
                </i>
            </span>
            <span class="task-component-wrapper">
                <span class="complete-wrapper" onmouseenter="openHoverMsg(event, this)" onmouseleave="closeHoverMsg(this)"> 
                    <input type="checkbox" onclick=toggleTaskComplete(this) ${task.complete ? "checked" : ""}>
                    <span class="hover-msg">
                        ${getCompleteHover(task.complete)}
                    </span>
                </span>
            </span>
        </span>
    `;
    return taskhtml;
}

function compareTasksName(a, b){
    return a.name < b.name ? -1 : 1;
}

function compareTasksPriority(a, b){
    if(a.priority != b.priority){
        return comparePriority(a, b);
    }
    if(a.date.getTime() !== b.date.getTime()){
        return compareDate(a, b);
    }
    if(a.type != b.type){
        return compareType(a, b);
    }
    return compareTasksName(a, b);
}

function compareTasksDate(a, b){
    if(a.date.getTime() !== b.date.getTime()){
        return compareDate(a, b);
    }
    if(a.priority != b.priority){
        return comparePriority(a, b);
    }
    if(a.type != b.type){
        return compareType(a, b);
    }
    return compareTasksName(a, b);
}

function compareTasksType(a, b){
    if(a.type != b.type){
        return compareType(a, b);
    }
    if(a.priority != b.priority){
        return comparePriority(a, b);
    }
    if(a.date.getTime() !== b.date.getTime()){
        return compareDate(a, b);
    }
    return compareTasksName(a, b);
}

function comparePriority(a, b){
    const priorityMap = {
        "high": 2,
        "mid": 1,
        "low": 0
    }
    return priorityMap[a.priority] > priorityMap[b.priority] ? -1 : 1;
}

function compareDate(a, b){
    if(a.complete != b.complete){
        return a.complete < b.complete ? -1 : 1;
    }
    return a.date.getTime() < b.date.getTime() ? -1 : 1;
}

function compareType(a, b){
    const typeMap = {
        "planning": 4,
        "design": 3,
        "development": 2,
        "debugging": 1,
        "other": 0
    }
    return typeMap[a.type] > typeMap[b.type] ? -1 : 1;
}

function toReadableDate(date){
    return date.toLocaleString();
}

function timeUntil(task){
    if(task.complete){
        return ["Complete", "complete"];
    }
    let date = task.date;
    let diff = date - new Date();
    if(diff < 0){
        return ["Overdue", "overdue"];
    }
    if(diff < 3.6e+6){
        return [`Due in ${Math.floor(diff / 60000)} minutes`, "today"];
    }
    if(diff < 8.64e+7){
        return [`Due in ${Math.floor(diff / 3.6e+6)} hours`, "today"];
    }
    if(diff < 6.048e+8){
        return [`Due in ${Math.floor(diff / 8.64e+7)} days`, "week"];
    }
    return [`Due in ${Math.floor(diff / 8.64e7)} days`, "later"];
}

function toggleTaskComplete(trigger){
    let task = trigger.closest(".task");
    let taskname = task.getAttribute("taskname");
    for(let i = 0; i < tasks.length; i++){
        if(tasks[i].name == taskname){
            tasks[i].complete = !tasks[i].complete;
        }
    }
    loadTasks();
}

function getCompleteHover(complete){
    if(complete){
        return "Mark as incomplete"
    }
    else{
        return "Mark as complete"
    }
}

function deleteTask(trigger){
    let taskname = trigger.closest(".task").getAttribute("taskname");
    tasks = tasks.filter((item) => {
        return item.name !== taskname;
    });
    loadTasks();
}

function sortTasks(){
    let sortType = getElement("select-sort-by").value;
    let sortFunc;
    if(sortType == "name"){
        sortFunc = compareTasksName;
    }
    if(sortType == "priority"){
        sortFunc = compareTasksPriority;
    }
    if(sortType == "due"){
        sortFunc = compareTasksDate;
    }
    if(sortType == "type"){
        sortFunc = compareTasksType;
    }
    tasks.sort(sortFunc);
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

function genBreakdown(){
    breakdown = {
        overall: [0, 0],
        planning: [0, 0],
        design: [0, 0],
        development: [0, 0],
        debugging: [0, 0],
        other: [0, 0]
    };
    for(let task of tasks){
        breakdown["overall"][1]++;
        breakdown[task.type][1]++;
        if(task.complete){
            breakdown["overall"][0]++;
            breakdown[task.type][0]++;
        }
    }
}

function displayBreakdown(){
    genBreakdown();
    for(let [type, completion] of Object.entries(breakdown)){
        let breakdown = getElement(`breakdown-${type}`);
        breakdown.querySelector(".breakdown-completion").textContent = `${completion[0]}/${completion[1]}`;
        let width;
        if(completion[1] > 0){
            width = completion[0] / completion[1];
        }
        else{
            width = 1;
        }
        width = width * 100;
        breakdown.querySelector(".breakdown-bar-fill").style.width = `${width}%`;
    }
}