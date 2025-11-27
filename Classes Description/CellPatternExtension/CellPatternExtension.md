Наследуется от [[PatternExtension]]

Поля:
- `#contentType`

Методы:
- [[CellPatternExtension.setContentType(contentType)]]
- [[CellPatternExtension.getContentType()]]
- [[CellPatternExtension.fromRawData(rawData)]]
- [[CellPatternExtension.serializeTo(rawData)]]

```js
class CellPatternExtension extends PatternExtension{
	#contentType = "";
	setContentType(contentType) {}
	getContentType() {}
	fromRawData(rawData) {}
	serializeTo(rawData) {/* Всегда записывать content_type, даже если он "" */}
}
```