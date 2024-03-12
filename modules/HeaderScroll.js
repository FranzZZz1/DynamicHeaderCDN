class HeaderScroll {
    constructor(dh) {
        this.dh = dh;
        this.headerPositionCheck = null;
        this.errors = [];
    }

    setMethod(method) {
        this.headerPositionCheck = method;
    }

    init() {
        console.log("HeaderScroll initiated");

        this.#initVariables();
        this.#start();
        this.#bindEvents();
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        Object.assign(this, this.headerScroll);

        this.scrollEndPosition =
            this.headerScrollEndPosition !== false
                ? this.headerScrollEndPosition
                : this.headerScrollPosition > 0
                ? this.headerScrollPosition - 1
                : this.headerScrollPosition;
    }

    #start() {
        const pos = window.pageYOffset;
        const isMobile = this.headerScrollMobile ? true : !this.mql.matches;

        if (isMobile && pos >= this.headerScrollPosition) {
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
window.HeaderScroll = HeaderScroll;
