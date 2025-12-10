class Frontend {
    /** @type {Browser} */
    static browser;
    /** @type {Grammar} */
    static grammar;

    static init() {
        this.browser = new Browser(document.getElementById("tree-browser"));
    }

    static resetUI() {
        this.browser.clear();
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
            this.browser.addItem(component, componentPattern, this.grammar.getPatternName(componentPattern), "browser-item");
        }
    }
}