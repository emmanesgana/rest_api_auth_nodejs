const jwt = require("jsonwebtoken");
const config = require("../config/config");

const ensureAuthenticated = async (req, res, next) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
        return res.status(401).json({
            message: "Access token not found"
        });
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, config.accessTokenSecret);

        req.user = {
            id: decodedAccessToken.userId
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Access token invalid or expired" });
    }
}

module.exports = {
    ensureAuthenticated
}