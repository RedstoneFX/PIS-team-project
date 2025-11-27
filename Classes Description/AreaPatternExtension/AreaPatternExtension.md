Наследуется от [[PatternExtension]]

Поля:
- `#innerComponents` - Map<string, Component>
- `#outerComponents` - Map<string, Component>

Методы:
- [[AreaPatternExtension.destroy()]]
- [[AreaPatternExtension.serializeTo(rawData)]]
- [[AreaPatternExtension.getComponentName(component, isInner)]] (выбрасывать ошибку, если такого компонента нет)
- [[AreaPatternExtension.renameComponent(component, newName, isInner)]] (выбрасывать ошибку, если такого компонента нет, имя уже занято, или не подходит по формату)
- [[AreaPatternExtension.setComponentInner(component)]]  (Выбрасывать ошибку, если компонент не считает этот паттерн своим родителем, или его имя уже занято в `inner`)
- [[AreaPatternExtension.setComponentOuter(component)]] (Выбрасывать ошибку, если компонент не считает этот паттерн своим родителем, или его имя уже занято в `outer`)
- [[AreaPatternExtension.addComponent(componentName, component, isInner)]] (Выбрасывать ошибку, если компонент не считает этот паттерн своим родителем, имя занято, или не подходит по формату)
- [[AreaPatternExtension.isComponentInner(component)]] (`true`, если компонент есть в `inner`, `false`, если в `outer`, ошибка, если ни там и ни там)
- [[AreaPatternExtension.popComponent(component, isInner)]] (извлечь и вернуть компонент из указанного раздела или выкинуть ошибку, если его там нет)
- [[AreaPatternExtension.getInnerComponentsEntries()]] (`this.#innerComponents.entries()`)
- [[AreaPatternExtension.getOuterComponentsEntries()]] (`this.#outerComponents.entries()`)

```js
class AreaPatternExtension extends PatternExtension {
	/** @type {string, Component} */
	#innerComponents = new Map();
	/** @type {string, Component} */
	#outerComponents = new Map();
	
	destroy() {/*Вызвать деструкторы компонентов и очистить списки*/}
	serializeTo(rawData) {}
	getComponentName(component, isInner) {}
	renameComponent(component, newName, isInner) {}
	setComponentInner(component) {}
	setComponentOuter(component) {}
	addComponent(componentName, component, isInner) {}
	isComponentInner(component) {}
	popComponent(component, isInner) {}
	getInnerComponentsEntries() {}
	getOuterComponentsEntries() {}
}
```