Поля:
- `#begin`
- `#end`
- `#defaultBegin`
- `#defailtEnd`
- `#minBegin`
- `#maxEnd`

Методы:
- [[Interval.constructor(begin, end)]] - конструктор
- [[Interval.update(begin, end)]] - устанавливает начало и конец интервала
- [[Interval.fromString(stringInterval)]] - парсит диапазон значений из строки
- [[Interval.default(begin, end)]] - устанавливает дефолтные значения и приводит к ним значение объекта
- [[Interval.restoreDefault()]] - приводит значение объекта к дефолтному
- [[Interval.isDefault()]] - проверяет, соответствует ли значение объекта дефолтному; возвращает false, если значения по умолчанию не заданы
- [[Interval.limit(minBegin, maxEnd)]] - устанавливает лимиты значений
- [[Interval.toString()]] - конвертирует промежуток в строку или число, если возможно
- [[Interval.getBegin()]]
- [[Interval.setBegin()]]
- [[Interval.getEnd()]]
- [[Interval.setEnd()]]
- [[getMinBegin()]]
- [[getMaxEnd() {}]]
- [[getDefaultBegin()]]
- [[getDefaultEnd() {}]]


```js
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

    constructor(begin, end) {}
    update(begin, end) {}
    fromString(stringInterval) {}
    default(begin, end) {}
    restoreDefault() {}
    isDefault() {}
    limit(minBegin, maxEnd) {}
    toString() {}
    getBegin() {}
    setBegin(begin) {}
    getEnd() {}
    setEnd(end) {}
    getMinBegin() {}
    getMaxEnd() {}
    getDefaultBegin() {}
    getDefaultEnd() {}
}
```