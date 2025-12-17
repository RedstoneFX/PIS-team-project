### Структура класса

Поля:
- `#cell_types_filepath` - путь к файлу типов клеток
- `#patterns` - словарь (Map), сопоставляющий название его паттерну [[Pattern]]
- `#rootPattern` - указатель на корневой паттерн

Методы:
- [[static isNameValid(name) ]]- валидирует название (статический метод)
- [[Grammar.constructor()]] - конструктор
- [[static Grammar.fromRawData(rawData)]] - создает новую грамматику на основе исходных данных (статический метод)
- [[Grammar.serialize()]] - создает объект в формате исходных данных с информацией из грамматики
- [[Grammar.addPattern(name, pattern)]] - добавляет переданный паттерн в словарь грамматики
- [[Grammar.popPattern(name)]] - находит паттерн и извлекает его из грамматики
- [[popPatternNotByName(pattern)]] - обёртка метода popPattern() для вызова через ссылку, а не имя
- [[Grammar.renamePattern(pattern, newName)]] - переименовывает существующий паттерн
- [[Grammar.getPatternCount()]] - возвращает количество паттернов в грамматике
- [[getPatternById(id)]] - возвращает паттерн по его идентификатору
- [[getAllArraysWithPattern(pattern)]] - возвращает все массивы имеющие ссылку на указанный паттерн
- [[getAllComponentsWithPattern(pattern)]] - возвращает все компоненты имеющие ссылку на указанный паттерн
- [[Grammar.destroy()]]  - обнуляет ссылки объекта
- [[getTemplateName(base = "example")]] - создаёт уникальное название
- [[Grammar.getPatternByName(name)]]
- [[Grammar.getPatternName(pattern)]]
- [[Grammar.getAllPatternEntries()]]
- [[static Grammar.fromRawData(rawData)]]
- [[Grammar.setRoot(pattern)]]
- [[Grammar.getRoot()]]
- [[Grammar.setCellTypesFilepath(filepath)]]
- [[Grammar.getCellTypesFilepath()]]
- 

#### Шаблон кода
```js
class Grammar {
	/** @type {string} */
    #cellTypesFilepath = "";
    /** @type {Map<string, Pattern>} */
    #patterns = new Map();
    /** @type {Pattern} */
    #rootPattern = null;

	constructor() {}
	static isNameValid(name) {}
	static fromRawData(rawData) {}
	serialize() {}
	addPattern(name, pattern) {}
	popPattern(name) {}
	popPatternNotByName(pattern) {}
	renamePattern(pattern, newName) {}
	getPatternCount() {}
	getPatternById(id) {}
	getAllArraysWithPattern(pattern) {}
	getAllComponentsWithPattern(pattern) {}
	destroy() {}
	getPatternName(pattern) {}
	getPatternByName(name) {}
	getAllPatternEntries() {}
	setRoot(pattern) {}
	getRoot() {}
	setCellTypesFilepath(filepath) {}
	getCellTypesFilepath() {}
	getTemplateName(base = "example") {}
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