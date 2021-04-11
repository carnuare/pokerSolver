/*
var data = {'Messi': '2H,3D,5S,9C,KD', 'Cristiano': 'AH,AD,AC,4S,6C'};
for(mano in data){
    console.log(data[mano]);
}

var mano= "1H,3B"
var res = [];
var cartas = mano.split(',');
for(var i= 0; i< cartas.length; i++){
    var cartaDefault = {"valor": "", "palo": ""};
    cartaDefault["valor"] = cartas[i][0];
    cartaDefault["palo"] = cartas[i][1];
    res.push(cartaDefault);
}
console.log(res)
*/
var str = "Cristiano gana 0 euros."
console.log(str.split(' ')[0] + " gana la partida.");