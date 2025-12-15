Поля:
- `#left` - [[Interval]]
- `#top` - [[Interval]]
- `#right` - [[Interval]]
- `#bottom` - [[Interval]]
- `#isLeftPadding`
- `#isTopPadding`
- `#isRightPadding`
- `#isBottomPadding`

Методы:
- [[ComponentLocation.constructor()]] - конструктор
- [[ComponentLocation.parse(rawData, isInner)]] - распознает значения позиции в указанных данных и обновляет текущую позицию
- [[ComponentLocation.serialize()]] - создает объект в формате исходных данных с текущей информацией
- [[ComponentLocation.isDefault()]] - проверяет, имеют ли все отступы значение по умолчанию
- [[ComponentLocation.flipPaddingMargin()]] - меняет тип относительного расположения на противоположный
- [[ComponentLocation.setPositionByWord(word, isInner)]] - устанавливает дефолтную позицию в соответствии с заданной стороной
- [[ComponentLocation.setPositionByWordAndInterval(word, isInner, interval)]] - устанавливает позицию в соответствии с заданной стороной и интервалом
- [[ComponentLocation.getLeft()]]
- [[ComponentLocation.getTop()]]
- [[ComponentLocation.getRoght()]]
- [[ComponentLocation.getBottom()]]
- [[ComponentLocation.isLeftPadding()]]
- [[ComponentLocation.isTopPadding()]]
- [[ComponentLocation.isRightPadding()]]
- [[ComponentLocation.isBottomPadding()]]
- [[ComponentLocation.destroy()]] - обнуляет ссылки объекта

```js
class ComponentLocation {

	constructor() {}
	parse(rawData, isInner) {}
	serialize() {}
	isDefault() {}
	flipPaddingMargin() {}
	setPositionByWord(word, isInner) {}
	setPositionByWordAndInterval(word, isInner, interval) {}
    getLeft() {}
    getTop() {}
    getRight() {}
    getBottom() {}
    isLeftPadding() {}
    isTopPadding() {}
    isRightPadding() {}
    isBottomPadding() {}
    destroy() {}
}
```