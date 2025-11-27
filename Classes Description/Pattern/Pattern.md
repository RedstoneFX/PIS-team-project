Поля:
- `#description`
- `#countInDocument` - [[Range]]
- `#width` - [[Range]]
- `#height` - [[Range]]
- `#kind` - [[PatternExtension]]
- `#style` - объект, сохраняющий неиспользуемые данные стиля (пусть не будут теряться)

Методы:
- [[Pattern.constructor()]]
- [[Pattern.destroy()]]
- [[Pattern.setDescription(description)]]
- [[Pattern.getDescription()]]
- [[Pattern.getKind()]]
- [[Pattern.setKind(kind)]]
- [[static Pattern.fromRawData(rawData)]]
- [[Pattern.resolveKindFromRawData(pattern, rawData)]]
- [[Pattern.serialize()]]
- [[Pattern.countInDocument()]]
- [[Pattern.width()]]
- [[Pattern.height()]]

```js
class Pattern {
	#countInDocument = new Range().default(0,Infinity).limit(0, Infinity);
	#width = new Range().default(1, Infinity).limit(1, Infinity);
	#height = new Range().default(1, Infinity).limit(1, Infinity);
	#style = {};
	/** @type {PatternExtension} */
	#kind;
	#description = "";
	
	constructor() {}
	destroy() {}
	setDescription(description) {}
	getDescription() {}
	getKind() {}
	setKind(kind) {}
	static fromRawData(rawData) {}
	resolveKindFromRawData(pattern, rawData) {}
	serialize() {}
	countInDocument() {}
	width() {}
	height() {}
}
```