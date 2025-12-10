
/// <reference path="backend.js" />
/// <reference path="frontend.js" />
/// <reference path="drawer.js" />

function writeFile(name, value) {

    let blobdtMIME =
        new Blob([value], { type: "text/plain" })
    let url = URL.createObjectURL(blobdtMIME)
    let anele = document.createElement("a")
    anele.setAttribute("download", name);
    anele.href = url;
    anele.click();
    console.log(blobdtMIME)
}

/**
 * @param {Grammar} grammar 
 */
function saveToLocalStorage(grammar) {
    localStorage.setItem("GrammarData", JSON.stringify(grammar.serialize()));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem("GrammarData");
    if (savedData) {
        return Grammar.fromRawData(savedData);
    }
}


let grammar = new Grammar();

function onPageLoaded() {
    let testData = YAML.load(request("cnf/grammar_root.yml"));
    grammar = Grammar.fromRawData(testData);
    Frontend.init();
    Frontend.setGrammar(grammar);
    /*Drawer.init();

    try {
        loadFromLocalStorage();
        UI.loadFromGrammar();
    } catch (e) {
        UI.resetUI();
        console.log("Загрузка автосохранения не удалась.");
        throw e;
    }

    setInterval(saveToLocalStorage, 1000);*/
}

function onFileUpload(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        let text = e.target.result;
        try {
            let yaml = YAML.load(text);
            grammar.destroy();
            grammar = Grammar.fromRawData(yaml);
            //UI.loadFromGrammar();
        } catch (e) {
            //UI.resetUI();
            alert(e.message);
            throw e;
        }
    };
    reader.readAsText(file);
}

function onFileSave() {
    writeFile("grammar.yml", YAML.dump(grammar.serialize()))
}

document.getElementById("load-from-file").addEventListener("change", (e) => onFileUpload(e));
document.getElementById("save-to-file").onclick = onFileSave;
document.addEventListener('DOMContentLoaded', onPageLoaded());