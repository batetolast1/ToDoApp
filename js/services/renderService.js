class RenderService {

    constructor() {
        this.taskAddingForm = document.querySelector(".js-task-adding-form");
        this.main = document.querySelector("main");

        this.modal = document.querySelector('.modal');
        this.modalBackdrop = document.querySelector(".modal-backdrop");
        this.modalTitle = document.querySelector(".modal-title");
        this.modalDescription = document.querySelector(".modal-description");

        this.apiService = new ApiService();

        this.addEventToTaskAddingForm();
        this.renderAllTasks();
        this.addEventsToCloseModal();
    }

    addEventToTaskAddingForm() {
        this.taskAddingForm.addEventListener("submit", event => {
            event.preventDefault();

            if (event.target.elements.title.value !== "") {
                let title = event.target.elements.title.value;
                let description = event.target.elements.description.value;
                let newTask = new Task(title, description, "open", new Date());

                this.apiService.saveTask(newTask)
                    .then(savedTask => this.renderTask(savedTask));

                event.target.elements.title.value = "";
                event.target.elements.description.value = "";
            }
        });
    }

    renderAllTasks() {
        this.apiService.getTasks()
            .then(tasks => tasks.forEach(
                task => this.renderTask(task)));
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
        h4.innerText = task.title;
        headerLeftDiv.appendChild(h4);

        const h5 = document.createElement("h5");
        h5.className = "card-subtitle text-muted";
        h5.innerText = task.description;
        headerLeftDiv.appendChild(h5);

        const taskAddedDate = new Date(task.addedDate);
        const p = document.createElement("p");
        p.className = "card-subtitle text-muted mt-1";
        p.innerText = "Created: " + taskAddedDate.toUTCString();
        headerLeftDiv.appendChild(p);

        const headerRightDiv = document.createElement("div");
        headerDiv.appendChild(headerRightDiv);

        // create finish buton only for opened tasks
        if (task.status === "open") {
            const finishButton = document.createElement("button");
            finishButton.className = "btn btn-dark btn-sm js-task-open-only";
            finishButton.innerText = "Finish";
            headerRightDiv.appendChild(finishButton);

            // add event to remove all DOM elements except name and time for all operations of given task
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
            descriptionInput.className = "form-control";
            inputGroup.appendChild(descriptionInput);

            const inputGroupAppend = document.createElement("div");
            inputGroupAppend.className = "input-group-append";
            inputGroup.appendChild(inputGroupAppend);

            const addButton = document.createElement("button");
            addButton.className = "btn btn-info";
            addButton.innerText = "Add";
            inputGroupAppend.appendChild(addButton);

            // add event to form to create and render new operation
            form.addEventListener("submit", (event) => {
                event.preventDefault();

                if (descriptionInput.value !== "") {
                    let newOperation = new Operation(descriptionInput.value, 0, new Date());

                    this.apiService.saveOperation(task, newOperation)
                        .then(savedOperation => this.renderOperation(ul, task, savedOperation));

                    descriptionInput.value = "";
                }
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

        const descriptionDiv = document.createElement("h6");
        descriptionDiv.innerText = operation.description;
        li.appendChild(descriptionDiv);

        const time = document.createElement("span");
        time.className = "badge badge-success badge-pill ml-2";
        if (operation.timeSpent !== -1) {
            time.innerText = this.formatTime(operation.timeSpent);
        } else {
            time.innerText = 'Operation finished!';
        }
        descriptionDiv.appendChild(time);

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

                operation.timeSpent += (1 * 60);

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
            if (operation.timeSpent === 0) {
                countdownButton.setAttribute("disabled", "true");
            }
            countdownButton.innerText = "Start countdown";
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

                        time.innerText = 'Operation finished!';

                        operation.timeSpent = "-1";

                        this.apiService.updateOperation(operation)
                            .then(() => {
                                this.openModal();
                                this.modalTitle.innerText = "Time is up!";
                                this.modalDescription.innerText = "Operation: \"" + operation.description + "\" is finished!";

                                countdownDiv.parentElement.removeChild(countdownDiv);
                                controlDiv.classList.remove("d-none");
                                li.querySelectorAll(".js-operation-open-only")
                                    .forEach(element => element.parentElement.removeChild(element));
                            });
                    }
                }, 10);

                const countdownDiv = document.createElement("div");
                countdownDiv.className = "js-task-open-only";
                li.appendChild(countdownDiv);

                const pauseButton = document.createElement("button");
                pauseButton.className = "btn btn-outline-danger btn-sm";
                pauseButton.innerText = "Pause countdown";
                countdownDiv.appendChild(pauseButton);

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

    addEventsToCloseModal() {
        // close modal when clicking anywhere outside modal
        window.addEventListener("click", event => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // close modal when clicking on x and 'close' button
        document.querySelectorAll(".modal-close")
            .forEach(element => element.addEventListener("click", () => this.closeModal()));
    }

    closeModal() {
        this.modalBackdrop.style.display = "none";
        this.modal.style.display = "none";
        this.modal.classList.remove("show");
    }

    openModal() {
        this.modalBackdrop.style.display = "block";
        this.modal.style.display = "block";
        this.modal.classList.add("show");
    }
}
