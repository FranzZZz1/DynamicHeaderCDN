class ScrollWatch {
    root = {
        moduleName: "scrollWatch",
    };

    constructor(dh) {
        this.dh = dh;
        this.errors = [];
        this.inspectVariable = null;
    }

    init() {
        this.#initVariables();
        if (!this.menuItems || !this.menuItems.length)
            return this.errors.push("Menu items not found");
        console.log("scrollWatch initiated");
        this.#start();
    }

    setMethod(method) {
        this.inspectVariable = method;
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        this.menuItems = this.inspectVariable(document, this.menuItem, true);
        this.headerElemHeight =
            this.headerHeightScrollValue !== false
                ? this.headerHeightScrollValue + 100
                : this.headerElem.offsetHeight + 100;
    }

    #start() {
        console.log("hi");
    }

    #bindEvents() {}

    getErrors() {
        return this.errors;
    }

    destroy() {}
}
window.ScrollWatch = ScrollWatch;
