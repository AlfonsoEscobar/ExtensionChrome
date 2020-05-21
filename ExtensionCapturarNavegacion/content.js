// Constructor del objeto que luego queremos enviar al background
function DatosEvento(id, name, elementType, typeEvent, value, linkText) {
    this.id = id;
    this.name = name;
    this.elementType = elementType;
    this.typeEvent = typeEvent;
    this.value = value;
    this.linkText = linkText;
}
//Esta a la escucha del evento click en todo el DOM y llama a la funcion "clickHandler"
document.addEventListener("click", clickHandler);
//Es la funcion que se encarga de recoger el evento del click
function clickHandler(event) {
    //Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
    // al background
    
    let mandar = false;
    let tipo = event.srcElement.localName;
    console.log(tipo);
    //Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
    if (tipo == 'a' || tipo == 'button' || tipo == 'input' || tipo == 'select') {
        var miobjeto = new DatosEvento(event.srcElement.id, event.srcElement.name, event.srcElement.localName, event.type, null, event.srcElement.textContent);
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
    var datos = new DatosEvento(e.srcElement.id, event.srcElement.name, e.srcElement.localName, e.type, e.srcElement.value, event.srcElement.textContent);
    chrome.runtime.sendMessage(datos);
}