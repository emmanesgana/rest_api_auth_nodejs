const router = require("express").Router();
const {
    register,
    login,
    current
} = require("../controllers/authController.js");
const { ensureAuthenticated } = require("../middleware/ensureAuthenticated.js");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/users/current", ensureAuthenticated, current);

module.exports = router