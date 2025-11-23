const router = require("express").Router();
const {
    register,
    login,
    current,
    admin,
    adminModerator,
    refreshToken,
} = require("../controllers/authController.js");
const { ensureAuthenticated } = require("../middleware/ensureAuthenticated.js");
const { authorize } = require("../middleware/authorize.js");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/refreshToken", refreshToken);
router.get("/users/current", ensureAuthenticated, current);
router.get("/admin", ensureAuthenticated, authorize(["admin"]), admin);
router.get("/moderator", ensureAuthenticated, authorize(["admin", "moderator"]), adminModerator);

module.exports = router