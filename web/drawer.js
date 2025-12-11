
/// <reference path="backend.js" />
/// <reference path="lib/paper-core.js" />

class Drawer {
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
        let kind = pattern.getKind();
        let group;
        if (kind instanceof CellPatternExtension) this.drawCellPattern(pattern, kind, group);
        else if (kind instanceof ArrayPatternExtension) this.drawArrayPattern(pattern, kind, group);
        else if (kind instanceof AreaPatternExtension) this.drawAreaPattern(pattern, kind, group);
        else throw new Error("Нельзя отрисовать данный объект!");
    }

    /**
     * Отрисовать квадратную ячейку
     * @param {Color} color 
     */
    static squareCell(color) {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [100, 100],
            strokeColor: color,
            strokeWidth: 2,
            fillColor: null
        });
    }
    /**
     * Отрисовать треугольную стрелку
     * @param {Number} angle 
     */
    static triangleArrow(angle) {
        let arrow = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        arrow.fillColor = 'black';
        arrow.rotate(angle);
        return arrow;
    }

    /**
     * Отрисовать треугольную стрелку
     */
    static triangleArrow() {
        let arrow = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        arrow.fillColor = 'black';
        return arrow;
    }

    /**
     * Отрисовать линию
     * @param {Point} from 
     * @param {Point} to 
     */
    static straightLine(from, to) {
        return new Path.Line({ from: from, to: to, strokeColor: 'black' });
    }

    /**
     * Обозначить размер между двумя точками
     * @param {boolean} isOuter 
     * @param {boolean} isHorizontal 
     * @param {Number} size 
     */
    static figureSize(isOuter, isHorizontal, size) {

        let group;

        from = new Point(0, -5);
        to = new Point(0, 5-size);

        // отрисовать треугольник в точке (0, -10) с углом поворота в 0 градусов
        let up = this.triangleArrow();
        up.position = from;
        group.addChild(up);

        // отрисовать второй треугольник в точке (0, 10-(длина стрелки)) с углом поворота в 180 градусов
        let down = this.triangleArrow(180);
        down.position = to;
        group.addChild(down);

        // отрисовать между треугольниками прямую линию
        let line = this.straightLine(from, to);
        group.addChild(line);

        // если размер внешний
        if (isOuter) {

            //// отрисовать две линии с параметрами ((0, 0), (100, 0))
            point1 = new Point(0, 0);
            point2 = new Point(100, 0);
            line1 = straightLine(from, to);
            line2 = straightLine(from, to);
            //// установить центр одной линии на верхнем конце стрелки
            line1.position = (0, 0);
            group.addChild(line1);
            //// установить центр второй линии на нижнем конце стрелки
            line2.position = (0, -size);
            group.addChild(line2);

        }

        // повернуть объект на 90 градусов по часовой стрелке, если он должен быть горизонтальный
        if (isHorizontal) group.rotate(90);

        // вернуть объект
        return group;
        
    }

    /**
     * Отрисовать паттерн-ячейку
     * @param {CellPattern} pattern 
     */
    static drawCellPattern(pattern, kind, group) {
        
        // отрисовать прямоугольник 100 на 100
        let cell = this.squareCell(new Color(1));
        // установить центр прямоугольника (50, -50)
        cell.position = (50, -50);
        group.addChild(cell);
        // отрисовать фигуру "размер" с параметрами "внешний", "по вертикали",  "100"
        sizeV = figureSize(true, false, 100);
        // установить центр фигуры (-50, -50)
        sizeV.position = (-50, -50);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "100"
        sizeH = figureSize(true, true, 100);
        // установить центр фигуры (50, 50)
        sizeH.position = (50, 50);
        group.addChild(sizeH);
        
    }

}