Наследуется от [[Pattern]]
Поля:
- `#parrentComponent` - родительский паттерн

Методы:
- [[PatternByPatternDefinition.constructor(parentComponent)]] - конструктор
- [[PatternByPatternDefinition.destroy()]] - обнуляет ссылки объекта
- [[PatternByPatternDefinition.getParentComponent()]] - возвращает родительский компонент
- [[PatternByPatternDefinition.getPath(grammar)]] - составляет путь от вписанного паттерна до независимого

```js
class PatternByPatternDefinition extends Pattern {
    /** @type {Component} */
    #parentComponent;
	
	constructor(parentComponent) {}
	destroy() {}
	getParentComponent() {}
	getPath(grammar) {}
}
```