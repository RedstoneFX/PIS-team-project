
/// <reference path="converter.js" />


function onPageLoaded() {
    let testData = YAML.load(request("cnf/grammar_root.yml"));
    UI.init();

    try {
        Grammar.parse(testData);
        UI.loadFromGrammar();
    } catch (e) {
        UI.resetUI();
        alert(e.message);
        throw e;
    }
}


document.addEventListener('DOMContentLoaded', onPageLoaded());