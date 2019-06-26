var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req, res)=> {
    var body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {

        if(err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    })
});


module.exports = app;