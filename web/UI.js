class UI {
    /** @type {HTMLElement} */
    static browser;
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
    /** @type {Map<String, Pattern>} */
    static patternByID = new Map();
    /** @type {Map<Pattern, String>} */
    static IDByPattern = new Map();
    static last_id = 0;

    /** @type {HTMLElement} */
    static selectedPatternInBrowser;

    static loadFromGrammar() {
        this.resetUI();
        this.generateBrowserTree();
        this.generateSelections();
    }

    /**
     * @param {Pattern} pattern 
     * @returns {string}
     */
    static getIDForPattern(pattern) {
        let id = this.IDByPattern.get(pattern);
        if (!id) {
            id = `pattern_${this.last_id++}`;
            this.IDByPattern.set(pattern, id);
            this.patternByID.set(id, pattern);
        }
        return id;
    }

    /**
     * @param {string} id
     * @returns {Pattern}
     */
    static getPatternByID(id) {
        return this.patternByID.get(id);
    }

    static generateSelections() {
        // Для каджого селектора...
        let selections = document.getElementsByClassName("pattern-select");
        for (let i = selections.length - 1; i >= 0; --i) {
            let selection = selections.item(i);
            // Удаляем все известные ссылки
            for (let c = selection.children.length - 1; c >= 0; --c) {
                selection.children[c].remove();
            }
            // Генерируем новые ссылки
            for (const [name, pattern] of Grammar.patterns.entries()) {
                let newOption = document.createElement("option");
                newOption.innerText = pattern.name;
                newOption.value = this.getIDForPattern(pattern);
                selection.append(newOption);
            }
        }
    }

    static generateBrowserTree() {
        this.clearBrowser();
        for (const [name, pattern] of Grammar.patterns.entries()) {
            let patternBlock = this.generatePattern(pattern.name, pattern);
            this.browser.append(patternBlock);
        }
    }

    /**
     * @param {Component} component
     */
    static generateComponent(titleName, component) {
        let componentElement;
        if (component.pattern && component.pattern.isInline) {
            componentElement = this.generatePattern(titleName, component.pattern);
            componentElement.classList.add("component-inline");
        } else {
            componentElement = document.createElement("span");
            if(titleName != component.pattern.name)
                componentElement.innerText = `🌌 ${titleName} (${component.pattern.name})`;
            else
                componentElement.innerText = "🌌" + titleName;
            componentElement.classList.add("pattern-ptr");
        }
        return componentElement;
    }

    /**
     * @param {String} titleName 
     * @param {Pattern} pattern 
     * @returns 
     */
    static generatePattern(titleName, pattern) {
        let newBlock = document.createElement("details");
        let title = document.createElement("summary");
        let components = document.createElement("div");
        components.classList.add("components");

        // Вставляем информацию о паттерне
        title.innerText = titleName;
        title.id = this.getIDForPattern(pattern);
        newBlock.classList.add("pattern");
        title.onclick = (d) => this.onPatternSelected(d);

        // генерируем компоненты
        if (pattern.components)
            for (let c = 0; c < pattern.components.length; ++c)
                components.append(this.generateComponent(pattern.components[c].name, pattern.components[c]));

        newBlock.append(title);
        newBlock.append(components);
        return newBlock;
    }

    /**
     * Слушатель нажатий на паттерны в браузере
     * @param {PointerEvent} element
     */
    static onPatternSelected(element) {
        if (this.selectedPatternInBrowser)
            this.selectedPatternInBrowser.classList.remove("selected-browser-pattern");
        this.selectedPatternInBrowser = element.target;
        element.target.parentElement.classList.add("selected-browser-pattern");
        let pattern = this.getPatternByID(element.target.id);
        this.loadPatternToUI(pattern);
    }

    /**
     * Функция, загружающяя данные из этого паттерна в интерфейс параметров
     * @param {Pattern} pattern
     */
    static loadPatternToUI(pattern) {
        console.log(pattern);
        this.loadGeneralPatternData(pattern);
        if (pattern instanceof CellPattern) {
            this.loadCellPatternData(pattern);
            this.setCellParamsEnabled(true);
        } else if (pattern instanceof ArrayPattern) {
            this.loadArrayPatternData(pattern);
            this.setArrayParamsEnabled(true);
        } else this.setGeneralPatternParamsEnabled(true);
    }

    /**
     * Загружает в интерфейс специфичные параметры паттерна-клетки
     * @param {CellPattern} pattern
     */
    static loadCellPatternData(pattern) {
        this.patternCellContentType.value = pattern.contentType;
    }

    /**
     * Загружает в интерфейс специфичные параметры паттерна-массива
     * @param {ArrayPattern} pattern
     */
    static loadArrayPatternData(pattern) {
        if (pattern.direction == "ROW") this.patternArrayDirection.selectedIndex = 0;
        else if (pattern.direction == "COL") this.patternArrayDirection.selectedIndex = 1;
        else if (pattern.direction == "FILL") this.patternArrayDirection.selectedIndex = 2;
        else alert("Не удалось распознать направление массива: " + pattern.direction);

        this.patternArrayPattern.value = this.getIDForPattern(pattern.pattern);

        if (pattern.gap.isDefined()) {
            this.patternArrayGapMin = pattern.gap.getBegin();
            this.patternArrayGapMax = pattern.gap.getEnd();
        } else {
            this.patternArrayGapMin = null;
            this.patternArrayGapMax = null;
        }

        if (pattern.itemCount.isDefined()) {
            this.patternArrayCountMin = pattern.gap.getBegin();
            this.patternArrayCountMax = pattern.gap.getEnd();
        } else {
            this.patternArrayCountMin = null;
            this.patternArrayCountMax = null;
        }
    }

    /**
     * Загружает в интерфейс основные параметры паттерна
     * @param {Pattern} pattern
     */
    static loadGeneralPatternData(pattern) {
        if (pattern.isInline) {
            this.patternName.value = "Объявлен в компоненте";
            this.patternName.disabled = true;
        } else {
            this.patternName.disabled = false;
            this.patternName.value = pattern.name;
        }

        if (pattern.kind == "CELL") this.patternKind.selectedIndex = 0;
        else if (pattern.kind == "ARRAY") this.patternKind.selectedIndex = 1;
        else if (pattern.kind == "AREA") this.patternKind.selectedIndex = 2;
        else if (pattern.kind == "ARRAY-IN-CONTEXT") this.patternKind.selectedIndex = 3;
        else alert("Не удалось распознать тип паттерна: " + pattern.kind);

        this.patternDesc.value = pattern.desc;

        if (pattern.width.isDefined()) {
            this.patternWidthMin.value = pattern.width.getBegin();
            this.patternWidthMax.value = pattern.width.getEnd();
        } else {
            this.patternWidthMin.value = "";
            this.patternWidthMax.value = "";
        }
        if (pattern.height.isDefined()) {
            this.patternHeightMin.value = pattern.height.getBegin();
            this.patternHeightMax.value = pattern.height.getEnd();
        } else {
            this.patternHeightMin.value = "";
            this.patternHeightMax.value = "";
        }
        if (pattern.countInDoc.isDefined()) {
            this.patternCountInDocMin.value = pattern.countInDoc.getBegin();
            this.patternCountInDocMin.value = pattern.countInDoc.getEnd();
        } else {
            this.patternCountInDocMin.value = "";
            this.patternCountInDocMin.value = "";
        }
    }

    static resetUI() {
        this.clearBrowser();
        this.setGeneralPatternParamsEnabled(false);
        this.setComponentParamsEnabled(false);
        this.patternByID.clear();
        this.IDByPattern.clear();
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
    static setGeneralPatternParamsEnabled(isEnabled) {
        if (isEnabled) {
            this.patternParams.hidden = false;
            this.cellParams.hidden = true;
            this.arrayParams.hidden = true;
            this.componentParams.hidden = true;
        } else {
            this.patternParams.hidden = true;
            this.cellParams.hidden = true;
            this.arrayParams.hidden = true;
        }
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled
     */
    static setCellParamsEnabled(isEnabled) {
        this.setGeneralPatternParamsEnabled(isEnabled);
        this.cellParams.hidden = !isEnabled;
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled
     */
    static setArrayParamsEnabled(isEnabled) {
        this.setGeneralPatternParamsEnabled(isEnabled);
        this.arrayParams.hidden = !isEnabled;
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled
     */
    static setComponentParamsEnabled(isEnabled) {
        this.componentParams.hidden = !isEnabled;
        if (isEnabled) this.setGeneralPatternParamsEnabled(false);
    }

    static init() {
        this.browser = document.getElementById("tree-browser");
        this.patternParams = document.getElementById("pattern-parameters");
        this.cellParams = document.getElementById("cell-parameters");
        this.arrayParams = document.getElementById("array-parameters");
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
        this.resetUI();
    }
}
