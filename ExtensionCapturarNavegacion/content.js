
// Variable para motrar mensajes por la consola del navegador
var debug = true;

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

log(">>>>>>> En funcionamiento");

// window.addEventListener("load", onLoadHandler);
// function onLoadHandler(e) {
//     console.log("JMP->En onLoadHandler...");
//     for (let idx = 0; idx < window.frames.length; idx++) {
//         console.log("JMP->Asociando listener a frame:" + idx);
//         window.frames[idx].addEventListener("click", clickHandler);
// 		window.frames[idx].addEventListener("change", updateValue);
//     }
   
//     console.log("JMP->Asociando listener a document");
//     document.addEventListener("click", clickHandler);
// 	document.addEventListener("change", updateValue);
// }

//Es la funcion que se encarga de recoger el evento de la pulsacion del ENTER
function keypressed(ev) {
    var codigo = ev.which || ev.keyCode;
    console.log(ev);
    if(codigo === 13){
        for (let i = 0; i < ev.path; i++){
            if(ev.path[i] == "form"){
                for (let x = 0; x < ev.path[i]; x++){
                    if(ev.path[i][x].type == "submit"){
                        var miobjeto = new DatosEvento(
                                        ev[i][x].id,
                                        ev[i][x].name,
                                        ev[i][x].localName,
                                        "click",
                                        null,
                                        ev[i][x].textContent,
                                        null
                                        );
                        chrome.runtime.sendMessage(miobjeto);
                        break;
                    }
                }
            }
        }
    }
    
}

//Es la funcion que se encarga de recoger el evento del click.
function clickHandler(event) {
    //Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
    // al background
    let mandar = false;
    let tipo = event.srcElement.localName;
    var path = "";
    //Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
    if (tipo == 'td' || tipo == 'a' || tipo == 'button' || tipo == 'select' || tipo == 'submit' || tipo == 'reset') {
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

//Es la funcion que se encarga de recoger el evento del change.
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
                    e.srcElement.parentNode.localName, 
                    null, 
                    path.toLowerCase());
    chrome.runtime.sendMessage(datos);
}

function log(mensaje){
	if(debug){
		console.log(mensaje);
	}
}


//Esta a la escucha del evento click en todo el DOM y llama a la funcion "clickHandler"
document.addEventListener("click", clickHandler);

//Esta a la escucha del evento que se producce al pulsar una tecla en el DOM y llama a la funcion "keypressed"
document.addEventListener("keypress", keypressed);

//Es el evento que esta a la escucha de cualquier cambio de foco, lo utilizamos para recoger las variables
// de los elementos input y select
document.addEventListener("change", updateValue);