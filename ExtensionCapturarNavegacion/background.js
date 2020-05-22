//Icono de activado
var iconAct = "img/activatev.png";
//Icono desactivado
var iconDes = "img/desactivate.png";
//Array donde se guardaran los eventos que vayan grabando
var secuencia = [];
// Inicializacion del objeto que se va guardando
var mensaje = {};
// Variable para que empiece o termine dependiendo de si es la primera o segunda vez de pulsar el
//icono de la extension
var pulsado = true;
// Variable para motrar mensajes por la consola del navegador
var debug = true;
//Se pone en funcionamiento o se apaga solo cuando se le da click al icono
chrome.browserAction.onClicked.addListener(function() {
    if (pulsado) {
        empezando();
        pulsado = !pulsado;
    } else {
        terminando();
        pulsado = !pulsado;
    }
});

function empezando() {
    log(">>>>>>>>>> En funcionamiento <<<<<<<<<<");
    crearNotificacion("on", "Empezando a grabar", iconAct, "Empezando a grabar", 3000);
    chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
    }, function(tabs) {
        // console.log(tabs);
        mensaje = {
            url: tabs[0].url
        }
        console.log(mensaje);
        secuencia.push(mensaje);
        log("Nº de secuencia >>>>>> " + secuencia.length);
    });
    //Recibe los mensaje del content con el objeto del evento
    chrome.runtime.onMessage.addListener(oyente);
}
// Funcion que se llama cuando se pulsa por segunda vez el icono para terminar de grabar
// y abre la ventana de Guardado y vuelve a inicializar las variables
function terminando() {
    chrome.downloads.download({
        url: saveFunctionJava(),
        filename: "Test.txt",
        saveAs: true
    });
    secuencia = [];
    mensaje = {};
    crearNotificacion("off", "Terminando de grabar", iconDes, "Terminando de grabar", 1500);
    log(">>>>>>> Terminando <<<<<<");
    chrome.runtime.onMessage.removeListener(oyente);
}
// Es la funcion que se le llama para recibir el mensaje y se vuelve a llamar cuando se termina para 
// el "removeListener"
const oyente = function listener(request, sender, sendResponse) {
    mensaje = {
        id: request.id,
        name: request.name,
        elementType: request.elementType,
        typeEvent: request.typeEvent,
        value: request.value,
        linkText: request.linkText,
        path: request.path
    }
    console.log(mensaje);
    //Guardamos los objetos segun van llegando
    secuencia.push(mensaje);
    log("Nº de secuencia >>>>>> " + secuencia.length);
}
// Funcion que crea notificaciones solo cuando empieza la grabacion y cuando termina
function crearNotificacion(idMsg, titulo, icono, msj, tiempo) {
    chrome.notifications.create(idMsg, {
        type: 'basic',
        title: titulo,
        iconUrl: icono,
        message: msj
    });
    setTimeout(function() {
        chrome.notifications.clear(idMsg);
    }, tiempo);
    //Cambia el icono a activado
    chrome.browserAction.setIcon({
        path: icono
    });
}
// Muestra los mensajes en consola si se pone la variable "debug" a true
function log(mensaje) {
    if (debug) {
        console.log(mensaje);
    }
}
// Funcion que se utiliza para guardar la informacion en un archivo
function save() {
    var htmlContent = "";
    for (i in secuencia) {
        if (i == 0) {
            htmlContent = [secuencia[i].url + "\n"];
        } else {
            htmlContent = [htmlContent + secuencia[i].id + " - " + secuencia[i].name + " - " + secuencia[i].elementType + " - " + secuencia[i].typeEvent + " - " + secuencia[i].value + " - " + secuencia[i].path + "\n"];
        }
    }
    var bl = new Blob(htmlContent, {
        type: "text/txt"
    });
    return URL.createObjectURL(bl);
}
// Funcion que se utiliza para guardar la informacion en un archivo con metodos Java
function saveFunctionJava() {
    var htmlContent = "";
    for (i in secuencia) {
        if (i == 0) {
            htmlContent = [secuencia[i].url + "\n"];
        }
    }
    htmlContent = [htmlContent + diferenciarEventos(secuencia)];
    var bl = new Blob(htmlContent, {
        type: "text/txt"
    });
    return URL.createObjectURL(bl);
}

function diferenciarEventos(secuencia) {
    var javaFunciones = "";
    for (i in secuencia) {
        if(secuencia[0].url != ""){
			javaFunciones = [javaFunciones + " driver.get(" + "\"" + secuencia[i].url + "\"" + ");" + "\n"];
		}
        if (secuencia[i].typeEvent == "click") {
            if (secuencia[i] && secuencia[i].id != "") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.id(" + "\"" + secuencia[i].id + "\"))" + "\n"];
            } else if (secuencia[i] && secuencia[i].name != "") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.name(" + "\"" + secuencia[i].name + "\"))" + "\n"];
            } else if (secuencia[i] && secuencia[i].linkText != "") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.linkText(" + "\"" + secuencia[i].linkText + "\"))" + "\n"];
            } else if (secuencia[i] && secuencia[i].path != "") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "\"))" + "\n"];
            } else {
                javaFunciones = [javaFunciones + "No se ha podido identificar el evento" + "\n"];
            }
        } else if (secuencia[i].typeEvent == "change") {
            if (secuencia[i] && secuencia[i].id != "") {
                javaFunciones = [javaFunciones + "waitElementAndSendKeys(By.id(" + "\"" + secuencia[i].id + "\"" + ", " + "\"" + secuencia[i].value + "\"" + "))" + "\n"];
            } else if (secuencia[i] && secuencia[i].name != "") {
                javaFunciones = [javaFunciones + "waitElementAndSendKeys(By.name(" + "\"" + secuencia[i].name + "\"" + ", " + "\"" + secuencia[i].value + "\"" + "))" + "\n"];
            } else if (secuencia[i] && secuencia[i].path != "") {
                javaFunciones = [javaFunciones + "waitElementAndSendKeys(By.xpath(" + "\"" + secuencia[i].path + "\"" + ", " + "\"" + secuencia[i].value + "\"" + "))" + "\n"];
            } else {
                javaFunciones = [javaFunciones + "No se ha podido identificar el evento" + "\n"];
            }
        }
    }
    return javaFunciones;
}