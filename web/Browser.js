class BrowserLink {
    constructor(data) {
        this.data = data;
    }
}

class Browser {
    /** @type {HTMLDivElement} */
    #htmlElement;
    /** @type {Map<object, Set>} */
    #childrenOfParent = new Map();
    /**  @type {Map<Object, HTMLElement>} */
    #HTMLElementForItem = new Map();
    /** @type {Map<string, any>} */
    #itemByID = new Map();
    #lastID = 0;
    /** @type {Map<object, Set<BrowserLink>>} */
    #links = new Map();
    #onClickListeners = new Set();

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
        this.#HTMLElementForItem.clear();
        this.#childrenOfParent.clear();
        this.#itemByID.clear();
        this.#lastID = 0;
    }

    #bindNewID(item) {
        let id = "" + this.#lastID;
        this.#lastID += 1;
        this.#itemByID.set(id, item);
        return id;
    }

    /*#upgradeHTMLElementForItem(item) {
        // Извлекаем старые данные
        let oldElement = this.#HTMLElementForItem.get(item);
        if (oldElement.tagName.toLowerCase() == "details") return; // Ничего не делаем, если он и так уже обновленный
        let title = oldElement.innerText;
        let id = oldElement.getAttribute("item");

        // Создаем новый элемент
        // Создаем details
        let element = document.createElement("details");
        for (let [cls, _] of oldElement.classList.entries()) {
            if (cls != "browserItemWithoutChildren")
                element.classList.add(cls);
        }
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
    }*/

    #makeNewHTMLElementForItem(item, title, extraClass = null) {
        let element = document.createElement("details");
        element.classList.add("browserItemWithChildren");
        if (extraClass != null) element.classList.add(extraClass);
        element.setAttribute("item", this.#bindNewID(item));

        // Создаем summary
        let titleElement = document.createElement("summary");
        titleElement.innerText = title;
        titleElement.onclick = (e) => this.#onClick(e);
        element.appendChild(titleElement);

        // Создаем поле для дочерних объектов
        let childrenDiv = document.createElement("div");
        element.appendChild(childrenDiv);

        // Заменяем старый элемент на новый
        this.#HTMLElementForItem.set(item, element);
        return element;
    }

    addItem(parentItem, childItem, title, extraClass = null) {

        // Выбросить ошибку, если переданный родитель не находится в дереве и не является корнем
        if (parentItem != null && !this.#HTMLElementForItem.has(parentItem)) throw new Error("В браузере нет элемента " + parentItem);

        // Выбросить ошибку, если данная сущность уже есть в дереве
        if (this.#HTMLElementForItem.has(childItem)) throw new Error("Данный элемент уже есть в браузере");

        // Добавить данного ребенка к родителю
        let parentChildren = this.#childrenOfParent.get(parentItem);
        if (parentChildren == null) {
            parentChildren = new Set();
            this.#childrenOfParent.set(parentItem, parentChildren)
        }
        parentChildren.add(childItem);

        // Обновить интерфейс...
        let parentDiv = this.#htmlElement; // По умолчанию, вставлять в корень
        if (parentItem != null) { // Если передан какой-то родитель, кроме корня, вставлять в него
            let children = this.#HTMLElementForItem.get(parentItem).children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName.toLowerCase() == "div") {
                    parentDiv = children[i];
                    break;
                }
            }
        }
        parentDiv.appendChild(this.#makeNewHTMLElementForItem(childItem, title, extraClass)); // Вставляем элемент
    }

    removeItem(item) {
        if (!this.#HTMLElementForItem.has(item)) return; // Ничего не делаем, если элемента и не было в дереве

        // Вызываем удаление всех дочерних элементов
        let childrenItems = this.#childrenOfParent.get(item);
        if (childrenItems != null && childrenItems.size > 0) {
            for (let [v, _] of childrenItems.entries()) {
                this.removeItem(v);
            }
        }
        // Удаляем этот элемент
        let element = this.#HTMLElementForItem.get(item);
        this.#childrenOfParent.delete(item); // Удаляем список его детей
        this.#itemByID.delete(element.getAttribute("item")); // Удаляем связку ID
        this.#HTMLElementForItem.delete(item); // Удаляем из базы данных элементов
        element.remove(); // Удаляем HTML

        if (item instanceof BrowserLink) {
            this.#links.get(item.data).delete(item);
            item.data = null;
        } else {
            let links = this.#links.get(item);
            if (links != null) {
                for (let [link, _] of links.entries()) {
                    this.removeItem(link);
                }
            }
            this.#links.delete(item);
        }
    }

    addLink(parentItem, targetChildren, title, extraClass = null) {
        let links = this.#links.get(parentItem);
        if (links == null) {
            links = new Set();
            this.#links.set(parentItem, links);
        }

        let link = new BrowserLink(targetChildren);
        links.add(link);
        this.addItem(parentItem, link, title, extraClass);
    }

    onClickListeners() {
        return this.#onClickListeners;
    }

    /**
     * @param {PointerEvent} e 
     */
    #onClick(e) {
        /** @type {HTMLElement} */
        let itemElement = e.target.parentElement;
        let id = itemElement.getAttribute("item");
        let data = this.#itemByID.get(id);
        if (data instanceof BrowserLink) {
            this.notifyListeners(data.data);
        } else {
            this.notifyListeners(data);
        }
    }

    notifyListeners(clickedEntity) {
        for (let [listener, _] of this.#onClickListeners.entries()) {
            listener(clickedEntity);
        }
    }
}