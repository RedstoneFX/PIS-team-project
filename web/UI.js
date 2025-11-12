class UI {

    static resetUI() {
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