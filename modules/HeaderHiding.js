class HeaderHiding {
    root = {
        moduleName: "headerHiding",
    };

    constructor(dh) {
        this.dh = dh;
        this.errors = [];

        this.importCSS = null;
    }

    init() {
        console.log("HeaderHiding initiated");

        this.#initVariables();
        this.#initProperties();
        this.#start();
        this.#bindEvents();
    }

    setMethod(method) {
        this.importCSS = method;
    }

    #initProperties() {
        this.headerElem.classList.add(
            this.rootClasses.headerHiding,
            this.appearanceMode[this.appearanceMethod]
        );

        this.headerElem.style.setProperty(
            this.cssVariables.headerHeight,
            this.headerHeight + "px"
        );

        this.importCSS(`src/styles/css/modules/${this.root.moduleName}.css`);
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

        this.elemY = Math.min(
            0,
            Math.max(-this.headerHeight, this.elemY + diff)
        );

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
        this.headerElem.classList.remove(
            this.rootClasses.headerHiding,
            this.appearanceMode[this.appearanceMethod]
        );
        this.headerElem.style.removeProperty(this.cssVariables.headerHeight);
        this.headerElem.style.removeProperty(
            this.cssVariables.headerHidingTranslateY
        );
        if (this.animationID) {
            cancelAnimationFrame(this.animationID);
        }
        window.removeEventListener("scroll", this.animate);
    }
}
window.HeaderHiding = HeaderHiding;
