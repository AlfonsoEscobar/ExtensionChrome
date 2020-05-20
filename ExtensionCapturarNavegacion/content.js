
var mensaje;

//Esta a la escucha del evento click en todo el DOM y llama a la funcion "clickHandler"
document.addEventListener("click", clickHandler);

//Es la funcion que se encarga de recoger el evento del click
function clickHandler(event){

	//Inicializa la variable "mandar" a falso para que solo cuando es un click valido se mande la informacion
	// al background
	let mandar = false;

	//Se inicializa el mensaje, para que cada vez que se hace click este vacio
	mensaje = {};

	let tipo = event.srcElement.localName;

	//Se carga con la informacion dependiendo de donde haya dado click, y solo en los elementos que queremos
	
	if(tipo == 'button' || tipo == 'a' || tipo == 'input' || tipo == 'select'){
		mensaje = {
			id: event.srcElement.id,
			name: event.srcElement.name,
			elementType: event.srcElement.localName,
			typeEvent: event.type,
			value: event.srcElement.value
		};
		mandar = true;
	}

	//Solo si la varible "mandar" es igual a true, es decir a dado en un elemento valido
	// se envia la informacion
	if(mandar){
		chrome.runtime.sendMessage(mensaje);
	}
};


//Es el evento que esta a la escucha de cualquier cambio de foco, lo utilizamos para recoger las variables
// de los elementos input y select
document.addEventListener("change", updateValue);
function updateValue(e) {
	mensaje = {
        id: e.srcElement.id,
		name: e.srcElement.name,
		elementType: e.srcElement.localName,
		typeEvent: e.type,
		value: e.srcElement.value
    }; 
	chrome.runtime.sendMessage(mensaje);
}

