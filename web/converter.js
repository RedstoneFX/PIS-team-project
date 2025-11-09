const yaml = require('js-yaml');

class Grammar {
    /** @type {String[]} */
    static cellTypes = [];
    /** @type {Map<String, Pattern>} */
    static patterns = new Map();
    /** @type {String} */
    static rootName = null;

    rootName

    constructor(cellTypes, patterns, rootName) {
        this.cellTypes = cellTypes;
        this.patterns = patterns;
        this.rootName = rootName;
    }
}

class CellOffset {
    /** @type {number}  */
    left
    /** @type {number} */
    top 
    /** @type {number} */
    right 
    /** @type {number} */
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

class Cell extends Pattern {
    /** @type {String} */
    contentType

    constructor(name, kind, desc, countInDoc, width, height, isRoot, contentType) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.contentType = contentType;
    }
}

class Array extends Pattern {
    /** @type {"ROW" | "COL" | "FILL"} */
    direction
    /** @type {Pattern} */
    pattern
    /** @type {Range} */
    gap
    /** @type {Range} */
    itemCount

    constructor(name, kind, desc, countInDoc, width, height, isRoot, direction, pattern, gap, itemCount) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.direction = direction;
        this.pattern = pattern;
        this.gap = gap; 
        this.itemCount = itemCount;
    }
}

class Area extends Pattern {
    /** @type {Component[]} */
    components

    constructor(name, kind, desc, countInDoc, width, height, isRoot, components) {
        super(name, kind, desc, countInDoc, width, height, isRoot);
        this.components = components;
    }
}

