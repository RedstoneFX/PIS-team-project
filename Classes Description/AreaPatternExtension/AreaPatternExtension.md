Наследуется от [[PatternExtension]]

Поля:
- `#innerComponents` (Map<string, Component>) - внутренние компоненты
- `#outerComponents` (Map<string, Component>) - внешние компоненты
- `#pattern` - родительский паттерн

Методы:
- [[AreaPatternExtension.constructor(pattern)]] - конструктор
- [[AreaPatternExtension.fromRawData(rawData, grammar)]] - извлекает необходимые для объекта данные
- [[AreaPatternExtension.serializeTo(rawData, grammar)]] - сериализирует данные объекта
- [[AreaPatternExtension.addComponent(componentName, component, isInner)]] - добавляет компонент в область
- [[AreaPatternExtension.popComponent(component, isInner)]] - удаляет компонент из области
- [[AreaPatternExtension.renameComponent(component, newName, isInner)]] - меняет имя компонента
- [[AreaPatternExtension.isComponentInner(component)]] - определить тип расположения компонента
- [[AreaPatternExtension.updateComponentInner(component, isInner)]] - изменить тип расположения компонента
- [[AreaPatternExtension.getComponentName(component, isInner)]] - определить имя компонента
- [[AreaPatternExtension.getInnerComponentsEntries()]]
- [[AreaPatternExtension.getOuterComponentsEntries()]]
- [[AreaPatternExtension.destroy()]] - обнуляет ссылки объекта

```js
class AreaPatternExtension extends PatternExtension {
    /** @type {Map<string, Component>} */
    #innerComponents = new Map();
    /** @type {Map<string, Component>} */
    #outerComponents = new Map();
    /** @type {Pattern} */
    #pattern;
	
	constructor(pattern) {}
	fromRawData(rawData, grammar) {}
	serializeTo(rawData, grammar) {}
	addComponent(componentName, component, isInner) {}
	popComponent(component, isInner) {}
	renameComponent(component, newName, isInner) {}
	isComponentInner(component) {}
	updateComponentInner(component, isInner) {}
	getComponentName(component, isInner) {}
	getInnerComponentsEntries() {}
	getOuterComponentsEntries() {}	
	destroy() {}
}
```