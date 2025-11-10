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
        if (!yamlData || typeof yamlData !== 'object') {
            throw new Error("Некорректные данные YAML");
        }

        if (yamlData.cell_types_filepath) {
            this.cellTypesFilepath = yamlData.cell_types_filepath;
        }

        this.cellTypes = [];
        this.patterns = new Map();
        this.rootName = null;

        for (const [patternName, patternData] of Object.entries(yamlData.patterns)) {
            try {
                const pattern = this.parsePattern(patternName, patternData);
                this.patterns.set(patternName, pattern);

                if (pattern.isRoot) {
                    if (this.rootName) {
                        throw new Error(`Обнаружено несколько корневых паттернов: ${this.rootName} и ${patternName}`);
                    }
                    this.rootName = patternName;
                }
            } catch (error) {
                throw new Error(`Ошибка создания паттерна "${patternName}": ${error.message}`);
            }
        }

        for (const [patternName, patternData] of Object.entries(yamlData.patterns)) {
            try {
                this.setPatternRelations(this.patterns.get(patternName), patternData);
            } catch (error) {
                throw new Error(`Ошибка установки связей для паттерна "${patternName}": ${error.message}`);
            }
        }

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
        if (!data.kind) {
            throw new Error(`Паттерн '${name}' не имеет поля 'kind'`);
        }

        const kind = data.kind.toUpperCase();
        const desc = data.description || '';
        const countInDoc = this.parseRange(data.count_in_document);
        const size = this.parseSize(data.size);
        const isRoot = data.root === true;

        switch (kind) {
            case 'CELL':
                return new CellPattern(
                    name,
                    kind,
                    desc,
                    countInDoc,
                    size?.width || new Range(1, 1),
                    size?.height || new Range(1, 1),
                    isRoot,
                    data.content_type
                );

            case 'ARRAY':
                return new ArrayPattern(
                    name,
                    kind,
                    desc,
                    countInDoc,
                    size?.width || new Range(1, 1),
                    size?.height || new Range(1, 1),
                    isRoot,
                    data.direction?.toUpperCase() || 'ROW',
                    null,
                    this.parseRange(data.gap),
                    this.parseRange(data.item_count),
                    false
                );
                
            case 'ARRAY-IN-CONTEXT':
                return new ArrayPattern(
                    name,
                    kind,
                    desc,
                    countInDoc,
                    size?.width || new Range(1, 1),
                    size?.height || new Range(1, 1),
                    isRoot,
                    data.direction?.toUpperCase() || 'ROW',
                    null,
                    this.parseRange(data.gap),
                    this.parseRange(data.item_count),
                    true
                );

            case 'AREA':
                return new AreaPattern(
                    name,
                    kind,
                    desc,
                    countInDoc,
                    size?.width || new Range(1, 1),
                    size?.height || new Range(1, 1),
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
        if (pattern instanceof ArrayPattern) {
            this.setArrayRelations(pattern, data);
        } else if (pattern instanceof AreaPattern) {
            this.setAreaRelations(pattern, data);
        }
    }

    /**
     * Устанавливает связи для массива
     * @param {ArrayPattern} arrayPattern 
     * @param {Object} data 
     */
    static setArrayRelations(arrayPattern, data) {
        if (!data.item_pattern) {
            throw new Error('Массив должен содержать item_pattern');
        }

        const patternName = data.item_pattern;
        const itemPattern = this.patterns.get(patternName);

        if (!itemPattern) {
            throw new Error(`Паттерн "${patternName}" не найден`);
        }

        arrayPattern.pattern = itemPattern;
    }

    /**
     * Устанавливает связи для области
     * @param {AreaPattern} areaPattern
     * @param {Object} data 
     */
    static setAreaRelations(areaPattern, data) {
        areaPattern.components = [];

        if (data.inner) {
            for (const [componentName, componentData] of Object.entries(data.inner)) {
                const component = this.parseComponent(areaPattern.name, componentName, componentData, true);
                areaPattern.components.push(component);
            }
        }

        if (data.outer) {
            for (const [constraintName, constraintData] of Object.entries(data.outer)) {
                const constraint = this.parseComponent(areaPattern.name, constraintName, constraintData, false);
                areaPattern.components.push(constraint);
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
        const location = this.parseLocation(componentData.location);
        const optional = componentData.optional === true;

        let referencedPattern;

        if (componentData.pattern) {
            referencedPattern = this.patterns.get(componentData.pattern);
            if (!referencedPattern) {
                throw new Error(`Не удалось найти паттерн "${componentData.pattern}" для компонента "${componentName}"`);
            }
        } else if (componentData.pattern_definition) {
            const referencedPatternName = `${parentName}__${componentName}`;
            try {
                referencedPattern = this.parsePattern(referencedPatternName, componentData.pattern_definition);
                this.patterns.set(referencedPatternName, referencedPattern);
                this.setPatternRelations(referencedPattern, componentData.pattern_definition);
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
     * @returns {Range}
     */
    static parseRange(rangeStr) {
        if (!rangeStr) {
            return new Range(0, 0);
        }

        if (typeof rangeStr === 'number') {
            return new Range(rangeStr, rangeStr);
        }

        if (rangeStr === '*') {
            return new Range(-Infinity, Infinity);
        }
        
        if (rangeStr.includes('..')) {
            const parts = rangeStr.split('..');

            if (parts.length !== 2) {
                throw new Error(`Некорректный формат диапазона: ${rangeStr}`);
            }

            let begin = parseInt(parts[0]);
            let end = parseInt(parts[1]);

            if (parts[0] === '*') {
                begin = -Infinity;
            }
            if (parts[1] === '*') {
                end = Infinity;
            }

            if (isNaN(begin) || (isNaN(end))) {
                throw new Error(`Некорректный формат диапазона: ${rangeStr}`);
            }

            return new Range(begin, end);
        }

        if (rangeStr.endsWith('+') || rangeStr.endsWith('-')) {
            const number = parseInt(rangeStr.slice(0, -1));
            const modifier = rangeStr.slice(-1);

            if (isNaN(number)) {
                throw new Error(`Некорректный формат диапазона: ${rangeStr}`);
            }

            if (modifier === '+') {
                return new Range(number, Infinity);
            } else {
                return new Range(-Infinity, number);
            }
        }
    }

    /**
     * Парсит размер
     * @param {string} sizeStr 
     * @returns {Object}
     */
    static parseSize(sizeStr) {
        if (!sizeStr) return null;

        const parts = sizeStr.trim().split(/\s*x\s*/);

        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error(`Некорректный формат размера: ${sizeStr}. Ожидается формат "ширина x высота"`);
        }

        return {
            width: this.parseRange(parts[0]),
            height: this.parseRange(parts[1])
        };
    }

    /**
     * Парсит расположение
     * @param {string|Object} locationData 
     * @returns {Location} 
     */
    static parseLocation(locationData) {
        if (!locationData) return null;

        let padding = new CellOffset(new Range(0, 0), new Range(0, 0), new Range(0, 0), new Range(0, 0));
        let margin = new CellOffset(new Range(0, 0), new Range(0, 0), new Range(0, 0), new Range(0, 0));

        if (typeof locationData === 'string') {
            const parts = locationData.split(',').map(part => part.trim());
            parts.forEach(part => {
                switch (part) {
                    case 'top': padding.top = new Range(0, 0); break;
                    case 'right': padding.right = new Range(0, 0); break;
                    case 'bottom': padding.bottom = new Range(0, 0); break;
                    case 'left': padding.left = new Range(0, 0); break;
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
                const offset = this.parseRange(range);

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

        return new Location(padding, margin);
    }

    /**
     * Устанавливает значение отступа для стороны
     * @param {CellOffset} offset
     * @param {string} side
     * @param {Range} value
     */
    static setOffset(offset, side, value) {
        switch (side) {
            case 'left': offset.left = value; break;
            case 'top': offset.top = value; break;
            case 'right': offset.right = value; break;
            case 'bottom': offset.bottom = value; break;
        }
    }
}

class CellOffset {
    /** @type {Range}  */
    left
    /** @type {Range} */
    top
    /** @type {Range} */
    right
    /** @type {Range} */
    bottom

    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}

class Location {
    /** @type {CellOffset} */
    padding
    /** @type {CellOffset} */
    margin

    constructor(padding, margin) {
        this.padding = padding;
        this.margin = margin;
    }
}

class Range {
    /** @type {number} */
    #begin
    /** @type {number} */
    #end

    constructor(begin, end) {
        if (begin > end) {
            throw new Error('Конец диапазона не может быть больше начала');
        }
        this.#begin = begin;
        this.#end = end;
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
    }

    setEnd(value) {
        if (this.getBegin > value) {
            return;
        }
        this.#end = value;
    }
}

class Component {
    /** @type {String} */
    name
    /** @type {Pattern} */
    pattern
    /** @type {Location} */
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
}

class Pattern {
    /** @type {String} */
    name
    /** @type {"CELL" | "AREA" | "ARRAY"}  */
    kind
    /** @type {String} */
    desc
    /** @type {Range} */
    countInDoc
    /** @type {Range} */
    width
    /** @type {Range} */
    height
    /** @type {boolean} */
    isRoot

    constructor(name, kind, desc, countInDoc, width, height, isRoot) {
        this.name = name;
        this.kind = kind;
        this.desc = desc;
        this.countInDoc = countInDoc;
        this.width = width;
        this.height = height;
        this.isRoot = isRoot;
    }
}

class CellPattern extends Pattern {
    /** @type {String} */
    contentType

    constructor(name, kind, desc, countInDoc, width, height, isRoot, contentType) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.contentType = contentType;
    }
}

class ArrayPattern extends Pattern {
    /** @type {"ROW" | "COL" | "FILL"} */
    direction
    /** @type {Pattern} */
    pattern
    /** @type {Range} */
    gap
    /** @type {Range} */
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
}

class AreaPattern extends Pattern {
    /** @type {Component[]} */
    components

    constructor(name, kind, desc, countInDoc, width, height, isRoot, components) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.components = components;
    }
}

