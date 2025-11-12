class UI {

    static resetUI() {
        this.clearBrowser();
        this.setPatternParamsEnabled(false);
        this.setComponentParamsEnabled(false);
    }

    static clearBrowser() {
        for (let i = this.browser.children.length - 1; i >= 0; --i)
            this.browser.children[i].remove();
    }

    /**
     * Устанавливает секцию параметров видимой/невидимой
     * @param {boolean} isEnabled 
     */
    static setPatternParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        if (!isEnabled) {
            this.cellParams.hidden = true;
            this.arrayParams.hidden = true;
        } else {
            this.setComponentParamsEnabled(false);
        }
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setCellParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        this.cellParams.hidden = !isEnabled;
        if (isEnabled) this.arrayParams.hidden = true;
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setArrayParamsEnabled(isEnabled) {
        this.patternParams.hidden = !isEnabled;
        this.arrayParams.hidden = !isEnabled;
        if (isEnabled) this.cellParams.hidden = true;
    }

    /**
 * Устанавливает секцию параметров видимой/невидимой
 * @param {boolean} isEnabled 
 */
    static setComponentParamsEnabled(isEnabled) {
        this.componentParams.hidden = !isEnabled;
        if (isEnabled) this.setPatternParamsEnabled(false);
    }

    /**
     * Метод, проводящий инициализацию интерфейса
     * @param {HTMLElement} browser 
     */
    static init(browser) {
        this.browser = document.getElementById("tree-browser");
        this.patternParams = document.getElementById("pattern-parameters");
        this.cellParams = document.getElementById("cell-parameters");
        this.arrayParams = document.getElementById("array-parameters");
        this.componentParams = document.getElementById("component-parameters");
        this.resetUI();
    }
}