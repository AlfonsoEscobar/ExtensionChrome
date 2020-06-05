//Icono de activado
var iconAct = "img/activado.png";
//Icono desactivado
var iconDes = "img/desactivado.png";
//Array donde se guardaran los eventos que vayan grabando
var secuencia = [];
// Inicializacion del objeto que se va guardando
var mensaje = {};
// Variable para que empiece o termine dependiendo de si es la primera o segunda vez de pulsar el
//icono de la extension
var pulsado = true;
// Variable para motrar mensajes por la consola del navegador
var debug = true;
// Variable para comparar los cambios de frame.
var frameViejo;

var javaFunciones = "";
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
   
    if(frameViejo !== request.frame){
        frameViejo = request.frame;
    }else{
        frameViejo = null;
    }

    mensaje = {
        id: request.id,
        name: request.name,
        elementType: request.elementType,
        typeEvent: request.typeEvent,
        value: request.value,
        linkText: request.linkText,
        innerText: request.innerText,
        path: request.path,
        valueSelect:request.valueSelect,
        altImg: request.altImg,
        className:request.className,
        srcType:request.srcType,
        frame:frameViejo
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
            htmlContent = ["/** " + secuencia[i].url + "\n"];
        } else {
            htmlContent = [htmlContent + 
            "ID: " + secuencia[i].id + 
            " - NAME: " + secuencia[i].name + 
            " - ELEMENT_TYPE: " + secuencia[i].elementType + 
            " - TYPE_EVENT: " + secuencia[i].typeEvent + 
            " - VALUE: " + secuencia[i].value + 
            " - LINKTEXT: " + secuencia[i].linkText + 
            " - VALUESELECT: " + secuencia[i].valueSelect + 
            " - ALTIMG: " + secuencia[i].altImg + 
            " - TARGET: " + secuencia[i].className + 
            " - SRCTYPE: " + secuencia[i].srcType + 
            "\nPATH: " + secuencia[i].path.toLowerCase() + "\n"];
        }
    }
    htmlContent = htmlContent + "**/\n";
    return htmlContent;
}
// Funcion que se utiliza para guardar la informacion en un archivo con metodos Java
function saveFunctionJava() {
    var htmlContent = save();
    htmlContent = ["@Test" + "\n" 
    + "public void test" + Date.now() + "() throws Exception {"+ "\n" 
    + htmlContent + diferenciarEventos(secuencia) + "}"];  
    
    var bl = new Blob(htmlContent, {
        type: "text/txt"
    });
    return URL.createObjectURL(bl);
}
function waitElementAndClick(objeto){
    if (objeto.id != undefined && objeto.id != "") {
        javaFunciones = [javaFunciones + "waitElementAndClick(By.id(" + "\"" + objeto.id + "\"));" + "\n"];
    } else if (objeto.name != undefined && objeto.name != "") {
        javaFunciones = [javaFunciones + "waitElementAndClick(By.name(" + "\"" + objeto.name + "\"));" + "\n"];
    } else if (objeto.linkText != undefined && objeto.linkText != "") {
        javaFunciones = [javaFunciones + "waitElementAndClick(By.linkText(" + "\"" + objeto.linkText + "\"));" + "\n"];
    } else if (objeto.path != undefined && objeto.path != "") {
        javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + objeto.path + "\"));" + "\n"];
    } else {
        javaFunciones = [javaFunciones + "No se ha podido identificar el evento" + "\n"];
    }
}

function waitElementAndSendKeys(objeto){
    if (objeto.id != undefined && objeto.id != ""){
        javaFunciones = [javaFunciones + "waitElementAndSendKeys(By.id(" + "\"" + objeto.id + "\")" + ", \"" + objeto.value + "\");" + "\n"];
    } else if (objeto.name != undefined && objeto.name != "") {
        javaFunciones = [javaFunciones + "waitElementAndSendKeys(By.name(" + "\"" + objeto.name + "\")" + ", \"" + objeto.value + "\");" + "\n"];
    } else if (objeto.path != undefined && objeto.path != "") {
        javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + objeto.path + "[contains(text(),'" + objeto.linkText + "')]\"));" + "\n"];
    } else {
        javaFunciones = [javaFunciones + "No se ha podido identificar el evento" + "\n"];
    }
}

function waitElementAndSelect(objeto){
    if (objeto.id != undefined && objeto.id != ""){
        javaFunciones = [javaFunciones + "waitElementAndSelect(By.id(" + "\"" + objeto.id + "\")," + "\"" + objeto.valueSelect + "\"));"+ "\n"];
    }else{
        javaFunciones = [javaFunciones + "waitElementAndSelect(By.id(" + "\"" + objeto.name + "\")," + "\"" + objeto.valueSelect + "\"));"+ "\n"];
    }
}

function diferenciarEventos(secuencia) {
    javaFunciones = "";
    if (secuencia[0].url != "") {
        javaFunciones = [javaFunciones + "driver.get(" + "\"" + secuencia[0].url + "\"" + ");" + "\n"];
    }
    for (i in secuencia) {
        if (secuencia[i].typeEvent == "click") {
           if(secuencia[i].frame !== null && secuencia[i].frame !== ""){
                 javaFunciones = [javaFunciones + "changeFrame(" + "\"" + secuencia[i].frame + "\");" + "\n"];
            }
            if (secuencia[i].elementType == "a") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.linkText(" + "\"" + secuencia[i].linkText + "\"));" + "\n"];
                // Con este if se puede extraer todos los td que puedan estar dentro de un tr
                // } else if (secuencia[i].elementType == "td") {
                //     javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "[" + secuencia[i].innerText + "]\"));" + "\n"];
            } else if (secuencia[i].elementType == "img") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.cssSelector(\"img[alt=\\"+"\"" + secuencia[i].altImg + "\\\"]), By.xpath(" + "\"" + secuencia[i].path + "\"));" + "\n"];
            } else if (secuencia[i].elementType == "td") {
                javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "[contains(text(),'" + secuencia[i].linkText + "')]\"));" + "\n"];
            } else if (secuencia[i].srcType == "submit") {
                if(secuencia[i].className != undefined && secuencia[i].className != ""){
                    javaFunciones = [javaFunciones + "waitElementAndClick(By.cssSelector(\""+secuencia[i].elementType +"." + secuencia[i].className + "\"));" + "\n"];
                }else{
                   javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "\"));" + "\n"];
                }
                
            } else {
                waitElementAndClick(secuencia[i]);
            }
        } else if (secuencia[i].typeEvent == "change") {
            if (secuencia[i].elementType == "select") {
                waitElementAndSelect(secuencia[i]);            
            }else {
                waitElementAndSendKeys(secuencia[i]);
            }

        }else if (secuencia[i].typeEvent == "checkbox") {
            waitElementAndClick(secuencia[i]);
        }
    }
    return javaFunciones;
}