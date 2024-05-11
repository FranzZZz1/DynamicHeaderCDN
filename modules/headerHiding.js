class DHHeaderHiding {
    root = {
        moduleName: "headerHiding",
    };

    constructor(dh) {
        this.dh = dh;
        this.errors = [];

        this.importCSS = null;

        this._isDestroyed = true;
        this.onDestroyCallback = null;
        this.stylesLoaded = false;
    }

    init() {
        this.isDestroyed = false;

        this.#initVariables();
        this.#initProperties();
        this.#start();
        this.#bindEvents();
    }

    setMethod(...methods) {
        methods.forEach((method) => {
            if (method.name === "bound #updateHeaderHeightOnResize") {
                this.updateHeaderHeightOnResize = method;
            } else if (method.name === "bound #importCSS") {
                this.importCSS = method;
            }
        });
    }

    #initProperties() {
        this.headerElem.classList.add(
            this.rootClasses.headerHiding,
            this.appearanceMode[this.appearanceMethod]
        );

        if (this.stylesLoaded === false && this.styles.headerHiding.enabled === true) {
            this.importCSS(this.styles.headerHiding.src);
            this.stylesLoaded = true;
        }
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        this.elemY = 0;
        this.scroll = 0;
    }

    #start() {
        const pos = window.pageYOffset;
        const diff = this.scroll - pos;

        this.headerHeight = this.updateHeaderHeightOnResize();

        this.elemY = Math.min(0, Math.max(-this.headerHeight, this.elemY + diff));

        this.headerElem.style.setProperty(
            this.cssVariables.headerHidingTranslateY,
            this.elemY + "px"
        );

        this.scroll = pos;
    }

    #bindEvents() {
        const startBound = this.#start.bind(this);
        this.animate = null;
        this.animationID = null;
        this.animate = () => {
            this.animationID = requestAnimationFrame(startBound);
        };
        window.addEventListener("scroll", this.animate);
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        this.isDestroyed = true;

        this.headerElem.classList.remove(
            this.rootClasses.headerHiding,
            this.appearanceMode[this.appearanceMethod]
        );
        this.headerElem.style.removeProperty(this.cssVariables.headerHidingTranslateY);
        if (this.animationID) {
            cancelAnimationFrame(this.animationID);
        }
        window.removeEventListener("scroll", this.animate);
    }

    get isDestroyed() {
        return this._isDestroyed;
    }

    set isDestroyed(value) {
        if (value !== this._isDestroyed) {
            this._isDestroyed = value;
            if (typeof this.onDestroyCallback === "function") {
                this.onDestroyCallback(value);
            }
        }
    }
}

// window.headerHiding = DHHeaderHiding;
export default DHHeaderHiding;
