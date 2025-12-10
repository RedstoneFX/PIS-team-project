
class Grammar {
    /** @type {string} */
    #cellTypesFilepath = "";
    /** @type {Map<string, Pattern>} */
    #patterns = new Map();
    /** @type {Pattern} */
    #rootPattern = null;

    constructor() { }

    /**
     * Создает новую грамматику на основе исходных данных
     * @param {Object} rawData 
     * @returns новая грамматика
     */
    static fromRawData(rawData) {
        let tmp;
        // Проверка типа исходных данных: должен быть объект
        if (!rawData || typeof rawData !== 'object') {
            throw new Error("Некорректные исходные данные");
        }

        // Создать пустой объект грамматики
        const grammar = new Grammar();

        // Заполнить #cell_types_filepath в грамматике...
        tmp = rawData.cell_types_filepath;
        // Выкинуть ошибку, если сell_types_filepath отсутствует
        if (!tmp) {
            throw new Error(`Поле сell_types_filepath отсутствует в исходных данных`)
        }
        // Выкинуть ошибку, если cell_types_filepath не является строкой
        if (typeof tmp !== "string") {
            throw new Error(`Путь к файлу с описанием типов клеток должен быть строкой`);
        }
        // Установить значение #cell_types_filepath
        grammar.setCellTypesFilepath(tmp);

        // Заполнить паттерны в грамматике...
        tmp = rawData.patterns;
        // Выбросить ошибку, если patterns отсутствует
        if (!tmp) {
            throw new Error(`Поле patterns отсутствует в исходных данных`)
        }
        // Создать паттерны без парсинга специфичных данных их типов...
        // Для каждого паттерна в сырых данных...
        for (const [patternName, patternData] of Object.entries(tmp)) {
            // Создать новый паттерн на основе этих данных
            let pattern = new Pattern().fromRawData(patternData);
            // Обновить информацию о корневом узле...
            // Проверить, является ли паттерн корневым
            let isRoot = patternData.root;
            if (!(this.isRoot === true || this.isRoot === false || this.isRoot === null || this.isRoot == undefined)) {
                throw new Error(`Паттерн имеет нечитаемое значение root (${isRoot})`);
            }
            // Если паттерн корневой
            if (isRoot) {
                // Вывести уведомление в консоль, если корневой паттерн уже был
                if (grammar.getRoot()) {
                    console.log(`Иммется более чем один корневой паттерн. Записан только последний: '${patternName}'.`);
                }
                // Считать этот паттерн корневым
                grammar.setRoot(pattern);
            }
            // Добавить паттерн в словарь паттернов по его имени
            grammar.addPattern(patternName, pattern);
        }

        // Обработать специфичные данные для типов паттернов...
        // Для каждого паттерна в словаре и его исходных данных...
        for (const [patternName, patternData] of Object.entries(tmp)) {
            // Обработать специфичные данные типа через Pattern.resolveKindFromRawData(rawData)
            grammar.getPatternByName(patternName).resolveKindFromRawData(patternData);
        }

        // Вернуть созданный объект грамматики
        return grammar;
    }

    /**
     * Создает объект в формате исходных данных с информацией из грамматики
     * @returns объект в формате исходных данных
     */
    serialize() {
        // Создать новый пустой объект
        const result = {};

        // Записать поле cell_types_filepath, если такие данные есть
        if (this.#cellTypesFilepath.length > 0) {
            result.cell_types_filepath = this.#cellTypesFilepath;
        }

        // Если количество паттернов больше нуля...
        if (this.#patterns.size > 0) {
            // Записать в поле patterns пустой список
            result.patterns = {};
            // Для каждого известного паттерна...
            for (const [patternName, pattern] of this.#patterns) {
                // Добавить в поле patterns объект, созданный сериализацией паттерна через Pattern.serialize()
                result.patterns[patternName] = pattern.serialize();
            }
        }

        // Вернуть созданный объект
        return result;
    }

    /**
     * Добавляет переданный паттерн в словарь грамматики
     * @param {string} name 
     * @param {Pattern} pattern 
     * @returns возвращает себя для цепного вызова
     */
    addPattern(name, pattern) {
        // Выбросить ошибку, если паттерн с таким именем уже есть
        if (this.#patterns.get(name)) {
            throw new Error(`Паттерн с таким имененм уже есть`);
        }
        // Сохранить паттерн в грамматику
        this.#patterns.set(name, pattern);
        return this;
    }

    /**
     * Находит паттерн и извлекает его из грамматики
     * @param {string} name 
     * @returns извлеченный паттерн
     */
    popPattern(name) {
        const pattern = this.#patterns.get(name);
        // Вернуть null, если паттерна с таким именем нет
        if (!pattern) {
            return null;
        }
        // Извлечь паттерн из #patterns, если он там есть
        this.#patterns.delete(name);
        // Если извлеченный паттерн является корневым...
        if (this.#rootPattern === pattern) {
            // Вывести в консоль сообщение об удалении корневого паттерна
            console.log(`Удалён корневой паттерн '${name}'`);
            // Занулить #rootPattern
            this.#rootPattern = null;
        }

        // Вернуть извлеченный паттерн
        return pattern;
    }

    /**
     * Переименовывает существующий паттерн
     * @param {Pattern} pattern 
     * @param {string} newName 
     * @returns возвращает себя для цепного вызова
     */
    renamePattern(pattern, newName) {
        this.#patterns.delete(this.getPatternName(pattern));
        this.#patterns.set(newName, pattern);
        return this;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        // Удалить ссылку на корневой паттерн
        this.#rootPattern = null;
        // Вызвать деструкторы всех известных паттернов
        this.#patterns.forEach(pattern => pattern.destroy());
        // Очистить набор паттернов
        this.#patterns.clear();
    }

    getPatternName(pattern) {
        for (const [key, value] of this.#patterns) {
            if (value === pattern) {
                return key;
            }
        }
        throw new Error(`Грамматика не содержит требуемый паттерн`);
    }

    getPatternByName(name) {
        const pattern = this.#patterns.get(name);
        if (!pattern) {
            throw new Error(`Грамматика не содержит паттерн с требуемым именем`);
        }
        return pattern;
    }

    getAllPatternEntries() {
        return this.#patterns.entries();
    }

    /**
     * @param {Pattern} pattern 
     * @returns возвращает себя для цепного вызова
     */
    setRoot(pattern) {
        if (!(pattern instanceof Pattern)) {
            throw new Error(`Только паттерн может быть корнем`);
        }
        if (this.#rootPattern !== pattern) {
            this.#rootPattern = pattern;
        }
        return this;
    }

    getRoot() {
        return this.#rootPattern;
    }

    /**
     * @param {string} filepath 
     * @returns возвращает себя для цепного вызова
     */
    setCellTypesFilepath(filepath) {
        if (typeof filepath !== "string") {
            throw new Error(`Путь к файлу с описанием типов клеток должен быть строкой`);
        }
        this.#cellTypesFilepath = filepath;
        return this;
    }

    getCellTypesFilepath() {
        return this.#cellTypesFilepath;
    }
}

class Pattern {
    /** @type {string} */
    #description = "";
    /** @type {PatternExtension} */
    #kind = null;
    /** @type {Interval} */
    #width = new Interval().default(1, Infinity).limit(1, Infinity);
    /** @type {Interval} */
    #height = new Interval().default(1, Infinity).limit(1, Infinity);
    /** @type {Interval} */
    #countInDocument = new Interval().default(0, Infinity).limit(0, Infinity);
    /** @type {Object} */
    #style = {};

    constructor() { }

    /**
     * Генерирует расширение для текущего паттерна на основе сырых данных
     * @param {Object} rawData 
     */
    resolveKindFromRawData(rawData) {
        // Выбросить ошибку, если у паттерна уже есть kind
        if (this.#kind) {
            throw new Error(`Текущий паттерн уже имеет тип данных`);
        }
        // Выбросить ошибку, если в сырых данных не указан тип
        if (!rawData.kind) {
            throw new Error(`Текущий паттерн не имеет поля 'kind'`);
        }

        // Создать расширение, соответствующее полю rawData.kind...
        const newKind = rawData.kind.toUpperCase();
        // Если искомый тип паттерна - клетка...
        if (newKind === "CELL") {
            // Создать расширение клетки
            this.#kind = new CellPatternExtension().fromRawData(rawData);
        } else if (newKind === "ARRAY" || newKind === "ARRAY-IN-CONTEXT") { // Иначе если искомый тип паттерна - массив...
            // Создать расширение массива
            this.#kind = new ArrayPatternExtension().fromRawData(rawData);
        } else if (newKind === "AREA") { // Иначе если искомый тип паттерна - область...
            // Создать расширение массива
            this.#kind = new AreaPatternExtension().fromRawData(rawData);
        } else { // Иначе
            // Выбросить ошибку о невозможности распознания вида паттерна по ключевому слову в поле rawData.kind
            throw new Error(`В поле kind указан неизвестный тип паттерна: ${newKind}. Поддерживаемые: CELL, ARRAY, ARRAY-IN-CONTEXT, AREA`);
        }
    }

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(rawData) {
        // Обновить description из данных, если такое поле есть
        if (rawData.description) {
            this.#description = rawData.description;
        }

        // Обновить width и height из данных, если поле size есть
        if (rawData.size) {
            // Удалить пробелы из приведённой к нижнему регистру строки и разделить по "x"
            const parts = rawData.size.toLowerCase().replaceAll(/\s+/g, "").split("x");

            // Выбросить ошибку, если строка не задаёт размер
            if (parts.length !== 2 || !parts[0] || !parts[1]) {
                throw new Error(`Некорректный формат размера: ${rawData.size}. Ожидается формат "ширина x высота"`);
            }

            this.#width.fromString(parts[0]);
            this.#height.fromString(parts[1]);
        }

        // Обновить countInDocument из данных, если такое поле есть
        if (rawData.count_in_document) {
            this.#countInDocument.fromString(rawData.count_in_document);
        }

        // Сохранить значение поля style, если такое поле есть (не терять неиспользуемые данные)
        if (rawData.style) {
            this.#style = rawData.style;
        }

        return this;
    }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     */
    serialize() {
        // Выкинуть ошибку, если у текущего паттерна нет типа
        if (!this.#kind) {
            throw new Error(`Невозможно сериализовать, так как текущий паттерн не имеет типа`);
        }

        // Создать новый пустой объект
        const result = {};
        // Записать в объект общие данные паттерна...
        // Записать в объект поле description, если описание не пустое
        if (this.#description.length !== 0) {
            result.description = this.#description;
        }
        // Записать в объект данные, зависящие от типа, с помощью PatternExtension.serializeTo(rawData)
        this.#kind.serializeTo(result);
        // Записать в объект поле size, если width и height не являются значениями по умолчанию
        if (!(this.#width.isDefault() && this.#height.isDefault())) {
            result.size = `${this.#width.toString()} x ${this.#height.toString()}`;
        }
        // Записать в объект поле count_in_document, если countInDocument не является значением по умолчанию
        if (!this.#countInDocument.isDefault()) {
            result.count_in_document = this.#countInDocument.toString();
        }
        // Записать в объект поле style, если this.style не пустой
        if (this.#style) {
            result.style = this.#style;
        }

        // Вернуть созданный сериализованный объект
        return result;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        if (this.#kind) {
            this.#kind.destroy();
        }
        this.#kind = null;
        this.#width = null;
        this.#height = null;
        this.#style = null;
        this.#countInDocument = null;
    }

    /**
     * @param {PatternExtension} kind 
     * @returns возвращает себя для цепного вызова
     */
    setKind(kind) {
        if (!(kind instanceof PatternExtension)) {
            throw new Error(`Тип паттерна должен быть расширением паттерна`);
        }
        if (this.#kind) {
            this.#kind.destroy();
        }
        this.#kind = kind;
        return this;
    }

    getKind() {
        return this.#kind;
    }

    /**
     * @param {string} description 
     * @returns возвращает себя для цепного вызова
     */
    setDescription(description) {
        if (typeof description != "string") {
            throw new Error(`Описание паттерна должно быть строкой`);
        }
        this.#description = description;
        return this;
    }

    getDescription() {
        return this.#description;
    }

    /**
     * @param {number} widthBegin 
     * @param {number} widthEnd 
     * @returns возвращает себя для цепного вызова
     */
    setWidth(widthBegin, widthEnd) {
        if (this.#width === null) {
            throw new Error(`Объект уничтожен`);
        }
        this.#width.setBegin(widthBegin).setEnd(widthEnd);
        return this;
    }

    getWidth() {
        return this.#width;
    }

    /**
     * @param {number} heightBegin 
     * @param {number} heightEnd 
     * @returns возвращает себя для цепного вызова
     */
    setHeight(heightBegin, heightEnd) {
        if (this.#height === null) {
            throw new Error(`Объект уничтожен`);
        }
        this.#height.setBegin(heightBegin).setEnd(heightEnd);
        return this;
    }

    getHeight() {
        return this.#height;
    }

    /**
     * @param {number} countBegin 
     * @param {number} countEnd 
     * @returns возвращает себя для цепного вызова
     */
    setCountInDocument(countBegin, countEnd) {
        if (this.#countInDocument === null) {
            throw new Error(`Объект уничтожен`);
        }
        this.#countInDocument.setBegin(countBegin).setEnd(countEnd);
        return this;
    }

    getCountInDocument() {
        return this.#countInDocument;
    }
}

class PatternByPatternDefinition extends Pattern {
    /** @type {Component} */
    #parentComponent;

    constructor(parentComponent) {
        if (!(parentComponent instanceof Component)) {
            throw new Error(`Вписанный паттерн должен быть определён в компоненте.`);
        }
        this.#parentComponent = parentComponent;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        super.destroy();
        this.#parentComponent = null;
    }

    getParentComponent() {
        return this.#parentComponent;
    }
}

class PatternExtension {
    /** @type {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} */
    #kindName = "";

    constructor() { }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     */
    serializeTo(rawData, grammar) {
        rawData.kind = this.#kindName.toLowerCase();
    }

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(rawData, grammar) {
        if (!rawData.kind) {
            throw new Error(`Паттерн не имеет типа`);
        }
        this.setKindName(rawData.kind);
        return this;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() { }

    getKindName() {
        return this.#kindName;
    }

    /**
     * @param {string} kindName 
     */
    setKindName(kindName) {
        if (!(typeof kindName === 'string' && ["CELL", "AREA", "ARRAY", "ARRAY-IN-CONTEXT"].includes(kindName.toUpperCase()))) {
            throw new Error(`Неизвестный тип паттерна: ${kindName}. Поддерживаемые: CELL, AREA, ARRAY, ARRAY-IN-CONTEXT`);
        }
        this.#kindName = kindName.toUpperCase();
    }
}

class CellPatternExtension extends PatternExtension {
    /** @type {string} */
    #contentType = "";

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(rawData, grammar) {
        super.fromRawData(rawData);
        if (!rawData.kind || rawData.kind.toUpperCase() !== "CELL") {
            throw new Error(`Исходные данные не соответствуют паттерну типа 'ячейка'`);
        }
        if (!rawData.content_type) {
            throw new Error(`Исходные данные для паттерна типа 'ячейка' не содержат поля 'content_type'`)
        }
        this.setContentType(rawData.content_type);
        return this;
    }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     */
    serializeTo(rawData, grammar) {
        super.serializeTo(rawData);
        rawData.content_type = this.#contentType;
    }

    /**
     * @param {string} contentType 
     * @returns 
     */
    setContentType(contentType) {
        if (typeof contentType !== 'string') {
            throw new Error(`Тип данных ячейки должен быть задан строкой`);
        }
        this.#contentType = contentType.toUpperCase();
        return this;
    }

    getContentType() {
        return this.#contentType;
    }
}

class ArrayPatternExtension extends PatternExtension {
    /** @type {"COLUMN" | "ROW" | "FILL"} */
    #direction = "ROW";
    /** @type {Pattern} */
    #itemPattern = null;
    /** @type {Interval} */
    #itemCount = new Interval().default(1, Infinity).limit(1, Infinity);
    /** @type {Interval} */
    #gap = new Interval().default(0, 0).limit(0, Infinity);

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(rawData, grammar) {
        super.fromRawData(rawData);

        if (!rawData.direction) {
            throw new Error(`Не задано направление для массива.`);
        }
        this.setDirection(rawData.direction);

        if (!rawData.item_pattern) {
            throw new Error(`Не задан паттерн для массива.`);
        }
        this.setItemPattern(rawData.item_pattern);

        if (rawData.item_count) {
            this.#itemCount.fromString(rawData.item_count);
        }

        if (rawData.gap) {
            this.#gap.fromString(rawData.gap);
        }

        return this;
    }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     */
    serializeTo(rawData, grammar) {
        super.serializeTo(rawData);

        if (this.#itemPattern === null) {
            throw new Error(`Не задан паттерн элемента массива`);
        }

        rawData.direction = this.#direction;
        rawData.item_pattern = grammar.getPatternName(this.#itemPattern);
        if (!this.#itemCount.isDefault()) {
            rawData.item_count = this.#itemCount.toString();
        }
        if (!this.#gap.isDefault()) {
            rawData.gap = this.#gap.toString();
        }
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        super.destroy();
        this.#itemPattern = null;
        this.#itemCount = null;
        this.#gap = null;
    }

    /**
     * @param {"COLUMN" | "ROW" | "FILL"} direction 
     * @returns возвращает себя для цепного вызова
     */
    setDirection(direction) {
        const allowedDirection = ["ROW", "COLUMN", "FILL"];
        if (!(allowedDirection.includes(direction.toUpperCase()))) {
            throw new Error(`Некорректно задано направление для массива: '${direction}'. Допустимые: ${allowedDirection}.`);
        }
        this.#direction = direction.toUpperCase();
        return this;
    }

    getDirection() {
        return this.#direction;
    }

    /**
     * @param {Pattern} pattern 
     * @returns  возвращает себя для цепного вызова
     */
    setItemPattern(pattern) {
        if (!(pattern instanceof Pattern)) {
            throw new Error(`Элементы массива должны быть определены паттерном`);
        }
        this.#itemPattern = pattern;
        return this;
    }

    getItemPattern() {
        return this.#itemPattern;
    }

    /**
     * @param {number} countBegin 
     * @param {number} countEnd 
     * @returns возвращает себя для цепного вызова
     */
    setItemCount(countBegin, countEnd) {
        if (this.#itemCount === null) {
            throw new Error(`Объект уничтожен`);
        }
        this.#itemCount.setBegin(countBegin).setEnd(countEnd);
        return this;
    }

    getItemCount() {
        return this.#itemCount;
    }

    /**
     * @param {number} gapBegin 
     * @param {number} gapEnd 
     * @returns возвращает себя для цепного вызова
     */
    setGap(gapBegin, gapEnd) {
        if (this.#gap === null) {
            throw new Error(`Объект уничтожен`);
        }
        this.#gap.setBegin(gapBegin).setEnd(gapEnd);
        return this;
    }

    getGap() {
        return this.#gap;
    }
}

class AreaPatternExtension extends PatternExtension {
    /** @type {Map<string, Component>} */
    #innerComponents = new Map();
    /** @type {Map<string, Component>} */
    #outerComponents = new Map();

    constructor() {
        super();
    }

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(rawData, grammar) {
        super.fromRawData(rawData, grammar);

        if (rawData.inner) { // Если область имеет внутренние компоненты
            for (const [componentName, componentData] of Object.entries(data.inner)) { // Для каждого внутреннего компонента...
                const component = new Component().fromRawData(this, componentData, true, grammar); // Распознаем компонент
                this.#innerComponents.set(componentName, component);
            }
        }

        if (rawData.outer) { // Если область имеет внешние компоненты
            for (const [componentName, componentData] of Object.entries(data.outer)) { // Для каждого внешнего компонента...
                const component = new Component().fromRawData(this, componentData, false, grammar); // Распознаем компонент
                this.#outerComponents.set(componentName, component);
            }
        }

        return this;
    }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     * @param {Grammar} grammar 
     */
    serializeTo(rawData, grammar) {
        super.serializeTo(rawData, grammar);

        // Если у области есть внутренние компоненты
        if (this.#innerComponents.size() > 0) {
            // Создать поле inner, если его нет
            if (!rawData.inner) { result.inner = {} };
            // Записать все внутренние компоненты
            for (const [name, component] of this.#innerComponents) {
                rawData.inner[name] = component.serialize(grammar);
            }
        }

        // Если у области есть внешние компоненты
        if (this.#outerComponents.size() > 0) {
            // Создать поле outer, если его нет
            if (!rawData.outer) { result.outer = {} };
            // Записать все внешние компоненты
            for (const [name, component] of this.#outerComponents) {
                rawData.outer[name] = component.serialize(grammar);
            }
        }
    }

    /**
     * Добавляет компонент в область
     * @param {string} componentName 
     * @param {Component} component 
     * @param {boolean} isInner 
     * @returns возвращает себя для цепного вызова
     */
    addComponent(componentName, component, isInner) {
        if (component.isParent(this)) {
            throw new Error(`Компонент не считает, что принадлежит текущей области.`);
        }
        if ((isInner ? this.#innerComponents : this.#outerComponents).has(componentName)) {
            throw new Error(`Компонент с таким именем уже записан в области.`);
        }
        (isInner ? this.#innerComponents : this.#outerComponents).set(componentName, component);
        return this;
    }

    /**
     * Удаляет компонент из области
     * @param {Component} component 
     * @param {boolean} isInner 
     * @returns удалённый компонент
     */
    popComponent(component, isInner) {
        const name = this.getComponentName(component, isInner);
        (isInner ? this.#innerComponents : this.#outerComponents).delete(name);
        return component;
    }

    /**
     * Переименовать компонент
     * @param {Component} component 
     * @param {string} newName 
     * @param {boolean} isInner 
     * @returns возвращает себя для цепного вызова
     */
    renameComponent(component, newName, isInner) {
        if ((isInner ? this.#innerComponents : this.#outerComponents).has(newName)) {
            throw new Error(`Компонент с таким именем уже существует.`);
        }
        this.popComponent(component, isInner);
        this.addComponent(newName, component, isInner);
        return this;
    }

    /**
     * Определить тип расположения компонента
     * @param {Component} component 
     * @returns true - inner | false - outer
     */
    isComponentInner(component) {
        // Проверить, является ли компонент внутренним
        for (const [key, value] of this.#innerComponents) {
            if (value === component) {
                return true;
            }
        }
        // Проверить, является ли компонент внешним
        for (const [key, value] of this.#outerComponents) {
            if (value === component) {
                return false;
            }
        }
        // Выбросить ошибку, если компонента нет в области
        throw new Error(`Компонент отсутствует в текущей области.`);
    }

    /**
     * Изменить тип расположения компонента
     * @param {Component} component 
     * @param {boolean} isInner 
     * @returns возвращает себя для цепного вызова
     */
    updateComponentInner(component, isInner) {
        if (component.isParent(this)) {
            throw new Error(`Компонент не считает, что принадлежит текущей области.`);
        }
        // Если компонент уже имеет требуемый тип расположения
        if (this.isComponentInner(component)) {
            // Вернуть себя
            return this;
        } else { // Иначе
            // Изменить тип расположения
            let name = this.getComponentName(component, !isInner);
            this.popComponent(component, !isInner);
            this.addComponent(name, component, isInner);
        }
        return this;
    }

    /**
     * Определить имя компонента
     * @param {Component} component 
     * @param {boolean} isInner 
     * @returns имя компонента
     */
    getComponentName(component, isInner) {
        for (const [key, value] of (isInner ? this.#innerComponents : this.#outerComponents)) {
            if (value === component) {
                return key;
            }
        }
        throw new Error(`Область не содержит требуемый компонент.`);
    }

    getInnerComponentsEntries() {
        this.#innerComponents.entries();
    }

    getOuterComponentsEntries() {
        this.#outerComponents.entries()
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        // Вызвать деструкторы компонентов
        for (const component of this.#innerComponents.values()) {
            component.destroy();
        }
        for (const component of this.#outerComponents.values()) {
            component.destroy();
        }
        // Очистить списки
        this.#innerComponents.clear();
        this.#outerComponents.clear();
    }
}

class Component {
    /** @type {Pattern | PatternByPatternDefinition} */
    #pattern = null;
    /** @type {Pattern | PatternByPatternDefinition} */
    #parentPattern = null;
    /** @type {boolean} */
    #isOptional = false;
    /** @type {ComponentLocation} */
    #location = new ComponentLocation();

    constructor(parentPattern) {
        if (parentPattern) {
            if (!(parentPattern instanceof Pattern)) {
                throw new Error(`Компонент должен содержаться в паттерне.`);
            }
            this.#parentPattern = parentPattern;
        }
    }

    /**
     * Заполняет компонент, основываясь на данных
     * @param {Pattern} parentPattern 
     * @param {Object} rawData 
     * @param {boolean} isInner 
     * @param {Grammar} grammar 
     * @returns возвращает себя для цепного вызова
     */
    fromRawData(parentPattern, rawData, isInner, grammar) {
        if (!(parentPattern instanceof Pattern)) {
            throw new Error(`Компонент должен содержаться в паттерне.`);
        }
        this.#parentPattern = parentPattern;

        // Распознать паттерн...
        let pattern = null;
        // Если в данных указано название паттерна и не указан pattern_definition...
        if (rawData.pattern && !rawData.pattern_definition) {
            // Найти в грамматике паттерн с таким названием
            pattern = grammar.getPatternByName(rawData.pattern);
            // Выбросить ошибку, если паттерн не найден
            if (!pattern) {
                throw new Error(`Не удаётся найти паттерн с указанным названием (${rawData.pattern}) для компонента.`)
            }
        } else if (rawData.pattern_definition && !rawData.pattern) { // Иначе если в данных есть pattern_definition и нет названия паттерна...
            try {
                // Распознать pattern_definition
                pattern = new PatternByPatternDefinition(this).fromRawData(rawData);
            } catch (e) {
                // Выбросить ошибку, если не удалось распознать паттерн
                throw new Error(`Не удаётся распознать вложнный паттерн в компоненте: ${e.message}`);
            }
        } else {
            throw new Error(`Компонент должен содержать pattern или pattern_definition`);
        }

        // Привязать к компоненту распознанный паттерн
        this.#pattern = pattern;

        // Распознать позицию...
        // Если в данных есть location...
        if (rawData.location) {
            // Обновить позицию компонента
            this.#location.parse(rawData, isInner);
        }

        // Распознать и установить #isOptional, если такое поле есть в данных
        if (rawData.optional) {
            let optional = data.optional;
            if (!(optional === true || optional === false)) throw new Error(`Не удалось распознать поле optional у компонента`);
            this.#isOptional = optional;
        }

        return this;
    }

    /**
     * Создает объект в формате исходных данных с текущей информацией
     * @param {Grammar} grammar 
     * @returns объект в формате исходных данных
     */
    serialize(grammar) {
        // Выбросить ошибку, если в компоненте не указан паттерн
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }

        // Создать пустой объект
        const result = {};

        // Сохранить паттерн...
        // Если паттерн является pattern_definition...
        if (this.#pattern instanceof PatternByPatternDefinition) {
            // Сериализовать паттерн и добавить в поле pattern_definition
            result.pattern_definition = this.#pattern.serialize();
        } else { // Иначе...
            // Узнать название паттерна в грамматике
            let name = grammar.getPatternName(this.#pattern);
            // Выбросить ошибку, если у паттерна нет названия
            if (!name) {
                throw new Error(`Указанный в компоненте паттерн не имеет названия`);
            }
            // Добавить название паттерна в поле pattern
            result.pattern = name;
        }

        // Сохранить позицию...
        // Если позиция не совпадает со значением по умолчанию (ComponentLocation.isDefault())...
        if (!this.#location.isDefault()) {
            // Сериализовать позицию и записать в поле location
            result.location = this.#location.serialize();
        }

        // Сохранить optional...
        // если isOptional - истина...
        if (this.#isOptional) {
            // записать истину в поле optional
            result.optional = true;
        }

        // Вернуть созданный объект
        return result;
    }

    /**
     * Устанавливает или заменяет паттерн в данном компоненте
     * @param {Pattern | PatternByPatternDefinition} pattern 
     * @returns возвращает себя для цепного вызова
     */
    setPattern(pattern) {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        if (!(pattern instanceof Pattern)) {
            throw new Error(`Тип данных компонента должен быть задан вариацией паттерна.`);
        }

        // Вызвать деструктор дочернего паттерна, если он является pattern_definition
        if (this.#pattern instanceof PatternByPatternDefinition) {
            this.#pattern.destroy();
        }

        // Установить новый паттерн в компонент
        this.#pattern = pattern;

        return this;
    }

    getPattern() {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        return this.#pattern;
    }

    getParentPattern() {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        return this.#parentPattern;
    }

    /**
     * Проверяет, является ли паттерн родительским
     * @param {Pattern | PatternByPatternDefinition} pattern 
     * @returns 
     */
    isParent(pattern) {
        return this.#parentPattern === pattern;
    }

    /**
     * @param {boolean} isOptional 
     * @returns возвращает себя для цепного вызова
     */
    setOptional(isOptional) {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        if (typeof isOptional != 'boolean') {
            throw new Error(`Значение isOptional должно быть логическим`);
        }
        this.#isOptional = isOptional;
        return this;
    }

    isOptional() {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        return this.#isOptional;
    }

    /** Сеттер-Геттер */
    location() {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уничтожен либо не инициализован.`);
        }
        return this.#location;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        if (this.#parentPattern === null) {
            throw new Error(`Компонент уже уничтожен либо ещё не инициализован.`);
        }
        // Вызвать деструктор дочернего компонента, если он является pattern_definition
        if (this.#pattern instanceof PatternByPatternDefinition) {
            this.#pattern.destroy();
        }

        // Вызвать деструктор для location
        this.#location.destroy();

        // Занулить все указатели на объекты
        this.#pattern = null;
        this.#parentPattern = null;
        this.#location = null;
    }
}

class ComponentLocation {
    /** @type {Interval} */
    #left = new Interval().default(-Infinity, Infinity);
    /** @type {Interval} */
    #top = new Interval().default(-Infinity, Infinity);
    /** @type {Interval} */
    #right = new Interval().default(-Infinity, Infinity);
    /** @type {Interval} */
    #bottom = new Interval().default(-Infinity, Infinity);
    /** @type {boolean} */
    #isLeftPadding
    /** @type {boolean} */
    #isTopPadding
    /** @type {boolean} */
    #isRightPadding
    /** @type {boolean} */
    #isBottomPadding

    constructor() { }

    /**
     * Распознает значения позиции в указанных данных и обновляет текущую позицию
     * @param {Object} rawData 
     * @param {boolean} isInner 
     */
    parse(rawData, isInner) {
        if (this.#left === null || this.#top === null || this.#right === null || this.#bottom === null) {
            throw new Error(`Объект уничтожен`);
        }

        // Восстановить значения позиций по умолчанию
        this.#left.restoreDefault();
        this.#top.restoreDefault();
        this.#right.restoreDefault();
        this.#bottom.restoreDefault();

        // Если тип переданных данных - строка...
        if (typeof rawData === 'string') {

            // Разбить строку на слова через запятую
            const words = rawData.split(',').map(part => part.trim());

            // Для каждого слова установить позицию по слову
            words.forEach(word => {
                this.setPositionByWord(word, isInner);
            });

        } else if (Array.isArray(rawData)) { // Иначе если тип данных - массив...
            // Для каждого элемента в массиве...
            for (let part of rawData) {
                // Если элемент - строка со стороной...
                if (['left', 'top', 'right', 'bottom'].includes(part)) {
                    // Установить позицию по слову
                    this.setPositionByWord(part, isInner);
                } else {
                    throw new Error(`Нечитаемое обозначение стороны: '${part}'`);
                }
            }
        } else if (typeof rawData === 'object') { // Иначе если тип данных - объект...
            for (const [key, value] of Object.entries(rawData)) {
                let side = key.trim();
                let interval = value.trim();

                // Обработка смешанной записи, где только часть заданных направлений имеют стандартный промежуток, а не указанный явно
                if (typeof value === 'string' && (value.includes('top') || value.includes('bottom')
                    || value.includes('left') || value.includes('right'))) { // Если на месте промежутка оказалось направление
                    side = value; // Вернуть направление на место
                    interval = defaultRange; // Считать, что промежуток являтся стандартным
                } else if (typeof value === 'object') { // Иначе если на месте промежутка пара направление - промежуток 
                    [side, interval] = Object.entries(value)[0]; // Распаковать объект
                }

                // Выбросить ошибку, если итоговая сторона не задаёт направление
                if (!(side.includes('top') || side.includes('bottom') || side.includes('left') || side.includes('right'))) {
                    throw new Error(`Нечитаемое обозначение стороны: '${side}'`);
                }

                // Установить позицию по паре
                this.setPositionByWordAndInterval(side, isInner, interval);
            }
        } else { // Иначе...
            // Выбросить ошибку о неправильном способе задачи позиции
            throw new Error(`Невозможно определить позицию по данной записи: '${rawData}'`)
        }
    }

    /**
     * Создает объект в формате исходных данных с текущей информацией
     * @returns объект в формате исходных данных
     */
    serialize() {
        if (this.#left === null || this.#top === null || this.#right === null || this.#bottom === null) {
            throw new Error(`Объект уничтожен`);
        }
        // Создать пустой объект
        const result = {};

        // Для каждого направления...
        // Если данное направление не является значением по умолчанию...
        // Преобразовать диапазон значений в строку и записать в соответствующее поле
        if (!this.#left.isDefault()) {
            result[(this.#isLeftPadding ? 'padding' : 'margin') + '-left'] = this.#left.toString();
        }
        if (!this.#top.isDefault()) {
            result[(this.#isTopPadding ? 'padding' : 'margin') + '-top'] = this.#top.toString();
        }
        if (!this.#right.isDefault()) {
            result[(this.#isRightPadding ? 'padding' : 'margin') + '-right'] = this.#right.toString();
        }
        if (!this.#bottom.isDefault()) {
            result[(this.#isBottomPadding ? 'padding' : 'margin') + '-bottom'] = this.#bottom.toString();
        }

        // Вернуть созданный объект
        return result;
    }

    /**
     * @returns имеют ли все отступы значение по умолчанию
     */
    isDefault() {
        if (this.#left === null || this.#top === null || this.#right === null || this.#bottom === null) {
            throw new Error(`Объект уничтожен`);
        }
        return this.#left.isDefault() && this.#top.isDefault() && this.#right.isDefault() && this.#bottom.isDefault();
    }

    /**
     * Изменить тип относительного расположения на противоположный
     */
    flipPaddingMargin() {
        this.#isLeftPadding = !this.#isLeftPadding;
        this.#isTopPadding = !this.#isTopPadding;
        this.#isRightPadding = !this.#isRightPadding;
        this.#isBottomPadding = !this.#isBottomPadding;
    }

    /**
     * Устанавливает дефолтную позицию в соответствии с заданной стороной
     * @param {string} word 
     * @param {boolean} isInner 
     */
    setPositionByWord(word, isInner) {
        if (this.#left === null || this.#top === null || this.#right === null || this.#bottom === null) {
            throw new Error(`Объект уничтожен`);
        }

        // Привести слово в нижний регистр и удалить пробелы
        word = word.trim().toLowerCase();
        // Обновить позицию, в зависимости от слова...
        // Если слово - "left"...
        if (word === 'left') {
            // Установить дефолтное значение left
            this.#left.setBegin(0).setEnd(isInner ? 0 : Infinity);
            // Установить #isLeftPadding в истину, если компонент внутренний, иначе - в ложь
            this.#isLeftPadding = isInner;
        } else if (word === 'top') { // Иначе если слово - "top"...
            // Установить дефолтное значение top
            this.#top.setBegin(0).setEnd(isInner ? 0 : Infinity);
            // Установить #isTopPadding в истину, если компонент внутренний, иначе - в ложь
            this.#isTopPadding = isInner;
        } else if (word === 'right') { // Иначе если слово - "right"...
            // Установить дефолтное значение right
            this.#right.setBegin(0).setEnd(isInner ? 0 : Infinity);
            // Установить #isRightPadding в истину, если компонент внутренний, иначе - в ложь
            this.#isRightPadding = isInner;
        } else if (word === 'bottom') { // Иначе если слово - "bottom"...
            // Установить дефолтное значение bottom
            this.#bottom.setBegin(0).setEnd(isInner ? 0 : Infinity);
            // Установить #isBottomPadding в истину, если компонент внутренний, иначе - в ложь
            this.#isBottomPadding = isInner;
        } else { // Иначе...
            // Выбросить ошибку о встреченном неизвестном слове
            throw Error(`Не удается распознать сторону: ${word}.`);
        }
    }

    /**
     * Устанавливает позицию в соответствии с заданной стороной и интервалом
     * @param {string} word 
     * @param {boolean} isInner 
     * @param {string} interval 
     */
    setPositionByWordAndInterval(word, isInner, interval) {
        if (this.#left === null || this.#top === null || this.#right === null || this.#bottom === null) {
            throw new Error(`Объект уничтожен`);
        }

        // Определить написание стороны...
        // Перевести строку в нижний регистр и удалить пробелы и табуляцию
        word = word.toLowerCase().replaceAll(/\s+/g, "");

        // Проверить, может ли строка задавать сторону
        if ((word !== 'left' && word !== 'top' && word !== 'right' && word !== 'bootom') && !(word.includes('padding') || word.includes('margin'))) {
            throw Error(`Переданная строка не задаёт сторону: ${word}.`);
        }

        // Если слово содержит "left"...
        if (word.includes('left')) {
            // Установить соответствующий padding флаг
            if (word.includes('padding')) {
                this.#isLeftPadding = true;
            } else if (word.includes('margin')) {
                this.#isLeftPadding = false;
            } else {
                this.#isLeftPadding = isInner;
            }
            // Установить значение left
            this.#left.fromString(interval);
        } else if (word.includes('top')) { // Иначе если слово содержит "top"...
            // Установить соответствующий padding флаг
            if (word.includes('padding')) {
                this.#isTopPadding = true;
            } else if (word.includes('margin')) {
                this.#isTopPadding = false;
            } else {
                this.#isTopPadding = isInner;
            }
            // Установить значение top
            this.#top.fromString(interval);
        } else if (word.includes('right')) { // Иначе если слово содержит "right"...
            // Установить соответствующий padding флаг
            if (word.includes('padding')) {
                this.#isRightPadding = true;
            } else if (word.includes('margin')) {
                this.#isRightPadding = false;
            } else {
                this.#isRightPadding = isInner;
            }
            // Установить значение right
            this.#right.fromString(interval);
        } else if (word.includes('bottom')) { // Иначе если слово содержит "bottom"...
            // Установить соответствующий padding флаг
            if (word.includes('padding')) {
                this.#isBottomPadding = true;
            } else if (word.includes('margin')) {
                this.#isBottomPadding = false;
            } else {
                this.#isBottomPadding = isInner;
            }
            // Установить значение bottom
            this.#bottom.fromString(interval);
        } else { // Иначе...
            // Выбросить ошибку о встреченном неизвестном слове
            throw Error(`Не удается распознать сторону: ${word}.`);
        }
    }

    getLeft() {
        return this.#left;
    }

    getTop() {
        return this.#top;
    }

    getRight() {
        return this.#right;
    }

    getBottom() {
        return this.#bottom;
    }

    isLeftPadding() {
        return this.#isLeftPadding;
    }

    isTopPadding() {
        return this.#isTopPadding;
    }

    isRightPadding() {
        return this.#isRightPadding;
    }

    isBottomPadding() {
        return this.#isBottomPadding;
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        this.#left = null;
        this.#top = null;
        this.#right = null;
        this.#bottom = null;
    }
}

class Interval {
    /** @type {number} */
    #begin;
    /** @type {number} */
    #end;
    /** @type {number} */
    #defaultBegin;
    /** @type {number} */
    #defaultEnd;
    /** @type {number} */
    #minBegin = -Infinity;
    /** @type {number} */
    #maxEnd = Infinity;

    /**
     * Конструктор
     * @param {number} begin
     * @param {number} end
     */
    constructor(begin, end) {
        if (begin != null && end != null) {
            if (begin > end) {
                throw new Error('Конец диапазона не может быть меньше начала');
            }
            if (begin < this.#minBegin) {
                throw new Error(`Начало не может быть меньше минимально допустимого (${this.#minBegin})`);
            }
            if (end > this.#maxEnd) {
                throw new Error(`Начало не может быть больше максимально допустимого (${this.#maxEnd})`);
            }
            this.#begin = begin;
            this.#end = end;
        } else {
            this.#begin = 0;
            this.#end = 0;
        }
    }

    /**
     * Парсит диапазон значений из строки
     * @param {String} stringInterval
     * @returns возвращает себя для цепного вызова
     */
    fromString(stringInterval) {
        if (!stringInterval) {
            return this;
        }

        // Если переданно число, то интервал сокращается до точки
        if (typeof stringInterval === 'number') {
            this.setBegin(stringInterval).setEnd(stringInterval);
        } else if (typeof stringInterval !== "string") { // Выбросить ошибку, если интервал не является строкой или числом
            throw new Error(`Не удается распознать интервал: '${stringInterval}'.`);
        }

        // Удалить пробелы
        stringInterval = stringInterval.replaceAll(/\s+/g, "");

        // Вернуть единичный интервал, если в строке только число (одно)
        if (/^-?\d+$/.test(stringInterval)) {
            let num = parseInt(stringInterval);
            this.setBegin(num).setEnd(num);
        }

        // Если передана * - то интервал бесконечен с обоих концов
        if (stringInterval === '*') {
            this.setBegin(-Infinity).setEnd(Infinity);
        }

        // Если в строке точно есть интервал...
        if (stringInterval.includes('..')) {
            const parts = stringInterval.split('..', 2); // Выделяем левую и правую часть интервала

            let begin;
            let end;

            // Парсим левую часть интервала
            if (/^-?\d+$/.test(parts[0])) {
                begin = parseInt(parts[0]);
            } else if (parts[0] == "*") {
                begin = -Infinity;
            } else {
                throw new Error(`Не удается распознать левую часть (${parts[0]}) интервала: '${stringInterval}'.`);
            }

            // Парсим правую часть интервала
            if (/^-?\d+$/.test(parts[1])) {
                end = parseInt(parts[1]);
            } else if (parts[1] == "*") {
                end = Infinity;
            } else {
                throw new Error(`Не удается распознать правую часть (${parts[1]}) интервала: '${stringInterval}'.`);
            }

            this.setBegin(begin).setEnd(end);
        }
    }

    /**
     * Устанавливает дефолтные значения и приводит к ним значение объекта
     * @param {number} begin 
     * @param {number} end 
     * @returns возвращает себя для цепного вызова
     */
    default(begin, end) {
        if (begin > end) {
            throw new Error('Конец диапазона не может быть меньше начала');
        }
        if (begin < this.#minBegin) {
            throw new Error(`Начало не может быть меньше минимально допустимого (${this.#minBegin})`);
        }
        if (end > this.#maxEnd) {
            throw new Error(`Начало не может быть больше максимально допустимого (${this.#maxEnd})`);
        }
        this.#defaultBegin = begin;
        this.#defaultEnd = end;
        this.restoreDefault();
        return this;
    }

    /**
     * Устанавливает лимиты значений
     * @param {number} minBegin 
     * @param {number} maxEnd
     * @returns возвращает себя для цепного вызова
     */
    limit(minBegin, maxEnd) {
        if (minBegin > maxEnd) {
            throw new Error('Конец диапазона не может быть меньше начала');
        }
        this.#minBegin = minBegin;
        this.#maxEnd = maxEnd;
        return this;
    }

    /**
     * Проверяет, соответствует ли значение объекта дефолтному,
     * возвращает false, если значения по умолчнию не заданы
     */
    isDefault() {
        if (this.#defaultBegin === undefined || this.#defaultEnd === undefined) {
            return false;
        }
        return (this.#defaultBegin === this.#begin && this.#defaultEnd === this.#end);
    }

    /**
     * Приводит значение объекта к дефолтному
     * @returns возвращает себя для цепного вызова
     */
    restoreDefault() {
        if (this.#defaultBegin != null && this.#defaultEnd != null) {
            this.#begin = this.#defaultBegin;
            this.#end = this.#defaultEnd;
        } else {
            this.#begin = 0;
            this.#end = 0;
        }
        return this;
    }

    /**
     * Конвертирует промежуток в строку
     */
    toString() {
        const begin = this.#begin;
        const end = this.#end;

        if (begin === end) { // Если начало и конец равны, возвращается одно число
            return begin.toString();
        } else if (begin === -Infinity && end === Infinity) { // Если начало и конец бесконечны, возвращается "*"
            return '*';
        } else if (begin === -Infinity) { // Если бесконечно начало, возвращается конец с минусом
            return `${end}-`;
        } else if (end === Infinity) { // Если бесконечен конец, возвращается начало с плюсом
            return `${begin}+`;
        } else { // Иначе возвращается промежуток
            return `${begin}..${end}`;
        }
    }

    getBegin() {
        return this.#begin;
    }

    /**
     * @param {number} begin 
     * @returns 
     */
    setBegin(begin) {
        if (typeof begin !== 'number') {
            throw new Error(`Начало интервала должно быть задано числом`);
        }
        if (begin > this.#end) {
            throw new Error('Конец диапазона не может быть меньше начала');
        }
        if (begin < this.#minBegin) {
            throw new Error(`Начало не может быть меньше минимально допустимого (${this.#minBegin})`);
        }
        this.#begin = begin;
        return this;
    }

    getEnd() {
        return this.#end;
    }

    /**
     * @param {number} end 
     * @returns 
     */
    setEnd(end) {
        if (typeof end !== 'number') {
            throw new Error(`Конец интервала должен быть задан числом`);
        }
        if (this.#begin > end) {
            throw new Error('Конец диапазона не может быть меньше начала');
        }
        if (end > this.#maxEnd) {
            throw new Error(`Начало не может быть больше максимально допустимого (${this.#maxEnd})`);
        }
        this.#end = end;
        return this;
    }
}