class DHScrollWatch {
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
        if (typeof this.menuLink !== "string") this.errors.push("menuLink must be a string");

        this.#bindEvents();
    }

    setMethod(method) {
        this.inspectVariable = method;
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        if (typeof this.menuItem === "string") {
            this.menuItems = this.inspectVariable(this.headerElem, this.menuItem, true);
        } else if (Array.isArray(this.menuItem)) {
            this.menuItems = this.menuItem;
        } else if (typeof this.menuItem !== "string" && !Array.isArray(this.menuItem)) {
            this.menuItems = this.inspectVariable(
                this.headerElem,
                `.${this.menuItem.classList[0]}`,
                true
            );
        }

        if (!this.menuItems || !this.menuItems.length)
            return this.errors.push("Menu items not found");

        this.headerElemHeight =
            this.headerHeightScrollValue !== false
                ? this.headerHeightScrollValue + 100
                : this.headerElem.offsetHeight + 100;

        this.animate = null;
        this.animationID = null;
    }

    #menuItemClickHandler = (event) => {
        const link = this.menuLink
            ? event.currentTarget.querySelector(this.menuLink)
            : event.currentTarget.querySelector("a");

        if (
            !link ||
            !link.getAttribute("href") ||
            link.getAttribute("href") === "#" ||
            link.getAttribute("href") === ""
        ) {
            return this.errors.push(`\nОтсутствует тег "a" в menuItem, либо атрибут href.`);
        }

        if (event.target !== link) return;

        const target = link.getAttribute("href");
        const targetElement = document.querySelector(target);

        if (!targetElement) {
            return this.errors.push(`\nОтсутствуют section с id, соответствующим href в menuLink.`);
        }

        this.menuItems.forEach((item) => {
            item.classList.remove(this.menuItemActive);
        });
        event.currentTarget.classList.add(this.menuItemActive);

        let timeout;

        if (timeout) {
            clearTimeout(timeout);
        }

        window.removeEventListener("scroll", this.animate);
        timeout = setTimeout(() => {
            window.addEventListener("scroll", this.animate);
        }, this.scrollEventTimeout);
    };

    #scrollHandler = () => {
        const scrollPos = window.scrollY;
        this.menuItems.forEach((item) => {
            const link = item.querySelector(this.menuLink);
            if (
                !link ||
                !link.getAttribute("href") ||
                link.getAttribute("href") === "#" ||
                link.getAttribute("href") === ""
            ) {
                this.menuItems.forEach((item) => {
                    item.removeEventListener("click", this.#menuItemClickHandler);
                    item.classList.remove(this.menuItemActive);
                });
                window.removeEventListener("scroll", this.animate);
                throw Error(`\nОтсутствует тег "a" в menuItem, либо атрибут href.`);
            }

            const target = link.getAttribute("href");
            const refElement = document.querySelector(target);

            if (
                refElement &&
                refElement.offsetTop - this.headerElemHeight <= scrollPos &&
                refElement.offsetTop + refElement.offsetHeight > scrollPos
            ) {
                this.menuItems.forEach((el) => {
                    el.classList.remove(this.menuItemActive);
                });
                item.classList.add(this.menuItemActive);
            } else {
                item.classList.remove(this.menuItemActive);
            }
        });
    };

    #bindEvents() {
        this.animate = () => {
            this.animationID = requestAnimationFrame(this.#scrollHandler);
        };
        this.animate();
        window.addEventListener("scroll", this.animate);

        this.menuItems.forEach((item) => {
            item.addEventListener("click", this.#menuItemClickHandler);
        });
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        this.menuItems.forEach((item) => {
            item.removeEventListener("click", this.#menuItemClickHandler);
            item.classList.remove(this.menuItemActive);
        });
        window.removeEventListener("scroll", this.animate);
    }
}
window.scrollWatch = DHScrollWatch;
