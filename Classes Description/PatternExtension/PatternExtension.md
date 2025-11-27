Поля:
- `#kindName`

Методы:
- [[PatternExtension.constructor()]]
- [[PatternExtension.destroy()]]
- [[PatternExtension.getKindName()]]
- [[PatternExtension.setKindName(name)]]
- [[PatternExtension.serializeTo(rawData)]]
- [[PatternExtension.fromRawData(rawData)]]

```js
class PatternExtension {
	#kindName = "";

constructor() {}
destroy() {}
getKindName() {}
setKindName(name) {}
serializeTo(rawData) {/*Дописать в rawData в поле kind значение #kindName*/}
fromRawData(rawData) {/*Считать текстовое название паттерна из rawData.kind в #kindName*/}
}
```