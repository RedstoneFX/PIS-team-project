/// <reference path="backend.js" />
/// <reference path="Browser.js" />

function isNameValid(name) {
    return name.search(/\s/gm) == -1 && name.replaceAll(/\s/gm, "") != "";
}

function myParseInt(value) {
    let v = value.replaceAll(/\w+/g, "").toLowerCase();
    if (v.includes("-inf")) return -Infinity;
    else if (v.includes("inf")) return Infinity;

    v = Number.parseInt(value);
    if (isNaN(v)) throw new Error("Введенное значение не является числом!");
    return v
}


class Frontend {

    /** @type {HTMLElement} */
    static patternParams;
    /** @type {HTMLElement} */
    static cellParams;
    /** @type {HTMLElement} */
    static arrayParams;
    /** @type {HTMLElement} */
    static componentParams;
    /** @type {HTMLSelectElement} */
    static patternName;
    /** @type {HTMLSelectElement} */
    static patternKind;
    /** @type {HTMLSelectElement} */
    static patternDesc;
    /** @type {HTMLSelectElement} */
    static patternWidthMin;
    /** @type {HTMLSelectElement} */
    static patternWidthMax;
    /** @type {HTMLSelectElement} */
    static patternHeightMin;
    /** @type {HTMLSelectElement} */
    static patternHeightMax;
    /** @type {HTMLSelectElement} */
    static patternCountInDocMin;
    /** @type {HTMLSelectElement} */
    static patternCountInDocMax;
    /** @type {HTMLSelectElement} */
    static patternArrayDirection;
    /** @type {HTMLSelectElement} */
    static patternArrayPattern;
    /** @type {HTMLSelectElement} */
    static patternArrayGapMin;
    /** @type {HTMLSelectElement} */
    static patternArrayGapMax;
    /** @type {HTMLSelectElement} */
    static patternArrayCountMin;
    /** @type {HTMLSelectElement} */
    static patternArrayCountMax;
    /** @type {HTMLSelectElement} */
    static patternCellContentType;
    /** @type {HTMLButtonElement} */
    static createPatternButton;
    /** @type {HTMLButtonElement} */
    static deleteSelectedButton;
    /** @type {HTMLButtonElement} */
    static createComponentLinkButton;
    /** @type {HTMLButtonElement} */
    static createComponentDefinitionButton;
    /** @type {HTMLInputElement} */
    static newComponentName;
    /** @type {HTMLInputElement} */
    static newComponentPattern;

    /** @type {HTMLInputElement} */
    static componentLeftMin;
    /** @type {HTMLInputElement} */
    static componentLeftMax;
    /** @type {HTMLSelectElement} */
    static componentLeftMode;
    /** @type {HTMLInputElement} */
    static componentTopMin;
    /** @type {HTMLInputElement} */
    static componentTopMax;
    /** @type {HTMLSelectElement} */
    static componentTopMode;
    /** @type {HTMLInputElement} */
    static componentRightMin;
    /** @type {HTMLInputElement} */
    static componentRightMax;
    /** @type {HTMLSelectElement} */
    static componentRightMode;
    /** @type {HTMLInputElement} */
    static componentBottomMin;
    /** @type {HTMLInputElement} */
    static componentBottomMax;
    /** @type {HTMLSelectElement} */
    static componentBottomMode;
    /** @type {HTMLSelectElement} */
    static componentType;
    /** @type {HTMLInputElement} */
    static isPatternRoot;
    /** @type {HTMLInputElement} */
    static isComponentOptional;

    /** @type {HTMLInputElement} */
    static cellTypeFilepath;

    /** @type {Browser} */
    static browser;
    /** @type {Grammar} */
    static grammar;

    /** @type {Pattern | Component | PatternByPatternDefinition} */
    static lastClickedItem;

    static init() {
        this.browser = new Browser(document.getElementById("tree-browser"));
        this.browser.onClickListeners().add((item) => this.onItemSelected(item));
        this.patternParams = document.getElementById("pattern-parameters");
        this.cellParams = document.getElementById("cell-parameters");
        this.arrayParams = document.getElementById("array-parameters");
        this.areaParams = document.getElementById("area-parameters");
        this.componentParams = document.getElementById("component-parameters");
        this.patternName = document.getElementById("pattern-name");
        this.patternKind = document.getElementById("pattern-kind");
        this.patternDesc = document.getElementById("pattern-description");
        this.patternWidthMin = document.getElementById("pattern-x-min");
        this.patternWidthMax = document.getElementById("pattern-x-max");
        this.patternHeightMin = document.getElementById("pattern-y-min");
        this.patternHeightMax = document.getElementById("pattern-y-max");
        this.patternCountInDocMin = document.getElementById("pattern-count-min");
        this.patternCountInDocMax = document.getElementById("pattern-count-max");
        this.patternArrayDirection = document.getElementById("pattern-array-direction");
        this.patternArrayPattern = document.getElementById("pattern-array-pattern");
        this.patternArrayGapMin = document.getElementById("pattern-array-gap-min");
        this.patternArrayGapMax = document.getElementById("pattern-array-gap-max");
        this.patternArrayCountMin = document.getElementById("pattern-array-count-min");
        this.patternArrayCountMax = document.getElementById("pattern-array-count-max");
        this.patternCellContentType = document.getElementById("pattern-cell-content-type");
        this.createPatternButton = document.getElementById("create-pattern-button");
        this.deleteSelectedButton = document.getElementById("delete-selected-button");
        this.createComponentLinkButton = document.getElementById("create-component-link-button");
        this.createComponentDefinitionButton = document.getElementById("create-component-definition-button");
        this.componentLocationList = document.getElementById("component-location-list");
        this.newComponentName = document.getElementById("new-component-name");
        this.newComponentPattern = document.getElementById("new-component-pattern");

        this.componentLeftMode = document.getElementById("left-mode");
        this.componentTopMode = document.getElementById("top-mode");
        this.componentRightMode = document.getElementById("right-mode");
        this.componentBottomMode = document.getElementById("bottom-mode");

        this.componentLeftMin = document.getElementById("left-min");
        this.componentLeftMax = document.getElementById("left-max");
        this.componentTopMin = document.getElementById("top-min");
        this.componentTopMax = document.getElementById("top-max");
        this.componentRightMin = document.getElementById("right-min");
        this.componentRightMax = document.getElementById("right-max");
        this.componentBottomMin = document.getElementById("bottom-min");
        this.componentBottomMax = document.getElementById("bottom-max");
        this.componentType = document.getElementById("component-type");

        this.isPatternRoot = document.getElementById("is-pattern-root");
        this.isComponentOptional = document.getElementById("is-component-optional");
        this.cellTypeFilepath = document.getElementById("cell-types-filepath");

        this.defToGlobalTab = document.getElementById("deffinition-to-global-tab");
        this.defToGlobalName = document.getElementById("def-to-global-name");
        this.defToGlobalButton = document.getElementById("def-to-global-btn");

        this.globalToDefTab = document.getElementById("copy-to-components-tab");
        this.globalToDefButton = document.getElementById("global-to-def-btn");

        this.resetUI();

        this.patternName.addEventListener("change", (e) => this.onPatternNameChange(e));
        this.patternDesc.addEventListener("change", (e) => this.onPatternDescChanged(e));
        this.patternWidthMin.addEventListener("change", (e) => this.onPatternSizeChanged(e, true, true));
        this.patternWidthMax.addEventListener("change", (e) => this.onPatternSizeChanged(e, false, true));
        this.patternHeightMin.addEventListener("change", (e) => this.onPatternSizeChanged(e, true, false));
        this.patternHeightMax.addEventListener("change", (e) => this.onPatternSizeChanged(e, false, false));
        this.patternCountInDocMin.addEventListener("change", (e) => this.onCountInDocChange(e, true));
        this.patternCountInDocMax.addEventListener("change", (e) => this.onCountInDocChange(e, false));
        this.patternCellContentType.addEventListener("change", (e) => this.onCellTypeChange(e));
        this.patternArrayDirection.addEventListener("change", (e) => this.onArrayDirectionChange(e));
        this.patternArrayGapMin.addEventListener("change", (e) => this.onArrayGapChanged(e, true));
        this.patternArrayGapMax.addEventListener("change", (e) => this.onArrayGapChanged(e, false));
        this.patternArrayCountMin.addEventListener("change", (e) => this.onArrayItemCountChanged(e, true));
        this.patternArrayCountMax.addEventListener("change", (e) => this.onArrayItemCountChanged(e, false));
        this.isPatternRoot.addEventListener("change", (e) => this.onRootChanged(e));
        this.patternKind.addEventListener("change", (e) => this.onPatternTypeChange(e));

        this.createPatternButton.onclick = (e) => this.onCreatePatternClicked(e);
        this.deleteSelectedButton.onclick = (e) => this.onDeleteSelectedClicked(e);
        this.patternArrayPattern.addEventListener("change", (e) => this.onArrayItemPatternChanged(e));
        this.createComponentLinkButton.onclick = () => this.onCreateComponentLinkClicked();
        this.createComponentDefinitionButton.onclick = () => this.onCreateComponentDefinitionClicked();

        this.componentLeftMode.addEventListener("change", (e) => this.onLocationModeChanged(e, "left"));
        this.componentTopMode.addEventListener("change", (e) => this.onLocationModeChanged(e, "top"));
        this.componentRightMode.addEventListener("change", (e) => this.onLocationModeChanged(e, "right"));
        this.componentBottomMode.addEventListener("change", (e) => this.onLocationModeChanged(e, "bottom"));

        this.componentLeftMin.addEventListener("change", (e) => this.onLocationChange(e, "left", "min"));
        this.componentLeftMax.addEventListener("change", (e) => this.onLocationChange(e, "left", "max"));
        this.componentTopMin.addEventListener("change", (e) => this.onLocationChange(e, "top", "min"));
        this.componentTopMax.addEventListener("change", (e) => this.onLocationChange(e, "top", "max"));
        this.componentRightMin.addEventListener("change", (e) => this.onLocationChange(e, "right", "min"));
        this.componentRightMax.addEventListener("change", (e) => this.onLocationChange(e, "right", "max"));
        this.componentBottomMin.addEventListener("change", (e) => this.onLocationChange(e, "bottom", "min"));
        this.componentBottomMax.addEventListener("change", (e) => this.onLocationChange(e, "bottom", "max"));

        this.componentType.addEventListener("change", (e) => this.onComponentTypeChange(e));
        this.isComponentOptional.addEventListener("change", (e) => this.onOptionalChange(e));
        this.cellTypeFilepath.addEventListener("change", (e) => this.onCellTypeFilepathChange(e));
    }

    static halt(err) {
        this.browser.clear();
        alert("Произошла критическая ошибка! Необходимо перезагрузить страницу.");
        throw err;
    }


    // TODO: Это должно быть в бекенде
    /**
     * @param {String} sideName 
     * @returns {Interval}
     */
    static getLocationBySideName(sideName) {
        if (sideName == "left") return this.lastClickedItem.location().getLeft();
        if (sideName == "top") return this.lastClickedItem.location().getTop();
        if (sideName == "right") return this.lastClickedItem.location().getRight();
        if (sideName == "bottom") return this.lastClickedItem.location().getBottom();
        throw new Error("Не удалось определить сторону: " + sideName);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    static onCellTypeFilepathChange(e) {
        try {
            this.grammar.setCellTypesFilepath(e.target.value);
        } catch (err) {
            this.halt(err);
        }
    }

    static onOptionalChange(e) {
        try {
            this.lastClickedItem.setOptional(e.target.checked);
        } catch (err) {
            this.halt(err);
        }
    }

    static onPatternTypeChange(e) {
        let newKindName = e.target.value;
        let oldKindName = this.lastClickedItem.getKind().getKindName();
        if (newKindName.includes("array") && oldKindName.includes("array")) {
            this.lastClickedItem.getKind().setKindName(newKindName);
        } else {
            try {
                this.lastClickedItem.changeKind(newKindName, this.grammar);
                if (oldKindName == "area") {
                    this.browser.clearChildren(this.lastClickedItem);
                }
                this.loadParameters(this.lastClickedItem);
            } catch (err) {
                this.halt(err);
            }
        }
    }

    static onComponentTypeChange(e) {
        /** @type {AreaPatternExtension} */
        let k = this.lastClickedItem.getParentPattern().getKind();
        try {
            k.updateComponentInner(this.lastClickedItem, e.target.value == "INNER");
        } catch (err) {
            alert(err.message);
            this.componentType.value = k.isComponentInner(this.lastClickedItem) ? "INNER" : "OUTER";
        }
    }

    static onLocationModeChanged(e, side) {
        try {
            this.lastClickedItem.location().setSideMode(side, e.target.value == "PADDING");
        } catch (err) {
            this.halt(err);
        }
    }

    static onLocationChange(e, side, limit) {
        try {
            let dim = this.getLocationBySideName(side);
            if (limit == "min") dim.setBegin(myParseInt(e.target.value - 0));
            else dim.setEnd(myParseInt(e.target.value - 0));
        } catch (err) {
            alert(err);
            this.loadParameters(this.lastClickedItem);
        }
    }

    static onRootChanged(e) {
        try {
            if (e.target.checked) {
                let previousRoot = this.grammar.getRoot();
                if (previousRoot) this.browser.removeClass(previousRoot, "root-pattern");
                this.grammar.setRoot(this.lastClickedItem);
                this.browser.addClass(this.lastClickedItem, "root-pattern");
            } else {
                alert("В документе должен быть корень, выберите другой паттерн у становите его как корень.");
                e.target.checked = true;
            }
        } catch (err) {
            this.halt(err);
        }
    }

    static onCreateComponentDefinitionClicked(e) {
        try {
            // Извлекаем имя
            let name = this.newComponentName.value;
            if (!isNameValid(name)) throw new Error("Имя компонента не должно содержать пробелов и не должно быть пустым.");

            // Создаем компонент с пустым pattern-definition
            let newComp = new Component(this.lastClickedItem);
            let targetPattern = new PatternByPatternDefinition(newComp).setKind(new CellPatternExtension().setContentType("None"));
            newComp.setPattern(targetPattern);

            // Привязываем компонент к текущему паттерну
            this.lastClickedItem.getKind().addComponent(name, newComp, false);

            // Добавляем все в браузер
            this.browser.addItem(this.lastClickedItem, newComp, name);
            this.browser.addItem(newComp, targetPattern, "pattern-definition");

        } catch (err) {
            alert(err.message);
            throw err;
        }
    }


    static onCreateComponentLinkClicked(e) {
        try {
            // Извлекаем имя
            let name = this.newComponentName.value;
            if (!isNameValid(name)) throw new Error("Имя компонента не должно содержать пробелов и не должно быть пустым.");

            // Создаем компонент, связанный
            let targetPattern = this.grammar.getPatternById(this.newComponentPattern.value - 0);
            let newComp = new Component(this.lastClickedItem).setPattern(targetPattern);

            // Привязываем компонент к текущему паттерну
            this.lastClickedItem.getKind().addComponent(name, newComp, false);

            // Добавляем все в браузер
            this.browser.addItem(this.lastClickedItem, newComp, name);
            this.browser.addLink(newComp, targetPattern, this.grammar.getPatternName(targetPattern));

        } catch (err) {
            alert(err.message);
            throw err;
        }
    }

    static onArrayItemPatternChanged(e) {
        let id = e.target.value - 0;
        try {
            let pattern = this.grammar.getPatternById(id);
            /** @type {ArrayPatternExtension} */
            let kind = this.lastClickedItem.getKind();
            kind.setItemPattern(pattern);
        } catch (e) {
            this.halt(e);
        }
    }

    static onCreatePatternClicked(e) {
        try {
            let pattern = new Pattern().setKind(new CellPatternExtension().setContentType("None"));
            let name = this.grammar.getTemplateName();
            this.grammar.addPattern(name, pattern);
            this.browser.addItem(null, pattern, name);
            this.regenerateSelections();
        } catch (e) {
            this.halt(e);
        }
    }

    static onDeleteSelectedClicked(e) {
        try {
            if (this.lastClickedItem instanceof PatternByPatternDefinition) {
                let component = this.lastClickedItem.getParentComponent();
                let parentAreaPattern = component.getParentPattern();
                /** @type {AreaPatternExtension} */
                let kind = parentAreaPattern.getKind();
                kind.popComponent(component, kind.isComponentInner(component)).destroy();
                this.browser.removeItem(component);
            } else if (this.lastClickedItem instanceof Component) {
                let component = this.lastClickedItem;
                let parentAreaPattern = component.getParentPattern();
                /** @type {AreaPatternExtension} */
                let kind = parentAreaPattern.getKind();
                kind.popComponent(component, kind.isComponentInner(component)).destroy();
                this.browser.removeItem(component);
            } else if (this.lastClickedItem instanceof Pattern) {
                let components = this.grammar.getAllComponentsWithPattern(this.lastClickedItem);
                let arrays = this.grammar.getAllArraysWithPattern(this.lastClickedItem);
                if (arrays.size > 0) {
                    alert("Не могу удалить паттерн, так как на него ссылаются массивы");
                    return;
                }

                // Удаляем компоненты из дерева и из браузера
                for (let comp of components.values()) {
                    /** @type {AreaPatternExtension} */
                    let kind = comp.getParentPattern().getKind();
                    kind.popComponent(comp, kind.isComponentInner(comp)).destroy();
                    this.browser.removeItem(comp);
                }

                // Удаляем сам паттерн
                this.grammar.popPattern(this.grammar.getPatternName(this.lastClickedItem)).destroy();
                this.browser.removeItem(this.lastClickedItem);
            } else {
                throw Error("Не могу удалить этот элемент");
            }
            this.unselectItem();
        } catch (e) {
            this.halt(e);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onPatternNameChange(e) {
        try {
            if (e.target.value.search(/\s/g) != -1) throw new Error("Название компонента не должно содержать пробелов!");
            this.grammar.renamePattern(this.lastClickedItem, e.target.value);
            this.browser.updateTitle(this.lastClickedItem, e.target.value);
            this.regenerateSelections();
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onPatternDescChanged(e) {
        try {
            this.lastClickedItem.setDescription(e.target.value);
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onPatternSizeChanged(e, isMin, isWidth) {
        try {
            let dim = isWidth ? this.lastClickedItem.getWidth() : this.lastClickedItem.getHeight();
            if (isMin) dim.setBegin(myParseInt(e.target.value));
            else dim.setEnd(myParseInt(e.target.value));
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onCountInDocChange(e, isMin) {
        try {
            let dim = this.lastClickedItem.getCountInDocument();
            if (isMin) dim.setBegin(myParseInt(e.target.value));
            else dim.setEnd(myParseInt(e.target.value));
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onCellTypeChange(e) {
        try {
            /** @type {CellPatternExtension} */
            let kind = this.lastClickedItem.getKind();
            kind.setContentType(e.target.value);
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onArrayDirectionChange(e) {
        try {
            /** @type {ArrayPatternExtension} */
            let kind = this.lastClickedItem.getKind();
            kind.setDirection(e.target.value);
            this.redrawSelected();
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onArrayGapChanged(e, isMin) {
        try {
            /** @type {ArrayPatternExtension} */
            let kind = this.lastClickedItem.getKind();
            let dim = kind.getGap();
            if (isMin) dim.setBegin(myParseInt(e.target.value));
            else dim.setEnd(myParseInt(e.target.value));
            this.redrawSelected();
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    /**
     * @param {PointerEvent} e 
     */
    static onArrayItemCountChanged(e, isMin) {
        try {
            /** @type {ArrayPatternExtension} */
            let kind = this.lastClickedItem.getKind();
            let dim = kind.getItemCount();
            if (isMin) dim.setBegin(myParseInt(e.target.value));
            else dim.setEnd(myParseInt(e.target.value));
            this.redrawSelected();
        } catch (err) {
            alert(err.message);
            this.loadParameters(this.lastClickedItem);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    static regenerateSelections() {
        let selections = document.getElementsByClassName("pattern-selection");
        for (let i = 0; i < selections.length; i++) {
            selections[i].innerHTML = "";
            for (let [name, pattern] of this.grammar.getAllPatternEntries()) {
                let el = document.createElement("option");
                el.innerText = name;
                el.value = pattern.getId();
                selections[i].appendChild(el);
            }
        }
    }

    static resetUI() {
        this.browser.clear();
        this.disableAllParameters();
        this.deleteSelectedButton.disabled = true;
        let selections = document.getElementsByClassName("pattern-selection");
        for (let i = 0; i < selections.length; i++) {
            selections[i].innerHTML = "";
        }
    }

    static setGrammar(grammar) {
        this.resetUI();
        this.grammar = grammar;
        this.cellTypeFilepath.value = this.grammar.getCellTypesFilepath();
        this.drawEverythingInGrammar();
        this.regenerateSelections();
    }

    static drawEverythingInGrammar() {
        for (let [name, pattern] of this.grammar.getAllPatternEntries()) {
            this.browser.addItem(null, pattern, name);
            this.addComponentsOf(pattern);
        }
        let root = this.grammar.getRoot();
        this.browser.addClass(root, "root-pattern");
    }

    static addComponentsOf(pattern) {
        let kind = pattern.getKind();
        if (kind instanceof AreaPatternExtension) {
            for (let [name, component] of kind.getInnerComponentsEntries()) {
                this.addComponent(pattern, component, name);
            }
            for (let [name, component] of kind.getOuterComponentsEntries()) {
                this.addComponent(pattern, component, name);
            }
        }
    }

    /**
     * @param {Pattern} pattern
     * @param {Component} component
     * @param {String} name
     */
    static addComponent(pattern, component, name) {
        this.browser.addItem(pattern, component, name);
        let componentPattern = component.getPattern();
        if (componentPattern instanceof PatternByPatternDefinition) {
            this.browser.addItem(component, componentPattern, "pattern-definition");
            this.addComponentsOf(componentPattern);
        } else {
            this.browser.addLink(component, componentPattern, this.grammar.getPatternName(componentPattern));
        }
    }

    /**
     * @param {Pattern | Component | PatternByPatternDefinition} item 
     */
    static onItemSelected(item) {
        if (this.lastClickedItem != null) this.browser.removeClass(this.lastClickedItem, "selected-item");
        this.lastClickedItem = item;
        this.browser.addClass(item, "selected-item");
        this.loadParameters(item);
        this.deleteSelectedButton.disabled = false;
        this.redrawSelected();
    }

    static redrawSelected() {
        if (this.lastClickedItem instanceof Pattern)
            Drawer.drawPattern(this.lastClickedItem);
        else
            Drawer.drawComponent(this.lastClickedItem);
    }

    static unselectItem() {
        this.disableAllParameters();
        this.lastClickedItem = null;
        this.deleteSelectedButton.disabled = true;
    }

    static disableAllParameters() {
        this.patternParams.hidden = true;
        this.areaParams.hidden = true;
        this.cellParams.hidden = true;
        this.arrayParams.hidden = true;
        this.componentParams.hidden = true;
        this.globalToDefTab.hidden = true;
        this.defToGlobalTab.hidden = true;
    }

    /**
     * @param {Pattern | Component | PatternByPatternDefinition} item 
     */
    static toggleApplyableParameters(item) {
        this.disableAllParameters();
        if (item instanceof Pattern) {
            this.patternParams.hidden = false;
            if (item instanceof PatternByPatternDefinition) {
                this.patternName.disabled = true;
                this.defToGlobalTab.hidden = false;
            } else {
                this.patternName.disabled = false;
                this.globalToDefTab.hidden = false;
            }
            let kind = item.getKind();
            if (kind instanceof CellPatternExtension) {
                this.cellParams.hidden = false;
            } else if (kind instanceof ArrayPatternExtension) {
                this.arrayParams.hidden = false;
            } else if (kind instanceof AreaPatternExtension) {
                this.areaParams.hidden = false;
            }
        } else {
            this.componentParams.hidden = false;
        }
    }

    /**
     * @param {Pattern | Component | PatternByPatternDefinition} item 
     */
    static loadParameters(item) {
        this.toggleApplyableParameters(item);
        if (item instanceof Pattern) {
            if (item instanceof PatternByPatternDefinition) {
                this.patternName.value = "Объявлен в компоненте";
                this.isPatternRoot.checked = false;
                this.isPatternRoot.disabled = true;
            } else {
                this.patternName.value = this.grammar.getPatternName(item);
                this.isPatternRoot.checked = this.grammar.getRoot() == item;
                this.isPatternRoot.disabled = false;
            }
            this.patternKind.value = item.getKind().getKindName();
            this.patternDesc.value = item.getDescription();

            let width = item.getWidth();
            if (width.getBegin() == width.getDefaultBegin()) this.patternWidthMin.value = null;
            else this.patternWidthMin.value = width.getBegin();
            if (width.getEnd() == width.getDefaultEnd()) this.patternWidthMax.value = null;
            else this.patternWidthMax.value = width.getEnd();
            let height = item.getHeight();
            if (height.getBegin() == height.getDefaultBegin()) this.patternHeightMin.value = null;
            else this.patternHeightMin.value = height.getBegin();
            if (height.getEnd() == height.getDefaultEnd()) this.patternHeightMax.value = null;
            else this.patternHeightMax.value = height.getEnd();

            let count = item.getCountInDocument();
            if (count.getBegin() == count.getDefaultBegin()) this.patternCountInDocMin.value = null;
            else this.patternCountInDocMin.value = count.getBegin();
            if (count.getEnd() == count.getDefaultEnd()) this.patternCountInDocMax.value = null;
            else this.patternCountInDocMax.value = count.getEnd();

            let kind = item.getKind();
            if (kind instanceof CellPatternExtension) {
                this.patternCellContentType.value = kind.getContentType();
            } else if (kind instanceof ArrayPatternExtension) {
                this.patternArrayDirection.value = kind.getDirection().toUpperCase();
                let gap = kind.getGap();
                if (gap.getBegin() == gap.getDefaultBegin()) this.patternArrayGapMin.value = null;
                else this.patternArrayGapMin.value = gap.getBegin();
                if (gap.getEnd() == gap.getDefaultEnd()) this.patternArrayGapMax.value = null;
                else this.patternArrayGapMax.value = gap.getEnd();
                let itemCount = kind.getItemCount();
                if (itemCount.getBegin() == itemCount.getDefaultBegin()) this.patternArrayCountMin.value = null;
                else this.patternArrayCountMin.value = itemCount.getBegin();
                if (itemCount.getEnd() == itemCount.getDefaultEnd()) this.patternArrayCountMax.value = null;
                else this.patternArrayCountMax.value = itemCount.getEnd();
                this.patternArrayPattern.value = kind.getItemPattern().getId();
            } else if (kind instanceof AreaPatternExtension) {
                // Нет особых параметров
            }
        } else if (item instanceof Component) {
            this.componentType.value = item.getParentPattern().getKind().isComponentInner(item) ? "INNER" : "OUTER";
            this.isComponentOptional.checked = item.isOptional();
            let loc = item.location();
            let left = loc.getLeft();
            if (left.isDefault()) {
                this.componentLeftMin.value = "";
                this.componentLeftMax.value = "";
            } else {
                this.componentLeftMin.value = "" + left.getBegin();
                this.componentLeftMax.value = "" + left.getEnd();
                this.componentLeftMode.value = loc.isLeftPadding() ? "PADDING" : "MARGIN";
            }

            let top = loc.getTop();
            if (top.isDefault()) {
                this.componentTopMin.value = "";
                this.componentTopMax.value = "";
            } else {
                this.componentTopMin.value = "" + top.getBegin();
                this.componentTopMax.value = "" + top.getEnd();
                this.componentTopMode.value = loc.isTopPadding() ? "PADDING" : "MARGIN";
            }

            let right = loc.getRight();
            if (right.isDefault()) {
                this.componentRightMin.value = "";
                this.componentRightMax.value = "";
            } else {
                this.componentRightMin.value = "" + right.getBegin();
                this.componentRightMax.value = "" + right.getEnd();
                this.componentRightMode.value = loc.isRightPadding() ? "PADDING" : "MARGIN";
            }

            let bottom = loc.getBottom();
            if (bottom.isDefault()) {
                this.componentBottomMin.value = "";
                this.componentBottomMax.value = "";
            } else {
                this.componentBottomMin.value = "" + bottom.getBegin();
                this.componentBottomMax.value = "" + bottom.getEnd();
                this.componentBottomMode.value = loc.isBottomPadding() ? "PADDING" : "MARGIN";
            }
        } else {
            this.halt(new Error("Не удается загрузить данные объекта"));
        }
    }
}