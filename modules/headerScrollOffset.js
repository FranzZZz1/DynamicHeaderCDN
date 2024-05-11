class DHHeaderScrollOffset {
    root = {
        moduleName: "headerScrollOffset",
    };

    constructor(dh) {
        this.dh = dh;
        this.errors = [];
    }

    init() {
        this.#initVariables();
        this.#bindEvents();
        this.#setIsHeaderHidingDestroyedValue();
    }

    setMethod(method) {
        this.updateHeaderHeightOnResize = method;
    }

    #initVariables() {
        Object.assign(this, this.dh.options);

        Object.keys(this.dh)
            .filter((key) => key !== "options")
            .forEach((key) => (this[key] = this.dh[key]));

        this.linkHandlersMap = new Map();
        this.anchorLinks = document.querySelectorAll(`a[href^="#"]`);

        if (!this.anchorLinks) {
            return this.errors.push(this.root.moduleName + ": There are no links on the page");
        }

        this.headerStyles = window.getComputedStyle(this.headerElem);
        this.headerPosition = this.headerStyles.getPropertyValue("position");
    }

    #bindEvents() {
        this.anchorLinks.forEach((link) => {
            if (link.getAttribute("href") === "#") {
                const handleScrollToTop = (event) => this.#scrollToTop(event);
                this.linkHandlersMap.set(link, handleScrollToTop);
                link.addEventListener("click", handleScrollToTop);
            } else {
                const handleHeightAccounting = (event) => this.#scrollToElement(link, event);
                this.linkHandlersMap.set(link, handleHeightAccounting);
                link.addEventListener("click", handleHeightAccounting);
            }
        });
    }

    #scrollToTop(event) {
        event.preventDefault();
        const scrollOptions = {
            top: 0,
            behavior: this.shouldSmoothScroll ? "smooth" : "auto",
        };
        window.scrollTo(scrollOptions);
    }

    #scrollToElement(link, event) {
        event.preventDefault();
        const targetId = link.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const offsetTop = targetElement.getBoundingClientRect().top;
            const scrollOptions = this.#calculateScrollOptions(offsetTop, link, targetElement);
            window.scrollBy(scrollOptions);
        }
    }

    #calculateScrollOptions(offsetTop, link, targetElement) {
        let scrollOptions = {};
        scrollOptions.behavior = this.shouldSmoothScroll ? "smooth" : "auto";

        this.headerScrollHeight = this.updateHeaderHeightOnResize();

        const isFirstLink = this.shouldScrollOffsetHeader
            ? this.anchorLinks.length > 0 && link == this.anchorLinks[0]
            : false;

        const isHeaderFixed = this.headerPosition == "fixed";

        const headerHidingDisabled = !this.headerHiding || this._isHeaderHidingDestroyed;
        const headerHidingEnabled = this.headerHiding && !this._isHeaderHidingDestroyed;

        if (this.shouldScrollOffsetHeader) {
            if (headerHidingDisabled || (headerHidingEnabled && isFirstLink)) {
                if (isHeaderFixed) {
                    if (isFirstLink) {
                        scrollOptions.top =
                            offsetTop - this.headerScrollHeight - this.mainElementScrollMargin;
                    } else {
                        scrollOptions.top = offsetTop - this.headerScrollHeight - this.scrollMargin;
                    }
                } else {
                    if (isFirstLink) {
                        scrollOptions.top =
                            offsetTop - this.headerScrollHeight - this.mainElementScrollMargin;
                    } else {
                        scrollOptions.top = offsetTop - this.scrollMargin;
                    }
                }
            } else {
                if (headerHidingEnabled) {
                    if (targetElement.getBoundingClientRect().y < 0 + this.headerScrollHeight) {
                        scrollOptions.top = offsetTop - this.headerScrollHeight - this.scrollMargin;
                    } else {
                        scrollOptions.top = offsetTop - this.scrollMargin;
                    }
                }
            }
        } else {
            if (headerHidingEnabled) {
                if (isFirstLink) {
                    scrollOptions.top =
                        offsetTop - this.headerScrollHeight - this.mainElementScrollMargin;
                } else {
                    scrollOptions.top = offsetTop - this.scrollMargin;
                }
            } else {
                if (isFirstLink) {
                    scrollOptions.top =
                        offsetTop - this.headerScrollHeight - this.mainElementScrollMargin;
                } else {
                    scrollOptions.top = offsetTop - this.scrollMargin;
                }
            }
        }

        return scrollOptions;
    }

    #setIsHeaderHidingDestroyedValue() {
        if (this.headerHidingInstance) {
            this._isHeaderHidingDestroyed = this.#isHeaderHidingDestroyed(
                this.headerHidingInstance._isDestroyed
            );

            if (typeof this.headerHidingInstance.onDestroyCallback !== "undefined") {
                this.headerHidingInstance.onDestroyCallback = (value) => {
                    this._isHeaderHidingDestroyed = this.#isHeaderHidingDestroyed(value);
                };
            }
        } else {
            this._isHeaderHidingDestroyed = true;
        }
    }

    #isHeaderHidingDestroyed(value) {
        return value;
    }

    getErrors() {
        return this.errors;
    }

    destroy() {
        this.linkHandlersMap.forEach((handler, link) => {
            link.removeEventListener("click", handler);
        });
        this.linkHandlersMap.clear();
    }
}
window.headerScrollOffset = DHHeaderScrollOffset;
