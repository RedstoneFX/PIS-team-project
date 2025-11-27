Поля:
- `#pattern`
- `#parentPattern`
- `#isOptional`
- `#location` - [[ComponentLocation]]
Методы:
- [[Component.constructor(parentPattern)]]
- [[Componennt.setPattern(pattern)]]
- [[Component.getPattern()]]
- [[Component.getParentPattern()]]
- [[Component.setOptional(isOptional)]]
- [[Component.isOptional()]]
- [[Component.location()]]
- [[Component.destroy()]]
- [[Component.serialize()]]
- [[static Component.fromRawData(parentPattern, rawData, isInner)]]

```js
class Component {
	/** @type {Pattern | PatternByPatternDefinition} */
	#pattern;
	/** @type {Pattern | PatternByPatternDefinition} */
	#parentPattern;
	#isOptional = false; // Хз, по умолчанию, они все опциональны, или нет? Что это вообще значит?
	#location = new ComponentLocation();

	constructor(parentPattern) {}
	setPattern(pattern) {}
	getPattern() {}
	getParentPattern() {}
	setOptional(isOptional) {}
	isOptional() {}
	location() {}
	destroy() {}
	serialize() {}
	static fromRawData(parentPattern, rawData, isInner) {}
}
```