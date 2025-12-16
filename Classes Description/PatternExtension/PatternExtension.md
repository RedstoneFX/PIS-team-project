Поля:
- `#kindName` - тип расширения паттерна

Методы:
- [[PatternExtension.constructor()]] - конструктор
- [[PatternExtension.serializeTo(rawData, grammar)]] - сериализирует данные объекта
- [[PatternExtension.fromRawData(rawData, gramamr)]] - извлекает необходимые для объекта данные
- [[PatternExtension.destroy()]] - обнуляет ссылки объекта
- [[PatternExtension.setKindName(name)]]
- [[PatternExtension.getKindName()]]

```js
class PatternExtension {
    /** @type {"CELL" | "AREA" | "ARRAY" | "ARRAY-IN-CONTEXT"} */
    #kindName = "UNDEFINITED";

	serializeTo(rawData, grammar) {}
	fromRawData(rawData, grammar) {}
	destroy() {}
	getKindName() {}
	setKindName(kindName) {}
}
```