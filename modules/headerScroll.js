class DHHeaderScroll {
    constructor(dh) {
        this.dh = dh;
        this.headerPositionCheck = null;
        this.importCSS = null;
        this.errors = [];

        this.stylesLoaded = false;
    }

    setMethod(...methods) {
        methods.forEach((method) => {
            if (method.name === "bound #headerPositionCheck") {
                this.headerPositionCheck = method;
            } else if (method.name === "bound #importCSS") {
                this.importCSS = method;
            }
        });
    }

    init() {
        this.#initVariables();
        this.#initProperties();
        this.#start();
        this.#bindEvents();
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        Object.assign(this, this.headerScroll);

        if (typeof this.headerScrollEndPosition === "number") {
            this.scrollEndPosition = this.headerScrollEndPosition;
        } else {
            if (this.headerScrollPosition > 0) {
                this.scrollEndPosition = this.headerScrollPosition - 1;
            } else {
                this.headerScrollPosition = 1;
                this.scrollEndPosition = 0;
            }
        }
    }

    #initProperties() {
        if (this.stylesLoaded === false && this.styles.headerScroll.enabled === true) {
            this.importCSS(this.styles.headerScroll.src);
            this.stylesLoaded = true;
        }
    }

    #start() {
        const pos = window.pageYOffset;

        if (pos >= this.headerScrollPosition) {
            this.headerElem.classList.add(this.headerScrollClass);
        } else if (pos <= this.scrollEndPosition) {
            this.headerElem.classList.remove(this.headerScrollClass);
        }
        if (this.mainElement) {
            this.headerPositionCheck();
        }
    }

    #bindEvents() {
        const startBound = this.#start.bind(this);
        this.scrollAnimationId = null;
        this.animateScroll = null;
        this.animateScroll = () => {
            this.scrollAnimationId = requestAnimationFrame(startBound);
        };

        if (this.headerScrollPosition >= this.scrollEndPosition) {
            window.addEventListener("scroll", this.animateScroll);
            this.animateScroll();
        } else {
            this.headerElem.classList.remove(this.headerScrollClass);
            window.removeEventListener("scroll", this.animateScroll);

            if (this.scrollAnimationId) {
                cancelAnimationFrame(this.scrollAnimationId);
            }

            this.errors.push(
                `headerScrollEndPosition должен быть меньше или равен headerScrollPosition`
            );
        }
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        this.headerElem.classList.remove(this.headerScrollClass);
        if (this.scrollAnimationId) {
            cancelAnimationFrame(this.scrollAnimationId);
        }
        window.removeEventListener("scroll", this.animateScroll);
    }
}

window.headerScroll = DHHeaderScroll;
