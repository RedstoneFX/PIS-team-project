### Структура класса

Поля:
- `#cell_types_filepath` - путь к файлу типов клеток
- `#patterns` - словарь (Map), сопоставляющий название его паттерну

Методы:
- [[Grammar.constructor()]]
- [[Grammar.destroy()]]
- [[Grammar.addPattern(name, pattern)]]
-  [[Grammar.popPattern(name)]]
- [[Grammar.getPatternByName(name)]]
- [[Grammar.renamePattern(pattern, newName)]]
- [[Grammar.getPatternName(pattern)]]
- [[Grammar.getAllPatternEntries()]]
- [[static Grammar.fromRawData(rawData)]]
- [[Grammar.setRoot(pattern)]]
- [[Grammar.getRoot()]]
- [[Grammar.setCellTypesFilepath(filepath)]]
- [[Grammar.getCellTypesFilepath()]]
- [[Grammar.serialize()]]

#### Шаблон кода
```js
class Grammar {
	#cell_types_filepath = "";
	/** @type {Map<string, Pattern} */
	#patterns = new Map();
	/** @type {Pattern} */
	#rootPattern = null;

	constructor() {}
	destroy() {}
	getPatternByName(name) {}
	getAllPatternEntries() {}
	addPattern(name, pattern) {}
	popPattern(name) {}
	setRoot(pattern) {}
	getRoot(pattern) {}
	setCellTypesFilepath(filepath) {}
	getCellTypesFilepath() {}
	static fromRawData(rawData) {}
}
```

### Исключения
 - `addPattern` ничего не делает, если паттерн уже есть в списке
 - `popPattern` может извлечь корневой узел (тогда `#rootPattern` станет null)
 - `setRoot` ничего не делает, если этот паттерн уже корневой
 - `getRoot` возвращает `null`, если корня нет
 - `fromRawData` выбрасывает исключение, если не обнаруживает поле `cell_types_filepath` или `patterns`, или если они не являются `строкой` и `объектом-словарем` соответственно.
 - renamePattern выбрасывает ошибку, если не может найти переименовываемый паттерн
 - Grammar.getPatternName(pattern) выбрасывает ошибку, если не может найти паттерн

#### Примечание
Если какой-то из сторонних методов, используемых в `fromRawData` выбрасывает ошибку - не ловить её, пусть метод аварийно завершится сам.