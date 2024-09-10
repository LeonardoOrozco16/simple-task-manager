'use strict'
var $this;
const taskForm = document.getElementById("task_form");
const taskList = document.getElementById("task-list-wrapp");
const svgUpdate = `<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" /></svg>`;
const svgDelete = `<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path d="m9.4 16.5l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 9.9l-1.4-1.4l-2.6 2.6l-2.6-2.6L8 9.9l2.6 2.6L8 15.1zM7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM7 6v13z" /></svg>`;
const taskInput = taskForm.querySelector("#task_input");
const createCompletionCheck = (itemFrame,task) => {
    let frameCheck = document.createElement("div");
    let nItem = taskList.children.length;
    let checkedBox = "";
    if (task.completed && task.completed == true) {
        checkedBox = "checked";
        itemFrame.classList.toggle("task_completed");
    }
    frameCheck.setAttribute("id", "check_completion");
    frameCheck.innerHTML = `<input ${checkedBox} type='checkbox' id='task_${(nItem - 1)}' name='task_${(nItem - 1)}'><label for='task_${(nItem - 1)}' class='completed'></label>`;
    if (!frameCheck.querySelector("#check_completion")) {
        itemFrame.prepend(frameCheck);
    }
}
const createButton = (btnClass,btnText)=> {
    let btnToCreate = document.createElement("a");
    btnToCreate.setAttribute("href", "#");
    btnToCreate.classList.add(btnClass);
    btnToCreate.innerHTML = btnText;
    return btnToCreate;
}
const completionPercent = () => {
    let numTasks = taskList.querySelectorAll(".task-item").length-1;
    let completedTasks = taskList.querySelectorAll(".task_completed").length;
    let percentOfCompletion = (completedTasks > 0)? Math.round((completedTasks * 100) / numTasks) : 0;
    let percentText = document.querySelector(".label-completion span");
    let completionBar = document.getElementById("completion_bar_inner");
    percentText.textContent = percentOfCompletion;
    completionBar.style.width = percentOfCompletion + "%";
}
const createTask = (task) => {
    let taskItem = document.querySelector(".toClone");
    let taskItemClone = taskItem.cloneNode(true);
    let btnFrame = taskItemClone.querySelector(".task-action_block");
    let btnUpdate = createButton("task-edit_btn", svgUpdate);
    let btnDelete = createButton("task-delete_btn", svgDelete);
    let content = (task.task) ? task.task : task;
    btnFrame.append(btnUpdate,btnDelete);
    createCompletionCheck(taskItemClone,task);
    taskItemClone.querySelector(".task-content").innerHTML = "<p>" + content + "</p>";
    taskItemClone.classList.remove("toClone");
    taskList.append(taskItemClone);
    taskInput.value = "";
}
const readTasks = () => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.forEach(task => {
        createTask(task);
    });
    completionPercent();
}
const updateTask = (task) => {
    let itemToUpdate = taskList.querySelector(".currently_edit");
    itemToUpdate.querySelector(".task-content").innerHTML = "<p>" + task + "</p>"
    taskForm.classList.remove("edit_task");
    itemToUpdate.classList.remove("currently_edit");
    taskForm.removeAttribute("style");
    taskInput.value = "";
}
const editTask = (target) => {
    let itemToEdit = target.closest(".task-item");
    itemToEdit.classList.add("currently_edit");
    taskForm.classList.add("edit_task");
    let taskText = itemToEdit.querySelector(".task-content").textContent;
    taskInput.value = taskText;
    taskInput.focus();
    taskForm.style.backgroundColor = "rgba(17, 35,251, .3)";
}
const deletetask = (taskItem) => {
    if (confirm("¿Deseas eliminar esta tarea?")) {
        taskItem.remove();
    }
}
const storeTaskLocalStorage = (taskDesc) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    let task = {
        "task": taskDesc,
        "completed": false
    };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
const updateLocalStorageTasks = () => {
    let tasks = Array.from(taskList.querySelectorAll(".task-item")).map((item) => {
        let itemCheck = item.querySelector("input[type='checkbox']");
        let taskUpdated = {
            "task": item.querySelector(".task-content").textContent,
            "completed": (itemCheck !== null && itemCheck.checked)? true : false
        }
        return taskUpdated;
    });
    tasks.shift();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
const processTask = (event) => {
    event.preventDefault();
    let task = taskInput.value;
    if (event.target.classList.contains("edit_task")){
        updateTask(task);
        updateLocalStorageTasks();
    }
    else {
        storeTaskLocalStorage(task);
        createTask(task);
        completionPercent();
    }
}
readTasks();
taskForm.addEventListener("submit", processTask);
taskList.addEventListener("click", (event) => {
    let taskItem = event.target.closest(".task-item");
    if (event.target.closest('input')) {
        taskItem.classList.toggle("task_completed");
        completionPercent();
        updateLocalStorageTasks();
    } else if (event.target.closest("a")) {
        event.preventDefault();
        let linkBtn = event.target.closest("a");
        if (linkBtn.classList.contains('task-edit_btn')) {
            editTask(linkBtn);
        } else {
            deletetask(taskItem);
            completionPercent();
            updateLocalStorageTasks();
        }
    }
});

