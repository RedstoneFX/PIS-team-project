
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
    static componentLeftMarginMin;
    /** @type {HTMLInputElement} */
    static componentLeftMarginMax;
    /** @type {HTMLInputElement} */
    static componentTopMarginMin;
    /** @type {HTMLInputElement} */
    static componentTopMarginMax;
    /** @type {HTMLInputElement} */
    static componentRightMarginMin;
    /** @type {HTMLInputElement} */
    static componentRightMarginMax;
    /** @type {HTMLInputElement} */
    static componentBottomMarginMin;
    /** @type {HTMLInputElement} */
    static componentBottomMarginMax;

    /** @type {HTMLInputElement} */
    static componentLeftPaddingMin;
    /** @type {HTMLInputElement} */
    static componentLeftPaddingMax;
    /** @type {HTMLInputElement} */
    static componentTopPaddingMin;
    /** @type {HTMLInputElement} */
    static componentTopPaddingMax;
    /** @type {HTMLInputElement} */
    static componentRightPaddingMin;
    /** @type {HTMLInputElement} */
    static componentRightPaddingMax;
    /** @type {HTMLInputElement} */
    static componentBottomPaddingMin;
    /** @type {HTMLInputElement} */
    static componentBottomPaddingMax;


    /** @type {Browser} */
    static browser;
    /** @type {Grammar} */
    static grammar;

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
        this.createPatternButton.onclick = (e) => this.onCreatePatternClicked(e);
        this.deleteSelectedButton = document.getElementById("delete-selected-button");
        this.deleteSelectedButton.onclick = (e) => this.onDeleteSelectedClicked(e);
        this.createComponentLinkButton = document.getElementById("create-component-link-button");
        this.createComponentLinkButton.onclick = () => this.onCreateComponentLinkClicked();
        this.createComponentDefinitionButton = document.getElementById("create-component-definition-button");
        this.createComponentDefinitionButton.onclick = () => this.onCreateComponentDefinitionClicked();
        this.componentLocationList = document.getElementById("component-location-list");
        this.newComponentName = document.getElementById("new-component-name");
        this.newComponentPattern = document.getElementById("new-component-pattern");

        this.componentLeftMarginMin = document.getElementById("left-margin-min");
        this.componentLeftMarginMax = document.getElementById("left-margin-max");
        this.componentTopMarginMin = document.getElementById("top-margin-min");
        this.componentTopMarginMax = document.getElementById("top-margin-max");
        this.componentRightMarginMin = document.getElementById("right-margin-min");
        this.componentRightMarginMax = document.getElementById("right-margin-max");
        this.componentBottomMarginMin = document.getElementById("bottom-margin-min");
        this.componentBottomMarginMax = document.getElementById("bottom-margin-max");

        this.componentLeftPaddingMin = document.getElementById("left-padding-min");
        this.componentLeftPaddingMax = document.getElementById("left-padding-max");
        this.componentTopPaddingMin = document.getElementById("top-padding-min");
        this.componentTopPaddingMax = document.getElementById("top-padding-max");
        this.componentRightPaddingMin = document.getElementById("right-padding-min");
        this.componentRightPaddingMax = document.getElementById("right-padding-max");
        this.componentBottomPaddingMin = document.getElementById("bottom-padding-min");
        this.componentBottomPaddingMax = document.getElementById("bottom-padding-max");

        this.resetUI();

        /*this.patternName.addEventListener("change", (e) => this.onPatternNameChange(e));
        this.patternDesc.addEventListener("change", (e) => this.onPatternDescChanged(e));
        this.patternWidthMin.addEventListener("change", (e) => this.onPatternSizeChanged(e, true, true));
        this.patternWidthMax.addEventListener("change", (e) => this.onPatternSizeChanged(e, false, true));
        this.patternHeightMin.addEventListener("change", (e) => this.onPatternSizeChanged(e, true, false));
        this.patternHeightMax.addEventListener("change", (e) => this.onPatternSizeChanged(e, false, false));
        this.patternCountInDocMin.addEventListener("change", (e) => this.onCountInDocChange(e, true));
        this.patternCountInDocMax.addEventListener("change", (e) => this.onCountInDocChange(e, false));
        this.patternCellContentType.addEventListener("change", (e) => this.onCellTypeChange(e));
        this.patternKind.addEventListener("change", (e) => this.onPatternTypeChange(e));*/
    }

    static resetUI() {
        this.browser.clear();
        this.disableAllParameters();
        this.deleteSelectedButton.disabled = true;
    }

    static setGrammar(grammar) {
        this.resetUI();
        this.grammar = grammar;
        this.drawEverythingInGrammar();
    }

    static drawEverythingInGrammar() {
        for (let [name, pattern] of this.grammar.getAllPatternEntries()) {
            this.browser.addItem(null, pattern, name, "browser-item");
            this.addComponentsOf(pattern);
        }
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
        this.browser.addItem(pattern, component, name, "browser-item");
        let componentPattern = component.getPattern();
        if (componentPattern instanceof PatternByPatternDefinition) {
            this.browser.addItem(component, componentPattern, "pattern-definition", "browser-item");
            this.addComponentsOf(componentPattern);
        } else {
            this.browser.addLink(component, componentPattern, this.grammar.getPatternName(componentPattern), "browser-item");
        }
    }

    /**
     * @param {Pattern | Component | PatternByPatternDefinition} item 
     */
    static onItemSelected(item) {
        this.toggleApplyableParameters(item);
        this.loadParameters(item);
        //console.log(item);
    }

    static disableAllParameters() {
        this.patternParams.hidden = true;
        this.areaParams.hidden = true;
        this.cellParams.hidden = true;
        this.arrayParams.hidden = true;
        this.componentParams.hidden = true;
    }

    /**
     * @param {Pattern | Component | PatternByPatternDefinition} item 
     */
    static toggleApplyableParameters(item) {
        this.disableAllParameters();
        if (item instanceof Pattern) {
            this.patternParams.hidden = false;
            this.patternName.disabled = false;
            if (item instanceof PatternByPatternDefinition) {
                this.patternName.value = "Объявлен в компоненте";
                this.patternName.disabled = true;
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
    }
}