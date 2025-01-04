const express = requiere("express");
const router = express.Router();

const db = require("../base-orm/sequelize-init");

router.get("/api/articulosfamiloas", async function (req, res, next){
    let data = await db.articulosfamilias.findAll({
        attributes: ["IdArticulofamilia", "Nombre"],
    });
    res.json(data)
});

module.exports = router;