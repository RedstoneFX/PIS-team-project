
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

    static maxX; static maxY;
    static cell_size;
    static gap_size;

    static init() {
        this.exampleVariable1 = 1;
        this.exampleVariable2 = 2;
        this.canvas = document.getElementById("illustration");
        paper.setup(this.canvas);
        this.maxX = 50; this.maxY = 50;
        this.cell_size = 70;
        this.gap_size = 20;
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
            fillColor: 'black'
        });
        return point;
    }

    static verticalLine() {
        let line = new paper.Path.Rectangle({
            point: [0, 0],
            size: [0, this.cell_size],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
        return line;
    }

    static horizontalLine() {
        let line = new paper.Path.Rectangle({
            point: [0, 0],
            size: [this.cell_size, 0],
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
        arrowLeft.position = new paper.Point(5, 0);
        group.addChild(arrowLeft);
        
        let arrowRight = this.gapEndArrow();
        arrowRight.position = new paper.Point(this.cell_size-5, 0);
        group.addChild(arrowRight);

        let line3 = this.horizontalLine();
        line3.position = new paper.Point(this.cell_size/2, 0);
        group.addChild(line3);

        return group;
        
    }

    static sizeHorizontal(x) {

        let group = new paper.Group();

        let line1 = this.verticalLine();
        line1.position = new paper.Point(0, this.cell_size);
        group.addChild(line1);

        let line2 = this.verticalLine();
        line2.position = new paper.Point(x, this.cell_size);
        group.addChild(line2);

        let arrowLeft = this.gapBeginArrow();
        arrowLeft.position = new paper.Point(5, this.cell_size);
        group.addChild(arrowLeft);

        let arrowRight = this.gapEndArrow();
        arrowRight.position = new paper.Point(x-5, this.cell_size);
        group.addChild(arrowRight);

        let line3 = this.horizontalLine();
        line3.position = new paper.Point(x/2, this.cell_size);
        group.addChild(line3);

        return group;
        
    }

    static gapVertical() {

        let group = new paper.Group();

        let arrowDown = this.gapArrowDown();
        arrowDown.position = new paper.Point(0, this.cell_size-5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = new paper.Point(0, this.cell_size+5);
        group.addChild(arrowUp);

        let line3 = this.verticalLine();
        line3.position = new paper.Point(0, this.cell_size/2);
        group.addChild(line3);

        return group;
        
    }

    static sizeVertical(y) {

        let group = new paper.Group();

        let line1 = this.horizontalLine();
        line1.position = new paper.Point(this.cell_size, 0);
        group.addChild(line1);

        let line2 = this.horizontalLine();
        line2.position = new paper.Point(this.cell_size, y);
        group.addChild(line2);

        let arrowDown = this.gapArrowDown();
        arrowDown.position = new paper.Point(this.cell_size, y-5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = new paper.Point(this.cell_size, 5);
        group.addChild(arrowUp);

        let line3 = this.verticalLine();
        line3.position = new paper.Point(this.cell_size, y/2);
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
        let group = new paper.Group();
        if (kind instanceof CellPatternExtension) {
            let cellPattern = this.drawCellPattern(pattern, kind);
            this.elements.push(cellPattern);
            group.addChild(cellPattern);
        }
        else if (kind instanceof ArrayPatternExtension) {
            let arrayPattern = this.drawArrayPattern(pattern, kind);
            this.elements.push(arrayPattern);
            group.addChild(arrayPattern);
        }
        else if (kind instanceof AreaPatternExtension) {
            let areaPattern = this.drawAreaPattern(pattern, kind);
            this.elements.push(areaPattern);
            group.addChild(areaPattern);
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
            size: [this.cell_size, this.cell_size],
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
            size: [this.cell_size*3, this.cell_size*3],
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
        let up = this.triangleArrow(0);
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
            let point2 = new paper.Point(this.cell_size/2, 0);
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
     * @param {Number} rowLength 
     * @param {Number} blackCellsLeft 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} gap 
     */
    static rowOfCells(rowLength, blackCellsLeft, itemCountEnd, x, y, gap, isFirst) {

        let row = new paper.Group();
        
        // если длина ряда больше 5
        if (rowLength > 5)
        {

            //// отрисовать 2 ячейки с учётом разрыва и цвета
            for (let i = 0; i < 2; i++) {
                let cell; 
                if (!isFirst && itemCountEnd == Infinity)
                    cell = this.squareCell('red');
                else if (blackCellsLeft > i)
                {
                    cell = this.squareCell('black');
                }
                else cell = this.squareCell('red');
                cell.position = new paper.Point(x, y);
                row.addChild(cell);
                x += this.cell_size;
                if (i == 0) x += gap;
            }

            //// отрисовать 3 точки с учётом разрыва
            for (let i = 0; i < 3; i++) {
                let dot = this.squareDot();
                dot.position = new paper.Point(x, y);
                row.addChild(dot);
                x += this.cell_size/2;
            }
            
                x += this.cell_size/2;

        }

        // иначе
        else {

            //// отрисовать все ячейки, кроме последней, с учётом разрыва и цвета
            for (let i = 0; i < rowLength - 1; i++) {
                let cell;
                if (blackCellsLeft > i)
                {
                    cell = this.squareCell('black');
                }
                else cell = this.squareCell('red');
                cell.position = new paper.Point(x, y);
                row.addChild(cell);
                x += this.cell_size + gap;
            }

        }

        // отрисовать последнюю ячейку с учётом цвета
        let lastCell;
        if (rowLength > 5 && itemCountEnd == Infinity)
            lastCell = this.squareCell('red');
        else if (blackCellsLeft > rowLength-1)
        {
            lastCell = this.squareCell('black');
        }
        else lastCell = this.squareCell('red');
        lastCell.position = new paper.Point(x, y);
        row.addChild(lastCell);
        x += this.cell_size/2;

        this.maxX = x;

        return row;
        
    }

    /**
     * Отрисовать многоточие
     * @param {Number} x 
     */
    static rowOfDots(x) {

        let row = new paper.Group();
        let xx = x;

        while (xx > 0) {

            let dot = this.squareDot();
            dot.position = new paper.Point(xx, 0);
            row.addChild(dot);
            xx -= this.cell_size/2;

        }

        return row;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern, kind) {

        let array = new paper.Group();

        let itemCountEnd = kind.getItemCount().getEnd();
        let maxCells = itemCountEnd == Infinity ? 36: itemCountEnd;
        // определить количество гарантированных ячеек
        let blackCells = kind.getItemCount().getBegin();
        // определить, есть разрыв или нет
        let gap = kind.getGap().getEnd() > 0 ? this.gap_size : 0;
        // определить начальную позицию отрисовки
        let x = this.cell_size/2; let y = this.cell_size/2;
        // определить длину ряда (в ячейках)
        let direction = kind.getDirection();
        let rowNumber; let rowLength;
        //// определить длину ряда как максимальное кол-во ячеек, если направление = 'ROW'
        if (direction == "row") rowLength = maxCells;
        //// определить длину ряда как 1, если направление = 'COLUMN'
        else if (direction == "column") rowLength = 1;
        //// определить длину ряда как ближайший целый корень максимального кол-ва ячеек
        else if (direction == "fill") rowLength = Math.ceil(Math.sqrt(maxCells));
        // определить количество рядов как округлённое частное макс. кол-ва ячеек и длины ряда 
        rowNumber = Math.ceil(maxCells / rowLength);
        // если рядов больше 5
        if (rowNumber > 5) {
            
            //// отрисовать 2 ряда ячеек с учётом разрыва 
                let row1;
                row1 = this.rowOfCells(rowLength, blackCells, itemCountEnd, x, y, gap, true); 
                row1.position = new paper.Point(this.maxX/2, y);
                array.addChild(row1);
                y += this.cell_size + gap;

                let row2;
                row2 = this.rowOfCells(rowLength, blackCells-rowLength, itemCountEnd, x, y, gap, false); 
                row2.position = new paper.Point(this.maxX/2, y);
                array.addChild(row2);
                y += this.cell_size + gap;

            //// отрисовать ряд точек с учётом разрыва
            let dots = this.rowOfDots(this.maxX);
            dots.position = new paper.Point(this.maxX/2, y); //[изменить позицию, добавить расчёт позиции]
            array.addChild(dots);
            y += this.cell_size;
            
        }

        // иначе
        else {
            
            //// отрисовать все ряды, кроме последнего, с учётом разрыва
            for (let i = 0; i < rowNumber - 1; i++) {
                
                let row;
                row = this.rowOfCells(rowLength, blackCells-i*rowLength, itemCountEnd, x, y, gap, i==0); 
                row.position = new paper.Point(this.maxX/2, y); //[изменить позицию, добавить расчёт позиции]
                array.addChild(row);
                y += this.cell_size + gap;

            }

        }

        // отрисовать последний ряд ячеек с учётом кол-ва оставшихся для отрисовки ячеек
        let row;
        let remainder = maxCells % rowNumber
        let rLen = remainder == 0 ? rowLength : remainder;
        row = this.rowOfCells(rLen, blackCells-(rowNumber-1)*rowLength, itemCountEnd, x, y, gap, rowNumber==1); 
        row.position = new paper.Point(this.maxX/2, y);
        array.addChild(row);
        y += this.cell_size/2;

        this.maxY = y;

        /*if (rowLength > 5) {
            let sizeOutH = this.figureSize(true, true, x);
            sizeOutH.position = new paper.Point(x/2, 50);
            array.addChild(sizeOutH);
        }
        
        if (rowNumber > 5) {
            let sizeOutV = this.figureSize(true, false, y);
            sizeOutV.position = new paper.Point(50, y/2);
            array.addChild(sizeOutV);
        }

        if (gap) {
            let sizeInH = this.figureSize(false, true, x);
            sizeInH.position = new paper.Point(x/2, 50);
            let sizeInV = this.figureSize(false, false, y);
            sizeInV.position = new paper.Point(50, y/2);
        }*/

        array.position = new paper.Point(250, 250);

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