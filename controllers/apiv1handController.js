'use strict'

var varapiv1handController = require('./apiv1handControllerService');

module.exports.solvePoker = function solvePoker(req, res, next) {
  varapiv1handController.solvePoker(req.swagger.params, res, next);
};