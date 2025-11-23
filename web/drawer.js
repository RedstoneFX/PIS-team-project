
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
     * Отрисовать паттерн-клетку
     * @param {CellPattern} pattern 
     */
    static drawCellPattern(pattern) {

    }

    /**
     * Отрисовать паттерн-клетку
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern) {

    }

    /**
     * Отрисовать паттерн-клетку
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