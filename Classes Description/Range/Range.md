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
- [[getBegin()]]
- [[setBegin()]]
- [[getEnd()]]
- [[setEnd()]]

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
	default(begin, end) {this.#begin = begin; this.#end = end; this.#defaultBegin = begin, this.defaultEnd()}
	limit(minBegin, minEnd) {}
	isDefault() {} // Всегда false, если нет значений по умолчнию
	toString() {}
	getBegin() {}
	setBegin() {}
	getEnd() {}
	setEnd() {}
}
```