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
        if (this.errors.length) return;

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

        this.menuItems = Array.from(this.inspectVariable(this.headerElem, this.menuItem, true));
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

        if (!link || !link.getAttribute("href")) {
            return this.errors.push(`\nОтсутствует тег "a" в menuItem, либо атрибут href.`);
        }

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

window.scrollWatch = ScrollWatch;
