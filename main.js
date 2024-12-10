document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.querySelector(".create-button");
    const listsContainer = document.querySelector(".lists-container");
    const createNewListButton = document.querySelector(".create-new-list");

    // Create a modal popup for task creation
    const modal = document.createElement("div");
    modal.className = "modal hidden";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>Create Task</h3>
            <input type="text" id="task-title" placeholder="Add title" />
            <div class="input-group">
                <label for="task-date">Date:</label>
                <input type="date" id="task-date" />
            </div>
            <div class="input-group">
                <label for="task-time">Time:</label>
                <input type="time" id="task-time" />
            </div>
            <textarea id="task-description" placeholder="Add description"></textarea>
            <button id="save-task">Save</button>
        </div>
    `;
    document.body.appendChild(modal);

    let activeListName = null; //This tracks which list the task is being added to

    // Function to open the modal
    const openModal = (listName = null) => {
        activeListName = listName;
        modal.classList.remove("hidden");
    };

    // Function to close the modal
    const closeModal = () => {
        modal.classList.add("hidden");
        activeListName = null;
    };

    // Event listener for opening modal
    createButton.addEventListener("click", () => openModal());

    // Event listener for closing modal
    modal.querySelector(".close-button").addEventListener("click", closeModal);

    // Function to add a task to a specific list
    const addTaskToList = (listName, taskTitle, taskDate, taskTime, taskDescription) => {
        const listCard = document.querySelector(`.list-card[data-list-name="${listName}"]`);
        const taskList = listCard.querySelector(".task-list");
        
        // Create a new task item
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <div>
                <strong>${taskTitle}</strong> <br>
                <small>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" width="14" fill="#efe8e5">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 12h-4V8h2v4h2z"/>
                    </svg>
                    ${taskDate} ${taskTime}
                </small>
                <p>${taskDescription || ""}</p>
            </div>
            <div class="task-options">
                <button class="dropdown-toggle">⋮</button>
                <div class="dropdown hidden">
                    <button class="add-label">Add Label</button>
                </div>
            </div>
        `;

        taskList.appendChild(taskItem);

        // Add event listeners for the dropdown
        const dropdownToggle = taskItem.querySelector(".dropdown-toggle");
        const dropdownMenu = taskItem.querySelector(".dropdown");

        dropdownToggle.addEventListener("click", () => {
            dropdownMenu.classList.toggle("hidden");
        });

        // Add event listener for "Add Label"
        const addLabelButton = taskItem.querySelector(".add-label");
        addLabelButton.addEventListener("click", () => openLabelModal(taskItem));
    };

    // Open a modal to add a label
    const openLabelModal = (taskItem) => {
        const labelModal = document.createElement("div");
        labelModal.className = "modal";
        labelModal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Add Label</h3>
                <input type="text" id="label-title" placeholder="Label Title" />
                <div class="color-options">
                    <button class="color-button" data-color="#ade4df" style="background-color: #ade4df;"></button>
                    <button class="color-button" data-color="#e4e49c" style="background-color: #e4e49c;"></button>
                    <button class="color-button" data-color="#e19ce4" style="background-color: #e19ce4;"></button>
                    <button class="color-button" data-color="#e4b49c" style="background-color: #e4b49c;"></button>
                </div>
                <button id="save-label">Save Label</button>
            </div>
        `;

        document.body.appendChild(labelModal);

        // Close modal
        const closeModalButton = labelModal.querySelector(".close-button");
        closeModalButton.addEventListener("click", () => {
            labelModal.remove();
        });

        // Save label
        const saveLabelButton = labelModal.querySelector("#save-label");
        saveLabelButton.addEventListener("click", () => {
            const labelTitle = labelModal.querySelector("#label-title").value.trim();
            const selectedColor = labelModal.querySelector(".color-button.selected");

            if (labelTitle && selectedColor) {
                const label = document.createElement("span");
                label.className = "task-label";
                label.textContent = labelTitle;
                label.style.backgroundColor = selectedColor.dataset.color;

                taskItem.querySelector("div").appendChild(label);
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

        listCard.innerHTML = `
            <h3>${listName}</h3>
            <ul class="task-list"></ul>
            <button class="add-task-button" data-list="${listName}">+ Add a task</button>
        `;

        listsContainer.appendChild(listCard);

        // Add event listener to the "Add a task" button
        listCard.querySelector(".add-task-button").addEventListener("click", () => {
            openModal(listName);
        });
    };

    // Event listener for saving a task from the modal
    modal.querySelector("#save-task").addEventListener("click", () => {
        const taskTitle = document.getElementById("task-title").value.trim();
        const taskDate = document.getElementById("task-date").value;
        const taskTime = document.getElementById("task-time").value;
        const taskDescription = document.getElementById("task-description").value.trim();

        if (taskTitle && taskDate && activeListName) {
            addTaskToList(activeListName, taskTitle, taskDate, taskTime, taskDescription);
            closeModal();
        } else {
            alert("Please fill out the title, date, and ensure you're adding the task to a list.");
        }
    });


    createNewListButton.addEventListener("click", () => {
        const listName = prompt("Enter new list name:");
        if (listName) {
            createNewList(listName);
        }
    });

    // Predefined lists
    const predefinedLists = ["Today", "Homework", "To Do", "Career"];
    predefinedLists.forEach((list) => createNewList(list));
});

