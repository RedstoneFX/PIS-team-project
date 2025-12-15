Наследуется от [[PatternExtension]]

Поля:
- `#direction`
- `#itemPattern`
- `#itemCount`
- `#gap`

Методы:
- [[ArrayPatternExtension.constructor]] - конструктор
- [[ArrayPatternExtension.fromRawData(rawData, grammar)]] - извлекает необходимые для объекта данные
- [[ArrayPatternExtension.serializeTo(rawData, grammar)]] - сериализирует данные объекта
- [[ArrayPatternExtension.destroy()]] - обнуляет ссылки объекта
- [[ArrayPatternExtension.setDirection(direction)]]
- [[ArrayPatternExtension.getDirection()]]
- [[ArrayPatternExtension.setItemPattern(pattern)]]
- [[ArrayPatternExtension.getItemPattern()]]
- [[ArrayPatternExtension.setItemCount(countBegin, countEnd)]]
- [[ArrayPatternExtension.getItemCount()]]
- [[ArrayPatternExtension.setGap(gapBegin, gapEnd) {]]
- [[ArrayPatternExtension.getGap()]]

```js
class ArrayPatternExtension extends PatternExtension {
    /** @type {"COLUMN" | "ROW" | "FILL"} */
    #direction = "ROW";
    /** @type {Pattern} */
    #itemPattern = null;
    /** @type {Interval} */
    #itemCount = new Interval().default(1, Infinity).limit(1, Infinity);
    /** @type {Interval} */
    #gap = new Interval().default(0, 0).limit(0, Infinity);
	
	constructor() {}
	fromRawData(rawData, grammar) {}
	serializeTo(rawData, grammar) {}
	destroy() {}
	setDirection(direction) {}
	getDirection() {}
	setItemPattern(pattern) {}
	getItemPattern() {}
	setItemCount(countBegin, countEnd) {}
	setGap(gapBegin, gapEnd) {}
	getGap() {}
}
```