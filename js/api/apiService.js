const API_KEY = "3fb07296-38b7-4b37-af42-258f6c90b1c3";
const API_URL = "https://todo-api.coderslab.pl";

class ApiService {
    constructor() {
        this.apikey = API_KEY;
        this.url = API_URL;
    }

    createTaskFromResponseData(data) {
        return new Task(data.title, data.description, data.status, data.addedDate, data.id);
    }

    async getTasks() {
        try {
            const response = await fetch(this.url + "/api/tasks", {
                headers: {
                    "Authorization": this.apikey
                },
                method: "GET"
            });

            if (response.ok) {
                const responseData = await response.json();
                return responseData.data.map(task => this.createTaskFromResponseData(task));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async saveTask(task) {
        try {
            const response = await fetch(this.url + "/api/tasks", {
                headers: {
                    "Authorization": this.apikey,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(task),
            });

            if (response.ok) {
                const responseData = await response.json();
                return this.createTaskFromResponseData(responseData.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async updateTask(task) {
        try {
            const response = await fetch(this.url + "/api/tasks/" + task.id, {
                headers: {
                    "Authorization": this.apikey,
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(task),
            });

            if (response.ok) {
                const responseData = await response.json();
                return this.createTaskFromResponseData(responseData.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async deleteTask(task) {
        try {
            const response = await fetch(this.url + "/api/tasks/" + task.id, {
                headers: {
                    "Authorization": this.apikey,
                },
                method: "DELETE",
            });

            return response.ok;
        } catch (error) {
            console.log(error);
        }
    }

    async getOperationsForTask(task) {
        try {
            const response = await fetch(this.url + "/api/tasks/" + task.id + "/operations", {
                headers: {
                    "Authorization": this.apikey
                },
                method: "GET"
            });

            if (response.ok) {
                const responseData = await response.json();
                return responseData.data.map(operation => this.createOperationFromResponseData(operation));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async saveOperation(task, operation) {
        try {
            const response = await fetch(this.url + "/api/tasks/" + task.id + "/operations", {
                headers: {
                    "Authorization": this.apikey,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(operation),
            });

            if (response.ok) {
                const responseData = await response.json();
                return this.createOperationFromResponseData(responseData.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async updateOperation(operation) {
        try {
            const response = await fetch(this.url + "/api/operations/" + operation.id, {
                headers: {
                    "Authorization": this.apikey,
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(operation),
            });

            if (response.ok) {
                const responseData = await response.json();
                return this.createOperationFromResponseData(responseData.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async deleteOperation(operation) {
        try {
            const response = await fetch(this.url + "/api/operations/" + operation.id, {
                headers: {
                    "Authorization": this.apikey,
                },
                method: "DELETE",
            });

            return response.ok;
        } catch (error) {
            console.log(error);
        }
    }

    createOperationFromResponseData(data) {
        return new Operation(data.description, data.timeSpent, data.addedDate, data.id, this.createTaskFromResponseData(data.task));
    }
}
