

class PatternExtension {
    /** @type {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} */
    #kindName = "";
    /** @type {Pattern} */
    #relatedPattern;

    constructor(relatedPattern) {
        if (!(relatedPattern instanceof Pattern)) {
            throw new Error("Расширение может быть только у паттерна");
        }
        this.#relatedPattern = relatedPattern;
    }

    /**
     * Сериализирует данные объекта
     * @param {Object} rawData 
     */
    serializeTo(rawData) {
        rawData.kind = this.#kindName.toLowerCase();
    }

    /**
     * Извлекает необходимые для объекта данные
     * @param {Object} rawData 
     */
    fromRawData(rawData) {
        this.setKindName(rawData.kind);
    }

    /**
     * Обнуляет ссылки объекта
     */
    destroy() {
        this.#relatedPattern = null;
    }

    getKindName() {
        return this.#kindName;
    }

    setKindName(kindName) {
        if (!(typeof kindName === 'string' && ["CELL", "AREA", "ARRAY", "ARRAY-IN-CONTEXT"].includes(kindName.toUpperCase()))) {
            throw new Error(`Неизвестный тип паттерна: ${kindName}. Поддерживаемые: CELL, AREA, ARRAY, ARRAY-IN-CONTEXT`);
        }
        this.#kindName = kindName.toUpperCase();
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
    #maxEnd = infinity;

    /**
     * Конструктор
     * @param {number} begin
     * @param {number} end
     */
    constructor(begin, end) {
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
    }

    /**
     * Парсит диапазон значений из строки
     * @param {String} stringInterval
     * @returns {Interval}
     */
    fromString(stringInterval) {
        // Возвращаем пустышку, если ничего не переданно
        if (!stringInterval) {
            return new Interval(0, 0);
        }

        // Если переданно число, то интервал сокращается до точки
        if (typeof stringInterval === 'number') {
            return new Interval(stringInterval, stringInterval);
        } else if (typeof stringInterval !== "string") { // Выбросить ошибку, если интервал не является строкой или числом
            throw new Error(`Не удается распознать интервал: '${stringInterval}'.`);
        }

        // Удалить пробелы
        stringInterval = stringInterval.replaceAll(/\s+/g, "");

        // Вернуть единичный интервал, если в строке только число (одно)
        if (/^-?\d+$/.test(stringInterval)) {
            let num = parseInt(stringInterval);
            return new Interval(num, num);
        }

        // Если передана * - то интервал бесконечен с обоих концов
        if (stringInterval === '*') {
            return new Interval(-Infinity, Infinity);
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

            return new Interval(begin, end);
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
        this.#begin = this.#defaultBegin;
        this.#end = this.#defaultEnd;
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

    setBegin(begin) {
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

    setEnd(end) {
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