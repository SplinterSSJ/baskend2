const jwt = require("jsonwebtoken");

const accessTokenSecret = "youraccesstokensecret";
const refreshTokenSecret = "yourrefreshtokensecrethere";

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                //return res.sendStatus(400);
                return res.status(403).json({ message: "Token no es valido"});
            }
            res.locals.user = user;
            next();
        });
    } else {
        //re.sendStatus(401);
        res.status(401).json({ message: "Acceso denegado" });
    }
};
module.exports = { authenticateJWT, accesTokenSecret, refreshTokenSecret }; 