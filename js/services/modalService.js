class ModalService {

    constructor() {
        this.modal = document.querySelector('.modal');
        this.modalBackdrop = document.querySelector(".modal-backdrop");
        this.modalTitle = document.querySelector(".modal-title");
        this.modalDescription = document.querySelector(".modal-description");

        this.addEventsToCloseModal();
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

    openModal(operation) {
        this.modalTitle.innerText = "Time is up!";
        this.modalDescription.innerText = "Operation: \"" + operation.description + "\" is finished!";

        this.modalBackdrop.style.display = "block";
        this.modal.style.display = "block";
        this.modal.classList.add("show");
    }
}