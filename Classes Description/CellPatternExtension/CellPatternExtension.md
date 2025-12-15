Наследуется от [[PatternExtension]]

Поля:
- `#contentType` - тип содержимого ячейки

Методы:
- [[CellPatternExtension.constructor]] - конструктор
- [[CellPatternExtension.fromRawData(rawData, grammar)]] - извлекает необходимые для объекта данные
- [[CellPatternExtension.serializeTo(rawData, grammar)]] - сериализирует данные объекта
- [[CellPatternExtension.setContentType(contentType)]]
- [[CellPatternExtension.getContentType()]]

```js
class CellPatternExtension extends PatternExtension{
    /** @type {string} */
    #contentType = "";
    
    constructor() {}
    fromRawData(rawData, grammar) {}
	serializeTo(rawData, grammar) {}
	setContentType(contentType) {}
	getContentType() {}
}
```