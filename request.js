/**
 * Функция, выполняющая запрос к сайту/файлу и возвращающая его текстовое содержимое.
 * Может принимать как полные ссылки, так и относительные, например "test.yaml"
 * @param {String} url 
 * @returns Текстовое содержание данного сайта/файла
 */
function request(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    if (xhr.status != 200) {
        alert( "Не удалось загрузить файл!\n" + xhr.status + ': ' + xhr.statusText );
        return "";
    } else return xhr.responseText; 
}