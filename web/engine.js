
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

let grammar = new Grammar();

/**
 * @param {Grammar} grammar 
 */
function saveToLocalStorage() {
    localStorage.setItem("GrammarData", JSON.stringify(grammar.serialize()));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem("GrammarData");
    if (savedData) {
        return Grammar.fromRawData(JSON.parse(savedData));
    }
    else return new Grammar();
}


function onPageLoaded() {
    Frontend.init();
    Drawer.init();

    try {
        grammar = loadFromLocalStorage();
        Frontend.setGrammar(grammar);
    } catch (err) {
        grammar = new Grammar();
        Frontend.setGrammar(grammar);
        alert("Не удалось загрузить автосохранение! Загружен пустой проект.");
        throw err;
    }

    setInterval(saveToLocalStorage, 5000);
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
            Frontend.setGrammar(grammar);
        } catch (e) {
            //UI.resetUI();
            alert(e.message);
            throw e;
        }
    };
    reader.readAsText(file);
}

function onFileSave() {
    try {
        writeFile("grammar.yml", YAML.dump(grammar.serialize()))
    } catch (err) {
        console.log(err.message);
        if (!/[а-яА-Я]/.test(err.message)) Frontend.halt(); // TODO: полностью завершает работу приложения, если ошибка была не через throw. Сломается, если изменить язык.
        throw err;
    }
}

function onCreateNewFile() {
    grammar = new Grammar();
    Frontend.setGrammar(grammar);
    Drawer.clearCanvas();
}

document.getElementById("load-from-file").addEventListener("change", (e) => onFileUpload(e));
document.getElementById("save-to-file").onclick = onFileSave;
document.addEventListener('DOMContentLoaded', () => onPageLoaded());
document.getElementById("create-new-file").onclick = onCreateNewFile;