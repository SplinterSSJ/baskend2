const express = require("express");

//crear servidor
const app = express();

require("./base-orm/sqlite-init"); //crear base si no existe
app.use(express.json()); //para leer json en el body
app.use(express.json()); //para poder leer json en el body

//controlar ruta 
app.get("/", (req, res) => {
    res.send("Baceknd inicial dds-baceknd!");
});

//vincular controlador con la aplicacion express
const articulosfamiliasRouter = require("./routes/articulosfamilias");
app.use(articulosfamiliasRouter);

const articulosRouter = require("./routes/articulos");
app.use(articulosRouter);

//cofigurar servidor
const cors = require("cors");
app.use(
    cors({
        origin: "*", // origin: 'https://dds-frontend.azurewebsites.net'
    })
);

//vincular seguridad
const seguridadRouter = require("./routes/seguridad");
app.use(seguridadRouter);

//levantar servidor
const port = 3000;
app.listen(port, () => {
    console.log(`sitio escuchando en el puerto ${port}`);
});

const articulosfamiliasmockRouter = require("./routes/articulosfamiliasmock");
app.use(articulosfamiliasmockRouter);
