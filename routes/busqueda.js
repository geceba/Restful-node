var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();


/*
=====================
	Busqueda General	
=====================
 */


 app.get('/coleccion/:tabla/:busqueda', (req, res) => {
	var busqueda = req.params.busqueda;
	var tabla = req.params.tabla;

	var regex  = new RegExp(busqueda, 'i');
	var promesa;

	switch(tabla) {
		case 'usuarios':
			promesa = buscarUsuario(busqueda, regex);
			break;
		case 'hospitales':
			promesa = buscarHospitales(busqueda, regex);
			break;
		case 'medicos':
			promesa = buscarMedicos(busqueda, regex);
			break; 
		default:
			return res.status(400).json({
				ok: false,
				mensaje: "Los tipos de busqueda sólo son: usuario, hospital, medico",
				error: { message: "Tipo de tabla/colección no válido"}
			});
	}

	promesa.then(data => {
		return res.status(200).json({
			ok: true,
			[tabla]: data
		});
	})
 });
/*
=====================
	Busqueda General	
=====================
 */

app.get('/todo/:busqueda', (req, res, next) => {
	var busqueda = req.params.busqueda;

	var regex  = new RegExp(busqueda, 'i');

	Promise.all([ 
		buscarHospitales(busqueda, regex), 
		buscarMedicos(busqueda, regex),
		buscarUsuario(busqueda, regex)])
		.then(respuestas => {
			res.status(200).json({
				ok: true,
				hospitales: respuestas[0],
				medicos: respuestas[1],
				usuarios: respuestas[2]
			});	
		})
	
	

});

function buscarHospitales( busqueda, regEx) {
	
	return new Promise( (resolve, reject) => {
		Hospital.find({nombre: regEx})
		.populate('usuario', 'nombre email')
		.exec( (err, hospitales) => {
				if(err) {
					reject('Error al cargar hospitales ', err);
				} else {
					resolve(hospitales);
				}
		});
	});
	
}

function buscarMedicos( busqueda, regEx) {
	
	return new Promise( (resolve, reject) => {
		Medico.find({nombre: regEx})
		.populate('usuario', 'nombre email')
		.populate('hospital')
		.exec((err, medicos) => {
			if(err) {
				reject('Error al cargar medicos ', err);
			} else {
				resolve(medicos);
			}
		});
	});
	
}

function buscarUsuario( busqueda, regex) {
	
	return new Promise( (resolve, reject) => {
		Usuario.find({}, 'nombre email role')
			.or([{'nombre': regex}, {'email': regex }])
			.exec((err, usuarios) => {
				if(err) {
					reject('Error al enviar al cargar los usuarios');
				} else {
					resolve(usuarios)
				}
			})
	});
	
}
module.exports = app;
