class Grammar {
    /** @type {String[]} */
    static cellTypes = [];
    /** @type {Map<String, Pattern>} */
    static patterns = new Map();
    /** @type {Map<String, Pattern>} */
    static componentsInlinePatterns = new Map();
    /** @type {String} */
    static rootName = null;
    /** @type {String} */
    static cellTypesFilepath = '';

    /**
     * Конвертирует YAML данные в объекты классов
     * @param {Object} yamlData 
     * @returns {Grammar}
     */
    static parse(yamlData) {

        // Проверка типа данных: должен быть объект
        if (!yamlData || typeof yamlData !== 'object') {
            throw new Error("Некорректные данные YAML");
        }

        // Обнуление даных
        this.cellTypes = [];
        this.patterns = new Map();
        this.componentsInlinePatterns = new Map();
        this.rootName = null;
        this.cellTypesFilepath = null;

        // Сохранение пути к файлу с типами ячеек
        if (yamlData.cell_types_filepath) {
            this.cellTypesFilepath = yamlData.cell_types_filepath;
        }

        // Создание объектов паттернов
        for (const [patternName, patternData] of Object.entries(yamlData.patterns)) { // Для каждого паттерна
            try {
                const pattern = this.parsePattern(patternName, patternData); // Парсим паттерн из его данных
                this.patterns.set(patternName, pattern); // Сохраняем паттерн в словарь

                // Обрабатываем корневой паттерн...
                if (pattern.isRoot) { // Если паттерн корневой
                    if (this.rootName) { // Выбрасываем ошибку, если корневой паттерн уже был
                        throw new Error(`Обнаружено несколько корневых паттернов: ${this.rootName} и ${patternName}`);
                    }
                    this.rootName = patternName; // Иначе сохраняем этот паттерн как корневой
                }
            } catch (error) {
                throw new Error(`Ошибка создания паттерна "${patternName}": ${error.message}`); // Выводим ошибку, если не удалось спарсить паттерн
            }
        }

        // Сообщить об ошибке, если не найден корневой паттерн
        if (!Grammar.rootName) {
            throw new Error('Не найден корневой паттерн');
        }

        // Связывание паттернов
        for (const [name, pattern] of this.patterns.entries()) {
            try {
                pattern.resolveLinks();
            } catch (error) {
                throw new Error(`Ошибка установки связей для паттерна "${name}": ${error.message}`);
            }
        }
    }

    /**
     * Конвертирует один паттерн
     * @param {String} name
     * @param {Object} data
     * @returns {Pattern}
     */
    static parsePattern(name, data) {

        // Сообщаем об ошибке, если паттерн не имеет типа
        if (!data.kind) {
            throw new Error(`Паттерн '${name}' не имеет поля 'kind'`);
        }

        const kind = data.kind.toUpperCase();

        if (kind == "CELL")
            return new CellPattern(name, data);
        else if (kind == "ARRAY" || kind == "ARRAY-IN-CONTEXT")
            return new ArrayPattern(name, data);
        else if (kind == "AREA")
            return new AreaPattern(name, data);
        else
            throw new Error(`Неизвестный тип паттерна: ${kind}`);
    }

    /**
     * Парсит диапазон значений
     * @param {string|number} rangeStr
     * @returns {YamlRange}
     */
    static parseYamlRange(rangeStr) {

        // Возвращаем пустышку, если ничего не переданно
        if (!rangeStr) {
            return new YamlRange(0, 0).setUndefined();
        }

        // Если переданно число, то интервал сокращается до точки
        if (typeof rangeStr === 'number') {
            return new YamlRange(rangeStr, rangeStr);
        } else if (typeof rangeStr !== "string") { // Выбросить ошибку, если интервал не является строкой или числом
            throw new Error("Не удается распознать интервал " + rangeStr);
        }

        // Удалить пробелы
        rangeStr = rangeStr.replaceAll(/\s+/g, "");

        // Вернуть единичный интервал, если в строке только число (одно)
        if (/\d+$/.test(rangeStr)) {
            let i = parseInt(rangeStr);
            return new YamlRange(i, i);
        }

        // Если передана * - то интервал любой
        if (rangeStr === '*') {
            return new YamlRange(-Infinity, Infinity);
        }

        // Если в строке точно есть интервал...
        if (rangeStr.includes('..')) {
            const parts = rangeStr.split('..', 2); // Выделяем левую и правую часть интервала

            let begin;
            let end;

            // Парсим левую часть интервала
            if (/\d+$/.test(parts[0])) {
                begin = parseInt(parts[0]);
            } else if (parts[0] == "*") {
                begin = -Infinity;
            } else {
                throw new Error(`Не удается распознать левую часть интервала: '${rangeStr}'.`);
            }

            // Парсим правую часть интервала
            if (/\d+$/.test(parts[1])) {
                end = parseInt(parts[1]);
            } else if (parts[1] == "*") {
                end = Infinity;
            } else {
                throw new Error(`Не удается распознать правую часть интервала: '${rangeStr}'.`);
            }

            return new YamlRange(begin, end);
        }

        if (rangeStr.endsWith('+') || rangeStr.endsWith('-')) {

            let number = rangeStr.slice(0, -1);
            const modifier = rangeStr.slice(-1);

            // Парсим число
            if (/\d+$/.test(number)) {
                number = parseInt(number);
            } else {
                throw new Error(`Не удается распознать число, задающее интервал: '${rangeStr}'.`);
            }

            // Вернуть интервал с бесконечным концом в зависимости от знака
            if (modifier === '+') {
                return new YamlRange(number, Infinity);
            } else {
                return new YamlRange(-Infinity, number);
            }
        }

        throw new Error(`Не удается распознать интервал: '${rangeStr}'.`);
    }

    /**
     * Парсит размер
     * @param {string} sizeStr 
     * @returns {PatternSize}
     */
    static parseSize(sizeStr) {
        if (!sizeStr) return new PatternSize(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined()); // Возвращаем пустышку, если размеры не указаны

        // Удалить пробелы из приведённой к нижнему регистру строки и разделить по "x"
        const parts = sizeStr.toLowerCase().replaceAll(/\s+/g, "").split("x");

        // Выбросить ошибку, если строка не задаёт размер
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error(`Некорректный формат размера: ${sizeStr}. Ожидается формат "ширина x высота"`);
        }

        // Создать объект
        return new PatternSize(
            this.parseYamlRange(parts[0]),
            this.parseYamlRange(parts[1])
        );
    }

    /**
     * Парсит расположение
     * @param {string|Object} locationData 
     * @param {boolean} isInner 
     * @returns {YamlLocation} 
     */
    static parseYamlLocation(locationData, isInner) {

        let padding = new CellOffset(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined());
        let margin = new CellOffset(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined());

        // Для внутреннего компонента стандартный промежуток считается нулевым, для внешнего - бесконечным
        const defaultRange = isInner ? '0' : '*';

        if (typeof locationData === 'string') { // Если расположение задано одной строкой

            // Отделить стороны друг от друга
            const parts = locationData.split(',').map(part => part.trim());

            // Задать соответствующий промежуток для каждой присутствующей стороны
            parts.forEach(part => {
                switch (part) {
                    case 'top': padding.top = this.parseYamlRange(defaultRange); break;
                    case 'right': padding.right = this.parseYamlRange(defaultRange); break;
                    case 'bottom': padding.bottom = this.parseYamlRange(defaultRange); break;
                    case 'left': padding.left = this.parseYamlRange(defaultRange); break;
                    default: throw Error("Не удается распознать сторону " + part);
                }
            });

        } else if (typeof locationData === 'object') { // Иначе если положение задано как пара направление - промежуток
            for (const [key, value] of Object.entries(locationData)) {
                let side = key.trim();
                let range = value;

                // Обработка смешанной записи, где только часть заданных направлений имеют стандартный промежуток, а не указанный явно
                if (typeof value === 'string' && (value.includes('top') || value.includes('bottom')
                    || value.includes('left') || value.includes('right'))) { // Если на месте промежутка оказалось направление
                    side = value; // Вернуть направление на место
                    range = defaultRange; // Считать, что промежуток являтся стандартным
                } else if (typeof value === 'object') { // Иначе если на месте промежутка пара направление - промежуток 
                    [side, range] = Object.entries(value)[0]; // Распаковать объект
                }

                // Выбросить ошибку, если итоговая сторона не задаёт направление
                if (!(side.includes('top') || side.includes('bottom') || side.includes('left') || side.includes('right'))) {
                    throw Error("Не удается распознать сторону " + part);
                }

                // Обработать промежуток
                const offset = this.parseYamlRange(range);

                // Записать промежуток в соответствии с типом и стороной
                if (side.includes('padding')) {
                    side = side.replace('padding-', '');
                    side = side.replace('-padding', '');
                    this.setOffset(padding, side, offset);
                } else if (side.includes('margin')) {
                    side = side.replace('margin-', '');
                    side = side.replace('-margin', '');
                    this.setOffset(margin, side, offset);
                } else if (isInner) {
                    this.setOffset(padding, side, offset);
                } else {
                    this.setOffset(margin, side, offset);
                }
            }
        }

        return new YamlLocation(padding, margin);
    }

    /**
     * Устанавливает значение отступа для стороны
     * @param {CellOffset} offset
     * @param {string} side
     * @param {YamlRange} value
     */
    static setOffset(offset, side, value) {
        switch (side) {
            case 'left': offset.left = value; break;
            case 'top': offset.top = value; break;
            case 'right': offset.right = value; break;
            case 'bottom': offset.bottom = value; break;
            default:
                throw Error(`Неверно задана сторона для отступа: '${side}'. Поддерживаемые стороны: 'top', 'bottom', 'right', 'left'.`);
        }
    }

    /**
     * Конвертирует Grammar в YAML-объект
     * @returns {Object}
     */
    static toYamlObject() {
        const result = {
            patterns: {}
        };

        // Добавление всех паттернов
        for (const [patternName, pattern] of this.patterns) {
            result.patterns[patternName] = pattern.toYaml();
        }

        // Добавление пути к файлу с типами данных, если он присутствует
        if (this.cellTypesFilepath) {
            result.cell_types_filepath = this.cellTypesFilepath;
        }

        return result;
    }
}

class CellOffset {
    /** @type {YamlRange}  */
    left
    /** @type {YamlRange} */
    top
    /** @type {YamlRange} */
    right
    /** @type {YamlRange} */
    bottom

    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}

class YamlLocation {
    /** @type {CellOffset} */
    padding
    /** @type {CellOffset} */
    margin

    constructor(padding, margin) {
        this.padding = padding;
        this.margin = margin;
    }

    /**
     * Конвертирует YamlLocation в YAML-представление
     * @returns {Object}
     */
    toYaml() {
        const { padding, margin } = this;
        const result = {};

        if (padding.left?.isDefined()) {
            result['padding-left'] = padding.left.toYaml();
        }
        if (padding.top?.isDefined()) {
            result['padding-top'] = padding.top.toYaml();
        }
        if (padding.right?.isDefined()) {
            result['padding-right'] = padding.right.toYaml();
        }
        if (padding.bottom?.isDefined()) {
            result['padding-bottom'] = padding.bottom.toYaml();
        }

        if (margin.left?.isDefined()) {
            result['margin-left'] = margin.left.toYaml();
        }
        if (margin.top?.isDefined()) {
            result['margin-top'] = margin.top.toYaml();
        }
        if (margin.right?.isDefined()) {
            result['margin-right'] = margin.right.toYaml();
        }
        if (margin.bottom?.isDefined()) {
            result['margin-bottom'] = margin.bottom.toYaml();
        }

        return result;
    }

    isDefined() {
        const ranges = [
            this.padding?.left,
            this.padding?.top,
            this.padding?.right,
            this.padding?.bottom,
            this.margin?.left,
            this.margin?.top,
            this.margin?.right,
            this.margin?.bottom
        ];
        return ranges.some(range => range?.isDefined() === true);
    }
}

class YamlRange {
    /** @type {number} */
    #begin
    /** @type {number} */
    #end
    /** @type {boolean} */
    #isDefined

    constructor(begin, end) {
        if (begin > end) {
            throw new Error('Конец диапазона не может быть больше начала');
        }
        this.#begin = begin;
        this.#end = end;
        this.#isDefined = true;
    }

    setDefined() {
        this.#isDefined = true;
        return this;
    }

    setUndefined() {
        this.#isDefined = false;
        return this;
    }

    isDefined() {
        return this.#isDefined;
    }

    getBegin() {
        return this.#begin;
    }

    getEnd() {
        return this.#end;
    }

    setBegin(value) {
        if (this.getEnd() < value) {
            throw new Error('Конец диапазона не может быть больше начала');
        }
        this.#begin = value;
        return this;
    }

    setEnd(value) {
        if (this.getBegin > value) {
            throw new Error('Конец диапазона не может быть больше начала');
        }
        this.#end = value;
        return this;
    }

    /**
     * Конвертирует YamlRange в YAML-строку
     * @returns {string}
     */
    toYaml() {
        if (this.isDefined()) {
            const begin = this.getBegin();
            const end = this.getEnd();

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
    }
}

class Component {
    /** @type {String} */
    name
    /** @type {Pattern} */
    parentPattern
    /** @type {String} */
    #parentPatternName
    /** @type {YamlLocation} */
    location
    /** @type {boolean} */
    optional
    /** @type {boolean} */
    isInner

    constructor() {
        if (arguments.length === 3) {
            let componentName = arguments[0];
            let data = arguments[1];
            let isInner = arguments[3];

            this.name = componentName;
            this.isInner = isInner;

            this.location = Grammar.parseYamlLocation(data.location, isInner); // Распознаем позицию элемента

            // Распознаем поле optional
            let optional = data.optional;
            if (optional === null || optional == undefined) optional = false;
            if (!(optional === true || optional === false)) throw new Error("Не удалось распознать поле optional у компонента " + this.name);

            // Запоминаем имя паттерна
            if (data.pattern) {
                this.#parentPatternName = data.pattern;
                this.parentPattern = null;
            } else if (data.pattern_definition) {
                try {
                    this.parentPattern = Grammar.parsePattern("", data.pattern_definition).setInlineDefined();
                } catch (e) {
                    throw new Error(`Не удается распознать вложнный паттерн в компоненте ${this.name}: ${e.message}`);
                }
            } else {
                throw new Error(`Компонент "${this.name}" должен содержать pattern или pattern_definition`);
            }
        } else if (arguments.length === 5) {
            let componentName = arguments[0];
            let parentPattern = arguments[1];
            let location = arguments[2];
            let optional = arguments[3];
            let isInner = arguments[4];

            if (typeof componentName != 'string') {
                throw new Error(`Имя паттерна должно быть строкой`);
            }
            this.name = componentName;

            if (!(parentPattern instanceof Pattern)) {
                throw new Error(`Компонент должен иметь ссылку на паттерн, в котором он находится`);
            }
            this.parentPattern = parentPattern;
            this.#parentPatternName = parentPattern.name;

            if (!(location instanceof YamlLocation)) {
                throw new Error(`Расположение должно быть задано соответствующим объектом`);
            }
            this.location = location;

            if (typeof optional != 'boolean') {
                throw new Error(`optional должно быть логическим значением`);
            }
            this.optional = optional;

            if (typeof isInner != 'boolean') {
                throw new Error(`isInner должно быть логическим значением`);
            }
            this.isInner = isInner;
        }
    }

    /**
     * @param {String} componentName 
     * @param {Pattern} parentPattern 
     * @param {YamlLocation} location 
     * @param {Boolean} optional 
     * @param {Boolean} isInner 
     * @returns {Component}
     */
    static fromDataStructure(componentName, parentPattern, location, optional, isInner) {
        return new Component(componentName, parentPattern, location, optional, isInner);
    }

    static fromYaml(componentName, data, isInner) {
        return new Component(componentName, data, isInner);
    }

    resolveLinks() {
        if(this.#parentPatternName && !this.parentPattern) {
            this.parentPattern = Grammar.patterns.get(this.#parentPatternName);
            if (!this.parentPattern)
            throw new Error(`Не удалось найти паттерн с названием '${this.#parentPatternName}' для привязки к компоненту '${this.name}'.`);
        } else if(this.parentPattern && !this.#parentPatternName) {
            this.parentPattern.resolveLinks();
        } else {
            throw new Error(`Не удалось установить ссылки для компонента: '${this.name}'.`);
        }
    }

    /**
     * Конвертирует Component в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = {};

        if (this.parentPattern) {
            if (this.parentPattern.isInline) {
                result.pattern_definition = this.parentPattern.toYaml();
            } else {
                result.pattern = this.pattern.name;
            }
        }

        if (this.location?.isDefined()) {
            result.location = this.location.toYaml();
        }

        if (this.optional === true) {
            result.optional = true;
        }

        return result;
    }
}

class Pattern {
    /** @type {String} */
    name
    /** @type {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"}  */
    kind
    /** @type {String} */
    desc
    /** @type {YamlRange} */
    countInDoc
    /** @type {YamlRange} */
    width
    /** @type {YamlRange} */
    height
    /** @type {boolean} */
    isRoot
    /** @type {boolean} */
    isInline

    constructor() {
        if (arguments.length === 2) {
            let patternName = arguments[0];
            let data = arguments[1];

            this.name = patternName;
            this.kind = data.kind.toUpperCase();
            this.desc = data.description || "";

            this.countInDoc = new YamlRange(0, 0).setUndefined();
            if (data.count_in_document) this.countInDoc = Grammar.parseYamlRange(data.count_in_document);

            let size = Grammar.parseSize(data.size);
            this.width = size.width;
            this.height = size.height;

            this.isRoot = data.root;
            if (this.isRoot === null || this.isRoot == undefined) this.isRoot = false;
            if (!(this.isRoot === true || this.isRoot === false)) {
                throw new Error(`Паттерн ${patternName} имеет непонятное значение root (${data.root})`);
            }

            this.isInline = false;

        } else if (arguments.length === 8) {
            let patternName = arguments[0];
            let kind = arguments[1];
            let desc = arguments[2];
            let countInDoc = arguments[3];
            let width = arguments[4];
            let height = arguments[5];
            let isRoot = arguments[6];
            let isInline = arguments[7];

            if (typeof patternName != 'string') {
                throw new Error(`Имя паттерна должно быть строкой`);
            }
            this.name = patternName;

            if (!(typeof kind === 'string' && ["CELL", "AREA", "ARRAY", "ARRAY-IN-CONTEXT"].includes(kind.toUpperCase()))) {
                throw new Error(`Неизвестный тип паттерна: ${kind}. Поддерживаемые: CELL, AREA, ARRAY, ARRAY-IN-CONTEXT`);
            }
            this.kind = kind.toUpperCase();

            if (typeof desc != 'string') {
                throw new Error(`Описание паттерна должно быть строкой`);
            }
            this.desc = desc;

            if (!(countInDoc instanceof YamlRange)) {
                throw new Error(`Количество паттернов в документе должно быть задано диапазоном`);
            }
            this.countInDoc = countInDoc;

            if (!(width instanceof YamlRange)) {
                throw new Error(`Ширина паттерна должна быть задана диапазоном`);
            }
            this.width = width;

            if (!(height instanceof YamlRange)) {
                throw new Error(`Высота паттерна должна быть задана диапазоном`);
            }
            this.height = height;

            if (typeof isRoot != 'boolean') {
                 throw new Error(`isRoot должно быть логическим значением`);
            }
            this.isRoot = isRoot;

            if (typeof isInline != 'boolean') {
                 throw new Error(`isInline должно быть логическим значением`);
            }
            this.isInline = isInline;

        } else {
            throw new Error(`Передано неверное количество аргументов для конструктора Pattern`);
        }
    }

    static fromYaml(patternName, data) {
        return new Pattern(patternName, data);
    }

    /**
     * @param {String} patternName 
     * @param {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} kind 
     * @param {String} desc 
     * @param {YamlRange} countInDoc 
     * @param {YamlRange} width 
     * @param {YamlRange} height 
     * @param {Boolean} isRoot 
     * @param {Boolean} isInline 
     * @returns {Pattern}
     */
    static fromDataStructure(patternName, kind, desc, countInDoc, width, height, isRoot, isInline) {
        return new Pattern(patternName, kind, desc, countInDoc, width, height, isRoot, isInline);
    }

    /**
     * Меняет название паттерна
     * @param {String} new_name 
     */
    rename(new_name) {
        if (Grammar.patterns.has(new_name)) {
            throw new Error(`Паттерн с названием ${new_name} уже существует`);
        }
        if (!Grammar.patterns.has(this.name)) {
            throw new Error(`Паттерн с названием ${this.name} не хранится в словаре`);
        }

        Grammar.patterns.delete(this.name);
        Grammar.patterns.set(new_name, this);
        this.name = new_name;
    }

    resolveLinks() {
        // У обычного паттерна нет ссылок
    }

    setInlineDefined() {
        this.isInline = true;
        return this;
    }

    /**
     * Конвертирует Pattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = {
            kind: this.kind.toLowerCase()
        };

        if (this.desc) {
            result.description = this.desc;
        }

        if (this.countInDoc?.isDefined()) {
            result.count_in_document = this.countInDoc.toYaml();
        }

        if (this.width?.isDefined() && this.height?.isDefined()) {
            result.size = this.sizeToYaml(this.width, this.height);
        }

        if (this.isRoot) {
            result.root = true;
        }

        return result;
    }

    /**
     * Конвертирует размер в YAML-строку
     * @param {YamlRange} width
     * @param {YamlRange} height  
     * @returns {string}
     */
    sizeToYaml(width, height) {
        if (width?.isDefined() && height?.isDefined()) {
            return `${width.toYaml()} x ${height.toYaml()}`;
        }
    }
}

class CellPattern extends Pattern {
    /** @type {String} */
    contentType

    constructor() {
        if (arguments.length === 2) {
            let patternName = arguments[0];
            let data = arguments[1];
            super(patternName, data);

            if (data.content_type) {
                if (typeof data.content_type !== "string") {
                    throw new Error(`Тип данных ячейки должен быть строкой.`);
                }
                this.contentType = data.content_type;
            } else {
                throw new Error(`Не задан тип данных для ячейки '${this.name}'.`);
            }
        } else if (arguments.length === 9) {
            let patternName = arguments[0];
            let kind = arguments[1];
            let desc = arguments[2];
            let countInDoc = arguments[3];
            let width = arguments[4];
            let height = arguments[5];
            let isRoot = arguments[6];
            let isInline = arguments[7];
            let contentType = arguments[8];
            super(patternName, kind, desc, countInDoc, width, height, isRoot, isInline);

            if (typeof contentType != 'string') {
                throw new Error(`Тип содержимого паттерна должен быть строкой`);
            }
            this.contentType = contentType;
            
        } else {
            throw new Error(`Передано неверное количество аргументов для конструктора CellPattern`);
        }
    }

    /**
     * @param {String} patternName 
     * @param {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} kind 
     * @param {String} desc 
     * @param {YamlRange} countInDoc 
     * @param {YamlRange} width 
     * @param {YamlRange} height 
     * @param {Boolean} isRoot 
     * @param {Boolean} isInline 
     * @param {String} contentType 
     * @returns {CellPattern}
     */
    static fromDataStructure(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, contentType) {
        return new CellPattern(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, contentType);
    }

    static fromYaml(patternName, data) {
        return new CellPattern(patternName, data);
    }

    resolveLinks() {}

    /**
     * Конвертирует CellPattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = super.toYaml();

        if (this.contentType) {
            result.content_type = this.contentType;
        }

        return result;
    }
}

class ArrayPattern extends Pattern {
    /** @type {"ROW" | "COLUMN" | "FILL"} */
    direction
    /** @type {Pattern} */
    pattern
    /** @type {String} */
    #patternName
    /** @type {YamlRange} */
    gap
    /** @type {YamlRange} */
    itemCount

    constructor() {
        const allowedDirection = ["ROW", "COLUMN", "FILL"];
        
        if (arguments.length == 2) {    
            let patternName = arguments[0];
            let data = arguments[1];   
            super(patternName, data);
        
            if (data.direction) {
                if (!(allowedDirection.includes(data.direction.toUpperCase())))
                    {
                        throw new Error(`Некорректно задано направление для массива: '${data.direction}'. Допустимые: 'row', 'column', 'fill'.`);
                    }
                this.direction = data.direction.toUpperCase();
            } else {
                throw new Error(`Не задано направление для массива '${this.name}'.`);
            }

            if (data.item_pattern) {
                this.#patternName = data.item_pattern;
            } else {
                throw new Error(`Не задан паттерн для массива '${this.name}'.`);
            }

            this.pattern = null;

            if (data.gap) {
                this.gap = Grammar.parseYamlRange(data.gap);
            } else {
                this.gap = new YamlRange(0, 0).setUndefined();
            }

            if (data.item_count) {
                this.itemCount = Grammar.parseYamlRange(data.item_count);
            } else {
                this.itemCount = new YamlRange(0, 0).setUndefined();
            }
        } else if (arguments.length === 12) {
            let patternName = arguments[0];
            let kind = arguments[1];
            let desc = arguments[2];
            let countInDoc = arguments[3];
            let width = arguments[4];
            let height = arguments[5];
            let isRoot = arguments[6];
            let isInline = arguments[7];
            let direction = arguments[8];
            let pattern = arguments[9];
            let gap = arguments[10];
            let itemCount = arguments[11];
            super(patternName, kind, desc, countInDoc, width, height, isRoot, isInline);

            if (!(typeof direction === 'string' && allowedDirection.includes(direction.toUpperCase()))) {
                throw new Error(`Неизвестное направление: ${direction}. Поддерживаемые: ROW, COLUMN, FILL`);
            }
            this.direction = direction.toUpperCase();

            if (!(pattern instanceof Pattern)) {
                throw new Error(`Массив должен иметь ссылку на паттерн находящихся в нём элементов`);
            }
            this.pattern = pattern;
            this.#patternName = pattern.name;

            if (!(gap instanceof YamlRange)) {
                throw new Error(`Промежуток между элементами массива должен быть задан диапазоном`);
            }
            this.gap = gap;

            if (!(itemCount instanceof YamlRange)) {
                throw new Error(`Количество элементов массива должно быть задано диапазоном`);
            }
            this.itemCount = itemCount;
        } else {
            throw new Error(`Передано неверное количество аргументов для конструктора ArrayPattern`);
        }
    }

    /**
     * @param {String} patternName 
     * @param {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} kind 
     * @param {String} desc 
     * @param {YamlRange} countInDoc 
     * @param {YamlRange} width 
     * @param {YamlRange} height 
     * @param {Boolean} isRoot 
     * @param {Boolean} isInline 
     * @param {"ROW" | "COLUMN" | "FILL"} direction 
     * @param {Pattern} pattern 
     * @param {YamlRange} gap
     * @param {YamlRange} itemCount  
     * @returns {Pattern}
     */
    static fromDataStructure(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, direction, pattern, gap, itemCount) {
        return new ArrayPattern(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, direction, pattern, gap, itemCount);
    }

    static fromYaml(patternName, data) {
        return new ArrayPattern(patternName, data);
    }

    resolveLinks() {
        if(!this.#patternName) return;
        this.pattern = Grammar.patterns.get(this.#patternName);
        if (!this.pattern)
            throw new Error(`Не удалось найти паттерн с названием '${this.#patternName}' для установления связи с массивом '${this.name}'.`);
    }

    /**
     * Конвертирует ArrayPattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = super.toYaml();

        if (this.direction) {
            result.direction = this.direction.toLowerCase();
        }

        if (this.pattern) {
            result.item_pattern = this.pattern.name;
        }

        if (this.itemCount?.isDefined()) {
            result.item_count = this.itemCount.toYaml();
        }

        if (this.gap?.isDefined()) {
            result.gap = this.gap.toYaml();
        }

        return result;
    }
}

class AreaPattern extends Pattern {
    /** @type {Component[]} */
    components

    constructor() {
        if (arguments.length === 2) {
            let patternName = arguments[0];
            let data = arguments[1];
            super(patternName, data);

            // Спарсить компоненты
            this.components = [];

            if (data.inner) { // Если область имеет внутренние компоненты
                for (const [componentName, componentData] of Object.entries(data.inner)) { // Для каждого внутреннего компонента...
                    const component = new Component(componentName, componentData, true); // Распознаем компонент
                    this.components.push(component);
                }
            }

            if (data.outer) { // Если область имеет внешние компоненты
                for (const [componentName, componentData] of Object.entries(data.outer)) { // Для каждого внешнего компонента...
                    const component = new Component(componentName, componentData, false); // Распознаем компонент
                    this.components.push(component);
                }
            }

        } else if (arguments.length === 8) {
            let patternName = arguments[0];
            let kind = arguments[1];
            let desc = arguments[2];
            let countInDoc = arguments[3];
            let width = arguments[4];
            let height = arguments[5];
            let isRoot = arguments[6];
            let isInline = arguments[7];
            super(patternName, kind, desc, countInDoc, width, height, isRoot, isInline);

            this.components = [];
            
        } else {
            throw new Error(`Передано неверное количество аргументов для конструктора CellPattern`);
        }
    }

    /**
     * @param {String} patternName 
     * @param {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} kind 
     * @param {String} desc 
     * @param {YamlRange} countInDoc 
     * @param {YamlRange} width 
     * @param {YamlRange} height 
     * @param {Boolean} isRoot 
     * @param {Boolean} isInline 
     * @param {String} contentType 
     * @returns {AreaPattern}
     */
    static fromDataStructure(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, contentType) {
        return new AreaPattern(patternName, kind, desc, countInDoc, width, height, isRoot, isInline, contentType);
    }

    static fromYaml(patternName, data) {
        return new AreaPattern(patternName, data);
    }

    resolveLinks() {
        for (let i = 0; i < this.components.length; ++i) {
            this.components[i].resolveLinks();
        }
    }

    /**
     * Конвертирует AreaPattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = super.toYaml();

        // Если у области есть более одного компонента
        if (this.components && this.components.length > 0) {

            // Добавить компоненты в зависимости от их расположения (inner или outer)
            for (const component of this.components) {
                if (component.isInner) {
                    // Создать поле inner, если его нет
                    if (!result.inner) result.inner = {};
                    result.inner[component.name] = component.toYaml();
                } else {
                    // Создать поле outer, если его нет
                    if (!result.outer) result.outer = {};
                    result.outer[component.name] = component.toYaml();
                }
            }
        }

        return result;
    }
}

class PatternSize {
    /** @type {YamlRange} */
    width
    /** @type {YamlRange} */
    height

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}