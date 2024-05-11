class PageLock {
    constructor(dh) {
        this.dh = dh;
        this.errors = [];
        this.mutationObserver = null;
    }

    init() {
        this.#initVariables();
        this.#start();
        this.#bindEvents();
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        Object.assign(this, this.pageLock);

        this.classToTrack = this.pageLockClass;
        this.docEl = document.documentElement;
        this.scrollbarWidth = window.innerWidth - this.docEl.clientWidth;
    }

    #start() {
        this.mutationObserver = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const currentClass = this.docEl.className;

                    if (this.pageLockPadding) {
                        if (currentClass.includes(this.classToTrack)) {
                            document.body.style.paddingRight = `${this.scrollbarWidth}px`;
                        } else {
                            document.body.style.paddingRight = 0;
                        }
                    }
                }
            }
        });
    }

    #bindEvents() {
        this.mutationObserver.observe(this.docEl, {
            attributes: true,
        });
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        document.body.style.removeProperty("padding-right");
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
}

window.pageLock = PageLock;
