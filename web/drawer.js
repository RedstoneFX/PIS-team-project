
/// <reference path="converter.js" />
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

    static squareCell(color) {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [100, 100],
            strokeColor: color,
            strokeWidth: 2,
            fillColor: null
        });
    }

    static squareArea() {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [500, 500],
            strokeColor: color,
            strokeWidth: 2,
            fillColor: null
        });
    }

    static squareDot() {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [10, 10],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: null
        });
    }

    static verticalLine() {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [0, 100],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
    }

    static horizontalLine() {
        return new paper.Path.Rectangle({
            point: [0, 0],
            size: [100, 0],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'black'
        });
    }

    static gapBeginArrow() {
        let gapBegin = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        gapBegin.fillColor = 'black';
        gapBegin.rotate(-90);
        return gapBegin;
    }

    static gapEndArrow() {
        let gapEnd = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        gapEnd.fillColor = 'black';
        gapEnd.rotate(90);
        return gapEnd;
    }

    static gapArrowUp() {
        let gapBegin = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        gapBegin.fillColor = 'black';
        return gapBegin;
    }

    static gapArrowDown() {
        let gapEnd = new paper.Path.RegularPolygon(new Point(0, 0), 3, 5);
        gapEnd.fillColor = 'black';
        gapEnd.rotate(180);
        return gapEnd;
    }

    static gapHorizontal() {

        let group;

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

        let group;

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

        let group;

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

        let group;

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
        this.clearCanvas();

        let group;

        if (pattern instanceof CellPattern) {
            const figure = this.drawCellPattern(pattern, group);
            this.elements.push(figure);
        }
        else if (pattern instanceof ArrayPattern) {
            const figure = this.drawArrayPattern(pattern, group);
            this.elements.push(figure);
        }
        else if (pattern instanceof AreaPattern) {
            const figure = this.drawAreaPattern(pattern, group);
            this.elements.push(figure);
        }
        else throw new Error("Нельзя отрисовать данный объект!");
    }

    /**
     * Отрисовать паттерн-ячейку
     */
    static drawCellPattern(pattern, group) {

        let cell = this.squareCell('black');
        cell.position = (0, 0);
        group.addChild(cell);

        let sizeH = this.sizeHorizontal(100);
        sizeH.position = (0, 100);
        group.addChild(sizeH);

        let sizeV = this.sizeVertical(100);
        sizeV.position = (-100, 0);
        group.addChild(sizeV);

    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern, group) {
    
        // Создаем ячейки в зависимости от направления
        switch (pattern.direction) {
            case 'ROW':
                this.drawRowArray(pattern, group);
                break;
            case 'COLUMN':
                this.drawColumnArray(pattern, group);
                break;
            case 'FILL':
                this.drawFillArray(pattern, group);
                break;
        }

        return group;

    }

    /**
     * Отрисовать массив в строку
     */
    static drawRowArray(pattern, group) {

        const minItemCount = Math.max(pattern.itemCount.getBegin(), 0);
        const maxItemCount = Math.max(pattern.itemCount.getEnd(), 0);

        const maxGap = Math.max(pattern.gap.getEnd(), 0);
        
        let x = 50;

        if (maxGap == 0) {
            if (minItemCount == maxItemCount) {
                if (maxItemCount > 5) {
                    for (i = 0; i < 2; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (x, 0);
                        group.addChild(dot);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 50;

                    let size = this.sizeHorizontal(x);
                    size.position = (x/2, 100);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                }
            }
            else {
                if (maxItemCount > 5) {
                    let blackCells = Math.min(2, minItemCount);
                    let greyCells = 2 - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (x, 0);
                        group.addChild(dot);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 50;

                    let size = this.sizeHorizontal(x);
                    size.position = (x/2, 100);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                }
            }
        }
        else {
            if (minItemCount == maxItemCount) {
                if (maxItemCount > 5) {

                    for (i = 0; i < 2; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }

                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (x, 0);
                        group.addChild(dot);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 50;

                    let gap = this.gapHorizontal();
                    gap.position = (50, 0);
                    group.addChild(gap);

                    let size = this.sizeHorizontal(x);
                    size.position = (x/2, 100);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }

                    let gap = this.gapHorizontal();
                    gap.position = (50, 0);
                    group.addChild(gap);
                }
            }
            else {
                if (maxItemCount > 5) {
                    let blackCells = Math.min(2, minItemCount);
                    let greyCells = 2 - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (x, 0);
                        group.addChild(dot);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 50;

                    let gap = this.gapHorizontal();
                    gap.position = (50, 0);
                    group.addChild(gap);

                    let size = this.sizeHorizontal(x);
                    size.position = (x/2, 100);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (x, 0);
                        group.addChild(cell);
                        x += 100;
                    }

                    let gap = this.gapHorizontal();
                    gap.position = (50, 0);
                    group.addChild(gap);
                }
            }
        }
    }


    /**
     * Отрисовать массив в колонку
     */
    static drawColumnArray(pattern, group) {

        const minItemCount = Math.max(pattern.itemCount.getBegin(), 0);
        const maxItemCount = Math.max(pattern.itemCount.getEnd(), 0);

        const maxGap = Math.max(pattern.gap.getEnd(), 0);
        
        let y = -50;

        if (maxGap == 0) {
            if (minItemCount == maxItemCount) {
                if (maxItemCount > 5) {
                    for (i = 0; i < 2; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, y);
                        group.addChild(dot);
                        y -= 50;
                    }
                        y -= 50;
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 50;

                    let size = this.sizeVertical(y);
                    size.position = (-100, y/2);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                }
            }
            else {
                if (maxItemCount > 5) {
                    let blackCells = Math.min(2, minItemCount);
                    let greyCells = 2 - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, y);
                        group.addChild(dot);
                        y -= 50;
                    }
                        y -= 50;
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 50;

                    let size = this.sizeVertical(y);
                    size.position = (-100, y/2);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                }
            }
        }
        else {
            if (minItemCount == maxItemCount) {
                if (maxItemCount > 5) {

                    for (i = 0; i < 2; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }

                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, y);
                        group.addChild(dot);
                        y -= 50;
                    }
                        y -= 50;
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 50;

                    let gap = this.gapVertical();
                    gap.position = (0, -50);
                    group.addChild(gap);

                    let size = this.sizeVertical(y);
                    size.position = (-100, y/2);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }

                    let gap = this.gapVertical();
                    gap.position = (0, -50);
                    group.addChild(gap);
                }
            }
            else {
                if (maxItemCount > 5) {
                    let blackCells = Math.min(2, minItemCount);
                    let greyCells = 2 - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, y);
                        group.addChild(dot);
                        y -= 50;
                    }
                        y -= 50;
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 50;

                    let gap = this.gapVertical();
                    gap.position = (0, -50);
                    group.addChild(gap);

                    let size = this.sizeVertical(y);
                    size.position = (-100, y/2);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, y);
                        group.addChild(cell);
                        y -= 100;
                    }

                    let gap = this.gapVertical();
                    gap.position = (0, -50);
                    group.addChild(gap);
                }
            }
        }
    }

    /**
     * Отрисовать массив с заполнением в обоих направлениях
     */
    static drawFillArray(pattern, group) {

        const minItemCount = Math.max(pattern.itemCount.getBegin(), 0);
        const maxItemCount = Math.max(pattern.itemCount.getEnd(), 0);

        const maxGap = Math.max(pattern.gap.getEnd(), 0);

        const columns = Math.ceil(Math.sqrt(maxItemCount));
        const rows = Math.ceil(maxItemCount / columns);

        const gap = maxGap > 0 ? 100 : 0;
        
        let x = 50;
        let y = -50;

        if (columns > 5) {
            for (i = 0; i < 2; i++) {
                if (i < minItemCount) {
                    let cell = this.squareCell('black');
                    cell.position = (x, y);
                    group.addChild(cell);
                }
                else {
                    let cell = this.squareCell('grey');
                    cell.position = (x, y);
                    group.addChild(cell);
                }
                    x += 100 + gap;
            }

            x -= gap;

            for (i = 0; i < 3; i++) {
                let dot = this.squareDot();
                dot.position = (x, y);
                group.addChild(dot);
                x += 50;
            }

            x += 50;
            
            if (columns <= minItemCount) {
                let cell = this.squareCell('black');
                cell.position = (x, y);
                group.addChild(cell);
                x += 50;
            }
            else {
                let cell = this.squareCell('grey');
                cell.position = (x, y);
                group.addChild(cell);
                x += 50;
            }

        }
        else {
            for (i = 0; i < columns; i++) {
                if (i < minItemCount) {
                    let cell = this.squareCell('black');
                    cell.position = (x, y);
                    group.addChild(cell);
                    x += 100 + gap;
                }
                else {
                    let cell = this.squareCell('grey');
                    cell.position = (x, y);
                    group.addChild(cell);
                    x += 100 + gap;
                }
            }
        }

        x = 50;
        y -= 100 + gap;

        if (rows > 5) {
            if (columns + 1 <= minItemCount) {
                let cell = this.squareCell('black');
                cell.position = (x, y);
                group.addChild(cell);
            }
            else {
                let cell = this.squareCell('grey');
                cell.position = (x, y);
                group.addChild(cell);
            }
                y -= 100;

            for (i = 0; i < 3; i++) {
                let dot = this.squareDot();
                dot.position = (x, y);
                group.addChild(dot);
                y -= 50;
            }

            y -= 50;
            
            if (columns * (rows - 1) + 1 < minItemCount) {
                let cell = this.squareCell('black');
                cell.position = (x, y);
                group.addChild(cell);
                y -= 50;
            }
            else {
                let cell = this.squareCell('grey');
                cell.position = (x, y);
                group.addChild(cell);
                y -= 50;
            }

        }
        else {
            for (i = 1; i < columns; i++) {
                if (columns * i + 1 < minItemCount) {
                    let cell = this.squareCell('black');
                    cell.position = (x, y);
                    group.addChild(cell);
                    y -= 100 + gap;
                }
                else {
                    let cell = this.squareCell('grey');
                    cell.position = (x, y);
                    group.addChild(cell);
                    y -= 100 + gap;
                }
            }
        }

        if (gap > 0) {            

            let gapH = this.gapHorizontal();
            gapH.position = (150, -50);
            group.addChild(gapH);

            let gapV = this.gapVertical();
            gapV.position = (50, -150);
            group.addChild(gapV);

        }

    }

    /**
     * Отрисовать паттерн-структуру
     * @param {AreaPattern} pattern 
     */
    static drawAreaPattern(pattern, group) {

        let cell = this.squareArea();
        cell.position = (250, 250);
        group.addChild(cell);

        let sizeH = this.sizeHorizontal(500);
        sizeH.position = (250, 550);
        group.addChild(sizeH);

        let sizeV = this.sizeVertical(500);
        sizeV.position = (-50, 250);
        group.addChild(sizeV);

        return group

    }


    /**
     * Отрисовать компонент
     * @param {Component} component
     */
    static drawComponent(component) {
        let group = new paper.Group();
    
        // Получаем отступы из location
        const cellLocation = component.location;
        const cellPadding = cellLocation.padding;
        const cellMargin = cellLocation.margin;

        const paddingTop = cellPadding.top.getBegin();
        const paddingLeft = cellPadding.left.getBegin();
        const paddingBottom = cellPadding.bottom.getBegin();
        const paddingRight = cellPadding.right.getBegin();
        
        const marginTop = cellMargin.top.getBegin();
        const marginLeft = cellMargin.left.getBegin();
        const marginBottom = cellMargin.bottom.getBegin();
        const marginRight = cellMargin.right.getBegin();

        x1 = 0; x2 = 500;
        y1 = -500; y2 = 0;
        
        if (component.isInner) {
            // Внутренний компонент - позиционируем внутри родителя
            if (cellPadding.left.isDefined() && cellPadding.left.getBegin() > 0)
                x1 += 100; 
            if (cellPadding.right.isDefined() && cellPadding.right.getBegin() > 0)
                x2 -= 100; 

            if (cellPadding.bottom.isDefined() && cellPadding.bottom.getBegin() > 0)
                y1 += 100; 
            if (cellPadding.top.isDefined() && cellPadding.top.getBegin() > 0)
                y2 -= 100; 
        } 
        else {
            // Внешний компонент - позиционируем снаружи родителя
            if (cellMargin.right.isDefined() && cellMargin.right.getBegin() > 0) {
                x1 = x2; x1 += 100; x2 = x1; x2 += 500;
            }
            else if (cellMargin.left.isDefined() && cellMargin.left.getBegin() > 0) {
                x2 = x1; x2 -= 100; x1 = x2; x1 -= 500;
            }
            else {
                if (cellPadding.left.isDefined() && cellPadding.left.getBegin() > 0)
                    x1 -= 100; 
                if (cellPadding.right.isDefined() && cellPadding.right.getBegin() > 0)
                    x2 += 100; 
            }
            
            if (cellMargin.top.isDefined() && cellMargin.top.getBegin() > 0) {
                y1 = y2; y1 += 100; y2 = y1; y2 += 500;
            }
            else if (cellMargin.bottom.isDefined() && cellMargin.bottom.getBegin() > 0) {
                y2 = y1; y2 -= 100; y1 = y2; y1 -= 500;
            }
            else {
                if (cellPadding.bottom.isDefined() && cellPadding.bottom.getBegin() > 0)
                    y1 -= 100; 
                if (cellPadding.top.isDefined() && cellPadding.top.getBegin() > 0)
                    y2 += 100; 
            }
        }

        x = (x1+x2)/2;
        y = (y1+y2)/2;
    
        // Рисуем ячейку компонента
        let cell = this.squareCell('black');
        cell.position = [x, y];
        group.addChild(cell);
        
        return group;
    }

    static getValueFromYamlRange(range) {
        const max_len = range.getEnd();
        const min_len = Math.max(range.getBegin(), 0);

        const len_avg = max_len == Infinity ? min_len : (max_len + min_len) / 2;
        return len_avg
    }

    /**
     * Нарисовать стрелки для отступов
     * @param {Component} component
     * @param {AreaPattern} parentPattern 
     * @param {number} x
     * @param {number} y
     * @param {number} cellWidth
     * @param {number} cellHeight
     * @param {number} areaWidth 
     * @param {number} areaHeight 
     */
    static drawOffsetArrows(group, component, parentPattern, x, y, cellWidth, cellHeight, parentWidth, parentHeight, located) {
        
        const offsets = [
            {
                type: component.location.margin.top.isDefined() ? 'margin' : 'padding',
                direction: 'top',
                value: component.location.margin.top.isDefined() ? located[1][0] : located[0][0],
                from: [x + cellWidth / 2, component.location.padding.top.isDefined() ? 0 : y + cellHeight],
                to: [x + cellWidth / 2, y],
                labelPos: [x + cellWidth / 2 - 15, y / 2]
            },
            {
                type: component.location.margin.left.isDefined() ? 'margin' : 'padding',
                direction: 'left',
                value: component.location.margin.left.isDefined() ? located[1][1] : located[0][1],
                from: [component.location.padding.left.isDefined() ? 0 : x + cellWidth, y + cellHeight / 2],
                to: [x, y + cellHeight / 2],
                labelPos: [x / 2 - 15, y + cellHeight / 2 - 10]
            },
            {
                type: component.location.margin.bottom.isDefined() ? 'margin' : 'padding',
                direction: 'bottom',
                value: component.location.margin.bottom.isDefined() ? located[1][2] : located[0][2],
                from: [x + cellWidth / 2, y + cellHeight],
                to: [x + cellWidth / 2, component.location.padding.bottom.isDefined() ? parentHeight : y + cellHeight],
                labelPos: [x + cellWidth / 2 - 15, y + cellHeight + (component.location.padding.bottom.isDefined() ? (parentHeight - y - cellHeight) / 2 : 0)]
            },
            {
                type: component.location.margin.right.isDefined() ? 'margin' : 'padding',
                direction: 'right',
                value: component.location.margin.right.isDefined() ? located[1][3] : located[0][3],
                from: [x + cellWidth, y + cellHeight / 2],
                to: [component.location.padding.right.isDefined() ? parentWidth : x + cellWidth, y + cellHeight / 2],
                labelPos: [x + cellWidth + (component.location.padding.right.isDefined() ? (parentWidth - x - cellWidth) / 2 : 0), y + cellHeight / 2 - 10]
            }
        ];
        
        // Рисуем стрелки только для ненулевых отступов
        for (const offset of offsets) {
            if (offset.value > 0) {
                this.drawDoubleArrowWithLabel(
                    group,
                    offset.from,
                    offset.to,
                    `${offset.type}-${offset.direction}: ${offset.value}`,
                    offset.labelPos
                );
            }
        }
    }

    /**
     * Нарисовать двухконечную стрелку с подписью
     */
    static drawDoubleArrowWithLabel(group, from, to, label, labelPos) {
        // Рисуем основную линию
        const line = new paper.Path.Line({
            from: from,
            to: to,
            strokeColor: 'blue',
            strokeWidth: 1
        });
        group.addChild(line);
        
        // Рисуем стрелки на обоих концах
        this.drawArrowhead(group, from, to);
        this.drawArrowhead(group, to, from);
        
        // Добавляем подпись
        const text = new PointText({
            point: labelPos,
            content: label,
            fillColor: 'blue',
            fontSize: 8,
            fontFamily: 'Arial'
        });
        group.addChild(text);
    }

    /**
     * Нарисовать стрелку
     */
    static drawArrowhead(group, point, directionPoint) {
        const arrowSize = 5;
        const angle = new Point(point).subtract(directionPoint).angle;
        
        const arrow = new paper.Path.RegularPolygon({
            center: point,
            sides: 3,
            radius: arrowSize,
            fillColor: 'blue',
            rotation: angle
        });
        group.addChild(arrow);
    }
}