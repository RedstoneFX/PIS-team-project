
/// <reference path="converter.js" />

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

        // Получаем средние значения ширины и высоты из диапазонов
        const width = this.getValueFromYamlRange(pattern.width);
        const height = this.getValueFromYamlRange(pattern.height);

        // Создаем прямоугольник ячейки
        const cell = new Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: 'none'
        });

        // Создаем текст с названием паттерна
        const text = new PointText({
            point: [5, 15],
            content: pattern.name,
            fillColor: 'black',
            fontFamily: 'Arial',
            fontSize: 12
        });

        // Группируем элементы для удобства
        const group = new Group([cell, text]);
    
        // Добавляем свойства паттерна в группу для отладки
        group.data = {
            isRoot: pattern.isRoot,
            isInline: pattern.isInline,
            kind: pattern.kind
        };

        return group;
    }

    /**
     * Отрисовать паттерн-массив
     * @param {ArrayPattern} pattern 
     */
    static drawArrayPattern(pattern) {
    const group = new Group();
    
    // Получаем значения из диапазонов
    const itemCount = this.getValueFromYamlRange(pattern.itemCount);
    const gap = this.getValueFromYamlRange(pattern.gap);
    
    // Получаем размеры ячейки из внутреннего паттерна
    const cellWidth = this.getValueFromYamlRange(pattern.pattern.width);
    const cellHeight = this.getValueFromYamlRange(pattern.pattern.height);
    
    // Добавляем название паттерна сверху слева
    const title = new PointText({
        point: [0, -10],
        content: pattern.pattern.name,
        fillColor: 'black',
        fontSize: 10,
        fontFamily: 'Arial'
    });
    group.addChild(title);
    
    // Создаем ячейки в зависимости от направления
    switch (pattern.direction) {
        case 'ROW':
            this.drawRowArray(group, pattern.pattern, itemCount, gap, cellWidth, cellHeight);
            break;
        case 'COLUMN':
            this.drawColumnArray(group, pattern.pattern, itemCount, gap, cellWidth, cellHeight);
            break;
        case 'FILL':
            this.drawFillArray(group, pattern.pattern, itemCount, gap, cellWidth, cellHeight);
            break;
    }
    
    return group;
}

/**
 * Отрисовать массив в строку
 */
static drawRowArray(group, cellPattern, itemCount, gap, cellWidth, cellHeight) {
    for (let i = 0; i < itemCount; i++) {
        const cell = this.drawCellPattern(cellPattern);
        cell.position = [i * (cellWidth + gap), 0];
        group.addChild(cell);
    }
}

/**
 * Отрисовать массив в колонку
 */
static drawColumnArray(group, cellPattern, itemCount, gap, cellWidth, cellHeight) {
    for (let i = 0; i < itemCount; i++) {
        const cell = this.drawCellPattern(cellPattern);
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
        
        const cell = this.drawCellPattern(cellPattern);
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
    const group = new Group();
    
    // Получаем размеры области
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
    
    // Добавляем название паттерна сверху слева
    const title = new PointText({
        point: [5, 15],
        content: pattern.name,
        fillColor: 'black',
        fontSize: 12,
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });
    group.addChild(title);
    
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
    const group = new Group();
    
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