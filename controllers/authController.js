const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Datastore = require("nedb-promises");
const users = Datastore.create("Users.db");
const userRefreshTokens = Datastore.create("UserRefreshTokens.db");
const config = require("../config/config");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(422).json({ message: "Please fill in all fields (name, email and password)" });
        }

        if (await users.findOne({ email })) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await users.insert({
            name,
            email,
            password: hashedPassword,
            role: role ?? "member"
        });

        return res.status(201).json({
            message: "User registered successuflly.",
            id: newUser._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate user and password if empty
        if (!email || !password) {
            return res.status(422).json({ message: "Please fill in all fields (email nad password)" });
        }

        // find user using email in db
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email or password is invalid" });
        }

        // compare password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Email or password is invalid" });
        }

        const accessToken = jwt.sign(
            {
                userId: user._id
            },
            config.accessTokenSecret,
            {
                subject: "accessApi",
                expiresIn: config.accessTokenExpiresIn
            }
        );

        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            config.refreshTokenSecret,
            {
                subject: "refreshToken",
                expiresIn: config.refreshTokenExpiresIn
            }
        );

        await userRefreshTokens.insert({
            refreshToken,
            userId: user._id
        });

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        const decodedRefreshToken = jwt.verify(refreshToken, config.refreshTokenSecret);

        const userRefreshToken = await userRefreshTokens.findOne({
            refreshToken,
            userId: decodedRefreshToken.userId
        });

        if (!userRefreshToken) {
            return res.status(401).json({ message: "Refresh token invalid or expired" });
        }

        await userRefreshTokens.remove({ _id: userRefreshToken._id });
        await userRefreshTokens.compactDataFile();

        const accessToken = jwt.sign(
            {
                userId: decodedRefreshToken.userId
            },
            config.accessTokenSecret,
            {
                subject: "accessApi",
                expiresIn: config.accessTokenExpiresIn
            }
        );

        const newRefreshToken = jwt.sign(
            {
                userId: decodedRefreshToken.userId
            },
            config.refreshTokenSecret,
            {
                subject: "refreshToken",
                expiresIn: config.refreshTokenExpiresIn
            }
        );

        await userRefreshTokens.insert({
            refreshToken: newRefreshToken,
            userId: decodedRefreshToken.userId
        });

        return res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Refresh token invalid or expired" });
        }

        return res.status(500).json({ message: error.message });
    }
};

const current = async (req, res) => {
    try {
        const user = await users.findOne({ _id: req.user.id });

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const admin = async (req, res) => {
    return res.status(200).json({ message: "Only admins can access this route" });
}

const adminModerator = async (req, res) => {
    return res.status(200).json({ message: "Only admins and moderators can access this route" });
}


module.exports = {
    register,
    login,
    current,
    admin,
    adminModerator,
    refreshToken,
}