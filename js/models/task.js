class Task {
    constructor(title, description, status, addedDate, id) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.addedDate = addedDate === undefined ? null : addedDate;
        this.id = id === undefined ? null : id;
    }
}
