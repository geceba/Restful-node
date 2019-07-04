var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
	var tipo = req.params.tipo;
	var id = req.params.id;

	// tipos de coleccion
	var tiposValidos = [ 'hospitales', 'medicos', 'usuarios' ];

	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			mensaje: 'Tipo de colección no valido',
			errors: { message: 'Tipo de colección no valido' }
		});
	}

	if (!req.files) {
		return res.status(400).json({
			ok: false,
			mensaje: 'No selecciono nada',
			errors: { message: 'debe seleccionar una imagen' }
		});
	}

	// obtener nombre del archivo
	var archivo = req.files.imagen;
	var nombreCorto = archivo.name.split('.');
	var extencion = nombreCorto[nombreCorto.length - 1];

	// extensiones validas
	var extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

	if (extensionesValidas.indexOf(extencion) < 0) {
		return res.status(400).json({
			ok: false,
			mensaje: 'Extensión no valida',
			errors: { message: 'las extensiones validas son ' + extensionesValidas.join(', ') }
		});
	}

	// archivo personalizados: nombre
	var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`;

	// mover el archivo a un path
	var path = `./uploads/${tipo}/${nombreArchivo}`;

	archivo.mv(path, (err) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al mover el archivo',
				errors: err
			});
		}

		subirPorTipo(tipo, id, nombreArchivo, res);
		// res.status(200).json({
		// 	ok: true,
		// 	mensaje: 'Archivo movido correctamente',
		// 	extencionArchivo: extencion
		// });
	});
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
	if (tipo === 'usuarios') {
		
		Usuario.findById(id, (err, usuario) => {

			if(!usuario){
				return res.status(400).json({
					ok: true,
					mensaje: 'Usuario no existe',
					errors: { message: 'Usuario no existe' }
				});
			}

			var oldPath = './uploads/usuarios/' + usuario.img;

			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}

			usuario.img = nombreArchivo;

			usuario.save((err, usuarioActualizado) => {
				usuarioActualizado.password = ';)';

				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de usuario actualizado ',
					extencionArchivo: usuarioActualizado
				});
			});
		});
	}

	if (tipo === 'medicos') {
		Medico.findById(id, (err, medico) => {
			if(!medico){
				return res.status(400).json({
					ok: true,
					mensaje: 'Medico no existe',
					errors: { message: 'Medico no existe' }
				});
			}

			var oldPath = './uploads/medicos/' + medico.img;

			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}

			medico.img = nombreArchivo;

			medico.save((err, medicoActualizado) => {
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de medico actualizado ',
					extencionArchivo: medicoActualizado
				});
			});
		});
	}

	if (tipo === 'hospitales') {
		Hospital.findById(id, (err, hospital) => {

			if(!hospital){
				return res.status(400).json({
					ok: true,
					mensaje: 'Hospital no existe',
					errors: { message: 'Hospital no existe' }
				});
			}
			
			var oldPath = './uploads/hospitales/' + hospital.img;
			

			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}

			hospital.img = nombreArchivo;

			hospital.save((err, hospitalActualizado) => {
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de hospital actualizado ',
					extencionArchivo: hospitalActualizado
				});
			});
		});
	}
}

module.exports = app;
