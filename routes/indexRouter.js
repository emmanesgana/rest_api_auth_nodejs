const router = require("express").Router();
const {
    renderIndex,
} = require("../controllers/indexController.js");

router.get("/", renderIndex);

module.exports = router;