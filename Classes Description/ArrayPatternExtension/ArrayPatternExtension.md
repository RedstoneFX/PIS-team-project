Наследуется от [[PatternExtension]]

Поля:
- `#direction`
- `#itemPattern`
- `#gap`
- `#itemCount`

Методы:
- [[ArrayPatternExtension.destroy()]]
- [[ArrayPatternExtension.getDirection()]]
- [[ArrayPatternExtension.setDirection(direction)]]
- [[ArrayPatternExtension.gap()]]
- [[ArrayPatternExtension.getItemPattern()]]
- [[ArrayPatternExtension.setItemPattern(pattern)]]
- [[ArrayPatternExtension.itemCount()]]
- [[ArrayPatternExtension.serializeTo(rawData)]]
- [[ArrayPatternExtension.fromRawData(rawData)]]

```js
class ArrayPatternExtension extends PatternExtension {
	/** @type {"COLUMN" | "ROW" | "FILL"} */
	#direction;
	/** @type {Pattern} */
	#itemPattern;
	#gap = new Interval().default(0, 0).limit(0, Infinity);
	#itemCount = new Interval().default(1, Infinity).limit(1, Infinity);
	
	getDirection() {}
	setDirection(direction) {}
	destroy() {}
	gap() {}
	getItemPattern() {}
	setItemPattern(pattern) {}
	itemCount() {}
	serializeTo(rawData) {}
	fromRawData(rawData) {}
}
```