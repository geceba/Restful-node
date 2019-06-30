var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

var app = express();

app.get('/todo/:busqueda', (req, res, next) => {
	var busqueda = req.params.busqueda;

	var regex  = new RegExp(busqueda, 'i');
	
	buscarHospitales( busqueda, regex).then( hospitales => {
		res.status(200).json({
			ok: true,
			hospitales: hospitales
		});
	});

});

function buscarHospitales( busqueda, regEx) {
	
	return new Promise( (resolve, reject) => {
		Hospital.find({nombre: regEx}, (err, hospitales) => {
			if(err) {
				reject('Error al cargar hospitales ', err);
			} else {
				resolve(hospitales);
			}
		});
	});
	
}

module.exports = app;
