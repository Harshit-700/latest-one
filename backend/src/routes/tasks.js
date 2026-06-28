const router = require("express").Router();
const auth   = require("../middleware/auth");
const ctrl   = require("../controllers/taskController");

// All task routes are JWT-protected
router.use(auth);

router.get("/",     ctrl.getTasks);
router.get("/:id",  ctrl.getTask);
router.post("/",    ctrl.createTask);
router.put("/:id",  ctrl.updateTask);
router.delete("/:id", ctrl.deleteTask);

module.exports = router;
