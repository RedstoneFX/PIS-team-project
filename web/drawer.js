
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
        arrowDown.position = (0, 5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = (0, 95);
        group.addChild(arrowUp);

        let line3 = this.verticalLine();
        line3.position = (0, 50);
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
        arrowDown.position = (-100, 5);
        group.addChild(arrowDown);

        let arrowUp = this.gapArrowUp();
        arrowUp.position = (-100, y-5);
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

        let cell = squareCell('black');
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
                        group.addChild(cell);
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
                        group.addChild(cell);
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
                        group.addChild(cell);
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
                        group.addChild(cell);
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
    static drawColumnArray(group, cellPattern, itemCount, gap, cellHeight) {

        const minItemCount = Math.max(pattern.itemCount.getBegin(), 0);
        const maxItemCount = Math.max(pattern.itemCount.getEnd(), 0);

        const maxGap = Math.max(pattern.gap.getEnd(), 0);
        
        let x = 50;

        if (maxGap == 0) {
            if (minItemCount == maxItemCount) {
                if (maxItemCount > 5) {
                    for (i = 0; i < 2; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, x);
                        group.addChild(cell);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 50;

                    let size = this.sizeVertical(x);
                    size.position = (-100, x/2);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
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
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, x);
                        group.addChild(cell);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 50;

                    let size = this.sizeVertical(x);
                    size.position = (-100, x/2);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
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
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }

                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, x);
                        group.addChild(cell);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 50;

                    let gap = this.gapVertical();
                    gap.position = (0, 50);
                    group.addChild(gap);

                    let size = this.sizeVertical(x);
                    size.position = (-100, x/2);
                    group.addChild(size);
                }
                else {
                    for (i = 0; i < maxItemCount; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }

                    let gap = this.gapVertical();
                    gap.position = (0, 50);
                    group.addChild(gap);
                }
            }
            else {
                if (maxItemCount > 5) {
                    let blackCells = Math.min(2, minItemCount);
                    let greyCells = 2 - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < 3; i++) {
                        let dot = this.squareDot();
                        dot.position = (0, x);
                        group.addChild(cell);
                        x += 50;
                    }
                        x += 50;
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 50;

                    let gap = this.gapVertical();
                    gap.position = (0, 50);
                    group.addChild(gap);

                    let size = this.sizeVertical(x);
                    size.position = (-100, x/2);
                    group.addChild(size);
                }
                else {
                    let blackCells = minItemCount;
                    let greyCells = maxItemCount - blackCells;

                    for (i = 0; i < blackCells; i++) {
                        let cell = this.squareCell('black');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }
                    for (i = 0; i < greyCells; i++) {
                        let cell = this.squareCell('grey');
                        cell.position = (0, x);
                        group.addChild(cell);
                        x += 100;
                    }

                    let gap = this.gapVertical();
                    gap.position = (0, 50);
                    group.addChild(gap);
                }
            }
        }
    }

    /**
     * Отрисовать массив с заполнением в обоих направлениях
     */
    static drawFillArray(group, cellPattern, itemCount, gap, cellWidth, cellHeight) {
        // Вычисляем оптимальное количество колонок для квадратного расположения
        const columns = Math.ceil(Math.sqrt(itemCount));
    
        for (let i = 0; i < itemCount; i++) {
            const row = Math.floor(i / columns);
            const col = i % columns;
        
            let cell = this.drawCellPattern(cellPattern);
            cell.position = [
                col * (cellWidth + gap),
                row * (cellHeight + gap)
            ];
            group.addChild(cell);
        }
    }

    /**
     * Отрисовать паттерн-структуру
     * @param {AreaPattern} pattern 
     */
    static drawAreaPattern(pattern) {
        let group = new paper.Group();

        let area_needed_width = 0;
        let area_needed_height = 0;

        for (const component of pattern.components) {
            let component_needed_width = this.getValueFromYamlRange(component.pattern.width);
            let component_needed_height = this.getValueFromYamlRange(component.pattern.height);
                
            component_needed_width += this.getValueFromYamlRange(component.location.padding.left);
            component_needed_width += this.getValueFromYamlRange(component.location.padding.right);

            component_needed_height += this.getValueFromYamlRange(component.location.padding.bottom);
            component_needed_height += this.getValueFromYamlRange(component.location.padding.top);

            area_needed_width = Math.max(area_needed_width, component_needed_width);
            area_needed_height = Math.max(area_needed_height, component_needed_height);
        }

        // Получаем значения ширины и высоты из диапазонов
        const width = this.getValueFromYamlRange(pattern.width);
        const height = this.getValueFromYamlRange(pattern.height);
    
        // Рисуем основную область
        const areaRect = new paper.Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 3,
            fillColor: 'white'
        });
        group.addChild(areaRect);
    
        // Отрисовываем все компоненты
        for (const component of pattern.components) {
            const componentGroup = this.drawComponent(component, pattern, width, height);
            group.addChild(componentGroup);
        }
    
        return group;
    }


    /**
     * Отрисовать компонент
     * @param {Component} component 
     * @param {AreaPattern} parentPattern 
     * @param {number} areaWidth 
     * @param {number} areaHeight 
     */
    static drawComponent(component, parentPattern, areaWidth, areaHeight) {
        let group = new paper.Group();
    
        // Получаем отступы из location
        const cellLocation = component.location;
        const cellPadding = cellLocation.padding;
        const cellMargin = cellLocation.margin;

        const paddingTop = this.getValueFromYamlRange(cellPadding.top);
        const paddingLeft = this.getValueFromYamlRange(cellPadding.left);
        const paddingBottom = this.getValueFromYamlRange(cellPadding.bottom);
        const paddingRight = this.getValueFromYamlRange(cellPadding.right);
        
        const marginTop = this.getValueFromYamlRange(cellMargin.top);
        const marginLeft = this.getValueFromYamlRange(cellMargin.left);
        const marginBottom = this.getValueFromYamlRange(cellMargin.bottom);
        const marginRight = this.getValueFromYamlRange(cellMargin.right);

        const paddings = {paddingTop, paddingLeft, paddingBottom, paddingRight};
        const margins = {marginTop, marginLeft, marginBottom, marginRight};

        const located = {paddings, margins};
    
        // Вычисляем позицию и ширину компонента
        let x = 0;
        let y = 0;

        const cellWidth = Math.max(pattern_width_avg, 10);
        const cellHeight = Math.max(pattern_height_avg, 10);

        let width = cellWidth;
        let height = cellHeight;
    
        if (component.inner) {
            // Внутренний компонент - позиционируем внутри 
            if (cellPadding.left.isDefined()) {
                x = paddingLeft;
                if (cellPadding.right.isDefined()) {
                    width = areaWidth - paddingLeft - paddingRight;
                }
            }
            else if (cellPadding.right.isDefined()) {
                x = areaWidth - cellWidth - paddingRight;
            }
            else {
                width = areaWidth;
            }

            if (cellPadding.bottom.isDefined()) {
                y = paddingTop;
                if (cellPadding.top.isDefined()) {
                    height = areaHeight - paddingBottom - paddingTop;
                }
            }
            else if (cellPadding.top.isDefined()) {
                y = areaHeight - cellHeight - paddingTop;
            }
            else {
                height = areaHeight;
            }

        } else {
            // Внешний компонент - позиционируем снаружи родителя
            if (cellMargin.right.isDefined()) {
                x = areaWidth + marginRight;
            }
            else if (cellMargin.left.isDefined()) {
                x = - marginLeft - cellWidth;
            }
            else {
                if (cellPadding.left.isDefined()) {
                    x = paddingLeft;
                    if (cellPadding.right.isDefined()) {
                        width = areaWidth - paddingLeft - paddingRight;
                    }
                }
                else if (cellPadding.right.isDefined()) {
                    x = areaWidth - cellWidth - paddingRight;
                }
                else {
                    width = areaWidth;
                }
            }
            
            if (cellMargin.top.isDefined()) {
                y = areaHeight + marginTop;
            }
            else if (cellMargin.bottom.isDefined()) {
                y = - marginBottom - cellHeight;
            }
            else {
                if (cellPadding.bottom.isDefined()) {
                    y = paddingTop;
                    if (cellPadding.top.isDefined()) {
                        height = areaHeight - paddingBottom - paddingTop;
                    }
                }
                else if (cellPadding.top.isDefined()) {
                    y = areaHeight - cellHeight - paddingTop;
                }
                else {
                    height = areaHeight;
                }
            }
        }
    
        // Рисуем ячейку компонента
        let cell = this.drawCell(width, height);
        cell.position = [x, y];
        group.addChild(cell);
    
        // Рисуем стрелки для отступов
        this.drawOffsetArrows(group, component, parentPattern, x, y, cellWidth, cellHeight, areaWidth, areaHeight, located);
        
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