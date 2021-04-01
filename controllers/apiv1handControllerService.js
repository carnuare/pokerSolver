'use strict'

module.exports.solvePoker = function solvePoker(req, res, next) {
  console.log("==================");

  var data = req.ArrayRondas.value;

  let pokerSolver = require('../js/pokerSolver.js');
  var sol = pokerSolver.readPoker(data);

  for(var i in data){
    console.log("Mano %s", i);
    console.log("   Jugadas: ");
    for(var jugada in data[i].jugadas){
      console.log(data[i].jugadas[jugada]);
    }
    console.log("   Bote: " + data[i].bote);
  }
  console.log("==========SOLUCION==========");
  console.log(sol);

  res.send(sol);
};