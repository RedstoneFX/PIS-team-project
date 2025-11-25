
/// <reference path="converter.js" />

class drawer {
    /** @type {Number} */
    static exampleVariable1;
    /** @type {Number} */
    static exampleVariable2;
    /** @type {HTMLCanvasElement} */
    static canvas;

    static init() {
        this.exampleVariable1 = 1;
        this.exampleVariable2 = 2;
        this.canvas = document.getElementById("illustration");
        paper.setup(this.canvas);
    }

    /**
     * Метод, который будет вызван для отрисовки паттерна неизвестного вида
     * @param {Pattern} pattern 
     */
    static drawPattern(pattern) {
        if (pattern instanceof CellPattern) this.drawCellPattern(pattern);
        else if (pattern instanceof ArrayPattern) this.drawArrayPattern(pattern);
        else if (pattern instanceof AreaPattern) this.drawAreaPattern(pattern);
        else throw new Error("Нельзя отрисовать данный объект!");
    }

    /**
     * Отрисовать паттерн-ячейку
     * @param {CellPattern} pattern 
     */
    static drawCellPattern(pattern) {

        // Получаем средние значения ширины и высоты из диапазонов
        const width = (pattern.width.min + pattern.width.max) / 2;
        const height = (pattern.height.min + pattern.height.max) / 2;

        // Создаем прямоугольник ячейки
        const cell = new Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'white'
        });

        // Создаем текст с названием паттерна
        const text = new PointText({
            point: [5, 15],
            content: pattern.name,
            fillColor: 'black',
            fontFamily: 'Arial',
            fontSize: 12
        });

        // Группируем элементы для удобства
        const group = new Group([cell, text]);
    
        // Добавляем свойства паттерна в группу для отладки
        group.data = {
            isRoot: pattern.isRoot,
            isInline: pattern.isInline,
            kind: pattern.kind
        };

        return group;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern) {

    }

    /**
     * Отрисовать паттерн-структуру
     * @param {AreaPattern} pattern 
     */
    static drawAreaPattern(pattern) {

    }

    /**
     * Отрисовать компонент
     * @param {Comment} component 
     * @param {AreaPattern} parentPattern 
     */
    static drawComponent(component, parentPattern) {

    }
}