
/// <reference path="converter.js" />

class drawer {
    /** @type {Number} */
    static exampleVariable1;
    /** @type {Number} */
    static exampleVariable2;
    /** @type {HTMLElement} */
    static canvas;

    static init() {
        this.exampleVariable1 = 1;
        this.exampleVariable2 = 2;
        this.canvas = document.getElementById("canvas");
        paper.setup(canvas);
    }

    /**
     * Метод, который будет вызван 
     * @param {Pattern} pattern 
     */
    static drawPattern(pattern) {
        if (pattern instanceof CellPattern) this.drawCellPattern(pattern);
        else if (pattern instanceof ArrayPattern) this.drawArrayPattern(pattern);
        else if (pattern instanceof AreaPattern) this.drawAreaPattern(pattern);
    }
}