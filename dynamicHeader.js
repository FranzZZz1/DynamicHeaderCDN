class DynamicHeader {
    cssVariables = {
        windowHeight: "--window-height",

        headerHeight: "--header-height",
        headerHidingTranslateY: "--header-hiding-translate",
        mainElementScrollMargin: "--main-element-scroll-margin",
        headerToMainOffset: "--header-to-main-offset",

        menuWidth: "--menu-width",
        menuHeight: "--menu-height",
        openSpeed: "--menu-open-speed",
        closeSpeed: "--menu-close-speed",
    };

    rootClasses = {
        headerHiding: "header--hiding",
        positionMode: "header__position-mode",
        transformMode: "header__transform-mode",
    };

    appearanceMode = {
        position: "header__position-mode",
        transform: "header__transform-mode",
    };

    allowedModules = [
        "headerScroll",
        "headerHiding",
        "headerScrollOffset",
        "pageLock",
        "scrollWatch",
        "menu",
        "all",
    ];

    moduleCDNs = {
        menu: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/modules/menu.js",
        headerScroll:
            "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/modules/headerScroll.js",
        headerHiding:
            "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/modules/headerHiding.js",
        scrollWatch:
            "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/modules/scrollWatch.js",
        headerScrollOffset:
            "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/modules/headerScrollOffset.js",
    };

    errorMessages = {
        undefinedKeys: (brokenKeys, allowedModules) =>
            "\nUndefined keys in destroyModule's object:\n " +
            `${brokenKeys.join(",\n ")}` +
            "\n\nPlease, use available keys:\n " +
            `${allowedModules.join(",\n ")}\n`,

        moduleNotAllowed: (wrongModules, allowedModules) =>
            "\nThis modules are not allowed:\n " +
            `${wrongModules.join(",\n ")}.` +
            "\n\nPlease, use available modules:\n " +
            `${allowedModules.join(",\n ")}.\n`,

        modulesNotReady: (brokenModules) =>
            "\nNot all modules are ready to work.\n\n" +
            "Please exclude this modules from the list:\n " +
            `${brokenModules.join(",\n ")}\n`,

        moduleInitErrors: (moduleErrors) => `\n${moduleErrors.join("\n")}`,
    };

    constructor(header, options = {}) {
        this.header = header;

        this.defaultOptions = {
            menuIcon: ".header__burger",
            menuBody: ".header__menu-wrapper",
            menuItem: ".header__menu-item",
            menuLink: ".header__menu-link",
            shouldMenuOffsetHeader: false,
            pageLock: false,
            menu: true,
            scrollWatch: false,
            headerScroll: false,
            headerHiding: false,
            scrollLock: false,
            shouldScrollOffsetHeader: false,
            shouldSmoothScroll: true,
            scrollMargin: 0,
            mainElement: false,
            mainElementScrollMargin: 0,
            menuItemActive: "active",
            menuOpenClass: "menu--open",
            hideClass: "visually-hidden",
            menuIconActive: "header__burger--active",
            on: {},
            //! new
            openSpeed: 550,
            closeSpeed: 350,
            animationClass: false,
            headerHeightScrollValue: false,
            appearanceMethod: "position",
            modules: false,
            menuDirection: "top",
            timingFunction: "ease",
            scrollEventTimeout: 900,

            destroyModule: false,

            styles: {
                //! Change srcs to cdn links
                default: {
                    enabled: false,
                    src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/main.css",
                },
                headerHiding: {
                    enabled: false,
                    src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/modules/headerHiding.css",
                },
                headerScroll: {
                    enabled: false,
                    src: "src/DynamicHeaderInstall/styles/css/modules/headerScroll.css",
                },
                menu: {
                    enabled: false,
                    src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/menu/menu.css",
                },
            },
            //! new end
        };
        this.options = Object.assign({}, this.defaultOptions, options);

        for (let key in this.options) {
            this[key] = this.options[key];
        }

        this.initializedModules = new Set();
        this.destroyedModules = new Set();

        this.globalErrors = {};

        // this.loadedScripts = [];

        this.#init();
    }

    #init() {
        this.headerElem = this.#inspectVariable(document, this.header);
        if (!this.headerElem) {
            throw new Error(`Не найден элемент с селектором "${this.header}"`);
        }

        this.menuIconElem = this.#inspectVariable(this.headerElem, this.menuIcon);
        this.menuBodyElem = this.#inspectVariable(this.headerElem, this.menuBody);

        this.headerHeight = this.headerElem.offsetHeight;
        this.headerScrollHeight =
            this.headerScroll && this.headerHeightScrollValue
                ? this.headerHeightScrollValue
                : this.headerHeight;

        this.headerElem.style.setProperty(this.cssVariables.headerHeight, this.headerHeight + "px");
        document.body.style.setProperty(this.cssVariables.headerHeight, this.headerHeight + "px");

        window.addEventListener("resize", this.#updateHeaderHeightOnResize);
        this.#updateHeaderHeightOnResize();

        this.rafHandle = null;

        this.#optionsObjectConversion();
        this.modules.length && this.#initModules();
        this.#headerPositionCheck();

        if (this.styles.default.enabled === true) {
            this.#importCSS(this.styles.default.src);
        }
    }

    #updateHeaderHeightOnResize = () => {
        if (!this.rafHandle) {
            this.rafHandle = requestAnimationFrame(() => {
                this.rafHandle = null;

                const cssVariable = getComputedStyle(this.headerElem).getPropertyValue(
                    this.cssVariables.headerHeight
                );
                if (cssVariable && cssVariable.trim() !== "") {
                    if (
                        this.headerHeight !== this.headerElem.offsetHeight ||
                        (this.headerHeight || this.headerElem.offsetHeight) !==
                            +cssVariable.substring(0, cssVariable.length - 2)
                    ) {
                        this.headerElem.style.setProperty(
                            this.cssVariables.headerHeight,
                            this.headerElem.offsetHeight + "px"
                        );
                        document.body.style.setProperty(
                            this.cssVariables.headerHeight,
                            this.headerElem.offsetHeight + "px"
                        );

                        this.headerHeight = this.headerElem.offsetHeight;
                        this.headerScrollHeight =
                            this.headerScroll && this.headerHeightScrollValue
                                ? this.headerHeightScrollValue
                                : this.headerHeight;
                    }
                }
            });
        }
        return this.headerScrollHeight;
    };

    #headerPositionCheck = () => {
        const headerStyles = window.getComputedStyle(this.headerElem);
        const headerPosition = headerStyles.getPropertyValue("position");
        const main = this.#inspectVariable(document, this.mainElement);
        if (main) {
            const marginTop =
                this.headerElem.offsetHeight +
                (this.mainElementScrollMargin ? this.mainElementScrollMargin : 0);
            const marginBottom = this.mainElementScrollMargin ? this.mainElementScrollMargin : 0;

            if (["absolute", "fixed"].includes(headerPosition)) {
                main.style.setProperty(this.cssVariables.mainElementScrollMargin, marginTop + "px");
                this.headerElem.style.removeProperty(this.cssVariables.headerToMainOffset);
            } else {
                this.headerElem.style.setProperty(
                    this.cssVariables.headerToMainOffset,
                    marginBottom + "px"
                );
                main.style.removeProperty(this.cssVariables.mainElementScrollMargin);
            }
        }
    };

    #importCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;

            link.onload = () => {
                resolve();
            };

            link.onerror = () => {
                reject(new Error(`Failed to load CSS file: ${url}`));
            };

            document.head.appendChild(link);
        });
    }

    #inspectVariable(el, key, all = false, debug = true) {
        if (!key) return;

        if (typeof key !== "string") return key;

        const elements = all ? Array.from(el.querySelectorAll(key)) : el.querySelector(key);

        if (!elements) {
            if (!debug) return;
            throw Error(`Cannot find elements with selector '${key}'.`);
        }

        return elements;
    }

    #initModules() {
        this.#destroyOptionsProcessing();

        this.normalizedModules = this.modules.map(
            (module) =>
                this.allowedModules.find(
                    (allowedModule) => allowedModule.toLowerCase() === module.toLowerCase()
                ) || module
        );

        this.#loadClassesFromCDN(this.normalizedModules);
        this.#observeWindowResize();
    }

    #destroyOptionsProcessing() {
        const destroyOptions = this.options.destroyModule;
        this.destroyOptions = {};
        const brokenKeys = [];

        for (const [key, value] of Object.entries(destroyOptions)) {
            const lowercaseKey = key.toLowerCase();
            const matchingModule = this.allowedModules.find(
                (module) => module.toLowerCase() === lowercaseKey
            );
            if (matchingModule) {
                this.destroyOptions[matchingModule] = value;
            } else {
                brokenKeys.push(key);
            }
        }
        if (brokenKeys.length) {
            throw Error(this.errorMessages.undefinedKeys(brokenKeys, this.allowedModules));
        }
    }

    async #loadClassesFromCDN(modulesArray) {
        if (!Array.isArray(modulesArray) || modulesArray.length === 0) {
            return console.error("Modules array is invalid or empty.");
        }

        const errors = [];

        try {
            await Promise.all(
                this.#checkForWrongModulesNames(modulesArray).map(async (moduleName) => {
                    try {
                        await this.#loadScriptFromCDN(moduleName);
                    } catch (error) {
                        errors.push(error);
                    }
                })
            );
            this.#createModule(modulesArray);
            if (errors.length) {
                throw new Error(errors.join("\n"));
            }
        } catch (error) {
            console.error(error);
        }
    }

    #checkForWrongModulesNames(modulesArray) {
        const notAllowedModules = [];
        modulesArray.forEach((moduleName) => {
            if (!this.allowedModules.includes(moduleName)) {
                notAllowedModules.push(moduleName);
            }
        });
        if (notAllowedModules.length) {
            const allowedModulesStr = this.allowedModules.join(",\n ");
            const notAllowedModulesStr = notAllowedModules.join(",\n ");
            throw Error(
                `\nThese modules are not allowed:\n ${notAllowedModulesStr} \n\nPlease, use available modules:\n ${allowedModulesStr}\n`
            );
        }
        return modulesArray;
    }

    async #createModule(modulesArray) {
        const instances = [];

        for (const moduleName of modulesArray) {
            if (this.options[moduleName] !== false) {
                try {
                    const instance = await this.#createModuleInstance(this.moduleCDNs[moduleName]);
                    if (instance) {
                        this[`${moduleName}Instance`] = instance;
                        this.#exportMethods(moduleName);
                        this.#initializeModule(instance, moduleName);
                        instances.push(instance);
                    } else {
                        throw new Error(`Failed to create instance for module '${moduleName}'.`);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }

        return instances;
    }

    #observeWindowResize() {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === document.documentElement) {
                    const screenWidth = window.innerWidth;
                    this.#initModulesOnScreenWidth(screenWidth);
                    this.#destroyModulesOnScreenWidth(screenWidth);
                }
            }
        });
        resizeObserver.observe(document.documentElement);
    }

    #loadScriptFromCDN = (moduleName) => {
        // if (this.options[moduleName] !== false) {
        //     const cdnUrl = this.moduleCDNs[moduleName];
        //     if (!cdnUrl) {
        //         const errorMessage = `CDN URL for module '${moduleName}' not found.`;
        //         return Promise.reject(errorMessage);
        //     }
        //     return new Promise((resolve, reject) => {
        //         const script = document.createElement("script");
        //         script.src = cdnUrl;
        //         script.type = "module";
        //         script.onload = () => {
        //             // Сохраняем ссылку на добавленный тег <script>
        //             this.loadedScripts.push(script);
        //             resolve();
        //         };
        //         script.onerror = () =>
        //             reject(`Failed to load module '${moduleName}' from ${cdnUrl}`);
        //         document.head.appendChild(script);
        //     });
        // }
    };

    async #createModuleInstance(module) {
        const loadedModule = await import(module);
        const ModuleClass = loadedModule.default;
        return new ModuleClass(this);
    }

    #initializeModule(instance, module, errors) {
        let moduleDestroyOptions = this.destroyOptions[module];

        if (moduleDestroyOptions && !(moduleDestroyOptions.min || moduleDestroyOptions.max)) {
            moduleDestroyOptions = { max: moduleDestroyOptions };
        }

        const { min, max } = moduleDestroyOptions || {};

        const screenWidth = window.innerWidth;

        if (!moduleDestroyOptions || (min && screenWidth < min) || (max && screenWidth > max)) {
            instance.init();
            this.initializedModules.add(module);
            const moduleErrors = instance.getErrors();
            if (moduleErrors.length > 0) {
                errors.push(...moduleErrors);
            }
        }
    }

    #exportMethods = (module) => {
        switch (module) {
            case "headerScroll":
                return this.headerScrollInstance.setMethod(
                    this.#headerPositionCheck.bind(this),
                    this.#importCSS.bind(this)
                );
            case "headerHiding":
                return this.headerHidingInstance.setMethod(
                    this.#updateHeaderHeightOnResize.bind(this),
                    this.#importCSS.bind(this)
                );
            case "scrollWatch":
                return this.scrollWatchInstance.setMethod(this.#inspectVariable.bind(this));
            case "headerScrollOffset":
                return this.headerScrollOffsetInstance.setMethod(
                    this.#updateHeaderHeightOnResize.bind(this)
                );
            default:
                return null;
        }
    };

    #destroyModule(moduleName) {
        const instanceName = `${moduleName}Instance`;
        if (this[instanceName]) {
            this[instanceName].destroy();
            this.destroyedModules.add(moduleName);
            this.initializedModules.delete(moduleName);

            // this.#removeCSS(moduleName);
        }
    }

    #processModulesOnScreenWidth(screenWidth, action) {
        const { destroyOptions, options, normalizedModules, initializedModules, destroyedModules } =
            this;
        if (destroyOptions) {
            const destroyOptionsCopy = {};
            for (const moduleName in destroyOptions) {
                if (
                    (options[moduleName] !== false && normalizedModules.includes(moduleName)) ||
                    moduleName == "all"
                ) {
                    if (!destroyOptionsCopy.moduleName) {
                        destroyOptionsCopy[moduleName] = destroyOptions[moduleName];
                    }

                    let { min, max } = destroyOptions[moduleName];

                    let shouldProcess =
                        action === "destroy"
                            ? (min && screenWidth >= min) || (max && screenWidth <= max)
                            : (min && screenWidth < min) || (max && screenWidth > max);

                    if (destroyOptions[moduleName] && !(min || max)) {
                        destroyOptions[moduleName] = {
                            max: destroyOptions[moduleName],
                        };
                    }

                    if (Object.keys(destroyOptions).includes("all")) {
                        const { min, max } = destroyOptions["all"];
                        if (!(min || max)) {
                            destroyOptions["all"] = {
                                max: destroyOptions["all"],
                            };
                        }
                        this.normalizedModules.forEach((allowedModuleName) => {
                            if (!destroyOptions[allowedModuleName]) {
                                destroyOptions[`${allowedModuleName}`] = destroyOptions.all;
                            }
                        });
                        if (typeof destroyOptions[moduleName] !== "number") {
                            if (destroyOptions["all"].min) {
                                delete destroyOptionsCopy[moduleName].max;
                                destroyOptions[moduleName].min = destroyOptions["all"].min;
                            } else if (destroyOptions["all"].max) {
                                delete destroyOptionsCopy[moduleName].min;
                                destroyOptions[moduleName].max = destroyOptions["all"].max;
                            }
                        }
                    }
                    ({ min, max } = destroyOptionsCopy[moduleName]);
                    shouldProcess =
                        action === "destroy"
                            ? (min && screenWidth >= min) || (max && screenWidth <= max)
                            : (min && screenWidth < min) || (max && screenWidth > max);
                    for (const updatedModuleName in destroyOptionsCopy) {
                        if (updatedModuleName !== "all") {
                            if (shouldProcess) {
                                if (
                                    action === "destroy" &&
                                    initializedModules.has(updatedModuleName)
                                ) {
                                    this.#destroyModule(updatedModuleName);
                                } else if (
                                    action === "init" &&
                                    !initializedModules.has(updatedModuleName) &&
                                    this[`${updatedModuleName}Instance`]
                                    // && this.normalizedModules.includes(updatedModuleName)
                                ) {
                                    this[`${updatedModuleName}Instance`].init();
                                    initializedModules.add(updatedModuleName);
                                    destroyedModules.delete(updatedModuleName);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    #destroyModulesOnScreenWidth(screenWidth) {
        this.#processModulesOnScreenWidth(screenWidth, "destroy");
    }

    #initModulesOnScreenWidth(screenWidth) {
        this.#processModulesOnScreenWidth(screenWidth, "init");
    }

    #objectConversion(mainParam, params, mainParamName) {
        const mergeObjectsWithDefaults = (obj1, obj2, parentKey) => {
            for (const key in obj2) {
                if (
                    typeof obj2[key] === "object" &&
                    !Array.isArray(obj2[key]) &&
                    obj2[key] !== null
                ) {
                    if (!(key in obj1)) {
                        obj1[key] = {};
                    }
                    mergeObjectsWithDefaults(obj1[key], obj2[key], `${parentKey}.${key}`);
                } else if (!(key in obj1)) {
                    obj1[key] = obj2[key];
                }
            }

            if (parentKey) {
                const invalidKeys = Object.keys(obj1).filter((key) => !(key in obj2));
                if (invalidKeys.length > 0) {
                    const separator = "-------------";
                    const invalidKeysMessage = `\n${mainParamName}.${parentKey} has invalid keys:\n${invalidKeys.join(
                        ",\n"
                    )}.\n`;
                    const expectedKeysMessage = `\nExpected keys:\n${Object.keys(obj2).join(
                        ",\n"
                    )}.\n\n`;
                    throw new Error(invalidKeysMessage + separator + expectedKeysMessage);
                }
            } else {
                const expectedKeys = Object.keys(obj1);
                const requiredKeys = Object.keys(obj2);
                const invalidKeys = expectedKeys.filter((key) => !(key in obj2));

                const separator = "-------------";
                const invalidKeysMessage = `\n${mainParamName} has invalid keys:\n${invalidKeys.join(
                    ",\n"
                )}.\n`;
                const expectedKeysMessage = `\nExpected keys:\n${requiredKeys.join(",\n")}.\n\n`;

                if (invalidKeys.length > 0) {
                    throw new Error(invalidKeysMessage + separator + expectedKeysMessage);
                }
            }
        };

        if (mainParam) {
            mergeObjectsWithDefaults(mainParam, params, "");
        }
        return mainParam;
    }

    #optionsObjectConversion() {
        const headerScrollParams = {
            headerScrollPosition: this.headerElem.offsetHeight,
            headerScrollEndPosition: false,
            headerScrollClass: "header--dark",
        };
        this.headerScroll = this.#objectConversion(
            this.headerScroll,
            headerScrollParams,
            "headerScroll"
        );

        const scrollLockParams = {
            scrollLockClass: "scroll-locked",
            scrollLockDesktop: true,
            scrollLockArray: [this.header],
        };
        this.scrollLock = this.#objectConversion(this.scrollLock, scrollLockParams, "scrollLock");

        const pageLockParams = {
            pageLockClass: "lock",
            pageLockPadding: false,
        };
        this.pageLock = this.#objectConversion(this.pageLock, pageLockParams, "pageLock");

        const stylesParams = {
            default: {
                enabled: false,
                src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/main.css",
            },
            headerHiding: {
                enabled: false,
                src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/modules/headerHiding.css",
            },
            headerScroll: {
                enabled: false,
                src: "src/DynamicHeaderInstall/styles/css/modules/headerScroll.css",
            },
            menu: {
                enabled: false,
                src: "https://cdn.jsdelivr.net/gh/FranzZZz1/DynamicHeaderCDN@nineteenth/styles/css/menu/menu.css",
            },
        };
        this.styles = this.#objectConversion(this.styles, stylesParams, "styles");
    }

    destroy() {
        if (this.modules.length) {
            this.destroyOptions.all = window.innerWidth + 1;
            this.#destroyModulesOnScreenWidth(window.innerWidth + 1);
        }

        window.removeEventListener("resize", this.#updateHeaderHeightOnResize);
        cancelAnimationFrame(this.rafHandle);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // this.loadedScripts.forEach((script) => {
        //     script.remove();
        // });

        this.headerElem.style.removeProperty(this.cssVariables.headerHeight);
        document.body.style.removeProperty(this.cssVariables.headerHeight);
        this.headerElem.style.removeProperty(this.cssVariables.headerToMainOffset);

        if (this.main) {
            this.main.style.removeProperty(this.cssVariables.mainElementScrollMargin);
        }
    }
}
// window.DynamicHeader = DynamicHeader;
