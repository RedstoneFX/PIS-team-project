Поля:
- `#pattern` - паттерн содержимого
- `#parentPattern` - родительский паттерн
- `#isOptional`
- `#location` - [[ComponentLocation]]

Методы:
- [[Component.constructor(parentPattern)]] - конструктор
- [[Component.fromRawData(parentPattern, rawData, isInner, grammar)]] - заполняет компонент, основываясь на данных
- [[Component.serialize(grammar)]] - создает объект в формате исходных данных с текущей информацией
- [[Component.setPattern(pattern)]] - устанавливает или заменяет паттерн в данном компоненте
- [[Component.getPattern()]]
- [[Component.getParentPattern()]]
- [[Component.isParent(pattern)]] - проверяет, является ли переданный паттерн родительским
- [[Component.setOptional(isOptional)]]
- [[Component.isOptional()]]
- [[Component.location()]]
- [[Component.destroy()]] - обнуляет ссылки объекта

```js
class Component {
    /** @type {Pattern | PatternByPatternDefinition} */
    #pattern = null;
    /** @type {Pattern | PatternByPatternDefinition} */
    #parentPattern = null;
    /** @type {boolean} */
    #isOptional = false;
    /** @type {ComponentLocation} */
    #location = new ComponentLocation();

	constructor(parentPattern) {}
	fromRawData(parentPattern, rawData, isInner, grammar) {}
	serialize(grammar) {}
	setPattern(pattern) {}
	getPattern() {}
	getParentPattern() {}
	isParent(pattern) {}
	setOptional(isOptional) {}
	isOptional() {}
	location() {}
	destroy() {}
}
```