class Grammar {
    /** @type {String[]} */
    static cellTypes = [];
    /** @type {Map<String, Pattern>} */
    static patterns = new Map();
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

        // Связывание паттернов
        for (const [patternName, patternData] of Object.entries(yamlData.patterns)) { // Для каждого паттерна
            try {
                this.setPatternRelations(this.patterns.get(patternName), patternData); // Попытаться связать паттерн
            } catch (error) {
                throw new Error(`Ошибка установки связей для паттерна "${patternName}": ${error.message}`);
            }
        }

        // Сообщить об ошибке, если не найден корневой паттерн
        if (!Grammar.rootName) {
            throw new Error('Не найден корневой паттерн');
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

        // Считываем данные
        const kind = data.kind.toUpperCase();
        const desc = data.description || '';
        let countInDoc = new YamlRange(0, 0).setUndefined();

        // Считываем количество вхождений паттерна в документ
        // TODO: может выкинуть ошибку?
        if (data.count_in_document) {
            countInDoc = this.parseYamlRange(data.count_in_document);
        }

        // Считываем размер паттерна в клетках
        let size = this.parseSize(data.size);

        // Считываем isRoot
        const isRoot = data.root;
        if(isRoot === null) isRoot = false;
        if(!(data.root === true || data.root === false))
            throw new Error(`Паттерн ${name} имеет непонятное значение root (${data.root})`);
        

        // Возвращаем паттерн определенного типа, в зависимости от поля kind
        switch (kind) {
            case 'CELL':
                return new CellPattern(
                    name,
                    kind, // TODO: а клетке нужно помнить о том, что она клетка?
                    desc,
                    countInDoc,
                    size.width,
                    size.height,
                    isRoot,
                    data.content_type
                );

            case 'ARRAY':
                return new ArrayPattern(
                    name,
                    kind, // окей, допустим, аррэй может быть разных типов
                    desc,
                    countInDoc,
                    size.width,
                    size.height,
                    isRoot,
                    data.direction?.toUpperCase() || 'ROW',
                    null,
                    this.parseYamlRange(data.gap),
                    this.parseYamlRange(data.item_count),
                    false
                );
                
            case 'ARRAY-IN-CONTEXT':
                return new ArrayPattern(
                    name,
                    kind, // окей, допустим, аррэй может быть разных типов
                    desc,
                    countInDoc,
                    size.width,
                    size.height,
                    isRoot,
                    data.direction?.toUpperCase() || 'ROW',
                    null,
                    this.parseYamlRange(data.gap),
                    this.parseYamlRange(data.item_count),
                    true
                );

            case 'AREA':
                return new AreaPattern(
                    name,
                    kind,
                    desc,
                    countInDoc,
                    size.width ,
                    size.height,
                    isRoot,
                    []
                );

            default:
                throw new Error(`Неизвестный тип паттерна: ${kind}`);
        }
    }

    /**
     * Устанавливает связи между паттернами
     * @param {Pattern} pattern
     * @param {Object} data
     */
    static setPatternRelations(pattern, data) {
        if (pattern instanceof ArrayPattern) { // Если этот паттерн - массив
            this.setArrayRelations(pattern, data);
        } else if (pattern instanceof AreaPattern) { // Если этот паттерн - область
            this.setAreaRelations(pattern, data);
        }
    }

    /**
     * Устанавливает связи для массива
     * @param {ArrayPattern} arrayPattern 
     * @param {Object} data 
     */
    static setArrayRelations(arrayPattern, data) {
        if (!data.item_pattern) { // Выбросить ошибку, если у этого массива нет элементов
            throw new Error('Массив должен содержать item_pattern');
        }

        const patternName = data.item_pattern; // Извлекаем имя паттерна-элемента
        const itemPattern = this.patterns.get(patternName); // Находим паттерн с таким названием

        if (!itemPattern) { // Сообщаем об ошибке, если не удалось найти такой паттерн
            throw new Error(`Не удалось найти паттерн "${patternName}" для массива`); 
        }

        arrayPattern.pattern = itemPattern; // Привязываем паттерн к текущему как элемент
    }

    /**
     * Устанавливает связи для области
     * @param {AreaPattern} areaPattern
     * @param {Object} data 
     */
    static setAreaRelations(areaPattern, data) {
        areaPattern.components = []; // Очищаем список компонентов области

        if (data.inner) { // Если... У области есть внутренняя часть?? 
            for (const [componentName, componentData] of Object.entries(data.inner)) { // Для каждого внутреннего компонента...
                const component = this.parseComponent(areaPattern.name, componentName, componentData, true); // Распознаем компонент
                areaPattern.components.push(component); // Добавляем компонент в список компонентов
            }
        }

        if (data.outer) { // Если... У области есть внешняя часть?? 
            for (const [constraintName, constraintData] of Object.entries(data.outer)) { // Для каждого внешнего компонента...
                const constraint = this.parseComponent(areaPattern.name, constraintName, constraintData, false); // Распознаем компонент
                areaPattern.components.push(constraint); // Добавляем компонент в список компонентов
            }
        }
    }

    /**
     * Конвертирует один компонент
     * @param {string} componentName
     * @param {Object} componentData
     * @param {boolean} isInner 
     * @returns {Component} 
     */
    static parseComponent(parentName, componentName, componentData, isInner) {
        const location = this.parseYamlLocation(componentData.location); // Распознаем позицию элемента

        // Распознаем поле optional
        let optional = componentData.optional; 
        if(optional === null) optional = false;
        if(!(optional === true || optional === false)) throw new Error("Не удалось распознать поле optional у компонента " + componentName);

        let referencedPattern;

        if (componentData.pattern) { // Если данный компонент имеет поле pattern
            referencedPattern = this.patterns.get(componentData.pattern); // ищем паттерн с таким именем
            if (!referencedPattern) { // Сообщаем об ошибке, если такого компонента нет
                throw new Error(`Не удалось найти паттерн "${componentData.pattern}" для компонента "${componentName}"`);
            }
        } else if (componentData.pattern_definition) { // Если данный компонент объявляет паттерн непосредственно...
            const referencedPatternName = `${parentName}__${componentName}`; // Генерируем новое имя для паттерна
            try {
                referencedPattern = this.parsePattern(referencedPatternName, componentData.pattern_definition).setInlineDefined();  // Распознаем внутренний паттерн
                this.componentsInlinePatterns.set(referencedPatternName, referencedPattern); // Добавляем паттерн в словарь паттернов для компонентов
                this.setPatternRelations(referencedPattern, componentData.pattern_definition); // Связываем паттерн
            } catch (error) {
                throw new Error(`Ошибка создания паттерна для компонента "${componentName}": ${error.message}`);
            }
        } else {
            throw new Error(`Компонент "${componentName}" должен содержать pattern или pattern_definition`);
        }

        return new Component(
            componentName,
            referencedPattern,
            location,
            optional,
            isInner
        );
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
        }

        // Если переданна не строка, то я хз, что делать
        if(typeof rangeStr != "string") {
            throw new Error("Не удается распознать интервал " + rangeStr);
        }

        // Если передана * - то интервал любой
        if (rangeStr === '*') {
            return new YamlRange(-Infinity, Infinity); // Жеееесть, но ОК
        }
        
        // Если в строке точно есть интервал...
        if (rangeStr.includes('..')) { 
            const parts = rangeStr.split('..', 2); // Выделяем левую и правую часть интервала

            let begin;
            let end;

            // Парсим левую часть интервала
            if(parts[0].test(/\d+/)) { 
                begin = parseInt(parts[0]);
            } else if(parts[0] == "*"){
                begin = -Infinity;
            } else {
                throw new Error("Не удается распознать левую часть интервала " + rangeStr);
            }

            // Парсим правую часть интервала
            if(parts[1].test(/\d+/)) { 
                begin = parseInt(parts[1]);
            } else if(parts[1] == "*"){
                begin = -Infinity;
            } else {
                throw new Error("Не удается распознать правую часть интервала " + rangeStr);
            }

            return new YamlRange(begin, end);
        }

        if (rangeStr.endsWith('+') || rangeStr.endsWith('-')) {

            let number = rangeStr.slice(0, -1);
            const modifier = rangeStr.slice(-1);

            // Парсим число
            if(number.test(/\d+/)) { 
                number = parseInt(number);
            } else {
                throw new Error("Не удается распознать число в интервале: " + rangeStr);
            }

            if (modifier === '+') {
                return new YamlRange(number, Infinity);
            } else if (modifier === '-') {
                return new YamlRange(-Infinity, number);
            } else {
                throw new Error("Не удается распознать модификатор в интервале: " + rangeStr);
            }
        }

        throw new Error("Не удается распознать интервал " + rangeStr);
    }

    /**
     * Парсит размер
     * @param {string} sizeStr 
     * @returns {PatternSize}
     */
    static parseSize(sizeStr) {
        if (!sizeStr) return new PatternSize(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined()); // Возвращаем пустышку, если размеры не указаны

        const parts = sizeStr.toLowerCase().replaceAll(" ", "") .split("x");

        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error(`Некорректный формат размера: ${sizeStr}. Ожидается формат "ширина x высота"`);
        }

        return new PatternSize(
            this.parseYamlRange(parts[0]),
            this.parseYamlRange(parts[1])
        );
    }

    /**
     * Парсит расположение
     * @param {string|Object} locationData 
     * @returns {YamlLocation} 
     */
    static parseYamlLocation(locationData) {
        if (!locationData) return null;

        let padding = new CellOffset(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined());
        let margin = new CellOffset(new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined(), new YamlRange(0, 0).setUndefined());

        if (typeof locationData === 'string') {
            const parts = locationData.split(',').map(part => part.trim());
            parts.forEach(part => {
                switch (part) {
                    case 'top': padding.top = new YamlRange(0, 0); break;
                    case 'right': padding.right = new YamlRange(0, 0); break;
                    case 'bottom': padding.bottom = new YamlRange(0, 0); break;
                    case 'left': padding.left = new YamlRange(0, 0); break;
                }
            });
        } else if (typeof locationData === 'object') {
            for (const [key, value] of Object.entries(locationData)) {
                let side = key;
                let range = value;
                if (typeof value === 'string' && (value.includes('top') || value.includes('bottom')
                                              || value.includes('left') || value.includes('right'))) {
                    side = value;
                    range = 0;
                } else if (typeof value === 'object') {
                    [side, range] = Object.entries(value)[0];
                }
                const offset = this.parseYamlRange(range);

                if (side.startsWith('padding-') || side.endsWith('-padding')) {
                    side = side.replace('padding-', '');
                    side = side.replace('-padding', '');
                    this.setOffset(padding, side, offset);
                } else if (side.startsWith('margin-') || side.endsWith('-margin')) {
                    side = side.replace('margin-', '');
                    side = side.replace('-margin', '');
                    this.setOffset(margin, side, offset);
                } else {
                    this.setOffset(padding, side, offset);
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

        for (const [patternName, pattern] of this.patterns) {
            result.patterns[patternName] = pattern.toYaml();
        }

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
     * @returns {string|Object}
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
            return;
        }
        this.#begin = value;
        return this;
    }

    setEnd(value) {
        if (this.getBegin > value) {
            return;
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

            if (begin === end) {
                return begin.toString();
            } else if (begin === -Infinity && end === Infinity) {
                return '*';
            } else if (begin === -Infinity) {
                return `${end}-`;
            } else if (end === Infinity) {
                return `${begin}+`;
            } else {
                return `${begin}..${end}`;
            }
        }
    }
}

class Component {
    /** @type {String} */
    name
    /** @type {Pattern} */
    pattern
    /** @type {YamlLocation} */
    location
    /** @type {boolean} */
    optional
    /** @type {boolean} */
    inner

    constructor(name, pattern, location, optional, inner) {
        this.name = name;
        this.pattern = pattern;
        this.location = location;
        this.optional = optional;
        this.inner = inner;
    }

    /**
     * Конвертирует Component в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = {};

        if (this.pattern) {
            result.pattern = this.pattern.name;
        }

        if (this.location) {
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
    /** @type {"CELL" | "AREA" | "ARRAY"}  */
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

    constructor(name, kind, desc, countInDoc, width, height, isRoot) {
        this.name = name;
        this.kind = kind;
        this.desc = desc;
        this.countInDoc = countInDoc;
        this.width = width;
        this.height = height;
        this.isRoot = isRoot;
        this.isInline = false;
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
            description: this.desc,
            kind: this.kind.toLowerCase()
        };

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

    constructor(name, kind, desc, countInDoc, width, height, isRoot, contentType) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.contentType = contentType;
    }

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
    /** @type {"ROW" | "COL" | "FILL"} */
    direction
    /** @type {Pattern} */
    pattern
    /** @type {YamlRange} */
    gap
    /** @type {YamlRange} */
    itemCount
    /** @type {Boolean} */
    isInContext

    constructor(name, kind, desc, countInDoc, width, height, isRoot, direction, pattern, gap, itemCount, isInContext) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.direction = direction;
        this.pattern = pattern;
        this.gap = gap;
        this.itemCount = itemCount;
        this.isInContext = isInContext;
    }

    /**
     * Конвертирует ArrayPattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = super.toYaml();

        if (this.isInContext) {
            result.kind = 'array-in-context';
        }
        
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

    constructor(name, kind, desc, countInDoc, width, height, isRoot, components) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.components = components;
    }

    /**
     * Конвертирует AreaPattern в YAML-объект
     * @returns {Object}
     */
    toYaml() {
        const result = super.toYaml();
        
        if (this.components && this.components.length > 0) {
           
            for (const component of this.components) {
                if (component.inner) {
                    if (!result.inner) result.inner = {};
                    result.inner[component.name] = component.toYaml();
                } else {
                    if (!result.outer) result.outer = {};
                    result.outer[component.name] = component.toYaml();
                }
            }
        }

        return result;
    }
}

class PatternSize {
    constructor(width, height) {
        this.width = width;
        this.height  = height;
    }
}