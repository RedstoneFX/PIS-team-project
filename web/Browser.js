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

    clearChildren(item) {
        let children = this.#childrenOfParent.get(item);
        if (children == null) return;
        for (let child of children.values()) {
            this.removeItem(child);
        }
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

    addClass(item, cls) {
        let elem = this.#HTMLElementForItem.get(item);
        if (elem != null) {
            elem.classList.add(cls);
        }
    }

    removeClass(item, cls) {
        let elem = this.#HTMLElementForItem.get(item);
        if (elem != null) {
            elem.classList.remove(cls);
        }
    }

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
        let links = this.#links.get(targetChildren);
        if (links == null) {
            links = new Set();
            this.#links.set(targetChildren, links);
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

    getElementFor(item) {
        return this.#HTMLElementForItem.get(item);
    }

    /**
     * @param {HTMLDetailsElement} element 
     * @param {String} newTitle 
     */
    #renameSummary(element, newTitle) {
        let children = element.children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.tagName == "SUMMARY") {
                child.innerText = newTitle;
                return;
            }
        }
    }

    updateTitle(item, newTitle) {
        let element = this.#HTMLElementForItem.get(item);
        if (element == null) throw new Error('У данного объекта нет элемента в браузере!');
        this.#renameSummary(element, newTitle);

        let links = this.#links.get(item);
        if (links == null) return;
        for (let link of links.values()) {
            this.updateTitle(link, newTitle);
        }
    }
}