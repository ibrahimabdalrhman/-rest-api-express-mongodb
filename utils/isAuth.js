const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied: missing token" });
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "secret");
        req.user = decodedToken;
        next()
    }
    catch (error) {
        return res.status(401).json({ error: 'Access denied: invalid token' });
    }

};

module.exports = isAuth;