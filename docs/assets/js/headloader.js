// Synchronously inlines head.html into <head>.
(function () {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'head.html', false); // false = synchronous
        xhr.send(null);

        if (xhr.status === 200 || xhr.status === 0) {
            document.write(xhr.responseText);
        } else {
            console.error('Error loading head.html: status ' + xhr.status);
        }
    } catch (error) {
        console.error('Error loading head.html:', error);
    }
})();