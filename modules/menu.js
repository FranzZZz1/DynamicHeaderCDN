class Menu {
    root = {
        menu: "dh-menu",
    };
    mode = {
        position: "menu__position-mode",
        transform: "menu__transform-mode",
    };
    device = {
        mobile: "header--mobile",
    };
    state = {
        open: "menu--opened",
        close: "menu--closed",
    };
    action = {
        open: "header__burger--active",
    };
    direction = {
        top: "top",
        left: "left",
        right: "right",
        bottom: "bottom",
    };

    constructor(dh) {
        this.dh = dh;

        this.errors = [];
    }
    init() {
        this.#initVariables();
        this.#initProps();
        this.#bindEvents();
        this.scrollLock && this.#initScrollLock();
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));
    }

    #initProps() {
        if (!this.menuBodyElem) return this.errors.push("Wrong selector on menuBody");
        if (!this.menuIconElem) return this.errors.push("Wrong selector on menuIcon");

        if (!(this.menuDirection in this.direction))
            return this.errors.push(
                "\nWrong menu direction.\n" +
                    "Allowed directions:\n " +
                    `${Object.keys(this.direction).join(",\n ")}\n`
            );
        this.menuIconElem.classList.remove("visually-hidden");

        this.menuBodyElem.classList.add(this.root.menu);
        this.headerElem.classList.add(this.mode[this.appearanceMethod]);
        this.headerElem.classList.add(this.state.close);

        if (
            this.headerElem.classList.contains(this.rootClasses.headerHiding) &&
            this.headerElem.classList.contains(this.mode.transform) &&
            this.menuDirection == "bottom"
        ) {
            return this.errors.push(
                "\nThis direction ('bottom') cant work with 'headerHiding' and transform appearance now.\n" +
                    "You can take several options:\n" +
                    "- Disable the headerHiding module during menu initialization by setting breakpoints in the destroyModule.\n" +
                    "- Select a different menu direction.\n" +
                    "- Choose a different way of appearance ('position').\n" +
                    "- Turn off the headerHiding module.\n"
            );
        }

        this.shouldMenuOffsetHeader && this.headerElem.classList.add("should-header-offset");

        this.headerElem.classList.add(
            `menu-direction__${this.direction[this.menuDirection]}`,
            `${this.device.mobile}`
        );

        this.menuBodyElem.style.setProperty(
            this.cssVariables.menuHeight,
            this.menuBodyElem.offsetHeight + "px"
        );

        this.headerElem.style.setProperty(
            this.cssVariables.headerHeight,
            this.headerElem.offsetHeight + "px"
        );
        document.body.style.setProperty(
            this.cssVariables.headerHeight,
            this.headerElem.offsetHeight + "px"
        );

        window.addEventListener("resize", this.#handleResize);
        this.#handleResize();

        this.rafHandle = null;
    }

    #handleResize = () => {
        if (!this.rafHandle) {
            this.rafHandle = requestAnimationFrame(() => {
                this.rafHandle = null;
                this.menuBodyElem.style.setProperty(
                    this.cssVariables.menuWidth,
                    this.menuBodyElem.offsetWidth + "px"
                );
            });
        }
    };

    #initScrollLock = () => {
        if (!this.scrollLock.scrollLockArray.length > 0) return;

        const wrongSelectors = [];

        this.scrollLock.scrollLockArray.forEach((el) => {
            const targets = document.querySelectorAll(el);
            if (targets.length === 0) return wrongSelectors.push(el);
        });
        if (wrongSelectors.length)
            return this.errors.push(
                "ScrollLockArray includes undefined selectors:\n " + wrongSelectors.join(",\n ")
            );

        this.scrollLockTouchHandler = this.#scrollLockTouch.bind(this);
        this.scrollLockWheelHandler = this.#scrollLockWheel.bind(this);

        this.scrollLockObj = {
            add: (scrollLockArray, scrollLockClass, func1, func2) => {
                scrollLockArray.forEach((el) => {
                    document.querySelectorAll(el).forEach((targetEl) => {
                        targetEl.classList.add(scrollLockClass);
                    });
                });

                document.addEventListener("touchmove", func1, { passive: false });
                if (this.scrollLock.scrollLockDesktop) {
                    document.addEventListener("wheel", func2, { passive: false });
                }
            },
            remove: (scrollLockArray, scrollLockClass, func1, func2) => {
                scrollLockArray.forEach((scrollLockElement) => {
                    document.querySelectorAll(scrollLockElement).forEach((targetEl) => {
                        targetEl.classList.remove(scrollLockClass);
                    });
                });

                document.removeEventListener("touchmove", func1);
                if (this.scrollLock.scrollLockDesktop) {
                    document.removeEventListener("wheel", func2);
                }
            },
        };
    };
    #scrollLockTouch(event) {
        if (event.target.closest(`.${this.scrollLock.scrollLockClass}`)) {
            event.preventDefault();
        }
    }
    #scrollLockWheel(event) {
        if (event.target.closest(`.${this.scrollLock.scrollLockClass}`)) {
            event.preventDefault();
        }
    }

    #open() {
        this.#updateHeaderState(this.state.open, this.state.close);

        this.menuBodyElem.style.setProperty(this.cssVariables.openSpeed, this.openSpeed + "ms");

        let timeout;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            this.menuBodyElem.style.removeProperty(
                this.cssVariables.openSpeed,
                this.openSpeed + "ms"
            );
        }, 10);

        this.menuBodyElem.style.removeProperty(
            this.cssVariables.closeSpeed,
            this.closeSpeed + "ms"
        );

        this.menuIconElem.blur();
        window.addEventListener("click", this.#closeTriggers);
        window.addEventListener("keydown", this.#escapeCloseHandler);

        if (!this.errors.length && this.scrollLock) {
            this.scrollLockObj.add(
                this.scrollLock.scrollLockArray,
                this.scrollLock.scrollLockClass,
                this.scrollLockTouchHandler,
                this.scrollLockWheelHandler
            );
        }

        if (this.normalizedModules.includes("pageLock") && this.pageLock) {
            document.documentElement.classList.add(this.pageLock.pageLockClass);
        }
    }

    #close() {
        this.#updateHeaderState(this.state.close, this.state.open);

        let timeout;

        this.menuBodyElem.style.setProperty(this.cssVariables.closeSpeed, this.closeSpeed + "ms");

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            this.menuBodyElem.style.removeProperty(
                this.cssVariables.closeSpeed,
                this.closeSpeed + "ms"
            );
        }, 10);

        window.removeEventListener("click", this.#closeTriggers);
        window.removeEventListener("keydown", this.#escapeCloseHandler);

        if (!this.errors.length && this.scrollLock) {
            this.scrollLockObj.remove(
                this.scrollLock.scrollLockArray,
                this.scrollLock.scrollLockClass,
                this.scrollLockTouchHandler,
                this.scrollLockWheelHandler
            );
        }

        if (this.normalizedModules.includes("pageLock") && this.pageLock) {
            document.documentElement.classList.remove(this.pageLock.pageLockClass);
        }
    }

    #closeTriggers = (event) => {
        if (!this.menu) return;

        const stringTypeCheck = (target) => {
            if (typeof target === "string") {
                return target;
            } else if (target instanceof Element) {
                if (target.id) {
                    return `#${target.id}`;
                } else {
                    const selectors = [];
                    while (target.parentElement) {
                        let selector = target.nodeName.toLowerCase();
                        let sibling = target;
                        let nthOfType = 1;
                        while ((sibling = sibling.previousElementSibling) != null) {
                            nthOfType++;
                        }
                        selector += `:nth-of-type(${nthOfType})`;
                        selectors.unshift(selector);
                        target = target.parentElement;
                    }
                    return selectors.join(" > ");
                }
            } else {
                this.errors.push(
                    `DynamicHeader: Указан неверный тип данных. Используйте класс для доступа к элементу:`,
                    target
                );
                return null;
            }
        };

        const target = event.target;

        const menuBodySelector = stringTypeCheck(this.menuBody);
        const headerSelector = stringTypeCheck(this.header);
        const menuLinkSelector = stringTypeCheck(this.menuLink);

        if (
            (!target.closest(`${menuBodySelector}.${this.menuOpenClass}`) &&
                !target.closest(headerSelector)) ||
            target.closest(menuLinkSelector)
        ) {
            this.#close();
        }
    };

    #escapeCloseHandler = (event) => {
        if (this.menu && event.code === "Escape") this.#closeTriggers(event);
    };

    #updateHeaderState(addClass, removeClass) {
        this.headerElem.classList.add(addClass);
        this.headerElem.classList.remove(removeClass);
    }

    #toggle() {
        if (this.headerElem.classList.contains(this.state.open)) {
            this.#close();
        } else {
            this.#open();
        }
    }

    #bindEvents() {
        this.toggle = this.#toggle.bind(this);
        this.menuIconElem.addEventListener("click", this.toggle);
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        window.removeEventListener("resize", this.#handleResize);
        cancelAnimationFrame(this.rafHandle);

        if (this.menuIconElem) {
            this.menuIconElem.classList.add("visually-hidden");
        }
        if (this.menuBodyElem) {
            this.menuBodyElem.classList.remove(this.root.menu);
        }
        if (this.headerElem) {
            this.headerElem.classList.remove(this.mode[this.appearanceMethod]);
            this.headerElem.classList.remove(this.state.open);
            this.headerElem.classList.remove(this.state.close);
            this.headerElem.classList.remove("should-header-offset");
        }

        this.headerElem.classList.remove(
            `menu-direction__${this.direction[this.menuDirection]}`,
            `${this.device.mobile}`
        );

        this.menuBodyElem.style.removeProperty(this.cssVariables.menuHeight);
        this.menuBodyElem.style.removeProperty(this.cssVariables.menuWidth);

        if (this.pageLock) {
            document.documentElement.classList.remove(this.pageLock.pageLockClass);
        }

        window.removeEventListener("click", this.#closeTriggers);
        window.removeEventListener("keydown", this.#escapeCloseHandler);

        this.menuIconElem.removeEventListener("click", this.toggle);
    }
}

window.menu = Menu;
