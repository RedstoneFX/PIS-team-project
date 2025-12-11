Поля:
- `#begin`
- `#end`
- `#defaultBegin`
- `#defailtEnd`
- `#minBegin`
- `#maxEnd`

Методы:
- [[Interval.constructor(begin, end)]]
- [[Interval.fromString(strRange)]]
- [[Interval.default(begin, end)]]
- [[Interval.limit(minBegin, maxEnd)]]
- [[Interval.isDefault()]]
- [[Interval.toString()]]
- [[Interval.getBegin()]]
- [[Interval.setBegin()]]
- [[Interval.getEnd()]]
- [[Interval.setEnd()]]
- [[Interval.restoreDefault()]]

```js
class Interval {
	#begin;
	#end;
	#defaultBegin;
	#defaultEnd;
	#minBegin = -Infinity;
	#maxEnd = infinity;

	constructor(begin, end) {this.#begin = begin; this.#end = end;}
	fromString(stringInterval) {}
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