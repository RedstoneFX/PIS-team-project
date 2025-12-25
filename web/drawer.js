
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

    static maxX; static X; static maxY;
    static cell_size;
    static gap_size;
    static max_row_length;

    static init() {
        this.exampleVariable1 = 1;
        this.exampleVariable2 = 2;
        this.canvas = document.getElementById("illustration");
        paper.setup(this.canvas);
        this.maxX = 50; this.X = 0; this.maxY = 50;
        this.cell_size = 70;
        this.gap_size = 30;
        this.max_row_length = 0;
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
        let dot_size = this.cell_size/10;
        let point = new paper.Path.Rectangle({
            point: [0, 0],
            size: [dot_size, dot_size],
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
        let gapBegin = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 3);
        gapBegin.fillColor = 'black';
        gapBegin.rotate(90);
        return gapBegin;
    }

    static gapEndArrow() {
        let gapEnd = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 3);
        gapEnd.fillColor = 'black';
        gapEnd.rotate(-90);
        return gapEnd;
    }

    static gapArrowUp() {
        let gapBegin = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 3);
        gapBegin.fillColor = 'black';
        return gapBegin;
    }

    static gapArrowDown() {
        let gapEnd = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 3);
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
        arrowDown.position = new paper.Point(0, this.cell_size+5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = new paper.Point(0, this.cell_size-5);
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
    static squareArea() {
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

        let from = new paper.Point(0, -3);
        let to = new paper.Point(0, 3-size);

        // отрисовать треугольник в точке (0, -10) с углом поворота в 0 градусов
        let up = this.gapArrowUp();
        up.position = to;
        group.addChild(up);

        // отрисовать второй треугольник в точке (0, 10-(длина стрелки)) с углом поворота в 180 градусов
        let down = this.gapArrowDown();
        down.position = from;
        group.addChild(down);

        // отрисовать между треугольниками прямую линию
        let line = this.straightLine(from, to);
        group.addChild(line);

        // если размер внешний
        if (isOuter) {

            //// отрисовать две линии с параметрами ((0, 0), (30, 0))
            let point1 = new paper.Point(0, 0);
            let point2 = new paper.Point(30, 0);
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
        let sizeV = this.figureSize(true, false, this.cell_size);
        // установить центр фигуры (-50, -50)
        sizeV.position = new paper.Point (200, 250);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "100"
        let sizeH = this.figureSize(true, true, this.cell_size);
        // установить центр фигуры (50, 50)
        sizeH.position = new paper.Point (250, 200);
        group.addChild(sizeH);

        let sizeWidth = new paper.PointText(new paper.Point(0, 0));
        let stringWidth = pattern.getWidth();
        sizeWidth.content = this.toString(stringWidth);
        sizeWidth.position = new paper.Point(250, 193);
        group.addChild(sizeWidth);

        let sizeHeight = new paper.PointText(new paper.Point(0, 0));
        let stringHeight = pattern.getHeight();
        sizeHeight.content = this.toString(stringHeight);
        sizeHeight.position = new paper.Point(193, 250);
        sizeHeight.rotate(-90);
        group.addChild(sizeHeight);

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

        if (rowLength > 5) {
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

            if (rowLength == this.max_row_length) {
                //// отрисовать 3 точки с учётом разрыва
                for (let i = 0; i < 2; i++) {
                    let dot = this.squareDot();
                    dot.position = new paper.Point(x, y);
                    row.addChild(dot);
                    x += this.cell_size/2;
                }
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
        if (this.maxX > this.X) this.X = this.maxX;

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

        this.X = 0;

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
        this.max_row_length = rowLength;
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
                y += this.cell_size;

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
        let remainder = maxCells % rowLength
        let rLen = remainder == 0 ? rowLength : remainder;
        let drawnCells = (rowNumber-1)*rowLength;
        let row = this.rowOfCells(rLen, blackCells-drawnCells, itemCountEnd, x, y, gap, rowNumber==1); 
        row.position = new paper.Point(this.maxX/2, y);
        array.addChild(row);
        y += this.cell_size/2;

        this.maxY = y;

        if (rLen < this.max_row_length) {
            let sizeOutH = this.figureSize(true, true, this.maxX);
            sizeOutH.position = new paper.Point(this.maxX/2, this.maxY+15);
            array.addChild(sizeOutH);
            let length = new paper.PointText(new paper.Point(0, 0));
            let string = "";
            string += kind.getItemCount().getEnd() == Infinity ? 0 : kind.getItemCount().getEnd() - rowLength * (rowNumber - 1);
            string += "..";
            string += remainder;
            length.content = string;
            length.position = new paper.Point(this.maxX/2, this.maxY+25);
            array.addChild(length);
        }

        if (rowLength > 5) {
            let sizeOutH = this.figureSize(true, true, this.X);
            sizeOutH.position = new paper.Point(this.X/2, -this.cell_size/2);
            array.addChild(sizeOutH);
            let length = new paper.PointText(new paper.Point(0, 0));
            let string = "";
            string += Math.min(kind.getItemCount().getBegin(), rowLength);
            string += "..";
            if (itemCountEnd != Infinity)
                string += rowLength;
            length.content = string;
            length.position = new paper.Point(this.X/2, -this.cell_size/2-7);
            array.addChild(length);
        }
        
        if (rowNumber > 5) {
            let sizeOutV = this.figureSize(true, false, this.maxY);
            sizeOutV.position = new paper.Point(-this.cell_size/2, this.maxY/2);
            array.addChild(sizeOutV);
            let number = new paper.PointText(new paper.Point(0, 0));
            let string = "";
            string += Math.min(Math.ceil(kind.getItemCount().getBegin() / rowLength), rowNumber);
            string += "..";
            if (itemCountEnd != Infinity)
                string += rowNumber;
            number.content = string;
            number.rotate(-90);
            number.position = new paper.Point(-this.cell_size/2-7, this.maxY/2);
            array.addChild(number);
        }

        if (gap) {
            if (direction != "column"){
                let sizeInH = this.figureSize(false, true, gap);
                sizeInH.position = new paper.Point(this.cell_size+gap/2, 0);
                array.addChild(sizeInH);
                let size = new paper.PointText(new paper.Point(0, 0));
                let string = kind.getGap();
                size.content = this.toString(string);
                size.position = new paper.Point(this.cell_size+gap/2, -7);
                array.addChild(size);
            }
            if (direction != "row") {
                let sizeInV = this.figureSize(false, false, gap);
                sizeInV.position = new paper.Point(0, this.cell_size+gap/2);
                array.addChild(sizeInV);
                let size = new paper.PointText(new paper.Point(0, 0));
                let string = kind.getGap();
                size.content = this.toString(string);
                size.rotate(-90);
                size.position = new paper.Point(-7, this.cell_size+gap/2);
                array.addChild(size);
            }
        }

        array.position = new paper.Point(250, 250);

        return array;
        
    }

    static toString(newInterval) {

        let gap = "";
        let begin = newInterval.getBegin();
        let end = newInterval.getEnd();

        if (begin == -Infinity)
        {
            if (end == Infinity) 
            {
                gap += "*";
                return gap;
            }
        }
        else
        {
            gap += begin;
        }

        gap += "..";

        if (end != Infinity)
        {
            gap += end;
        }

        return gap;

    }

    /**
     * Отрисовать паттерн-область
     * @param {AreaPattern} pattern 
     */
    static drawAreaPattern(pattern, kind) {

        let group = new paper.Group();

        let area_size = this.cell_size*3;
        
        // отрисовать прямоугольник 300 на 300
        let area = this.squareArea();
        // установить центр прямоугольника (150, -150)
        area.position = new paper.Point (250, 250);
        group.addChild(area);
        // отрисовать фигуру "размер" с параметрами "внешний", "по вертикали",  "300"
        let sizeV = this.figureSize(true, false, area_size);
        // установить центр фигуры (-150, -150)
        sizeV.position = new paper.Point (130, 250);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "300"
        let sizeH = this.figureSize(true, true, area_size);
        // установить центр фигуры (150, 150)
        sizeH.position = new paper.Point (250, 130);
        group.addChild(sizeH);

        let sizeWidth = new paper.PointText(new paper.Point(0, 0));
        let stringWidth = pattern.getWidth();
        sizeWidth.content = this.toString(stringWidth);
        sizeWidth.position = new paper.Point(250, 123);
        group.addChild(sizeWidth);

        let sizeHeight = new paper.PointText(new paper.Point(0, 0));
        let stringHeight = pattern.getHeight();
        sizeHeight.content = this.toString(stringHeight);
        sizeHeight.rotate(-90);
        sizeHeight.position = new paper.Point(123, 250);
        group.addChild(sizeHeight);

        return group;
        
    }

    /**
     * Отрисовать компонент
     * @param {Component} component 
     */
    static drawComponent(component) {

        let group = new paper.Group();

        this.clearCanvas();

        let location = component.location();

        let left = location.getLeft();
        let right = location.getRight();
        let top = location.getTop();
        let bottom = location.getBottom();

        let array1 = [left, right, top, bottom];

        let leftPadding = location.isLeftPadding();
        let rightPadding = location.isRightPadding();
        let topPadding = location.isTopPadding();
        let bottomPadding = location.isBottomPadding();
        
        let arrayPadding = [leftPadding, rightPadding, topPadding, bottomPadding];

        let leftMargin = !leftPadding;
        let rightMargin = !rightPadding;
        let topMargin = !topPadding;
        let bottomMargin = !bottomPadding;

        let leftIsZero = left.getBegin() == 0 & left.getEnd() == 0;
        let rightIsZero = right.getBegin() == 0 & right.getEnd() == 0;
        let topIsZero = top.getBegin() == 0 & top.getEnd() == 0;
        let bottomIsZero = bottom.getBegin() == 0 & bottom.getEnd() == 0;
        
        let arrayIsZero = [leftIsZero, rightIsZero, topIsZero, bottomIsZero];

        //рисуем отцовский паттерн
        let parent = this.squareArea();
        parent.position = new paper.Point(250, 250);

        group.addChild(parent);

        let childWidth = this.cell_size;
        let childHeight = this.cell_size;
        
        let childX = 250;
        let childY = 250;

        let cases = 0;

        if (leftPadding & rightPadding & topPadding & bottomPadding)
            cases = 1;
        else if ((leftMargin || rightMargin) & topPadding & bottomPadding)
            cases = 2;
        else if (leftPadding & rightPadding & (topMargin || bottomMargin))
            cases = 3;

        
            if(cases == 1) {
                for (let i = 0; i < 4; i++) {
                    if(arrayIsZero[i]) {
                        if (i < 2)
                        {
                            childWidth += this.cell_size;

                            if (i == 0)
                                childX -= this.cell_size/2;
                            else
                                childX += this.cell_size/2;

                            let x = 250 + (i == 1 ? this.cell_size*3/2 : -this.cell_size*3/2); 
                            
                            let innerSizeH = this.figureSize(false, true, 0);
                            innerSizeH.position = new paper.Point(x, 250);
                            group.addChild(innerSizeH);

                            let string = new paper.PointText(new paper.Point(0, 0));
                            string.content = this.toString(array1[i]);
                            string.rotate(-90);
                            string.position = new paper.Point(i == 0 ? x-13 : x+13, 250);
                            group.addChild(string);
                        }
                        else
                        {
                            childHeight += this.cell_size;
                        
                            if (i == 2)
                                childY -= this.cell_size/2;
                            else
                                childY += this.cell_size/2;

                            let y = 250 + (i == 3 ? this.cell_size*3/2 : -this.cell_size*3/2); 
                            
                            let innerSizeV = this.figureSize(false, false, 0);
                            innerSizeV.position = new paper.Point(250, y);
                            group.addChild(innerSizeV);
                        
                            let string = new paper.PointText(new paper.Point(0, 0));
                            string.content = this.toString(array1[i]);
                            string.position = new paper.Point(250, i == 2 ? y-13 : y+13);
                            group.addChild(string);
                        }
                    }
                    else {
                        
                        if(i < 2) {
                            let innerSizeH = this.figureSize(false, true, this.cell_size);
                            innerSizeH.position = new paper.Point(180+i*140, 250);
                            group.addChild(innerSizeH);

                            let string = new paper.PointText(new paper.Point(0, 0));
                            string.content = this.toString(array1[i]);
                            string.position = new paper.Point(180+i*140, 243);
                            group.addChild(string);
                        }
                        else {
                            let innerSizeV = this.figureSize(false, false, this.cell_size);
                            innerSizeV.position = new paper.Point(250, i*140-100);
                            group.addChild(innerSizeV);
                        
                            let string = new paper.PointText(new paper.Point(0, 0));
                            string.content = this.toString(array1[i]);
                            string.rotate(-90);
                            string.position = new paper.Point(243, i*140-100);
                            group.addChild(string);
                        }

                    }
                }
            }
            else if(cases == 2) {
                let gapSize;
                let gapSizeX;

                let topArrowLength = topIsZero ? 0 : this.cell_size;
                let bottomArrowLength = bottomIsZero ? 0 : this.cell_size;

                if (leftMargin) {
                    if (leftIsZero)
                    {
                        gapSize = this.cell_size*2;
                        gapSizeX = 250 - this.cell_size*3/2;
                    }
                    else
                    {
                        gapSize = this.cell_size*3;
                        gapSizeX = 250 - this.cell_size*2;
                    }

                    childX -= gapSize;
                    
                    let line1point1 = new paper.Point(250 - gapSize, 250 - this.cell_size*3/2);
                    let line1point2 = new paper.Point(250 - this.cell_size*3/2, 250 - this.cell_size*3/2);
                    let line1 = this.straightLine(line1point1, line1point2);
                    group.addChild(line1);

                    let line2point1 = new paper.Point(250 - gapSize, 250 + this.cell_size*3/2);
                    let line2point2 = new paper.Point(250 - this.cell_size*3/2, 250 + this.cell_size*3/2);
                    let line2 = this.straightLine(line2point1, line2point2);
                    group.addChild(line2);

                }
                else {
                    if (rightIsZero)
                    {
                        gapSize = this.cell_size*2;
                        gapSizeX = 250 + this.cell_size*3/2;
                    }
                    else
                    {
                        gapSize = this.cell_size*3;
                        gapSizeX = 250 + this.cell_size*2;

                    }

                    childX += gapSize;
                    
                    let line1point1 = new paper.Point(250 + gapSize, 250 - this.cell_size*3/2);
                    let line1point2 = new paper.Point(250 + this.cell_size*3/2, 250 - this.cell_size*3/2);
                    let line1 = this.straightLine(line1point1, line1point2);
                    group.addChild(line1);

                    let line2point1 = new paper.Point(250 + gapSize, 250 + this.cell_size*3/2);
                    let line2point2 = new paper.Point(250 + this.cell_size*3/2, 250 + this.cell_size*3/2);
                    let line2 = this.straightLine(line2point1, line2point2);
                    group.addChild(line2);

                }

                if(topIsZero) {
                    childHeight += this.cell_size;
                    childY -= this.cell_size / 2;
                }

                if(bottomIsZero) {
                    childHeight += this.cell_size;
                    childY += this.cell_size / 2;
                }

                    let topArrow = this.figureSize(false, false, topArrowLength);
                    topArrow.position = new paper.Point(childX, 250 - this.cell_size*3/2 + topArrowLength/2);
                    group.addChild(topArrow);

                    let topText = new paper.PointText(new paper.Point(0, 0));
                    topText.content = this.toString(top);
                    if (topIsZero) {
                        topText.position = new paper.Point(childX, 250 - this.cell_size*3/2 - 13);
                    }
                    else {
                        topText.rotate(-90);
                        topText.position = new paper.Point(childX - 7, 250 - this.cell_size);
                    }
                    group.addChild(topText);

                    let bottomArrow = this.figureSize(false, false, bottomArrowLength);
                    bottomArrow.position = new paper.Point(childX, 250 + this.cell_size*3/2 - bottomArrowLength/2);
                    group.addChild(bottomArrow);

                    let bottomText = new paper.PointText(new paper.Point(0, 0));
                    bottomText.content = this.toString(bottom);
                    if (bottomIsZero) {
                        bottomText.position = new paper.Point(childX, 250 + this.cell_size*3/2 + 13);
                    }
                    else {
                        bottomText.rotate(-90);
                        bottomText.position = new paper.Point(childX - 7, 250 + this.cell_size);
                    }
                    group.addChild(bottomText);

                let gapSizeArrowSize = gapSize - this.cell_size*2;
                let gapSizeArrows = this.figureSize(false, true, gapSizeArrowSize);
                gapSizeArrows.position = new paper.Point(gapSizeX, 250);
                group.addChild(gapSizeArrows);

                let string = new paper.PointText(new paper.Point(0, 0));
                string.content = this.toString(leftPadding ? right : left);

                if(gapSizeArrowSize > 0)
                {
                    string.position = new paper.Point(gapSizeX, 243);
                }
                else {
                    string.rotate(-90);
                    string.position = new paper.Point(gapSizeX-13, 250);
                }

                group.addChild(string);
            }
            else if(cases == 3) {
                let gapSize;
                let gapSizeY;

                let leftArrowLength = leftIsZero ? 0 : this.cell_size;
                let rightArrowLength = rightIsZero ? 0 : this.cell_size;

                if (topMargin) {
                    if (topIsZero)
                    {
                        gapSize = this.cell_size*2;
                        gapSizeY = 250 - this.cell_size*3/2;
                    }
                    else
                    {
                        gapSize = this.cell_size*3;
                        gapSizeY = 250 - this.cell_size*2;
                    }

                    childY -= gapSize;

                    let line1point1 = new paper.Point(250 - this.cell_size*3/2, 250 - gapSize);
                    let line1point2 = new paper.Point(250 - this.cell_size*3/2, 250 - this.cell_size*3/2);
                    let line1 = this.straightLine(line1point1, line1point2);
                    group.addChild(line1);

                    let line2point1 = new paper.Point(250 + this.cell_size*3/2, 250 - gapSize);
                    let line2point2 = new paper.Point(250 + this.cell_size*3/2, 250 - this.cell_size*3/2);
                    let line2 = this.straightLine(line2point1, line2point2);
                    group.addChild(line2);

                }
                else {
                    if (bottomIsZero)
                    {
                        gapSize = this.cell_size*2;
                        gapSizeY = 250 + this.cell_size*3/2;
                    }
                    else
                    {
                        gapSize = this.cell_size*3;
                        gapSizeY = 250 + this.cell_size*2;

                    }

                    childY += gapSize;

                    let line1point1 = new paper.Point(250 - this.cell_size*3/2, 250 + gapSize);
                    let line1point2 = new paper.Point(250 - this.cell_size*3/2, 250 + this.cell_size*3/2);
                    let line1 = this.straightLine(line1point1, line1point2);
                    group.addChild(line1);

                    let line2point1 = new paper.Point(250 + this.cell_size*3/2, 250 + gapSize);
                    let line2point2 = new paper.Point(250 + this.cell_size*3/2, 250 + this.cell_size*3/2);
                    let line2 = this.straightLine(line2point1, line2point2);
                    group.addChild(line2);

                }

                if(leftIsZero) {
                    childWidth += this.cell_size;
                    childX -= this.cell_size / 2;
                }

                if(rightIsZero) {
                    childWidth += this.cell_size;
                    childX += this.cell_size / 2;
                }
                    
                    let leftArrow = this.figureSize(false, true, leftArrowLength);
                    leftArrow.position = new paper.Point(250 - this.cell_size*3/2 + leftArrowLength/2, childY);
                    group.addChild(leftArrow);

                    let leftText = new paper.PointText(new paper.Point(0, 0));
                    leftText.content = this.toString(left);
                    if (leftIsZero) {
                        leftText.rotate(-90);
                        leftText.position = new paper.Point(250 - this.cell_size*3/2 - 13, childY);
                    }
                    else {
                        leftText.position = new paper.Point(250 - this.cell_size, childY - 7);
                    }
                    group.addChild(leftText);

                    let rightArrow = this.figureSize(false, true, rightArrowLength);
                    rightArrow.position = new paper.Point(250 + this.cell_size*3/2 - rightArrowLength/2, childY);
                    group.addChild(rightArrow);

                    let rightText = new paper.PointText(new paper.Point(0, 0));
                    rightText.content = this.toString(right);
                    if (rightIsZero) {
                        rightText.rotate(-90);
                        rightText.position = new paper.Point(250 + this.cell_size*3/2 + 13, childY);
                    }
                    else {
                        rightText.position = new paper.Point(250 + this.cell_size, childY - 7);
                    }
                    group.addChild(rightText);

                let gapSizeArrowSize = gapSize - this.cell_size*2;
                let gapSizeArrows = this.figureSize(false, false, gapSizeArrowSize);
                gapSizeArrows.position = new paper.Point(250, gapSizeY);
                group.addChild(gapSizeArrows);

                let string = new paper.PointText(new paper.Point(0, 0));
                string.content = this.toString(topPadding ? bottom : top);

                if(gapSizeArrowSize > 0)
                {
                    string.rotate(-90);
                    string.position = new paper.Point(243, gapSizeY);
                }
                else {
                    string.position = new paper.Point(250, gapSizeY-13);
                }

                group.addChild(string);
            }
            else {

                let gapSizeX;
                let gapSizeY;

                if(leftMargin) {
                    if (leftIsZero)
                        gapSizeX = this.cell_size*2;
                    else
                        gapSizeX = this.cell_size*3;
                    childX -= gapSizeX;
                }
                else if (rightMargin) {
                    if (rightIsZero)
                        gapSizeX = this.cell_size*2;
                    else
                        gapSizeX = this.cell_size*3;
                    childX += gapSizeX;
                }

                if(topMargin) {
                    if (topIsZero)
                        gapSizeY = this.cell_size*2;
                    else
                        gapSizeY = this.cell_size*3;
                    childY -= gapSizeY;
                }
                else if (bottomMargin) {
                    if (bottomIsZero)
                        gapSizeY = this.cell_size*2;
                    else
                        gapSizeY = this.cell_size*3;
                    childY += gapSizeY;
                }

                let lineHorizontalPoint1; let lineHorizontalPoint2;
                let lineVerticalPoint1; let lineVerticalPoint2;

                if(leftMargin) {
                    lineVerticalPoint1 = new paper.Point(250-this.cell_size*3/2, 250);
                    if(topMargin)
                        lineVerticalPoint2 = new paper.Point(250-this.cell_size*3/2, 250 - gapSizeX);
                    else
                        lineVerticalPoint2 = new paper.Point(250-this.cell_size*3/2, 250 + gapSizeX);
                }
                else {
                    lineVerticalPoint1 = new paper.Point(250+this.cell_size*3/2, 250);
                    if(topMargin)
                        lineVerticalPoint2 = new paper.Point(250+this.cell_size*3/2, 250 - gapSizeX);
                    else
                        lineVerticalPoint2 = new paper.Point(250+this.cell_size*3/2, 250 + gapSizeX);
                }

                if(topMargin) {
                    lineHorizontalPoint1 = new paper.Point(250, 250-this.cell_size*3/2);
                    if(leftMargin)
                        lineHorizontalPoint2 = new paper.Point(250 - gapSizeY, 250-this.cell_size*3/2);
                    else
                        lineHorizontalPoint2 = new paper.Point(250 + gapSizeY, 250-this.cell_size*3/2);
                }
                else {
                    lineHorizontalPoint1 = new paper.Point(250, 250+this.cell_size*3/2);
                    if(leftMargin)
                        lineHorizontalPoint2 = new paper.Point(250 - gapSizeY, 250+this.cell_size*3/2);
                    else
                        lineHorizontalPoint2 = new paper.Point(250 + gapSizeY, 250+this.cell_size*3/2);
                }

                let lineHorizontal = this.straightLine(lineHorizontalPoint1, lineHorizontalPoint2);
                group.addChild(lineHorizontal);

                let lineVertical = this.straightLine(lineVerticalPoint1, lineVerticalPoint2);
                group.addChild(lineVertical);

                let arrowHorizontal = this.figureSize(false, true, this.cell_size);
                let arrowHorizontalX = lineVerticalPoint2.x - (leftMargin ? this.cell_size/2 : -(this.cell_size/2));
                arrowHorizontal.position = new paper.Point(arrowHorizontalX, lineVerticalPoint2.y);
                group.addChild(arrowHorizontal);

                let textArrowHorizontal = new paper.PointText(new paper.Point(0, 0));
                if (leftMargin)
                    textArrowHorizontal.content = this.toString(left);
                else
                    textArrowHorizontal.content = this.toString(right);
                textArrowHorizontal.position = new paper.Point(arrowHorizontalX, lineVerticalPoint2.y+13);
                group.addChild(textArrowHorizontal);

                let arrowVertical = this.figureSize(false, false, this.cell_size);
                let arrowVerticalY = lineHorizontalPoint2.y - (topMargin ? this.cell_size/2 : -(this.cell_size/2));
                arrowVertical.position = new paper.Point(lineHorizontalPoint2.x, arrowVerticalY);
                group.addChild(arrowVertical);

                let textArrowVertical = new paper.PointText(new paper.Point(0, 0));
                if (topMargin)
                    textArrowVertical.content = this.toString(top);
                else
                    textArrowVertical.content = this.toString(bottom);
                textArrowVertical.position = new paper.Point(lineHorizontalPoint2.x+13, arrowVerticalY);
                group.addChild(textArrowVertical);

            }

        let child = new paper.Path.Rectangle({
            point: [0, 0],
            size: [childWidth, childHeight],
            strokeColor: "black",
            strokeWidth: 2,
            fillColor: null
        });

        child.position = new paper.Point(childX, childY);

        group.addChild(child);

        group.position = new paper.Point(250, 250);

        this.elements.push(group);
        return group;

    }

}