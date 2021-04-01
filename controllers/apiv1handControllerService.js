'use strict'

//const axios = require('axios');

//var pokerSolver = require('/pokerSolver/js/pokerSolver.js');

module.exports.solvePoker = function solvePoker(req, res, next) {
  console.log("==================");
  console.log(req.ArrayRondas.value); //JSON!derulo
  var data = req.ArrayRondas.value;

  let pokerSolver = require('../js/pokerSolver.js');
  var sol = pokerSolver.readPoker(data);
  console.log(sol);

  res.send(sol);
};