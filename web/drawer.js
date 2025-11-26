
/// <reference path="converter.js" />
/// <reference path="lib/paper-core.js" />

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

        // Получаем значения ширины и высоты из диапазонов
        const pattern_width_avg = this.getValueFromYamlRange(pattern.width);
        const pattern_height_avg = this.getValueFromYamlRange(pattern.height);

        const width = Math.max(pattern_width_avg, 10);
        const height = Math.max(pattern_height_avg, 10);

        // Создаем прямоугольник ячейки
        const cell = new Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'none'
        });

        return cell;
    }

    /**
     * Отрисовать паттерн-ячейку
     * @param {Number} width 
     * @param {Number} height 
     */
    static drawCell(width, height) {
        // Создаем прямоугольник ячейки
        const cell = new Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'none'
        });

        return cell;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern) {
        const group = new paper.Group();

        const gap = this.getValueFromYamlRange(pattern.gap);

        const max_item_count = pattern.itemCount.getEnd();
        const min_item_count = Math.max(pattern.itemCount.getBegin(), 0);        
        const itemCount = max_item_count == Infinity ? Math.max(min_item_count, 4) : Math.ceil((max_item_count + min_item_count) / 2);

        // Получаем размеры ячейки из внутреннего паттерна
        const cell_width_avg = this.getValueFromYamlRange(pattern.pattern.width);
        const cell_height_avg = this.getValueFromYamlRange(pattern.pattern.height);
    
        const cellWidth = Math.max(cell_width_avg, 0);
        const cellHeight = Math.max(cell_height_avg, 0);

        const min_pattern_width = cellWidth;
        const min_pattern_height = cellHeight;

        switch (pattern.direction) {
            case 'ROW':
                min_pattern_width += itemCount * (cellWidth + gap);
                break;
            case 'COLUMN':
                min_pattern_height += itemCount * (cellHeight + gap);
                break;
            case 'FILL':
                const squareRoot = Math.ceil(Math.sqrt(itemCount));
                min_pattern_width += squareRoot * (cellWidth + gap);
                min_pattern_height += squareRoot * (cellHeight + gap);
                break;
        }

        // Получаем значения ширины и высоты из диапазонов
        const pattern_width_avg = this.getValueFromYamlRange(pattern.width);
        const pattern_height_avg = this.getValueFromYamlRange(pattern.height);

        const width = Math.max(pattern_width_avg, min_pattern_width);
        const height = Math.max(pattern_height_avg, min_pattern_height);

        // Создаем прямоугольник массива
        const array_cell = new Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'none'
        });

        group.addChild(array_cell);
    
        // Создаем ячейки в зависимости от направления
        switch (pattern.direction) {
            case 'ROW':
                drawRowArray(group, pattern.pattern, itemCount, gap, cellWidth);
                break;
            case 'COLUMN':
                drawColumnArray(group, pattern.pattern, itemCount, gap, cellHeight);
                break;
            case 'FILL':
                drawFillArray(group, pattern.pattern, itemCount, gap, cellWidth, cellHeight);
                break;
        }
    
        return group;
    }

    /**
     * Отрисовать массив в строку
     */
    static drawRowArray(group, cellPattern, itemCount, gap, cellWidth) {
        for (let i = 0; i < itemCount; i++) {
            const cell = drawCellPattern(cellPattern);
            cell.position = [i * (cellWidth + gap), 0];
            group.addChild(cell);
        }
    }

    /**
     * Отрисовать массив в колонку
     */
    static drawColumnArray(group, cellPattern, itemCount, gap, cellHeight) {
        for (let i = 0; i < itemCount; i++) {
            const cell = drawCellPattern(cellPattern);
            cell.position = [0, i * (cellHeight + gap)];
            group.addChild(cell);
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
        
            const cell = drawCellPattern(cellPattern);
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
        const group = new paper.Group();

        const area_needed_width = 0;
        const area_needed_height = 0;

        for (const component of pattern.components) {
            const component_needed_width = this.getValueFromYamlRange(component.pattern.width);
            const component_needed_height = this.getValueFromYamlRange(component.pattern.height);
                
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
        const areaRect = new Path.Rectangle({
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
        const group = new paper.Group();
    
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
        const x = 0;
        const y = 0;

        const cellWidth = Math.max(pattern_width_avg, 10);
        const cellHeight = Math.max(pattern_height_avg, 10);

        const width = cellWidth;
        const height = cellHeight;
    
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
        const cell = this.drawCell(width, height);
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
        const line = new Path.Line({
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
        
        const arrow = new Path.RegularPolygon({
            center: point,
            sides: 3,
            radius: arrowSize,
            fillColor: 'blue',
            rotation: angle
        });
        group.addChild(arrow);
    }
}