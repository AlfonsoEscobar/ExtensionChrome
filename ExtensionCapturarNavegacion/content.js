// Constructor del objeto que luego queremos enviar al background
function DatosEvento(id, name, elementType, typeEvent, value, linkText, innerText, path, valueSelect) {
    this.id = id;
    this.name = name;
    this.elementType = elementType;
    this.typeEvent = typeEvent;
    this.value = value;
    this.linkText = linkText;
    this.innerText = innerText;
    this.path = path;
    this.valueSelect = valueSelect;
}
document.addEventListener("click", clickHandler);
document.addEventListener("change", updateValue);
//Es la funcion que se encarga de recoger el evento del click
function clickHandler(event) {
    //Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
    // al background
    console.log(event);
    let mandar = false;
    let tipo = event.srcElement.localName;
    var path = "";
    //Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
    if (tipo == 'img' || tipo == 'td' || tipo == 'a' || tipo == 'button' || tipo == 'submit' || tipo == 'reset') {
        // con esto recogemos todo el path del evento y lo guardamos en un string(lo ponemos a lenght -2 para que tome desde html)
        for (var i = 0; i < event.path.length - 2; i++) {
            path = "/" + event.path[i].nodeName + path;
        }
        // Con este for recorremos el tr para guardar los td que puedan estar dentro.
        // for (var i = 0; i < event.path[1].cells.length; i++) {
        //    var pathCells = pathCells + "<td>" + event.path[1].cells[i].innerText + "</td>";
        // }
        // Volcamos todos los datos a nuestro objeto para enviarlo
        var miobjeto = new DatosEvento (
            event.srcElement.id, 
            event.srcElement.name, 
            event.srcElement.localName, 
            event.type, 
            event.srcElement.value, 
            event.srcElement.textContent, 
            null,
            path.toLowerCase(), 
            null
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
    var valueSelect = "";
    var type = e.type;

    for (var i = 0; i < e.path.length - 2; i++) {
        path = "/" + event.path[i].nodeName + path;
    }
    if (e.srcElement.localName == "select") {
        valueSelect = e.srcElement.selectedOptions[0].innerText;
    } else {
        valueSelect = null;
    }
// Para cambiarle la propiedad a type si es que marcan un checkbox y deje de ser input
    if (e.srcElement.type == "checkbox") {
        type = e.srcElement.type;
    } 

    var datos = new DatosEvento(
        e.srcElement.id, 
        e.srcElement.name, 
        e.srcElement.localName, 
        type, 
        e.srcElement.value, 
        e.srcElement.textContent, 
        null, path.toLowerCase(), 
        valueSelect
        )

    chrome.runtime.sendMessage(datos);
}