// Icono de activado
var iconAct = "img/activate.png";
// Icono desactivado
var iconDes = "img/desactivate.png";
// Array donde se guardaran los eventos que vayan grabando
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
// Variable para guardar el string de los metodos java
var javaFunciones;
// Se pone en funcionamiento o se apaga solo cuando se le da click al icono
chrome.browserAction.onClicked.addListener(function() {
    if (pulsado) {
        empezando();
        pulsado = !pulsado;
    } else {
        terminando();
        pulsado = !pulsado;
    }
});
// Funcion que se llama cuando se pulsa por primera vez el icono para comenzar a grabar
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
        log(mensaje);
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
        filename: "Test_unitario.txt",
        saveAs: true
    });
    secuencia = [];
    mensaje = {};
    frameViejo = "";
    javaFunciones = "";
    crearNotificacion("off", "Terminando de grabar", iconDes, "Terminando de grabar", 1500);
    log(">>>>>>> Terminando <<<<<<");
    chrome.runtime.onMessage.removeListener(oyente);
}
// Es la funcion que se le llama para recibir el mensaje y se vuelve a llamar cuando se termina para 
// el "removeListener"
const oyente = function listener(request, sender, sendResponse) {
   
    // Recogemos todas los atributos del objeto que nos ha llegado desde el content
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
        frame:request.frame
    }
    log(mensaje);
    // Guardamos los objetos segun van llegando en un array
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
    var htmlContent = [
    "/**" + "\n"
        + "* TESTLINK ->"+ "\n"
        + "*" + "\n"
        + "*    titulo="+"\n"
        + "*    descripcion="+"\n"
        + "*    precondiciones="+"\n"
        + "*    idRequisitosCubiertos="+"\n"
    + "**/" + "\n"
    +"public class Test_unitario {" + "\n"
    + "@Test" + "\n" 
    + "public void test" + Date.now() + "() throws Exception {"+ "\n" 
    + diferenciarEventos(secuencia) + "}"+ "\n" + "}"];  
    
    var bl = new Blob(htmlContent, {
        type: "text/txt"
    });
    return URL.createObjectURL(bl);
}
// Funcion que escribe los metodos de java de los click.
function waitElementAndClick(objeto){
    if (objeto.id != undefined && objeto.id != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.id(" + "\"" + objeto.id + "\"));" + "\n"];
    } else if (objeto.name != undefined && objeto.name != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.name(" + "\"" + objeto.name + "\"));" + "\n"];
    } else if (objeto.linkText != undefined && objeto.linkText != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.linkText(" + "\"" + objeto.linkText + "\"));" + "\n"];
    } else if (objeto.path != undefined && objeto.path != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(" + "\"" + objeto.path + "\"));" + "\n"];
    } else {
        javaFunciones = [javaFunciones + "\tNo se ha podido identificar el evento" + "\n"];
    }
}
// Funcion que escribe los metodos de java de los change.
function waitElementAndSendKeys(objeto){
    if (objeto.id != undefined && objeto.id != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndSendKeys(By.id(" + "\"" + objeto.id + "\")" + ", \"" + objeto.value + "\");" + "\n"];
    } else if (objeto.name != undefined && objeto.name != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndSendKeys(By.name(" + "\"" + objeto.name + "\")" + ", \"" + objeto.value + "\");" + "\n"];
    } else if (objeto.path != undefined && objeto.path != "") {
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(" + "\"" + objeto.path + "[contains(text(),'" + objeto.linkText + "')]\"));" + "\n"];
    } else {
        javaFunciones = [javaFunciones + "\tNo se ha podido identificar el evento" + "\n"];
    }
}
// Funcion que escribe los metodos de java de los select de los change
function waitElementAndSelect(objeto){
    if (objeto.id != undefined && objeto.id != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndSelect(By.id(" + "\"" + objeto.id + "\")," + "\"" + objeto.valueSelect + "\"));"+ "\n"];
    }else{
        javaFunciones = [javaFunciones + "\twaitElementAndSelect(By.id(" + "\"" + objeto.name + "\")," + "\"" + objeto.valueSelect + "\"));"+ "\n"];
    }
}
// Funcion que escribe los metodos de java de Submit y Reset
function waitElementAndClick_Submit_Reset(objeto){
    if(objeto.className != undefined && objeto.className != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(\"//input[@type='"+ objeto.srcType +"' and @class='"+ objeto.className +"']\"));" + "\n"];
      
    }else if(objeto.name != undefined && objeto.name != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(\"//input[@type='"+ objeto.srcType +"' and @name='"+ objeto.name +"']\"));" + "\n"];
       
    }else if(objeto.id != undefined && objeto.id != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(\"//input[@type='"+ objeto.srcType +"' and @id='"+ objeto.id +"']\"));" + "\n"];
       
    }else if(objeto.value != undefined && objeto.value != ""){
        javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(\"//input[@type='"+ objeto.srcType +"' and @value='"+ objeto.value +"']\"));" + "\n"];
    }
}
function diferenciarEventos(secuencia) {
    javaFunciones= "";
    if (secuencia[0].url != "") {
        javaFunciones = [javaFunciones + "\tdriver.get(" + "\"" + secuencia[0].url + "\"" + ");" + "\n"];
    }
    for (i in secuencia) {
        // Diferenciamos los eventos si es un click
        if (secuencia[i].typeEvent == "click") {
            // Capturamos en un método cuando hay un cambio de frame
           if(secuencia[i].frame != frameViejo && secuencia[i].frame != ""){
                frameViejo = secuencia[i].frame;
                javaFunciones = [javaFunciones +"\tchangeParentFrame();\n" +"\tchangeFrame(" + "\"" + secuencia[i].frame + "\");" + "\n"];
            }
            if (secuencia[i].elementType == "a") {
                javaFunciones = [javaFunciones + "\twaitElementAndClick(By.linkText(" + "\"" + secuencia[i].linkText + "\"));" + "\n"];
                // Con este if se puede extraer todos los td que puedan estar dentro de un tr
                // } else if (secuencia[i].elementType == "td") {
                //     javaFunciones = [javaFunciones + "waitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "[" + secuencia[i].innerText + "]\"));" + "\n"];
            } else if (secuencia[i].elementType == "img") {
                if(objeto.id != undefined && objeto.id != ""){
                    javaFunciones = [javaFunciones + "\twaitElementAndClick(By.id(" + "\"" + objeto.id + "\"));" + "\n"];
                }else{
                 javaFunciones = [javaFunciones + "\twaitElementAndClick(By.cssSelector(\"img[alt=\\"+"\"" + secuencia[i].altImg + "\\\"]), By.xpath(" + "\"" + secuencia[i].path + "\"));" + "\n"];
                }
            } else if (secuencia[i].elementType == "td") {
                javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "[contains(text(),'" + secuencia[i].linkText + "')]\"));" + "\n"];
            } else if (secuencia[i].srcType == "submit") {
                waitElementAndClick_Submit_Reset(secuencia[i]);
            } else if (secuencia[i].srcType == "reset") {
                waitElementAndClick_Submit_Reset(secuencia[i]);
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
        }else if (secuencia[i].typeEvent == "radio") {
            javaFunciones = [javaFunciones + "\twaitElementAndClick(By.xpath(" + "\"" + secuencia[i].path + "\"));" + "\n"];
        }
    }
    return javaFunciones;
}
