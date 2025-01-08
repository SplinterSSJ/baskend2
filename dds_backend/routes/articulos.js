const express = require("express");
const router = express.Router();
const db = require("../base-orm/sequelize-init");
const { Op, ValidationError } = require("sequelize");

router.get("/api/articulos", async function (req, res, next){
    //#swagger.tags = ['Articulos']
    //#swagger.summary = 'obtiene todos los Articulos'
    //consulta de articulos con filtros y paginacion

    let where = {};
    if (req.query.Activo != undefined && req.query.Activo !== ""){
        // true o false een el modelo, en base de datos es 1 o 0
        // convertir el string a booleano
        where.Activo = req.query.Activo === "true";
    }
    const Pagina = req.query.Pagina ?? 1;
    const TamañoPagina = 10;
    const { const, rows } = await db.articulos.findAndCountAll({
        atributes: [
            "IdArticulo",
            "Nombre",
            "Precio",
            "Stock",
            "FechaAlta",
            "Activo",
        ],
        order: [["Nombre", "ASC"]],
        where,
        offset: (Pagina - 1) * TamañoPagina,
        limit: TamañoPagina,
    });

    return req.json({ Items: rows, RegistrosTotal: count });
});

router.get("/api/articulos/:id", async function (req, res, next){
    //#swagger.tags = ['Articulos']
    //#swagger.summary = 'obtiene un Articulo'
    //#swagger.parameters['id'] = { description: 'identificador del Articulo...'}
    let items = await db.articulos.findOne({
        attributes: [
            "IdArticulo",
            "Nombre",
            "Precio",
            "CodigoDeBarra",
            "IdArticuloFamilia",
            "Stock",
            "FechaAlta",
            "Activo",
        ],
        where: { IdArticulo: req.params.id },
    });
    res.json(items);
});

router.post("/api/articulos/", async (req, res) => {
    // #swagger.tags = ['Articulos']
    // #swagger.summary = 'agrega un Articulo'
    /*    #swagger.parameters['item'] = {
            in: 'body',
            description: 'nuevo Artículo',
            schema: { $ref: '#/definitions/Articulos' }
    } */
    try {
        let data = await db.articulos.create({
            Nombre: req.body.Nombre,
            Precio: req.body.Precio,
            CodigoDeBarra: req.body.CodigoDeBarra,
            IdArticulosFamilia: req.body.IdArticulosFamilia,
            Stock: req.body.Stock,
            FechaAlta: req.body.FechaAlta,
            Activo: req.body.Activo,
        });
        res.status(200).json(data.dataValues);//devuelve el registro agregado
    } catch (err) {
        if (err instanceof ValidationError) {
            //si son errores de validacion, se devuelve
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ": " + x.mesagge + '\n');
            res.status(400).json({message : messages});
        } else {
            //si son errores desconocidos, los controla el middleware de errores
            throw err;
        }
    }
});