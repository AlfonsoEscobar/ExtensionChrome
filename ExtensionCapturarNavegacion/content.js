// Constructor del objeto que luego queremos enviar al background
function DatosEvento(id, name, elementType, typeEvent, value, linkText, path) {
    this.id = id;
    this.name = name;
    this.elementType = elementType;
    this.typeEvent = typeEvent;
    this.value = value;
    this.linkText = linkText;
    this.path = path;
}
//Esta a la escucha del evento click en todo el DOM y llama a la funcion "clickHandler"
document.addEventListener("click", clickHandler);

window.addEventListener("load", onLoadHandler);
function onLoadHandler(e) {
    console.log("JMP->En onLoadHandler...");
    for (let idx = 0; idx < window.frames.length; idx++) {
        console.log("JMP->Asociando listener a frame:" + idx);
        window.frames[idx].addEventListener("click", clickHandler);
		window.frames[idx].addEventListener("change", updateValue);
    }
   
    console.log("JMP->Asociando listener a document");
    document.addEventListener("click", clickHandler);
	document.addEventListener("change", updateValue);
}

//Es la funcion que se encarga de recoger el evento del click
function clickHandler(event) {
    //Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
    // al background
    let mandar = false;
    let tipo = event.srcElement.localName;
    var path = "";
    //Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
    if (tipo == 'a' || tipo == 'button' || tipo == 'input' || tipo == 'select') {
        // con esto recogemos todo el path del evento y lo guardamos en un string
        for (var i = 0; i < event.path.length; i++) {
            path = path + "/" + event.path[i].nodeName;
        }
        // con esto creamos el array del path
        var arrayPath = path.split("/");
        
        // Volcamos todos los datos a nuestro objeto para enviarlo
        var miobjeto = new DatosEvento(event.srcElement.id, event.srcElement.name, event.srcElement.localName, event.type, null, event.srcElement.textContent, arrayPath);
        mandar = true;
    }
    //Solo si la varible "mandar" es igual a true, es decir a dado en un elemento valido
    // se envia la informacion
    if (mandar) {
        chrome.runtime.sendMessage(miobjeto);
    }
};

//Es el evento que esta a la escucha de cualquier cambio de foco, lo utilizamos para recoger las variables
// de los elementos input y select
document.addEventListener("change", updateValue);
function updateValue(e) {
    var path = "";
    for (var i = 0; i < e.path.length; i++) {
        path = path + "/" + e.path[i].nodeName;
    }
     var arrayPath = path.split("/");
    var datos = new DatosEvento(e.srcElement.id, event.srcElement.name, e.srcElement.localName, e.type, e.srcElement.value, event.srcElement.textContent,path);
    chrome.runtime.sendMessage(datos);
}