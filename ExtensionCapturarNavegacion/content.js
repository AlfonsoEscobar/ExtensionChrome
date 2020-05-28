// Constructor del objeto que luego queremos enviar al background
function DatosEvento(id, name, elementType, typeEvent, value, linkText, innerText, path) {
    this.id = id;
    this.name = name;
    this.elementType = elementType;
    this.typeEvent = typeEvent;
    this.value = value;
    this.linkText = linkText;
    this.innerText = innerText;
    this.path = path;
}


//Es la funcion que se encarga de recoger el evento del click
function clickHandler(event) {
    //Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
    // al background
    console.log(event);
    let mandar = false;
    let tipo = event.srcElement.localName;
    var path = "";
    //Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
    if (tipo == 'img' ||tipo == 'td' || tipo == 'a' || tipo == 'button' || tipo == 'submit' || tipo == 'reset') {
        // con esto recogemos todo el path del evento y lo guardamos en un string(lo ponemos a lenght -2 para que tome desde html)
        for (var i = 0; i < event.path.length - 2; i++) {
            path = "/" + event.path[i].nodeName + path;
        }
        // Con este for recorremos el tr para guardar los td que puedan estar dentro.
        // for (var i = 0; i < event.path[1].cells.length; i++) {
        //    var pathCells = pathCells + "<td>" + event.path[1].cells[i].innerText + "</td>";
        // }
        // Volcamos todos los datos a nuestro objeto para enviarlo
        var miobjeto = new DatosEvento(
            event.srcElement.id, 
            event.srcElement.name, 
            event.srcElement.localName, 
            event.type, 
            event.srcElement.value, 
            event.srcElement.textContent, 
            null, 
            path.toLowerCase()
            );
        mandar = true;
    }
    //Solo si la varible "mandar" es igual a true, es decir a dado en un elemento valido
    // se envia la informacion
    if (mandar) {
        chrome.runtime.sendMessage(miobjeto);
    }
};

function updateValue(e) {
    var path = "";
    for (var i = 0; i < e.path.length - 2; i++) {
        path = "/" + event.path[i].nodeName + path;
    }
    var datos = new DatosEvento(
        e.srcElement.id, 
        e.srcElement.name, 
        e.srcElement.localName, 
        e.type, 
        e.srcElement.value, 
        e.srcElement.textContent, 
        null, 
        path.toLowerCase());
    chrome.runtime.sendMessage(datos);
}

document.addEventListener("click", clickHandler);
document.addEventListener("change", updateValue);