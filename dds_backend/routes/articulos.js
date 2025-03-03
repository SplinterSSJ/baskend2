const express = require("express");
const router = express.Router();
const db = require("../base-orm/sequelize-init");
const { Op, ValidationError } = require("sequelize");
const auth = require("../seguridad/auth");

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
    const { count, rows } = await db.articulos.findAndCountAll({
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
            IdArticuloFamilia: req.body.IdArticuloFamilia,
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

router.put("/api/articulos/:id", async (req, res) => {
    // #swagger.tags = ['Articulos']
    // #swagger.summary = 'actualiza un Artículo'
    // #swagger.parameters['id'] = { description: 'identificador del Artículo...' }
    /*    #swagger.parameters['Articulo'] = {
                    in: 'body',
                    description: 'Articulo a actualizar',
                    schema: { $ref: '#/definitions/Articulos' }
        } */
    try {
        let item = await db.articulos.findOne({
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
        if (!item) {
            res.status(404).json({ message: "Articulo no encontrado" });
            return;
        }
        item.Nombre = req.body.Nombre;
        item.Precio = req.body.Precio;
        item.CodigoDeBarra = req.body.CodigoDeBarra;
        item.IdArticuloFamilia = req.body.IdArticuloFamilia;
        item.Stock = req.body.Stock;
        item.FechaAlta = req.body.FechaAlta;
        item.Activo = req.body.Activo;
        await item.save();
        // otra forma de hacerlo
        // let data = await db.articulos.update(
        //   {
        //     Nombre: req.body.Nombre,
        //     Precio: req.body.Precio,
        //     CodigoDeBarra: req.body.CodigoDeBarra,
        //     IdArticuloFamilia: req.body.IdArticuloFamilia,
        //     Stock: req.body.Stock,
        //     FechaAlta: req.body.FechaAlta,
        //     Activo: req.body.Activo,
        //   },
        //   { where: { IdArticulo: req.params.id } }
        // );
        res.sendStatus(204);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += x.path + ": " + x.message + '\n');
            res.status(400).json({message : messages});
        } else {
            throw err;
        }
    }
});

router.delete("/api/articulos/:id", async (req, res) => {
    // #swagger.tags = ['Articulos']
    // #swagger.summary = 'elimina un Articulo'
    // #swagger.parameters['id'] = { description: 'identificador del Articulo..' }
    let bajaFisica = false;

    if (bajaFisica) {
        //baja fisica
        let filasBorradas = await db.articulos.destroy({
            where: { IdArticulo: req.params.id },
        });
        if (filasBorradas == 1) res.sendStatus(200);
        else res-sendStatus(404);
    } else {
        //baja logica
        try {
            let data = await db.sequelize.query(
                "UPDATE articulos SET Activo = case when Activo = 1 then 0 else 1 end WHERE IdArticulo = :IdArticulo",
                {
                    replacements: { IdArticulo: +req.params.id },
                }
            );
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof ValidationError) {
                const messages = err.errors.map((x) => x.message);
                res.status(400).json(messages);
            } else {
                throw err;
            }
        }
    }
});

module.exports = router;