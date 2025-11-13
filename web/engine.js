
/// <reference path="converter.js" />

function saveToLocalStorage() {
    localStorage.setItem("GrammarData", JSON.stringify(Grammar.toYamlObject()));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem("GrammarData");
    if (savedData) {
        Grammar.parse(JSON.parse(savedData));
    }
}

function onPageLoaded() {
    let testData = YAML.load(request("cnf/grammar_root.yml"));
    UI.init();

    try {
        Grammar.parse(testData);
        loadFromLocalStorage();
        UI.loadFromGrammar();
    } catch (e) {
        UI.resetUI();
        alert(e.message);
        throw e;
    }

    setInterval(saveToLocalStorage, 300000);
}


document.addEventListener('DOMContentLoaded', onPageLoaded());