Поля:
- `#begin`
- `#end`
- `#defaultBegin`
- `#defailtEnd`
- `#minBegin`
- `#maxEnd`

Методы:
- [[Range.constructor(begin, end)]]
- [[Range.fromString(strRange)]]
- [[Range.default(begin, end)]]
- [[Range.limit(minBegin, maxEnd)]]
- [[Range.isDefault()]]
- [[Range.toString()]]
- [[Range.getBegin()]]
- [[Range.setBegin()]]
- [[Range.getEnd()]]
- [[Range.setEnd()]]
- [[Range.restoreDefault()]]

```js
class Range {
	#begin;
	#end;
	#defaultBegin;
	#defaultEnd;
	#minBegin = -Infinity;
	#maxEnd = infinity;

	constructor(begin, end) {this.#begin = begin; this.#end = end;}
	fromString(stringRange) {}
	default(begin, end) {this.#defaultBegin = begin, this.#defaultEnd = end; restoreDefault()}
	limit(minBegin, maxEnd) {}
	isDefault() {} // Всегда false, если нет значений по умолчнию
	restoreDefault() {}
	toString() {}
	getBegin() {}
	setBegin() {}
	getEnd() {}
	setEnd() {}
}
```