const router = require("express").Router();
const {
    register,
    login,
    current,
    admin,
    adminModerator
} = require("../controllers/authController.js");
const { ensureAuthenticated } = require("../middleware/ensureAuthenticated.js");
const { authorize } = require("../middleware/authorize.js");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/users/current", ensureAuthenticated, current);
router.post("/api/admin", ensureAuthenticated, authorize(["admin"]), admin);
router.post("/api/moderator", ensureAuthenticated, authorize(["admin", "moderator"]), adminModerator);

module.exports = router