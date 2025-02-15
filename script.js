document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.querySelector(".create-button");
    const listsContainer = document.querySelector(".lists-container");
    const createNewListButton = document.querySelector(".create-new-list");
    
    const updateClock = () => {
        const clockElement = document.getElementById("live-clock");
        if (!clockElement) {
            console.error("Clock element not found!");
            return;
        }

        const now = new Date();

        // Format date and time
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        // Update the clock element
        clockElement.innerHTML = `<p>${date}</p><p>${time}</p>`;
    };

    // Call updateClock immediately and set it to update every second
    updateClock();
    setInterval(updateClock, 1000);
    
    // Create a modal popup for task creation
    const modal = document.createElement("div");
    modal.className = "modal modal-task hidden";
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <span class="close-button">&times;</span>
                <h3>Create Task</h3>
                <input type="text" id="task-title" placeholder="Task Name..." />
                <div class="input-group">
                    <label for="task-date">Due Date:</label>
                    <input type="date" id="task-date" />
                </div>
                <div class="input-group">
                    <label for="task-time">Time Due:</label>
                    <input type="time" id="task-time" />
                </div>
                <textarea id="task-description" placeholder="Add description"></textarea>
                <button id="save-task">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let activeListName = null;

    // Function to open the modal and reset inputs
    const openModal = (listName = null) => {
        activeListName = listName;

        document.getElementById("task-title").value = "";
        document.getElementById("task-date").value = "";
        document.getElementById("task-time").value = "";
        document.getElementById("task-description").value = "";

        modal.classList.remove("hidden");
    };

    // Function to close the modal
    const closeModal = () => {
        modal.classList.add("hidden");
        activeListName = null;
    };

    // Event listener for opening task creation modal
    createButton.addEventListener("click", () => openModal());

    // Close modal when clicking outside modal-content
    modal.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal-overlay")) {
            closeModal();
        }
    });

    // Close modal with "X" button
    modal.querySelector(".close-button").addEventListener("click", closeModal);

    // Close modal with Escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // Function to save tasks to Local Storage
    const saveTasksToLocalStorage = () => {
        const tasks = [];
        document.querySelectorAll(".task-item").forEach((taskItem) => {
            const title = taskItem.querySelector("strong").textContent;
            const date = taskItem.querySelector("small").textContent.split(" ")[0];
            const time = taskItem.querySelector("small").textContent.split(" ")[1];
            const description = taskItem.querySelector("p").textContent;
            const listName = taskItem.closest(".list-card").dataset.listName;
            const completed = taskItem.classList.contains("completed");

            tasks.push({ listName, title, date, time, description, completed });
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    // Function to load tasks from Local Storage
    const loadTasksFromLocalStorage = () => {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => {
            // Verify if the list exists before adding tasks
            const listCard = document.querySelector(`.list-card[data-list-name="${task.listName}"]`);
            if (listCard) {
                addTaskToList(
                    task.listName,
                    task.title,
                    task.date,
                    task.time,
                    task.description,
                    task.completed
                );
            } else {
                console.warn(`List "${task.listName}" not found for task "${task.title}"`);
            }
        });
    };

    // Function to add a task to a specific list
    const addTaskToList = (listName, taskTitle, taskDate, taskTime, taskDescription, completed = false) => {
        const listCard = document.querySelector(`.list-card[data-list-name="${listName}"]`);
        const taskList = listCard.querySelector(".task-list");
    
        // Create a new task item
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";
        if (completed) {
            taskItem.classList.add("completed");
        }
    
        taskItem.innerHTML = `
            <div class="task-main">
        <button class="delete-task-button">🗑️</button>
        <input type="checkbox" class="task-checkbox" ${completed ? "checked" : ""} />
        <div>
            <strong>${taskTitle}</strong>
            ${taskDate || taskTime ? `<br><small>${taskDate || ""} ${taskTime || ""}</small>` : ""}
            ${taskDescription ? `<p>${taskDescription}</p>` : ""}
        </div>
        <button class="label-task-button">🏷️</button>
    </div>
        `;
    
        taskList.appendChild(taskItem);
    
        // Checkbox functionality
        const checkbox = taskItem.querySelector(".task-checkbox");
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                taskItem.classList.add("completed");
            } else {
                taskItem.classList.remove("completed");
            }
            saveTasksToLocalStorage();
        });
    
        // Delete task functionality
        const deleteButton = taskItem.querySelector(".delete-task-button");
        deleteButton.addEventListener("click", () => {
            taskItem.remove();
            saveTasksToLocalStorage();
        });
    
        // Add label functionality
        const addLabelButton = taskItem.querySelector(".label-task-button");
        addLabelButton.addEventListener("click", () => openLabelModal(taskItem));
    
        saveTasksToLocalStorage();
    };

    const openLabelModal = (taskItem) => {
        const labelModal = document.createElement("div");
        labelModal.className = "modal";
        labelModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <span class="close-button">&times;</span>
                    <h3>Add Label</h3>
                    <input type="text" id="label-title" placeholder="Label Title" />
                    <div class="color-options">
                        <button class="color-button" data-color="#e85a5a" style="background-color: #e85a5a;"></button>
                        <button class="color-button" data-color="#1db849" style="background-color: #1db849;"></button>
                        <button class="color-button" data-color="#307de3" style="background-color: #307de3;"></button>
                        <button class="color-button" data-color="#fcfaa4" style="background-color: #fcfaa4;"></button>
                    </div>
                    <button id="save-label">Save Label</button>
                </div>
            </div>
        `;
    
        document.body.appendChild(labelModal);
    
        // Close modal functionality
        const closeModalButton = labelModal.querySelector(".close-button");
        closeModalButton.addEventListener("click", () => labelModal.remove());
    
        // Save label functionality
        const saveLabelButton = labelModal.querySelector("#save-label");
        saveLabelButton.addEventListener("click", () => {
            const labelTitle = labelModal.querySelector("#label-title").value.trim();
            const selectedColor = labelModal.querySelector(".color-button.selected");
    
            if (labelTitle && selectedColor) {
                const label = document.createElement("span");
                label.className = "task-label";
                label.textContent = labelTitle;
                label.style.backgroundColor = selectedColor.dataset.color;
    
                taskItem.querySelector(".task-main > div").appendChild(label);
                labelModal.remove();
            } else {
                alert("Please provide a label title and select a color.");
            }
        });
    
        // Handle color selection
        const colorButtons = labelModal.querySelectorAll(".color-button");
        colorButtons.forEach((button) => {
            button.addEventListener("click", () => {
                colorButtons.forEach((btn) => btn.classList.remove("selected"));
                button.classList.add("selected");
            });
        });
    };

    // Function to create a new list
    const createNewList = (listName) => {
        const listCard = document.createElement("div");
        listCard.className = "list-card";
        listCard.dataset.listName = listName;
    
        // Add a delete button only for user-created lists
        listCard.innerHTML = `
            <button class="delete-list-button">🗑️</button>
            <h3>${listName}</h3>
            <ul class="task-list"></ul>
            <button class="add-task-button" data-list="${listName}">+ Add a task</button>
        `;
    
        listsContainer.appendChild(listCard);
    
        // Add event listener for the "Add a task" button
        listCard.querySelector(".add-task-button").addEventListener("click", () => {
            openModal(listName);
        });
    
        // Add event listener for the delete button
        const deleteButton = listCard.querySelector(".delete-list-button");
        deleteButton.addEventListener("click", () => {
            listCard.remove(); // Remove the list card from the DOM
            saveListsToLocalStorage(); // Update Local Storage
        });
    
        saveListsToLocalStorage(); // Save the new list to Local Storage
    };

    // Function to open a modal for creating a new list
    const openNewListModal = () => {
        const newListModal = document.createElement("div");
        newListModal.className = "modal modal-list";
        newListModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <span class="close-button">&times;</span>
                    <h3>Create New List</h3>
                    <input type="text" id="new-list-name" placeholder="Enter list name" />
                    <button id="save-new-list">Create List</button>
                </div>
            </div>
        `;

        document.body.appendChild(newListModal);

        const closeModal = () => {
            document.removeEventListener("keydown", escapeListener);
            newListModal.remove();
        };

        const escapeListener = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        newListModal.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal-overlay")) {
                closeModal();
            }
        });

        newListModal.querySelector(".close-button").addEventListener("click", closeModal);

        newListModal.querySelector("#save-new-list").addEventListener("click", () => {
            const listName = newListModal.querySelector("#new-list-name").value.trim();
            if (listName) {
                createNewList(listName);
                closeModal();
            } else {
                alert("Please enter a list name.");
            }
        });

        document.addEventListener("keydown", escapeListener);
    };


    createNewListButton.addEventListener("click", openNewListModal);

    modal.querySelector("#save-task").addEventListener("click", () => {
        const taskTitle = document.getElementById("task-title").value.trim();
        const taskDate = document.getElementById("task-date").value;
        const taskTime = document.getElementById("task-time").value;
        const taskDescription = document.getElementById("task-description").value.trim();

        if (taskTitle) {
            addTaskToList(activeListName, taskTitle, taskDate, taskTime, taskDescription);
            closeModal();
        } else {
            alert("Please provide at least a title for the task.");
        }
    });

    // Function to save lists to Local Storage
const saveListsToLocalStorage = () => {
    const lists = [];
    document.querySelectorAll(".list-card").forEach((listCard) => {
        const listName = listCard.dataset.listName;

        // Skip predefined lists
        if (!["Today", "Homework", "To Do", "Career"].includes(listName)) {
            lists.push(listName);
        }
    });

    localStorage.setItem("customLists", JSON.stringify(lists));
};

// Function to load lists from Local Storage
const loadListsFromLocalStorage = () => {
    const customLists = JSON.parse(localStorage.getItem("customLists")) || [];
    customLists.forEach((listName) => {
        createNewList(listName);
    });
};

// Predefined lists (kept static and undeletable)
const predefinedLists = ["Today", "Homework", "To Do", "Career"];
predefinedLists.forEach((listName) => {
    const listCard = document.createElement("div");
    listCard.className = "list-card";
    listCard.dataset.listName = listName;

    listCard.innerHTML = `
        <h3>${listName}</h3>
        <ul class="task-list"></ul>
        <button class="add-task-button" data-list="${listName}">+ Add a task</button>
    `;

    const listsContainer = document.querySelector(".lists-container");
    listsContainer.appendChild(listCard);

    listCard.querySelector(".add-task-button").addEventListener("click", () => {
        openModal(listName);
    });
});

// Load lists and tasks from Local Storage on page load
loadListsFromLocalStorage();
loadTasksFromLocalStorage();
});
