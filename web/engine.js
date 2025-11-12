
/// <reference path="converter.js" />


function onPageLoaded() {
    let testData = YAML.load(request("cnf/grammar_root.yml"));
    UI.init();

    try {
        Grammar.parse(testData);
    } catch (e) {
        UI.resetUI();
        alert(e.message);
    }
}


document.addEventListener('DOMContentLoaded', onPageLoaded());