class Browser {
    /** @type {HTMLDivElement} */
    #htmlElement;


    /**
     * @type {Map<object, Set>}
     */
    #childrenOfParent = new Map();


    /**
     * @type {Map<Object, HTMLElement>}
     */
    #HTMLElementForItem = new Map();

    /**
     * @type {Map<number, object>}
     */
    #itemByID = new Map();

    #lastID = 0;

    /**
     * @param {HTMLDivElement} htmlDiv 
     */
    constructor(htmlDiv) {
        this.#htmlElement = htmlDiv;
        this.clear();
    }

    clear() {
        for (let i = this.#htmlElement.children.length - 1; i >= 0; i--) {
            this.#htmlElement.children[i].remove();
        }
    }

    #bindNewID(item) {
        let id = "" + this.#lastID;
        this.#lastID;
        this.#itemByID.set(id, item);
        return id;
    }

    #upgradeHTMLElementForItem(item) {
        // Извлекаем старые данные
        let oldElement = this.#HTMLElementForItem.get(item);
        if (oldElement.tagName.toLowerCase() == "details") return; // Ничего не делаем, если он и так уже обновленный
        let title = oldElement.innerText;
        let id = oldElement.getAttribute("item");

        // Создаем новый элемент
        // Создаем details
        let element = document.createElement("details");
        element.classList.add("browserItemWithChildren");
        element.setAttribute("item", id);

        // Создаем summary
        let titleElement = document.createElement("summary");
        titleElement.innerText = title;
        element.appendChild(titleElement);

        // Создаем поле для дочерних объектов
        let childrenDiv = document.createElement("div");
        element.appendChild(childrenDiv);

        // Заменяем старый элемент на новый
        oldElement.replaceWith(element);
        this.#HTMLElementForItem.set(item, element);
    }

    #makeNewHTMLElementForItem(item, title) {
        let element = document.createElement("span");
        element.innerText = title;
        element.setAttribute("item", this.#bindNewID(item));
        element.classList.add("browserItemWithoutChildren");
        this.#HTMLElementForItem.set(item, element);
        return element;
    }

    addItem(parentItem, childItem, title) {

        // Выбросить ошибку, если переданный родитель не находится в дереве и не является корнем
        if (parentItem != null && !this.#HTMLElementForItem.has(parentItem)) throw new Error("В браузере нет элемента " + parentItem);

        // Выбросить ошибку, если у данного родителя уже есть данный элемент в детях
        let parentChildren = this.#childrenOfParent.get(parentItem);
        if (parentChildren != null && parentChildren.has(childItem)) throw new Error("У данного родителя уже есть данный элемент среди детей");

        // Добавить данного ребенка к родителю
        if (parentChildren == null) {
            parentChildren = new Set();
            this.#childrenOfParent.set(parentItem, parentChildren)
        }
        parentChildren.add(childItem);

        // Обновить интерфейс...
        let parentDiv = this.#htmlElement; // По умолчанию, вставлять в корень
        if (parentItem != null) { // Если передан какой-то родитель, кроме корня, вставлять в него
            this.#upgradeHTMLElementForItem(parentItem);
            let children = this.#HTMLElementForItem.get(parentItem).children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName.toLowerCase() == "div") {
                    parentDiv = children[i];
                    break;
                }
            }
        }
        parentDiv.appendChild(this.#makeNewHTMLElementForItem(childItem, title)); // Вставляем элемент
    }
}