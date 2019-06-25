// requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');


// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if(err) throw err;

    console.log('base de datos\x1b[32m%s\x1b[0m',' online')
});

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000:\x1b[32m%s\x1b[0m',' online');
});