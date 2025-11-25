
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
        const pattern_width_avg = (pattern.width.getEnd() + pattern.width.getBegin()) / 2;
        const pattern_height_avg = (pattern.height.getEnd() + pattern.height.getBegin()) / 2;

        const width = pattern_width_avg < 10 ? 10 : pattern_width_avg;
        const height = pattern_height_avg < 10 ? 10 : pattern_height_avg;

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

        const max_item_count = pattern.itemCount.getEnd();
        const min_item_count = pattern.itemCount.getBegin() < 0 ? 0 : pattern.itemCount.getBegin();
        const item_count = max_item_count == Infinity ? Math.max(min_item_count, 5) : Math.ceil((max_item_count + min_item_count) / 2);

        const max_gap = pattern.gap.getEnd() == NaN ? 0 : pattern.gap.getEnd();
        const min_gap = pattern.gap.getBegin() == NaN ? 0 : pattern.gap.getBegin();
        const gap = (max_gap + min_gap) / 2;

        // Получаем размеры ячейки из внутреннего паттерна
        const cell_width_avg = (pattern.pattern.width.getEnd() + pattern.pattern.width.getBegin()) / 2;
        const cell_height_avg = (pattern.pattern.height.getEnd() + pattern.pattern.height.getBegin()) / 2;
    
        const cellWidth = cell_width_avg < 10 ? 10 : cell_width_avg;
        const cellHeight = cell_height_avg < 10 ? 10 : cell_height_avg;

        const min_pattern_width = cellWidth;
        const min_pattern_height = cellHeight;

        switch (pattern.direction) {
            case 'ROW':
                min_pattern_width += item_count * (cellWidth + gap);
                break;
            case 'COLUMN':
                min_pattern_height += item_count * (cellHeight + gap);
                break;
            case 'FILL':
                min_pattern_width += Math.sqrt(item_count).toFixed(0) * (cellWidth + gap);
                min_pattern_height += Math.sqrt(item_count).toFixed(0) * (cellHeight + gap);
                break;
        }

        // Получаем значения ширины и высоты из диапазонов
        const pattern_width_avg = (pattern.width.getEnd() + pattern.width.getBegin()) / 2;
        const pattern_height_avg = (pattern.height.getEnd() + pattern.height.getBegin()) / 2;

        const width = pattern_width_avg < min_pattern_width ? min_pattern_width : pattern_width_avg;
        const height = pattern_height_avg < min_pattern_height ? min_pattern_height : pattern_height_avg;
    
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
                const component_max_width = component.pattern.width.getEnd();
                const component_min_width = Math.max(component.pattern.width.getBegin(), 0);

                const component_max_height = component.pattern.height.getEnd();
                const component_min_height = Math.max(component.pattern.height.getBegin(), 0);

                const component_needed_width = component_max_width == Infinity ? component_min_width : (component_max_width + component_min_width) / 2;
                const component_needed_height = component_max_height == Infinity ? component_min_height : (component_max_height + component_min_height) / 2;

                for(paddingling in component.location.padding) {
                    component_needed_width += paddingling[0];
                    component_needed_height += paddingling[1];
                }

                area_needed_width = Math.max(area_needed_width, component_needed_width);
                area_needed_height = Math.max(area_needed_height, component_needed_height);
            }

        // Получаем значения ширины и высоты из диапазонов
        const area_max_width = pattern.width.getEnd();
        const area_min_width = Math.max(pattern.width.getBegin(), area_needed_width);

        const area_max_height = pattern.height.getEnd();
        const area_min_height = Math.max(pattern.height.getBegin(), area_needed_height);

        const width = area_max_width == Infinity ? area_min_width : (area_max_width + area_min_width) / 2;
        const height = area_max_height == Infinity ? area_min_height : (area_max_height + area_min_height) / 2;
    
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
            const componentGroup = this.drawComponent(component, pattern);
            group.addChild(componentGroup);
        }
    
        return group;
    }


    /**
     * Отрисовать компонент
     * @param {Comment} component 
     * @param {AreaPattern} parentPattern 
     */
    static drawComponent(component, parentPattern) {
    const group = new paper.Group();
    
    // Получаем паттерн компонента
    const cellPattern = component.pattern;
    if (!cellPattern) {
        console.warn(`Component ${component.name} has no pattern`);
        return group;
    }
    
    // Получаем размеры компонента
    const cellWidth = this.getValueFromYamlRange(cellPattern.width);
    const cellHeight = this.getValueFromYamlRange(cellPattern.height);
    
    // Получаем отступы из location
    const paddingTop = this.getValueFromYamlRange(component.location.top || 0);
    const paddingLeft = this.getValueFromYamlRange(component.location.left || 0);
    const paddingBottom = this.getValueFromYamlRange(component.location.bottom || 0);
    const paddingRight = this.getValueFromYamlRange(component.location.right || 0);
    
    // Вычисляем позицию компонента
    let x, y;
    
    if (component.inner) {
        // Внутренний компонент - позиционируем внутри родителя с учетом padding
        x = paddingLeft;
        y = paddingTop;
    } else {
        // Внешний компонент - позиционируем снаружи родителя с учетом margin
        // Для простоты располагаем слева от родителя
        x = -paddingLeft - cellWidth;
        y = paddingTop;
    }
    
    // Рисуем ячейку компонента
    const cellGroup = this.drawCellPattern(cellPattern);
    cellGroup.position = [x, y];
    group.addChild(cellGroup);
    
    // Рисуем стрелки для отступов
    this.drawOffsetArrows(group, component, parentPattern, x, y, cellWidth, cellHeight);
    
    return group;
}

/**
 * Нарисовать стрелки для отступов
 */
static drawOffsetArrows(group, component, parentPattern, x, y, cellWidth, cellHeight) {
    const parentWidth = this.getValueFromYamlRange(parentPattern.width);
    const parentHeight = this.getValueFromYamlRange(parentPattern.height);
    
    const offsets = [
        {
            type: component.inner ? 'padding' : 'margin',
            direction: 'top',
            value: this.getValueFromYamlRange(component.location.top || 0),
            from: [x + cellWidth / 2, component.inner ? 0 : y + cellHeight],
            to: [x + cellWidth / 2, y],
            labelPos: [x + cellWidth / 2 - 15, y / 2]
        },
        {
            type: component.inner ? 'padding' : 'margin',
            direction: 'left',
            value: this.getValueFromYamlRange(component.location.left || 0),
            from: [component.inner ? 0 : x + cellWidth, y + cellHeight / 2],
            to: [x, y + cellHeight / 2],
            labelPos: [x / 2 - 15, y + cellHeight / 2 - 10]
        },
        {
            type: component.inner ? 'padding' : 'margin',
            direction: 'bottom',
            value: this.getValueFromYamlRange(component.location.bottom || 0),
            from: [x + cellWidth / 2, y + cellHeight],
            to: [x + cellWidth / 2, component.inner ? parentHeight : y + cellHeight],
            labelPos: [x + cellWidth / 2 - 15, y + cellHeight + (component.inner ? (parentHeight - y - cellHeight) / 2 : 0)]
        },
        {
            type: component.inner ? 'padding' : 'margin',
            direction: 'right',
            value: this.getValueFromYamlRange(component.location.right || 0),
            from: [x + cellWidth, y + cellHeight / 2],
            to: [component.inner ? parentWidth : x + cellWidth, y + cellHeight / 2],
            labelPos: [x + cellWidth + (component.inner ? (parentWidth - x - cellWidth) / 2 : 0), y + cellHeight / 2 - 10]
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