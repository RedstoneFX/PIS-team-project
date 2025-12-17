
/// <reference path="backend.js" />
/// <reference path="lib/paper-core.js" />

class Drawer {
    /** @type {Number} */
    static exampleVariable1;
    /** @type {Number} */
    static exampleVariable2;
    /** @type {HTMLCanvasElement} */
    static canvas;

    static elements = [];

    static init() {
        this.exampleVariable1 = 1;
        this.exampleVariable2 = 2;
        this.canvas = document.getElementById("illustration");
        paper.setup(this.canvas);
    }

    /**
     * Метод, который очищает холст 
     */
    static clearCanvas() {
        this.elements.forEach(element => {
            element.remove();
        });
        this.elements = [];
    }

    static squareDot() {
        let point = new paper.Path.Rectangle({
            point: [0, 0],
            size: [10, 10],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: null
        });
        return point;
    }

    static verticalLine() {
        let line = new paper.Path.Rectangle({
            point: [0, 0],
            size: [0, 100],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
        return line;
    }

    static horizontalLine() {
        let line = new paper.Path.Rectangle({
            point: [0, 0],
            size: [100, 0],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
        return line;
    }

    static gapBeginArrow() {
        let gapBegin = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        gapBegin.fillColor = 'black';
        gapBegin.rotate(-90);
        return gapBegin;
    }

    static gapEndArrow() {
        let gapEnd = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        gapEnd.fillColor = 'black';
        gapEnd.rotate(90);
        return gapEnd;
    }

    static gapArrowUp() {
        let gapBegin = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        gapBegin.fillColor = 'black';
        return gapBegin;
    }

    static gapArrowDown() {
        let gapEnd = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        gapEnd.fillColor = 'black';
        gapEnd.rotate(180);
        return gapEnd;
    }

    static gapHorizontal() {

        let group = new paper.Group();

        let arrowLeft = this.gapBeginArrow();
        arrowLeft.position = (5, 0);
        group.addChild(arrowLeft);
        
        let arrowRight = this.gapEndArrow();
        arrowRight.position = (95, 0);
        group.addChild(arrowRight);

        let line3 = this.horizontalLine();
        line3.position = (50, 0);
        group.addChild(line3);

        return group;
        
    }

    static sizeHorizontal(x) {

        let group = new paper.Group();

        let line1 = this.verticalLine();
        line1.position = (0, 100);
        group.addChild(line1);

        let line2 = this.verticalLine();
        line2.position = (x, 100);
        group.addChild(line2);

        let arrowLeft = this.gapBeginArrow();
        arrowLeft.position = (5, 100);
        group.addChild(arrowLeft);

        let arrowRight = this.gapEndArrow();
        arrowRight.position = (x-5, 100);
        group.addChild(arrowRight);

        let line3 = this.horizontalLine();
        line3.position = (x/2, 100);
        group.addChild(line3);

        return group;
        
    }

    static gapVertical() {

        let group = new paper.Group();

        let arrowDown = this.gapArrowDown();
        arrowDown.position = (0, -95);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = (0, -5);
        group.addChild(arrowUp);

        let line3 = this.verticalLine();
        line3.position = (0, -50);
        group.addChild(line3);

        return group;
        
    }

    static sizeVertical(y) {

        let group = new paper.Group();

        let line1 = this.horizontalLine();
        line1.position = (-100, 0);
        group.addChild(line1);

        let line2 = this.horizontalLine();
        line2.position = (-100, y);
        group.addChild(line2);

        let arrowDown = this.gapArrowDown();
        arrowDown.position = (-100, y+5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = (-100, -5);
        group.addChild(arrowUp);

        let line3 = this.verticalLine();
        line3.position = (-100, y/2);
        group.addChild(line3);

        return group;
        
    }

    /**
     * Метод, который будет вызван для отрисовки паттерна неизвестного вида
     * @param {Pattern} pattern 
     */
    static drawPattern(pattern) {
        let kind = pattern.getKind();
        this.clearCanvas();
        if (kind instanceof CellPatternExtension) {
            let cellPattern = this.drawCellPattern(pattern, kind);
            this.elements.push(cellPattern);
        }
        else if (kind instanceof ArrayPatternExtension) {
            let arrayPattern = this.drawArrayPattern(pattern, kind);
            this.elements.push(arrayPattern);
        }
        else if (kind instanceof AreaPatternExtension) {
            let areaPattern = this.drawAreaPattern(pattern, kind);
            this.elements.push(areaPattern);
        }
        else throw new Error("Нельзя отрисовать данный объект!");
    }

    /**
     * Отрисовать квадратную ячейку
     * @param {Color} color 
     */
    static squareCell(color) {
        let cell = new paper.Path.Rectangle({
            point: [0, 0],
            size: [100, 100],
            strokeColor: color,
            strokeWidth: 2,
            fillColor: null
        });
        return cell;
    }

    /**
     * Отрисовать квадратную ячейку
     */
    static squareArea(color) {
        let cell = new paper.Path.Rectangle({
            point: [0, 0],
            size: [300, 300],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: null
        });
        return cell;
    }

    /**
     * Отрисовать треугольную стрелку
     * @param {Number} angle 
     */
    static triangleArrow(angle) {
        let arrow = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        arrow.fillColor = 'black';
        arrow.rotate(angle);
        return arrow;
    }

    /**
     * Отрисовать треугольную стрелку
     */
    static triangleArrow() {
        let arrow = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 5);
        arrow.fillColor = 'black';
        return arrow;
    }

    /**
     * Отрисовать линию
     * @param {Point} from 
     * @param {Point} to 
     */
    static straightLine(from, to) {
        let line = new paper.Path.Line({ from: from, to: to, strokeColor: 'black' });
        return line;
    }

    /**
     * Обозначить размер между двумя точками
     * @param {boolean} isOuter
     * @param {boolean} isHorizontal 
     * @param {Number} size 
     */
    static figureSize(isOuter, isHorizontal, size) {

        let group = new paper.Group();

        let from = new paper.Point(0, -5);
        let to = new paper.Point(0, 5-size);

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
            let point1 = new paper.Point(0, 0);
            let point2 = new paper.Point(50, 0);
            let line1 = this.straightLine(point1, point2);
            let line2 = this.straightLine(point1, point2);
            //// установить центр одной линии на верхнем конце стрелки
            line1.position = new paper.Point(0, 0);
            group.addChild(line1);
            //// установить центр второй линии на нижнем конце стрелки
            line2.position = new paper.Point(0, -size);
            group.addChild(line2);

        }

        // повернуть объект на 90 градусов по часовой стрелке, если он должен быть горизонтальный
        if (isHorizontal) group.rotate(90);

        // вернуть объект
        return group;
        
    }

    /**
     * Отрисовать паттерн-ячейку
     */
    static drawCellPattern(pattern, kind) {

        let group = new paper.Group();
        
        // отрисовать прямоугольник 100 на 100
        let cell = this.squareCell('black');
        // установить центр прямоугольника (50, -50)
        cell.position = new paper.Point (250, 250);
        group.addChild(cell);
        // отрисовать фигуру "размер" с параметрами "внешний", "по вертикали",  "100"
        let sizeV = this.figureSize(true, false, 100);
        // установить центр фигуры (-50, -50)
        sizeV.position = new paper.Point (175, 250);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "100"
        let sizeH = this.figureSize(true, true, 100);
        // установить центр фигуры (50, 50)
        sizeH.position = new paper.Point (250, 175);
        group.addChild(sizeH);

        return group;
        
    }

    /**
     * Отрисовать ряд ячеек
     * @param {Number} cellsLeft 
     * @param {Number} blackCellsLeft 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} gap 
     */
    static rowOfCells(cellsLeft, blackCellsLeft, x, y, gap) {

        let row = new paper.Group();
        
        // если длина ряда больше 5
        if (cellsLeft > 5)
        {

            //// отрисовать 2 ячейки с учётом разрыва и цвета
            for (let i = 0; i < 2; i++) {
                let cell;
                if (blackCellsLeft > 0)
                {
                    cell = this.squareCell('black');
                    blackCellsLeft -= 1;
                }
                else cell = this.squareCell('red');
                cell.position = (x, y);
                row.addChild(cell);
                x += 100 + gap;
            }

            //// отрисовать 3 точки с учётом разрыва
            for (let i = 0; i < 2; i++) {
                let dot = this.squareDot();
                dot.position = (x, y);
                row.addChild(dot);
                x += 50;
            }
            
                x += 50;

        }

        // иначе
        else {

            //// отрисовать все ячейки, кроме последней, с учётом разрыва и цвета
            for (let i = 0; i < cellsLeft - 1; i++) {
                let cell;
                if (blackCellsLeft > 0)
                {
                    cell = this.squareCell('black');
                    blackCellsLeft -= 1;
                }
                else cell = this.squareCell('red');
                cell.position = (x, y);
                row.addChild(cell);
                x += 100 + gap;
            }

        }

        // отрисовать последнюю ячейку с учётом цвета
        let lastCell;
        if (blackCellsLeft > 0)
        {
            lastCell = this.squareCell('black');
            blackCellsLeft -= 1;
        }
        else lastCell = this.squareCell('red');
        lastCell.position = (x, y);
        row.addChild(lastCell);
        x += 50;

        return row, x;
        
    }

    /**
     * Отрисовать паттерн-массив
     */
    static squareDot(x) {
        let dot = new paper.Path.Rectangle({
            point: [x, 0],
            size: [10, 10],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
            return dot;
    }

    /**
     * Отрисовать паттерн-массив
     */
    static squareDot() {
        let dot = squareDot(0);
            return dot;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {Number} x 
     */
    static rowOfDots(x) {

        let row = new paper.Group();

        while (x > 0) {

            let dot = squareDot(x);
            row.addChild(dot);
            x -= 50;

        }

        return row;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern, kind) {

        let array = new paper.Group();

        let maxCells = kind.itemCount().getEnd();
        // определить количество гарантированных ячеек
        let blackCells = kind.itemCount().getBegin();
        // определить, есть разрыв или нет
        let gap = kind.gap().getEnd() > 0 ? 100 : 0;
        // определить начальную позицию отрисовки
        let x = 50; let y = -50;
        let maxX; let maxY;
        // определить длину ряда (в ячейках)
        let direction = kind.getDirection();
        let rowNumber; let rowLength;
        //// определить длину ряда как максимальное кол-во ячеек, если направление = 'ROW'
        if (direction = "ROW") rowLength = maxCells;
        //// определить длину ряда как 1, если направление = 'COLUMN'
        else if (direction = "ROW") rowLength = 1;
        //// определить длину ряда как ближайший целый корень максимального кол-ва ячеек
        else if (direction = "FILL") rowLength = Math.ceil(Math.sqrt(maxCells));
        // определить количество рядов как округлённое частное макс. кол-ва ячеек и длины ряда 
        rowNumber = Math.ceil(maxCells / rowLength);
        // если рядов больше 5
        if (rowNumber > 5) {
            
            //// отрисовать 2 ряда ячеек с учётом разрыва 
            for (let i = 0; i < 2; i++) {
                
                x = 50; 
                let row;
                row, x = this.rowOfCells(maxCells, blackCells, x, y, gap); 
                row.position = (x/2, y);
                array.addChild(row);
                maxCells -= rowLength;
                y -= 100 + gap;

            }

            maxX = x;

            //// отрисовать ряд точек с учётом разрыва
            let dots = this.rowOfDots(x);
            dots.position = (x/2, y); //[изменить позицию, добавить расчёт позиции]
            array.addChild(dots);
            y -= 100;
            
        }

        // иначе
        else {
            
            //// отрисовать все ряды, кроме последнего, с учётом разрыва
            for (let i = 0; i < rowNumber - 1; i++) {
                
                x = 50; 
                let row;
                row, x = this.rowOfCells(maxCells, blackCells, x, y, gap); 
                row.position = (x/2, y); //[изменить позицию, добавить расчёт позиции]
                array.addChild(row);
                maxCells -= rowLength;
                y -= 100 + gap;

            }

        }

        // отрисовать последний ряд ячеек с учётом кол-ва оставшихся для отрисовки ячеек
        x = 50; 
        let row;
        row, x = this.rowOfCells(maxCells, blackCells, x, y, gap); 
        row.position = (x/2, y);
        array.addChild(row);
        y -= 50;

        maxY = y;

        if (rowLength > 5) {
            let sizeOutH = this.figureSize(true, true, x);
            sizeOutH.position = (x/2, 50);
            array.addChild(sizeOutH);
        }
        
        if (rowNumber > 5) {
            let sizeOutV = this.figureSize(true, false, -y);
            sizeOutV.position = (-50, y/2);
            array.addChild(sizeOutV);
        }

        if (gap) {
            let sizeInH = this.figureSize(false, true, x);
            sizeInH.position = (x/2, -50);
            let sizeInV = this.figureSize(false, false, -y);
            sizeInV.position = (50, y/2);
        }

        return array;
        
    }

    /**
     * Отрисовать паттерн-область
     * @param {AreaPattern} pattern 
     */
    static drawAreaPattern(pattern, kind) {

        let group = new paper.Group();
        
        // отрисовать прямоугольник 300 на 300
        let area = this.squareArea();
        // установить центр прямоугольника (150, -150)
        area.position = new paper.Point (250, 250);
        group.addChild(area);
        // отрисовать фигуру "размер" с параметрами "внешний", "по вертикали",  "300"
        let sizeV = this.figureSize(true, false, 300);
        // установить центр фигуры (-150, -150)
        sizeV.position = new paper.Point (75, 250);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "300"
        let sizeH = this.figureSize(true, true, 300);
        // установить центр фигуры (150, 150)
        sizeH.position = new paper.Point (250, 75);
        group.addChild(sizeH);

        return group;
        
    }

}