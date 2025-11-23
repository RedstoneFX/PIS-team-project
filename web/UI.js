class UI_STORAGE {
    /** @type {Map<String, Object>} */
    static itemByID = new Map();
    /** @type {Map<Object, String>} */
    static IDByItem = new Map();
    static last_id = 0;
    /** @type {Map<object, HTMLElement[]} */
    static elementByID = new Map();

    /**
     * Находит ID данных или генерирует новый
     * @param {data} data 
     * @returns 
     */
    static getUniqueID(data) {
        let id = this.IDByItem.get(data);
        if (id == null) {
            id = "" + this.last_id++;
            this.IDByItem.set(data, id);
            this.itemByID.set(id, data);
        }
        return id;
    }

    /**
     * Привязывает данные к элементу
     * @param {HTMLElement} element 
     * @param {Object} data 
     */
    static bindDataToElement(element, data, attrName = "data-id") {
        let id = this.getUniqueID(data);
        data.UNIQUE_UI_ID = id;
        element.setAttribute(attrName, id);
        if (this.elementByID.get(id) == null)
            this.elementByID.set(id, [element]);
        else this.elementByID.get(id).push(element);
    }

    static getElementsByData(data) {
        return this.elementByID.get(this.getUniqueID(data));
    }

    /**
     * Извлекает привязанные к элементу данные
     * @param {Element} element
     * @returns {Object} 
     */
    static getDataFromElement(element, attrName = "data-id") {
        let id = element.getAttribute(attrName);
        if (id == null) return null;
        let data = this.itemByID.get(id);
        if (data == null) // Если это случилось, то выясняйте, почему этот элемент интерфейса до сих пор привязан несуществующим данным.
            throw new Error("Не удалось определить паттерн, привязанный к элементу: " + element);
        return data;
    }

    static reset() {
        this.IDByItem.clear();
        this.itemByID.clear();
        this.elementByID.clear();
        this.last_id = 0;
    }
}


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

    /** @type {HTMLElement} */
    static previousSelectedElement;

    /** @type {Pattern | Component}*/
    static selectedItem;

    static loadFromGrammar() {
        UI_STORAGE.reset();
        this.resetUI();
        this.generateBrowserTree();
        this.regenerateSelections();
    }

    static regenerateSelections() {
        // Для каджого селектора...
        let selections = document.getElementsByClassName("pattern-selection");
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
                newOption.value = UI_STORAGE.getUniqueID(pattern);
                selection.append(newOption);
            }
        }
    }

    static generateBrowserTree() {
        this.clearBrowser();
        for (const [name, pattern] of Grammar.patterns.entries()) {
            let patternBlock = this.createBrowserElementForPattern(pattern.name, pattern);
            this.browser.append(patternBlock);
        }
    }

    /**
     * @param {String} displayName - имя, отображаемое в браузере
     * @param {Component} component - компонент, который нужно привязать
     */
    static generateBrowserElementForComponent(displayName, component) {
        let componentElement;
        if (component.pattern && component.pattern.isInline) { // Если у компонента внутри есть объявление паттерна...
            componentElement = document.createElement("details");
            let title = document.createElement("summary");
            let innerPattern = this.createBrowserElementForPattern("pattern-difinition", component.pattern);
            title.innerText = displayName;
            componentElement.classList.add("browser-item");
            componentElement.appendChild(title);
            componentElement.appendChild(innerPattern);
            UI_STORAGE.bindDataToElement(title, component);
            title.onclick = (e) => this.onBrowserItemClicked(e);
        } else { // Иначе (если это обычный компонент)
            componentElement = document.createElement("details");
            let title = document.createElement("summary");
            let innerPattern = this.createBrowserLinkForPattern(component.pattern.name, component.pattern);
            title.innerText = displayName;
            componentElement.classList.add("browser-item");
            componentElement.appendChild(title);
            componentElement.appendChild(innerPattern);
            UI_STORAGE.bindDataToElement(title, component);
            title.onclick = (e) => this.onBrowserItemClicked(e);
        }
        // Возвращаем сгенерированный элемент дерева
        return componentElement;
    }

    static createBrowserLinkForPattern(displayName, pattern) {
        let element = document.createElement("div");
        element.innerText = displayName;
        element.classList.add("browser-item");
        element.classList.add("pattern-pointer");
        element.onclick = (e) => this.onBrowserItemClicked(e);
        UI_STORAGE.bindDataToElement(element, pattern);
        return element;
    }

    /**
     * @param {String} displayName 
     * @param {Pattern} pattern 
     * @returns {HTMLElement}
     */
    static createBrowserElementForPattern(displayName, pattern) {
        let patternElement = document.createElement("details");
        let title = document.createElement("summary");
        let components = document.createElement("div");
        components.classList.add("component-list");

        // Вставляем информацию о паттерне
        title.innerText = displayName;
        UI_STORAGE.bindDataToElement(title, pattern);
        patternElement.classList.add("browser-item");
        title.onclick = (e) => this.onBrowserItemClicked(e);

        // генерируем компоненты
        if (pattern.components)
            for (let c = 0; c < pattern.components.length; ++c)
                components.append(this.generateBrowserElementForComponent(pattern.components[c].name, pattern.components[c]));

        patternElement.append(title);
        patternElement.append(components);
        return patternElement;
    }

    /**
     * Слушатель нажатий на элементы бразуера
     * @param {PointerEvent} event
     */
    static onBrowserItemClicked(event) {
        let data = UI_STORAGE.getDataFromElement(event.target);
        this.selectBrowserElementByData(data);
    }

    static selectBrowserElementByData(data) {
        let originalElements = UI_STORAGE.getElementsByData(data);
        originalElements.forEach(element => {
            if (element.tagName == "SUMMARY") {
                this.highlightBrowserElement(element);
                this.selectedItem = data;
                this.loadSelectedDataToUI(data);
                this.updateBrowserControllsFor(data);
            }
        });
    }

    static isNameReserved(name) {
        for (let [key, pattern] of Grammar.patterns.entries()) {
            if (key == name || pattern.name == name) return true;
        }
        return false;
    }

    /**
     * Слушатель нажатий на кнопку создания паттена
     * @param {PointerEvent} event
     */
    static onCreatePatternClicked(event) {
        let name = "NewPattern_";
        let i = 0;
        while (this.isNameReserved(name + i)) ++i;
        name = name + i;

        let newPattern = new Pattern(name, { kind: "cell", size: "1 x 1" });
        Grammar.patterns.set(name, newPattern);
        this.browser.append(this.createBrowserElementForPattern(newPattern.name, newPattern));
        this.selectBrowserElementByData(newPattern);
    }

    /**
     * Включает и выключает кнопки в панели управления браузера, соответствующие действиям с переданным элементом
     * @param {Object} data 
     */
    static updateBrowserControllsFor(data) {
        this.deleteSelectedButton.disabled = data == null;
    }

    /**
     * Выделяет выбранный элемент в браузере
     * @param {HTMLElement} element 
     */
    static highlightBrowserElement(element) {
        let currentElement = element;
        if (!currentElement.classList.contains("browser-item"))
            currentElement = element.parentElement;
        if (this.previousSelectedElement)
            this.previousSelectedElement.classList.remove("selected-browser-item");
        this.previousSelectedElement = currentElement;
        currentElement.classList.add("selected-browser-item");
    }

    /**
     * Функция, загружающяя данные из паттерна или компонента в интерфейс параметров
     * @param {Object} data
     */
    static loadSelectedDataToUI(data) {
        if (data instanceof Pattern) {
            this.loadGeneralPatternData(data);
            if (data instanceof CellPattern) {
                this.loadCellPatternData(data);
                this.setCellParamsEnabled(true);
            } else if (data instanceof ArrayPattern) {
                this.loadArrayPatternData(data);
                this.setArrayParamsEnabled(true);
            } else if (data instanceof AreaPattern) {
                this.setAreaParamsEnabled(true);
            } else this.setGeneralPatternParamsEnabled(true);
        } else if (data instanceof Component) {
            this.loadComponentData(data);
            this.setComponentParamsEnabled(true);
        }
    }

    /**
     * Загружает в интерфейс специфичные параметры компонента
     * @param {Component} component 
     */
    static loadComponentData(component) {
        this.loadLocationDirection(component.location.margin.left, this.componentLeftMarginMin, this.componentLeftMarginMax);
        this.loadLocationDirection(component.location.margin.top, this.componentTopMarginMin, this.componentTopMarginMax);
        this.loadLocationDirection(component.location.margin.right, this.componentRightMarginMin, this.componentRightMarginMax);
        this.loadLocationDirection(component.location.margin.bottom, this.componentBottomMarginMin, this.componentBottomMarginMax);
        this.loadLocationDirection(component.location.padding.left, this.componentLeftPaddingMin, this.componentLeftPaddingMax);
        this.loadLocationDirection(component.location.padding.top, this.componentTopPaddingMin, this.componentTopPaddingMax);
        this.loadLocationDirection(component.location.padding.right, this.componentRightPaddingMin, this.componentRightPaddingMax);
        this.loadLocationDirection(component.location.padding.bottom, this.componentBottomPaddingMin, this.componentBottomPaddingMax);
    }

    /**
     * Загружает направление позиции компонента в параметры компонента.
     * @param {YamlRange} direction 
     * @param {HTMLInputElement} min
     * @param {HTMLInputElement} max 
     */
    static loadLocationDirection(direction, min, max) {
        if (!direction.isDefined() || direction.getBegin() == -Infinity)
            min.value = "";
        else min.value = direction.getBegin();
        if (!direction.isDefined() || direction.getEnd() == +Infinity)
            max.value = "";
        else max.value = direction.getEnd();
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
        else if (pattern.direction == "COL" || pattern.direction == "COLUMN") this.patternArrayDirection.selectedIndex = 1;
        else if (pattern.direction == "FILL") this.patternArrayDirection.selectedIndex = 2;
        else alert("Не удалось распознать направление массива: " + pattern.direction);

        this.patternArrayPattern.value = UI_STORAGE.getUniqueID(pattern.pattern);

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
            this.areaParams.hidden = true;
            this.componentParams.hidden = true;
        } else {
            this.patternParams.hidden = true;
            this.cellParams.hidden = true;
            this.arrayParams.hidden = true;
            this.areaParams.hidden = true;
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

    static setAreaParamsEnabled(isEnabled) {
        this.setGeneralPatternParamsEnabled(isEnabled);
        this.areaParams.hidden = !isEnabled;
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled
     */
    static setComponentParamsEnabled(isEnabled) {
        this.componentParams.hidden = !isEnabled;
        if (isEnabled) this.setGeneralPatternParamsEnabled(false);
    }

    /**
     * Удаляет выбранный объект
     */
    static deleteCurrentItem() {
        this.updateBrowserControllsFor(null);
        if (this.currentElement instanceof Pattern) {

        } else if (this.currentElement instanceof Component) {
        }
        Grammar.deletePattern(pattern);
    }

    static validateComponentName(name) {
        if (/\s/g.test(name)) {
            alert("Название компонента содержит пробельные символы, что недопустимо!");
            return false;
        }
        if (name == "") {
            alert("Название компонента не может быть пустой строкой!");
            return false;
        }
        for (let i = 0; i < this.selectedItem.components.length; ++i) {
            if (this.selectedItem.components.at(i).name == name) {
                alert("Уже существует компонент с таким названием в выбранном паттерне!");
                return false;
            }
        }
        return true;
    }

    static onCreateComponentDefinitionClicked() {
        let name = this.newComponentName.value;
        if (!this.validateComponentName(name)) return;
    }

    static onCreateComponentLinkClicked() {
        let name = this.newComponentName.value;
        if (!this.validateComponentName(name)) return;
        let linkedPattern = UI_STORAGE.itemByID.get(this.newComponentPattern.value);

        let comp = new Component(name, { pattern: linkedPattern.name }, false);
        comp.resolveLinks();

        this.selectedItem.components.push(comp);

        let compsElementsList = this.previousSelectedElement.lastElementChild;
        compsElementsList.appendChild(this.generateBrowserElementForComponent(name, comp));
    }

    static init() {
        this.browser = document.getElementById("tree-browser");
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
        this.deleteSelectedButton.onclick = () => this.deleteCurrentItem();
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
    }
}
