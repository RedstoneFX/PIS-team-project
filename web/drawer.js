
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
     * Отрисовать квадратную ячейку
     */
    static squareCell() {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [300, 300],
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

    /**
     * Отрисовать ряд ячеек
     * @param {Number} cellsLeft 
     * @param {Number} blackCellsLeft 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} gap 
     */
    static rowOfCells(cellsLeft, blackCellsLeft, x, y, gap) {

        let row;
        
        // если длина ряда больше 5
        if (cellsLeft > 5)
        {

            //// отрисовать 2 ячейки с учётом разрыва и цвета
            for (let i = 0; i < 2; i++) {
                let cell;
                if (blackCellsLeft > 0)
                {
                    cell = this.squareCell(new Color(1));
                    blackCellsLeft -= 1;
                }
                else cell = this.squareCell(new Color(0.5));
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
                    cell = this.squareCell(new Color(1));
                    blackCellsLeft -= 1;
                }
                else cell = this.squareCell(new Color(0.5));
                cell.position = (x, y);
                row.addChild(cell);
                x += 100 + gap;
            }

        }

        // отрисовать последнюю ячейку с учётом цвета
        let lastCell;
        if (blackCellsLeft > 0)
        {
            lastCell = this.squareCell(new Color(1));
            blackCellsLeft -= 1;
        }
        else lastCell = this.squareCell(new Color(0.5));
        lastCell.position = (x, y);
        row.addChild(lastCell);
        x += 50;

        return row, x;
        
    }

    /**
     * Отрисовать паттерн-массив
     */
    static squareDot(x) {
        return new paper.Path.Rectangle({
            point: [x, 0],
            size: [10, 10],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
    }

    /**
     * Отрисовать паттерн-массив
     */
    static squareDot() {
        return squareDot(0);
    }

    /**
     * Отрисовать паттерн-массив
     * @param {Number} x 
     */
    static rowOfDots(x) {

        let row;

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
    static drawArrayPattern(pattern, kind, group) {

        let array;

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
    static drawAreaPattern(pattern, kind, group) {
        
        // отрисовать прямоугольник 300 на 300
        let area = this.squareArea();
        // установить центр прямоугольника (150, -150)
        area.position = (150, -150);
        group.addChild(area);
        // отрисовать фигуру "размер" с параметрами "внешний", "по вертикали",  "100"
        sizeV = figureSize(true, false, 300);
        // установить центр фигуры (-150, -150)
        sizeV.position = (-150, -150);
        group.addChild(sizeV);
        // отрисовать фигуру "размер" с параметрами "внешний", "по горизонтали",  "100"
        sizeH = figureSize(true, true, 300);
        // установить центр фигуры (150, 150)
        sizeH.position = (150, 150);
        group.addChild(sizeH);
        
    }

    /**
     * Отрисовать компонент
     * @param {Component} component 
     */
    static drawComponent(component) {
        
        let group;

        group.addChild(this.drawAreaPattern());

        let child = component.getPattern;
        
    }

}