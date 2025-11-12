class UI {

    /** @type {HTMLElement} */
    static browser
    /** @type {HTMLElement} */
    static patternParams
    /** @type {HTMLElement} */
    static cellParams
    /** @type {HTMLElement} */
    static arrayParams
    /** @type {HTMLElement} */
    static componentParams
    /** @type {Map<String, Pattern>} */
    static patternByID = new Map()
    static last_id = 0;

    static loadFromGrammar() {
        this.resetUI();
        for (const [name, pattern] of Grammar.patterns.entries()) {
            this.addPattern(name, pattern);
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {Pattern} pattern 
     */
    static addPattern(name, pattern) {
        let newBlock = document.createElement("details");
        let title = document.createElement("summary");
        let components = document.createElement("div");

        title.innerText = name;
        title.id = `pattern_${this.last_id}`;
        this.patternByID.set(title.id, pattern);
        title.onclick = (d) => this.onPatternSelected(d);

        newBlock.append(title);
        newBlock.append(components);
        this.browser.append(newBlock);

        this.last_id += 1;
    }

    /**
     * Слушатель нажатий на паттерны в браузере
     * @param {PointerEvent} element 
     */
    static onPatternSelected(element) {
        let pattern = this.patternByID.get(element.target.id);
        console.log(pattern);
    }

    static resetUI() {
        this.clearBrowser();
        this.setPatternParamsEnabled(false);
        this.setComponentParamsEnabled(false);
        this.patternByID.clear();
        this.last_id = 0;
    }

    static clearBrowser() {
        for (let i = this.browser.children.length - 1; i >= 0; --i)
            this.browser.children[i].remove();
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled 
     */
    static setPatternParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        if (!isEnabled) {
            this.cellParams.hidden = true;
            this.arrayParams.hidden = true;
        } else {
            this.setComponentParamsEnabled(false);
        }
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setCellParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        this.cellParams.hidden = !isEnabled;
        if (isEnabled) this.arrayParams.hidden = true;
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setArrayParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        this.arrayParams.hidden = !isEnabled;
        if (isEnabled) this.cellParams.hidden = true;
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setComponentParamsEnabled(isEnabled) {
        this.componentParams.hidden = !isEnabled;
        if (isEnabled) this.setPatternParamsEnabled(false);
    }

    static init() {
        this.browser = document.getElementById("tree-browser");
        this.patternParams = document.getElementById("pattern-parameters");
        this.cellParams = document.getElementById("cell-parameters");
        this.arrayParams = document.getElementById("array-parameters");
        this.componentParams = document.getElementById("component-parameters");
        this.resetUI();
    }
}