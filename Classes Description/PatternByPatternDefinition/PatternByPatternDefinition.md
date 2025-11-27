Наследуется от [[Pattern]]
Поля:
- `#parrentComponent`
Методы:
- [[PatternByPatternDefinition.constructor(parrentComponent)]]
- [[PatternByPatternDefinition.destroy()]]
- [[PatternByPatternDefinition.getParentComponent()]]

```js
class PatternByPatternDefinition extends Pattern {
	/** @type {Component} */
	#parentComponent;
	
	constructor(parrentComponent) {}
	destroy() {}
	getParentComponent() {}
}
```