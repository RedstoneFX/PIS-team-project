Поля:
- `#description`
- `#kind` - [[PatternExtension]]
- `#width` - [[Interval]]
- `#height` - [[Interval]]
- `#countInDocument` - [[Interval]]
- `#style` - объект, сохраняющий неиспользуемые данные стиля
- `#id` - уникальный идентификатор паттерна
- `static #idCouner = 0;` - счётчик созданных паттернов

Методы:
- [[Pattern.constructor()]] - конструктор
- [[Pattern.getId()]] - возвращает идентификатор
- [[Pattern.resolveKindFromRawData(rawData, grammar)]] - генерирует расширение для текущего паттерна на основе сырых данных
- [[Pattern.fromRawData(rawData)]] - извлекает необходимые для объекта данные
- [[Pattern.serialize()]] - сериализирует данные объекта
- [[Pattern.destroy()]] - обнуляет ссылки объекта
- [[Pattern.setKind(kind)]]
- [[Pattern.getKind()]]
- [[Pattern.setDescription(description)]]
- [[Pattern.getDescription()]]
- [[Pattern.setWidth(widthBegin, widthEnd)]]
- [[Pattern.getWidth()]]
- [[Pattern.setHeight(heightBegin, heightEnd)]]
- [[Pattern.getHeight()]]
- [[Pattern.setCountInDocument(countBegin, countEnd)]]
- [[Pattern.getCountInDocument()]]


```js
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
    /** @type {number} */
    #id;
    /** @type {number} */
    static #idCouner = 0;
	
	constructor() {}
	getId() {}
	resolveKindFromRawData(rawData, grammar) {}
	fromRawData(rawData) {}
	serialize(grammar) {}
	destroy() {}
	setKind(kind) {}
	getKind() {}
	setDescription(description) {}
	getDescription() {}
	setWidth(widthBegin, widthEnd) {}
    getWidth() {}
    setHeight(heightBegin, heightEnd) {}
    getHeight() {}
    setCountInDocument(countBegin, countEnd) {}
    getCountInDocument() {}
}
```