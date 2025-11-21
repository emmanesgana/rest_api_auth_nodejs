const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Datastore = require("nedb-promises");
const users = Datastore.create("Users.db");
const config = require("../config/config");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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
            password: hashedPassword
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

        const accessToken = jwt.sign({ userId: user._id }, config.accessTokenSecret, { subject: "accessApi", expiresIn: "1h" });

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            accessToken
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const current = async (req, res) => {
    try {
        const user = await users.findOne({ _id: req.user.id });

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    register,
    login,
    current
}