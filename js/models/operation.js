class Operation {
    constructor(description, timeSpent, addedDate, id, task) {
        this.description = description;
        this.timeSpent = timeSpent === undefined ? 0 : timeSpent;
        this.addedDate = addedDate === undefined ? null : addedDate;
        this.id = id === undefined ? null : id;
        this.task = task === undefined ? null : task;
    }
}
