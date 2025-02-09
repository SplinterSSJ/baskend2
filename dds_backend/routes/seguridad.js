const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../seguridad/auth");

const users = [
    {
        usuario: "admin",
        clave: "123",
        rol: "admin",
    },
    {
        usuario: "juan",
        clave: "123",
        rol: "member",
    },
];
let refreshTokens = [];

router.post("/api/login", (req, res) => {
    // #swagger.tags = ['Seguridad']
    // #swagger.summary = 'Login de usuarios: admin:123(rol administrador), juan:123(rol miembro)'
    const { usuario, clave } = req.body;

    console.log("Usuario recibido:", usuario);//deputacion
    console.log("Clave recibida:", clave);//depuracion
    //Filter user from the users array by usuario and clave
    const user = users.find((u) => {
        return u.usuario === usuario && u.clave === clave;
    });
    if (user) {
        //Generated an access token
        const accesToken = jwt.sign(
            { usuario: user.usuario, rol: user.rol },
            auth.accessTokenSecret,
            { expiresIn: "20m" }
        );
        
        const refreshToken = jwt.sign (
            { usuario: user.usuario, rol: user.rol },
            auth.refreshTokenSecret
        );
        refreshTokens.push(refreshToken);
        res.json({
            accesToken,
            refreshToken,
            message: "Bienvenido " + user.usuario + "!",
        });
    } else {
        res.json({ message: "usaurio o clave incorrecto " });
    }
});

router.post("/api/logout", (req, res) => {
    // #swagger.tags = ['Seguridad']
    // #swagger.summary = 'Logout: invalida el refresh token (no invalida el token actual!!!)'
    let message = "Logout invalido";
    const { token } = req.body;
    if (refreshTokens.includes(token)) {
        message = "Usuario deslogueado correctamente";
    }
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.json({message});
});

router.post("/api/token", (req, res) => {
    // #swagger.tags = ['Seguridad']
    // #swagger.summary = 'refresh token'
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    if (!refreshTokens.includes(refreshToken)){
        return refreshToken.sendStatus(403);
    }
    jwt.verify(refreshToken, auth.refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const accessToken = jwt.sign(
            { usuario: user.usuario, rol: user.rol },
            auth.accessTokenSecret,
            { expiresIn: "20m" }
        );
        res.json({
            accessToken,
        });
    });
});

router.get(
    "api/articulosJWT",
    auth.authenticateJWT,
    async function (req, res, next) {
        const { rol } = res.locals.user;
        if (rol !== "admin") {
            return res.status(403).json({ message: "usuario no autorizado!" });  
        }
        let items = await db.articulos.findAll({
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
            order: [["Nombre", "ASC"]],
        });
        res.json(items);
    }
);

module.exports = router;