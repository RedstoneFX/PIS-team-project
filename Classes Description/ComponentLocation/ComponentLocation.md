Поля:
- `#left`
- `#top`
- `#right`
- `#bottom`
- `#isLeftPadding`
- `#isTopPadding`
- `#isRihtPadding`
- `#isBottomPadding`
Методы:
- [[ComponentLocation.constructor()]]
- [[ComponentLocation.destroy()]]
- [[ComponentLocation.isDefault()]]
- [[ComponentLocation.parse(rawData, isInner)]]
- [[ComponentLocation.serialize()]]
- [[ComponentLocation.left()]]
- [[ComponentLocation.top()]]
- [[ComponentLocation.right()]]
- [[ComponentLocation.bottom()]]
- [[ComponentLocation.isLeftPadding()]]
- [[ComponentLocation.isTopPadding()]]
- [[ComponentLocation.isRightPadding()]]
- [[ComponentLocation.isBottomPadding()]]
- [[ComponentLocation.setPositionByWord(word, isInner)]]
- [[ComponentLocation.setPositionByWordAndRange(word, range)]]
- [[flipPaddingMargin()]] - везде, где был margin, установить padding, а где был padding - установить margin

```js
class ComponentLocation {
	constructor() {}
		constructor() {}
		destroy() {}
		isDefault() {}
		parse(rawData, isInner) {}
		serialize() {}
		left() {}
		top() {}
		right() {}
		bottom() {}
		isLeftPadding() {}
		isTopPadding() {}
		isRightPadding() {}
		isBottomPadding() {}
		setPositionByWord(word, isInner) {}
		setPositionByWordAndRange(word, range) {}
		flipPaddingMargin() {}
}
```