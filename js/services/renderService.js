class RenderService {

    constructor() {
        this.taskAddingForm = document.querySelector(".js-task-adding-form");
        this.main = document.querySelector("main");

        this.modalService = new ModalService();
        this.apiService = new ApiService();

        this.addEventToTaskAddingForm();
        this.renderAllTasks();
    }

    addEventToTaskAddingForm() {
        this.taskAddingForm.addEventListener("submit", event => {
            event.preventDefault();

            let title = event.target.elements.title.value;
            let description = event.target.elements.description.value;
            let newTask = new Task(title, description, "open", new Date());

            event.target.elements.title.value = "";
            event.target.elements.description.value = "";

            this.apiService.saveTask(newTask)
                .then(savedTask => this.renderTask(savedTask));
        });
    }

    renderAllTasks() {
        this.apiService.getTasks()
            .then(tasks => tasks.forEach(task => this.renderTask(task)));
    }

    renderTask(task) {
        const section = document.createElement("section");
        section.className = "card mt-5 shadow-sm";
        this.main.appendChild(section);

        const headerDiv = document.createElement("div");
        headerDiv.className = "card-header d-flex justify-content-between align-items-center";
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement("div");
        headerDiv.appendChild(headerLeftDiv);

        const h4 = document.createElement("h4");
        h4.className = "card-title";
        h4.innerText = task.title;
        headerLeftDiv.appendChild(h4);

        const h5 = document.createElement("h5");
        h5.className = "card-subtitle text-muted";
        h5.innerText = task.description;
        headerLeftDiv.appendChild(h5);

        const p = document.createElement("p");
        p.className = "card-text text-muted mt-1";
        p.innerText = "Created: " + new Date(task.addedDate).toUTCString();
        headerLeftDiv.appendChild(p);

        const headerRightDiv = document.createElement("div");
        headerDiv.appendChild(headerRightDiv);

        // create modifying buttons only for opened tasks
        if (task.status === "open") {
            const editButton = document.createElement("button");
            editButton.className = "btn btn-secondary btn-sm js-task-open-only mr-2";
            editButton.innerText = "Edit";
            headerRightDiv.appendChild(editButton);

            // add event to create task edit form
            editButton.addEventListener("click", () => {
                headerLeftDiv.classList.add("d-none");
                headerRightDiv.classList.add("d-none");

                const headerEditDiv = document.createElement("div");
                headerEditDiv.className = "card-body";
                headerDiv.appendChild(headerEditDiv);

                const title = document.createElement("h4");
                title.className = "card-title";
                title.innerText = "Edit task";
                headerEditDiv.appendChild(title);

                const form = document.createElement("form");
                form.className = "text-right";
                headerEditDiv.appendChild(form);

                const titleFormGroup = document.createElement("div");
                titleFormGroup.className = "form-group";
                form.appendChild(titleFormGroup);

                const titleInput = document.createElement("input");
                titleInput.setAttribute("type", "text");
                titleInput.setAttribute("placeholder", "Task title");
                titleInput.setAttribute("minlength", "5");
                titleInput.setAttribute("value", task.title);
                titleInput.className = "form-control shadow-sm";
                titleInput.required = true;
                titleFormGroup.appendChild(titleInput);

                const descriptionFormGroup = document.createElement("div");
                descriptionFormGroup.className = "form-group";
                form.appendChild(descriptionFormGroup);

                const descriptionInput = document.createElement("input");
                descriptionInput.setAttribute("type", "text");
                descriptionInput.setAttribute("placeholder", "Task description");
                descriptionInput.setAttribute("minlength", "5");
                descriptionInput.setAttribute("value", task.description);
                descriptionInput.className = "form-control shadow-sm";
                descriptionInput.required = true;
                descriptionFormGroup.appendChild(descriptionInput);

                const cancelButton = document.createElement("button");
                cancelButton.className = "btn btn-warning mr-2";
                cancelButton.type = "button";
                cancelButton.innerText = "Cancel";
                form.appendChild(cancelButton);

                const cancelSign = document.createElement("i");
                cancelSign.className = "fas fa-undo ml-1";
                cancelButton.appendChild(cancelSign);

                cancelButton.addEventListener("click", () => {
                    headerLeftDiv.classList.remove("d-none");
                    headerRightDiv.classList.remove("d-none");

                    headerEditDiv.parentElement.removeChild(headerEditDiv);
                });

                const updateButton = document.createElement("button");
                updateButton.className = "btn btn-info";
                updateButton.type = "submit";
                updateButton.innerText = "Update task";
                form.appendChild(updateButton);

                const checkSign = document.createElement("i");
                checkSign.className = "fas fa-check ml-1";
                updateButton.appendChild(checkSign);

                // add event to form to update task title and description
                form.addEventListener("submit", event => {
                    event.preventDefault();

                    task.title = titleInput.value;
                    task.description = descriptionInput.value;

                    headerLeftDiv.classList.remove("d-none");
                    headerRightDiv.classList.remove("d-none");
                    headerEditDiv.parentElement.removeChild(headerEditDiv);

                    this.apiService.updateTask(task)
                        .then(updatedTask => {
                            task = updatedTask;

                            h4.innerText = task.title;
                            h5.innerText = task.description;
                        });
                });
            });

            const finishButton = document.createElement("button");
            finishButton.className = "btn btn-dark btn-sm js-task-open-only";
            finishButton.innerText = "Finish";
            headerRightDiv.appendChild(finishButton);

            // add event to remove all unnecessary DOM elements for finished task
            finishButton.addEventListener("click", () => {
                task.status = "closed";

                this.apiService.updateTask(task)
                    .then(() => section.querySelectorAll(".js-task-open-only")
                        .forEach(element => element.parentElement.removeChild(element)));
            });
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-outline-danger btn-sm ml-2";
        deleteButton.innerText = "Delete";
        headerRightDiv.appendChild(deleteButton);

        deleteButton.addEventListener("click", () => {
            this.apiService.deleteTask(task)
                .then(() => section.parentElement.removeChild(section));
        });

        // create list for task's operations
        const ul = document.createElement("ul");
        ul.className = "list-group list-group-flush";
        section.appendChild(ul);

        // render all operations
        this.renderAllOperations(ul, task);

        // create form to add new operations only for opened tasks
        if (task.status === "open") {
            const addOperationDiv = document.createElement("div");
            addOperationDiv.className = "card-body js-task-open-only";
            section.appendChild(addOperationDiv);

            const form = document.createElement("form");
            addOperationDiv.appendChild(form);

            const inputGroup = document.createElement("div");
            inputGroup.className = "input-group";
            form.appendChild(inputGroup);

            const descriptionInput = document.createElement("input");
            descriptionInput.setAttribute("type", "text");
            descriptionInput.setAttribute("placeholder", "Operation description");
            descriptionInput.setAttribute("minlength", "5");
            descriptionInput.className = "form-control shadow-sm";
            descriptionInput.required = true;
            inputGroup.appendChild(descriptionInput);

            const inputGroupAppend = document.createElement("div");
            inputGroupAppend.className = "input-group-append";
            inputGroup.appendChild(inputGroupAppend);

            const addButton = document.createElement("button");
            addButton.className = "btn btn-info";
            addButton.type = "submit";
            addButton.innerText = "Add operation";
            inputGroupAppend.appendChild(addButton);

            const plusSign = document.createElement("i");
            plusSign.className = "fas fa-plus-circle ml-1";
            addButton.appendChild(plusSign);

            // add event to form to create and render new operation
            form.addEventListener("submit", event => {
                event.preventDefault();

                let newOperation = new Operation(descriptionInput.value, 0, new Date());

                descriptionInput.value = "";

                this.apiService.saveOperation(task, newOperation)
                    .then(savedOperation => this.renderOperation(ul, task, savedOperation));
            });
        }
    }

    renderAllOperations(ul, task) {
        this.apiService.getOperationsForTask(task)
            .then(operations => operations.forEach(
                operation => this.renderOperation(ul, task, operation)));
    }

    renderOperation(ul, task, operation) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        ul.appendChild(li);

        const descriptionDiv = document.createElement("div");
        li.appendChild(descriptionDiv);

        const h6 = document.createElement("h6");
        h6.innerText = operation.description;
        descriptionDiv.appendChild(h6);

        const time = document.createElement("span");
        time.className = "badge badge-success badge-pill ml-2";
        time.innerText = operation.timeSpent !== -1 ? this.formatTime(operation.timeSpent) : 'Operation finished!';
        h6.appendChild(time);

        const controlDiv = document.createElement("div");
        controlDiv.className = "js-task-open-only";
        li.appendChild(controlDiv);

        // create elements to modify operation's data for opened task
        // operation is considered as 'finished' when timeSpent = -1
        if (task.status === "open" && operation.timeSpent !== -1) {
            const add1minButton = document.createElement("button");
            add1minButton.className = "btn btn-outline-success btn-sm mr-2 js-operation-open-only";
            add1minButton.innerText = "+1m";
            controlDiv.appendChild(add1minButton);

            // add event to increase operation time +1min
            add1minButton.addEventListener("click", () => {
                countdownButton.removeAttribute("disabled");

                operation.timeSpent += 60;

                this.apiService.updateOperation(operation)
                    .then(updatedOperation => {
                            operation = updatedOperation;
                            time.innerText = this.formatTime(operation.timeSpent);
                        }
                    );
            });

            const add15minButton = document.createElement("button");
            add15minButton.className = "btn btn-outline-success btn-sm mr-2 js-operation-open-only";
            add15minButton.innerText = "+15m";
            controlDiv.appendChild(add15minButton);

            // add event to increase operation time +15min
            add15minButton.addEventListener("click", () => {
                countdownButton.removeAttribute("disabled");

                operation.timeSpent += (15 * 60);

                this.apiService.updateOperation(operation)
                    .then(updatedOperation => {
                            operation = updatedOperation;
                            time.innerText = this.formatTime(operation.timeSpent);
                        }
                    );
            });

            const add1hButton = document.createElement("button");
            add1hButton.className = "btn btn-outline-success btn-sm mr-2 js-operation-open-only";
            add1hButton.innerText = "+1h";
            controlDiv.appendChild(add1hButton);

            // add event to increase operation time +1h
            add1hButton.addEventListener("click", () => {
                countdownButton.removeAttribute("disabled");

                operation.timeSpent += (60 * 60);

                this.apiService.updateOperation(operation)
                    .then(updatedOperation => {
                            operation = updatedOperation;
                            time.innerText = this.formatTime(operation.timeSpent);
                        }
                    );
            });

            const resetTimeButton = document.createElement("button");
            resetTimeButton.className = "btn btn-outline-success btn-sm mr-2 js-operation-open-only";
            resetTimeButton.innerText = "Reset time";
            controlDiv.appendChild(resetTimeButton);

            // add event to reset time to 0
            resetTimeButton.addEventListener("click", () => {
                countdownButton.setAttribute("disabled", "true");

                operation.timeSpent = 0;

                this.apiService.updateOperation(operation)
                    .then(updatedOperation => {
                            operation = updatedOperation;
                            time.innerText = this.formatTime(operation.timeSpent);
                        }
                    );
            });

            const countdownButton = document.createElement("button");
            countdownButton.className = "btn btn-primary btn-sm mr-2 js-operation-open-only";
            countdownButton.innerText = "Start countdown";
            if (operation.timeSpent === 0) {
                countdownButton.setAttribute("disabled", "true");
            }
            controlDiv.appendChild(countdownButton);

            // add event to remove all DOM elements except name and time for all operations of given task
            countdownButton.addEventListener("click", () => {
                controlDiv.classList.add("d-none");

                let remainingTime = operation.timeSpent;

                let timer = setInterval(() => {
                    let hours = Math.floor(remainingTime / (60 * 60));
                    let minutes = Math.floor((remainingTime / 60) % 60);
                    let seconds = remainingTime % 60;

                    time.innerText = hours + "h " + minutes + "m " + seconds + "s";

                    if (remainingTime > 0) {
                        remainingTime -= 1;
                    } else {
                        clearInterval(timer);

                        operation.timeSpent = "-1";

                        time.innerText = 'Operation finished!';
                        countdownDiv.parentElement.removeChild(countdownDiv);

                        // remove unnecessary buttons for finished operation
                        li.querySelectorAll(".js-operation-open-only")
                            .forEach(element => element.parentElement.removeChild(element));
                        controlDiv.classList.remove("d-none");

                        this.apiService.updateOperation(operation)
                            .then(() => this.modalService.openModal(operation));
                    }
                }, 1000);

                const countdownDiv = document.createElement("div");
                countdownDiv.className = "js-task-open-only";
                li.appendChild(countdownDiv);

                const pauseButton = document.createElement("button");
                pauseButton.className = "btn btn-outline-danger btn-sm";
                pauseButton.innerText = "Pause countdown";
                countdownDiv.appendChild(pauseButton);

                // add event to pause countdown and update operation with remaining time
                pauseButton.addEventListener("click", () => {
                    clearInterval(timer);

                    countdownDiv.parentElement.removeChild(countdownDiv);

                    controlDiv.classList.remove("d-none");

                    operation.timeSpent = remainingTime;

                    this.apiService.updateOperation(operation)
                        .then(updatedOperation => {
                                operation = updatedOperation;
                                time.innerText = this.formatTime(operation.timeSpent);
                            }
                        );
                });
            });

            const editButton = document.createElement("button");
            editButton.className = "btn btn-secondary btn-sm mr-2 js-operation-open-only";
            editButton.innerText = "Edit";
            controlDiv.appendChild(editButton);

            // add event to edit operation description
            editButton.addEventListener("click", () => {
                descriptionDiv.classList.add("d-none");
                controlDiv.classList.add("d-none");

                const editOperationDiv = document.createElement("div");
                editOperationDiv.className = "w-100 shadow";
                li.appendChild(editOperationDiv);

                const form = document.createElement("form");
                editOperationDiv.appendChild(form);

                const inputGroup = document.createElement("div");
                inputGroup.className = "input-group";
                form.appendChild(inputGroup);

                const descriptionInput = document.createElement("input");
                descriptionInput.setAttribute("type", "text");
                descriptionInput.setAttribute("placeholder", "Operation description");
                descriptionInput.setAttribute("minlength", "5");
                descriptionInput.setAttribute("value", operation.description);
                descriptionInput.className = "form-control shadow-sm";
                descriptionInput.required = true;
                inputGroup.appendChild(descriptionInput);

                const inputGroupAppend = document.createElement("div");
                inputGroupAppend.className = "input-group-append";
                inputGroup.appendChild(inputGroupAppend);

                const cancelButton = document.createElement("button");
                cancelButton.className = "btn btn-warning btn-sm";
                cancelButton.type = "button";
                cancelButton.innerText = "Cancel";
                inputGroupAppend.appendChild(cancelButton);

                const cancelSign = document.createElement("i");
                cancelSign.className = "fas fa-undo ml-1";
                cancelButton.appendChild(cancelSign);

                // add event to cancel editing operation description
                cancelButton.addEventListener("click", () => {
                    descriptionDiv.classList.remove("d-none");
                    controlDiv.classList.remove("d-none");

                    editOperationDiv.parentElement.removeChild(editOperationDiv);
                });

                const updateButton = document.createElement("button");
                updateButton.className = "btn btn-info btn-sm";
                updateButton.type = "submit";
                updateButton.innerText = "Update operation";
                inputGroupAppend.appendChild(updateButton);

                const checkSign = document.createElement("i");
                checkSign.className = "fas fa-check ml-1";
                updateButton.appendChild(checkSign);

                // add event to form to update operation description
                form.addEventListener("submit", event => {
                    event.preventDefault();

                    descriptionDiv.classList.remove("d-none");
                    controlDiv.classList.remove("d-none");

                    editOperationDiv.parentElement.removeChild(editOperationDiv);

                    operation.description = descriptionInput.value;

                    this.apiService.updateOperation(operation)
                        .then(updatedOperation => {
                            operation = updatedOperation;

                            h6.innerText = operation.description;
                            h6.appendChild(time);
                        });
                });
            });

            const finishButton = document.createElement("button");
            finishButton.className = "btn btn-dark btn-sm mr-2 js-operation-open-only";
            finishButton.innerText = "Finish";
            controlDiv.appendChild(finishButton);

            // add event to remove all DOM elements except name from operation
            finishButton.addEventListener("click", () => {
                time.innerText = 'Operation finished!';

                operation.timeSpent = "-1";

                this.apiService.updateOperation(operation)
                    .then(() => li.querySelectorAll(".js-operation-open-only")
                        .forEach(element => element.parentElement.removeChild(element)));
            });
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-outline-danger btn-sm";
        deleteButton.innerText = "Delete";
        controlDiv.appendChild(deleteButton);

        // add event to delete operation
        deleteButton.addEventListener("click", () => {
            this.apiService.deleteOperation(operation)
                .then(() => li.parentElement.removeChild(li));
        });
    }

    formatTime(timeSpent) {
        const hours = Math.floor(timeSpent / (60 * 60));
        const minutes = Math.floor((timeSpent / 60) % 60);
        const seconds = timeSpent % 60;
        return hours + "h " + minutes + "m " + seconds + "s";
    }
}
