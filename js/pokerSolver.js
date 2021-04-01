
const puntuacionCarta = {
    A:14,
    K:13,
    Q:12,
    J:11,
    10:10,
    9:9,
    8:8,
    7:7,
    6:6,
    5:5,
    4:4,
    3:3,
    2:2
}
//para llamarlo desde otro script
module.exports.readPoker = function readPoker(data){
    var res = [];
    for(numeroMano in data){
        var n = parseInt(numeroMano);
        //console.log('mano %d:', n+1);
        res.push(resolverRonda(data[numeroMano]));
    }
    return res;
}

function resolverRonda(rondaN){ //rondaN es una sola ronda con varias manos con sus respectivas cartas + apuestas, y un bote
    var sol = {};

    var rondaActual =  {
        jugadores: {},
        premio: 0,
        gana:[],
        set setJugador(jugador){
            this.jugadores[jugador] = "";
        },
        set setPremio(dinero){
            this.premio = parseInt(dinero);
        },
        set setGanador(jugador){
            this.gana.push(jugador);
        }
    }

    for(mano in rondaN.jugadas){ //por cada mano en la ronda sumamos su apuestas y calculamos la puntuacion

        let persona = rondaN.jugadas[mano].jugador; //el jugador en cuestion
        rondaActual.setJugador = persona;
        rondaActual.setPremio = parseInt(rondaActual.premio) + parseInt(rondaN.jugadas[mano].apuesta); //su apuesta

        let cartas = rondaN.jugadas[mano].cartas; //cartas del jugador n 
        rondaActual.jugadores[persona] = cartas;

        let puntuacion = calcularPuntuacion(cartas); //puntacion con las cartas del jugador

        //guardamos las soluciones en un mapa
        sol[persona] = puntuacion; //solucion es un objeto que tiene a cada jugador como propiedad
                                    //y dentro del jugador se le ponen sus cartas(parseadas), los puntos que ha conseguido y el tipo de mano
    }
    rondaActual.setPremio = parseInt(rondaActual.premio) + parseInt(rondaN.bote); //sumamos el bote global al premio de la ronda

    //console.log(rondaActual.jugadores);
    //console.log("   premio: "+  rondaActual.premio);
    //console.log("       puntuaciones: ", sol);

    let trampas = checkTrampas(rondaActual) // bool para saber si la partida esta amañada (sin tener en cuenta cartas comunitarias)
    var res;
    if(trampas){
        res = "Partida amañada."
    }else{
        res = determinarGanador(sol, rondaActual.premio);
    }
    return res;

}

function checkTrampas(rondaActual){
    var mapa = {}; // hacer un mapa contando las cartas que hay, si hay dos cartas iguales (mismo valor y mismo palo) la fx devolvera true (hay trampas)
    var res;
    var acum = 0; //uso esto para saber si hay alguna carta cuyo numero de apariciones es mas de 1
    for(jugador in rondaActual.jugadores){
        for(let i = 0; i<5; i++){//por cada carta
            var carta = rondaActual.jugadores[jugador][i].valor + rondaActual.jugadores[jugador][i].palo;
            mapa[carta] = (mapa[carta] || 0)+1; //guardo en el mapa el numero de repeticiones de cada carta
        }
    }
    Object.entries(mapa).forEach(function(carta){
        if(carta[1] > 1){ 
            acum = 1;
        }
    }); 
    if(acum == 1){
        res = true; //hay trampas
    }else{
        res = false; //no hay trampas
    }
    return res;
}

function determinarGanador(sol, premio){
    var res;
    var puntuacionMax;
    var gana = [];
    for (jugador in sol) {
            puntuacionMax = !puntuacionMax || puntuacionMax < sol[jugador].puntos ? sol[jugador].puntos : puntuacionMax; //el !puntuacionMaxima es para cuando esté vacio
    }

    Object.entries(sol).forEach(function(jugador){if(jugador[1].puntos == puntuacionMax){gana.push(jugador)}}); //otro modo de hacer for jugador in sol. jugador[0] es el nombre, jugador[1] son los atributos

    //console.log("La puntuacion maxima es: ", puntuacionMax);
    if(gana.length <=0){
        res = "ERROR; NO HAY GANADOR";
    }else if (gana.length == 1){
        res = gana[0][0] + " gana " + premio + " euros."; //gana[n] es el array del jugador gana[n][0] es el nombre del jugador y gana[n][1] son las cartas, puntos y tipo de mano con la que ha ganado
    }else{
        res = desempate(gana, premio);
    }
    return res;
}

//NOTA: Es imposible que haya empate de Poker, Full o Trio en una ronda. Por el filtro de antiCheat esas situaciones no se van a dar. Pero en una partida real de poker
//      donde existan cartas comunitarias, estas situaciones pueden llegar a ser posibles.

function desempate(gana, premio){
    var res;
    var nuevoGana = [];
    if(gana[0][1].tipoMano == "Escalera Color"){ //cojo el tipo de mano del primer jugador porque todos deben haber ganado con el mismo tipo de mano para que haya un empate
        nuevoGana = desempateEscalera(gana); //gana el jugador que tenga la escalera mas alta
    }else if (gana[0][1].tipoMano == "Poker"){  
        nuevoGana = desempatePoker(gana); //gana el jugador que tenga el poker mas alto, en caso de empate, la carta restante mas alta
    }else if (gana[0][1].tipoMano == "Full"){
        nuevoGana = desempateFull(gana); //gana el trio mas alto; con empate de trios gana la pareja mas alta
    }else if (gana[0][1].tipoMano == "Color"){
        nuevoGana = desempateColor(gana);
    }else if (gana[0][1].tipoMano == "Escalera"){
        nuevoGana = desempateEscalera(gana);
    }else if (gana[0][1].tipoMano == "Trio"){
        nuevoGana = desempateTrio(gana); //es imposible que haya dos trios en una misma baraja
    }else if (gana[0][1].tipoMano == "Doble Pareja"){
        nuevoGana = desempatePareja(gana, 1);
    }else if (gana[0][1].tipoMano == "Pareja"){
        nuevoGana = desempatePareja(gana, 1);
    }else if (gana[0][1].tipoMano == "Carta mas alta"){
        nuevoGana = desempateColor(gana); //desempateColor hace la funcion de ver quien tiene la carta mas alta y los casos de empate (no importa color)
    }

    //vemos si se puede hacer un desempate
    if(nuevoGana.length <=0){
        res = "ERROR; NO HAY GANADOR";
    }else if (nuevoGana.length == 1){
        res = nuevoGana[0][0] + " gana " + premio + " euros.";
    }else{
        res = "Verdadero empate.";
    }
    return res;
}



function cartasRepeticiones(jugadores){//objeto con jugadores, sus cartas y las veces que se han repetido
    var cuenta = {};
    for(jugador in jugadores){
        cuenta[jugador] = {}; //donde almaceno el numero de numeros y sus repeticiones segun el jugador
        jugadores[jugador][1].cartas.puntos.forEach(function(x) { cuenta[jugador][x] = (cuenta[jugador][x] || 0)+1; }); //crea un objeto con los numeros y sus repeticiones *********
    }
    return cuenta
}

function repeticionesDeN(jugadores, cuenta, N){ //devuelve el jugador que tenga la individual, pareja, trio o poker más alto
    var nuevoGana = [];
    var cartaMasAlta;

    for(jugador in cuenta){
        Object.entries(cuenta[jugador]).forEach(function(valor){if(valor[1] == N){ //valor[0] es el valor numerico de la carta, valor[1] es el numero de veces que se repite, 4 porque tiene que ser poker
            cartaMasAlta = !cartaMasAlta || +cartaMasAlta < +valor[0] ? valor[0] : cartaMasAlta; //poner el + antes de los numeros los pasa de string a numero de verdad
         }}); 
    }
    for(jugador in jugadores){
        for(valor in cuenta[jugador]){ 
            if(cuenta[jugador][valor]==N && valor == cartaMasAlta){ //se tiene que repetir N veces
                nuevoGana.push(jugadores[jugador]);
            }
        }
    }
    return nuevoGana;
}

function getIndices(array, n){ //devuelve array con los indices en los que se encuentra el elemento n
    var indices = [];
    for(j in array){
        if(array[j] == n){
            indices.push(j);
        }
    }
    return indices;
}

function desempatePareja(jugadores, opt){
    var cuenta = cartasRepeticiones(jugadores);// lista numeros en mano y sus repeticiones
    var nuevoGana = repeticionesDeN(jugadores, cuenta, 2); //ver quien tiene la pareja mas alta
    if(nuevoGana.length > 1){ //
        var parejaMasAlta;
        for(jugador in cuenta){
            Object.entries(cuenta[jugador]).forEach(function(valor){if(valor[1] == 2){ //valor[0] es el valor numerico de la carta, valor[1] es el numero de veces que se repite, 4 porque tiene que ser poker
                parejaMasAlta = !parejaMasAlta || +parejaMasAlta < +valor[0] ? valor[0] : parejaMasAlta;//busco la pareja mas alta para eliminarla
             }}); 
        }
        for(jugador in jugadores){
            for(valor in cuenta[jugador]){ 
                if(cuenta[jugador][valor]==2 && valor == parejaMasAlta){ //si es la pareja mas alta 
                    var i = getIndices(nuevoGana[jugador][1].cartas.puntos, parejaMasAlta);
                    for(e in i){
                        nuevoGana[jugador][1].cartas.puntos[i[e]] = 0; //el valor mas alto lo ponemos como 0 para buscar la siguiente pareja mas alta
                    }
                    
                }
            }
        }
        if(opt<2){ //por si hay dos parejas en la mano
            opt = parseInt(opt) + 1;
            nuevoGana = desempatePareja(nuevoGana, opt);
        }else{ //si ya se han borrado las dos parejas solo queda buscar la carta mas alta restante
            nuevoGana = calcularCartaAlta(nuevoGana);
        }
        
    }
    return nuevoGana;
}

function desempateTrio(jugadores){
    var cuenta = cartasRepeticiones(jugadores);// lista numeros en mano y sus repeticiones
    var nuevoGana = repeticionesDeN(jugadores, cuenta, 3); //ver quien tiene el trio mas alto
    if(nuevoGana.length > 1){
        cuenta = cartasRepeticiones(nuevoGana);
        nuevoGana = repeticionesDeN(nuevoGana, cuenta, 1); //mira quien tiene la carta (que No sea trio) mas alta
        if(nuevoGana.length >1){ //si sigue habiendo mas de un ganador significa que solo hay una diferencia en una carta 
            nuevoGana = desempatePorSuma(nuevoGana); //por lo que el ganador tendrá la suma mas alta 
        }
    }
    return nuevoGana;
}

function desempatePorSuma(jugadores){
    var nuevoGana = [];
    var sumaMasAlta;
    for (jugador in jugadores) {
        sumaMasAlta = !sumaMasAlta || sumaMasAlta < jugadores[jugador][1].cartas.puntos.reduce((a, b) => a + b, 0) ? jugadores[jugador][1].cartas.puntos.reduce((a, b) => a + b, 0) : sumaMasAlta;  
    }
    for(jugador in jugadores){
        if(jugadores[jugador][1].cartas.puntos.reduce((a, b) => a + b, 0) == sumaMasAlta){ //si el jugador tiene la suma mas alta se proclama ganador
            nuevoGana.push(jugadores[jugador]);
        }
    }
    return nuevoGana;
}

function desempateColor(jugadores){
    var nuevoGana = calcularCartaAlta(jugadores); //gana quien tenga la carta mas alta
    if(nuevoGana.length > 1 && nuevoGana[0][1].cartas.puntos.reduce((a, b) => a + b, 0) != 0){ //que la suma de las cartas sea distinta de 0 por lo que hacemos abajo
        //si los ganadores tienen la misma carta mas alta, se mirara la segunda/tercera/cuarta/quinta carta mas alta
        //para ello vamos llenando de 0 su lista de puntos 
        for(jugador in nuevoGana){
            var valorMaximo = Math.max.apply(Math, nuevoGana[jugador][1].cartas.puntos);
            var i = nuevoGana[jugador][1].cartas.puntos.indexOf(valorMaximo);
            nuevoGana[jugador][1].cartas.puntos[i] = 0; //el valor mas alto lo ponemos como 0 para buscar la siguiente carta mas alta
      
        }
        nuevoGana = desempateColor(nuevoGana);
    }

    return nuevoGana;
}

function desempateFull(jugadores){
    var cuenta = cartasRepeticiones(jugadores);// lista numeros en mano y sus repeticiones
    var nuevoGana = repeticionesDeN(jugadores, cuenta, 3); //ver quien tiene el trio mas alto
    if(nuevoGana.length>1){ //si hay mas de un ganador, significa que tienen el mismo trio
        var cuenta = cartasRepeticiones(nuevoGana);//resetear cuenta con valores de nuevos ganadores
        nuevoGana = repeticionesDeN(nuevoGana, cuenta, 2); //gana quien tenga la pareja mas alta
    }
    return nuevoGana;    
}

function desempatePoker(jugadores){
    var cuenta = cartasRepeticiones(jugadores);// lista numeros en mano y sus repeticiones
    var nuevoGana = repeticionesDeN(jugadores, cuenta, 4); //ver quien tiene el poker mas alto
    
    if(nuevoGana.length>1){ //si hay mas de un ganador, significa que tienen el mismo poker
        nuevoGana = calcularCartaAlta(nuevoGana); //gana quien tenga la carta mas alta
    }
    
    return nuevoGana;
}

function calcularCartaAlta(jugadores){ //gandores basado en carta mas alta de jugadores
    var nuevoGana = [];
    var cartaMasAlta;
    for (jugador in jugadores) {
        cartaMasAlta = !cartaMasAlta || cartaMasAlta < Math.max.apply(Math, jugadores[jugador][1].cartas.puntos) ? Math.max.apply(Math, jugadores[jugador][1].cartas.puntos) : cartaMasAlta; //hay que usar apply en math max para que me de el numero maximo del array 
    }
    for(jugador in jugadores){
        if(Math.max.apply(Math, jugadores[jugador][1].cartas.puntos) == cartaMasAlta){ //si el jugador tiene la carta mas alta se proclama ganador
            nuevoGana.push(jugadores[jugador]);
        }
    }
    return nuevoGana;

}

function desempateEscalera(jugadores){
    for(jugador in jugadores){ //tener en cuenta que 2,3,4,5,A es lo mas bajo y 10,J,Q,K,A y mas alto; 
        if(jugadores[jugador][1].cartas.puntos[4] == 14){
            jugadores[jugador][1].cartas.puntos[4] = 1; //si nos encontramos con 2,3,4,5,A lo vamos a transformar a 1,2,3,4,5 para que no haya errores al coger la carta mas alta
        }

    }
    return calcularCartaAlta(jugadores);
}

function calcularPuntuacion(cartas){
    var puntuacion = {}; //lo que va a solucion
    var cartasParseadas = parseCartas(cartas); //las parseamos de manera conveniente y en orden ascendente
    puntuacion.cartas= cartasParseadas; 
    if(cartas.length != 5){ //una mano solo puede tener 5 cartas
        throw new Error("Numero de cartas en mano invalido");
    }
    if (checkEscaleraColor(cartasParseadas)){
        puntuacion.puntos = 9;
        puntuacion.tipoMano = "Escalera Color";
    }else if (checkPoker(cartasParseadas)){
        puntuacion.puntos = 8;
        puntuacion.tipoMano = "Poker";
    }else if (checkFull(cartasParseadas)){
        puntuacion.puntos = 7;
        puntuacion.tipoMano = "Full";
    }else if (checkColor(cartasParseadas)){
        puntuacion.puntos = 6;
        puntuacion.tipoMano= "Color";
    }else if (checkEscalera(cartasParseadas) || checkEscaleraEspecial(cartasParseadas)){
        puntuacion.puntos = 5;
        puntuacion.tipoMano= "Escalera";
    }else if (checkTrio(cartasParseadas)){
        puntuacion.puntos = 4;
        puntuacion.tipoMano = "Trio";
    }else if (checkDoblePareja(cartasParseadas)){
        puntuacion.puntos = 3;
        puntuacion.tipoMano = "Doble Pareja";
    }else if (checkPareja(cartasParseadas)){
        puntuacion.puntos = 2;
        puntuacion.tipoMano = "Pareja";
    }else{
        puntuacion.puntos = 1;
        puntuacion.tipoMano = "Carta mas alta";
    }
    return puntuacion;
}

function valorCarta(valorInicial){
    return puntuacionCarta[valorInicial];
}

function parseCartas(cartas){
    var res = { 
        puntos: [], //cartas con valor numero asociadas 2=2 ... A=14
        palos: []   //los palos en orden de las cartas en la mano
    }

    for(carta in cartas){
        res.puntos.push(valorCarta(cartas[carta].valor)); //rellenamos el array de antes con valores numericos por carta
        res.palos.push(cartas[carta].palo); //rellenamos los palos
    }
    res.puntos.sort((a, b) => a - b ); //ordenamos los puntos de las cartas en orden ascendente, los palos nos dan igual ordenarlos porque no influyen en la puntuacion
                                        //**************
    return res;
}

// FUNCIONES DE CADA TIPO DE MANO

function checkEscaleraColor(cartasParseadas){ //consideramos que una escalera no puede ser A2345 
    var res = false; //valor retornado por la funcion, false hata que se demuestre lo contrario

    if(checkEscalera(cartasParseadas) || checkEscaleraEspecial(cartasParseadas)){ //condicion1: que sea escalera
        if(checkColor(cartasParseadas)){//condicion2: que sean del mismo palo
            res = true;
        }
    }
    //console.log(cartasParseadas.puntos);
    return res;
}

function checkPoker(cartasParseadas){ //4 valores iguales
    var res = false; //solucion true o false
    var cuenta = {};// lista numeros en mano y sus repeticiones
    cartasParseadas.puntos.forEach(function(x) { cuenta[x] = (cuenta[x] || 0)+1; }); //crea un objeto con los numeros y sus repeticiones *********
    Object.entries(cuenta).forEach(function(valor){if(valor[1] == 4){res = true}}); //valor[1] es el numero de repeticiones de la carta
    return res;
}

function checkEscaleraEspecial(cartasParseadas){ //condicion especial, una escalera puede ser A,2,3,4,5
    var res;
    if(cartasParseadas.puntos[0] == 2 && cartasParseadas.puntos[1] == 3 && cartasParseadas.puntos[2] == 4 && cartasParseadas.puntos[3] == 5 && cartasParseadas.puntos[4] == 14){
        res = true;
    }else{
        res = false
    }
    return res;
}     

function checkEscalera(cartasParseadas){ //5 valores consecutivos
    var res;
    for (var i = 1; i < cartasParseadas.puntos.length; i++) { 
        if (cartasParseadas.puntos[i] !== cartasParseadas.puntos[i-1] + 1) {
          res = false;
          break;
        }else{
            res = true;
        }
      }
    return res;
}

function checkFull(cartasParseadas){ //trio y pareja
    var res;
    if(checkTrio(cartasParseadas) && checkPareja(cartasParseadas)){
        res = true;
    }else{
        res = false;
    }
    return res;
}

function checkColor(cartasParseadas){ //todo mismo color
    var res;
    if(cartasParseadas.palos.every( v => v === cartasParseadas.palos[0] )){// que sean del mismo palo
        res = true;
    }
    return res;
}

function checkTrio(cartasParseadas){ //3 valores iguales
    var res;
    var cuenta = {};// lista numeros en mano y sus repeticiones
    cartasParseadas.puntos.forEach(function(x) { cuenta[x] = (cuenta[x] || 0)+1; }); //crea un objeto con los numeros y sus repeticiones
    Object.entries(cuenta).forEach(function(valor){if(valor[1] == 3){res = true}});
    return res;
}

function checkDoblePareja(cartasParseadas){ // dos parejas
    var res;
    var cuenta = {};// lista numeros en mano y sus repeticiones
    var contador = 0; //valor que cuenta el numero de parejas, tiene que ser dos para que la funcion devuelva true
    cartasParseadas.puntos.forEach(function(x) { cuenta[x] = (cuenta[x] || 0)+1; }); //crea un objeto con los numeros y sus repeticiones
    var contador = 0; 
    Object.entries(cuenta).forEach(function(valor){if(valor[1] == 2){contador++}});
    if(contador == 2){
        res = true;
    }
    return res;

}

function checkPareja(cartasParseadas){ //2 valores iguales
    var res;
    var cuenta = {};// lista numeros en mano y sus repeticiones
    cartasParseadas.puntos.forEach(function(x) { cuenta[x] = (cuenta[x] || 0)+1; }); //crea un objeto con los numeros y sus repeticiones
    Object.entries(cuenta).forEach(function(valor){if(valor[1] == 2){res = true}});
    return res;
}

//readPoker(data);