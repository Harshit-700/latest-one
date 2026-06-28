const Task = require("../models/Task");


exports.getTasks = async (req, res) => {
  try {
    const filter = { authorId: req.userId };

    
    if (req.query.status   && req.query.status   !== "all") filter.status   = req.query.status;
    if (req.query.priority && req.query.priority !== "all") filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("getTasks:", err);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
};


exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });


    if (task.authorId.toString() !== req.userId)
      return res.status(403).json({
        error:       "Forbidden — you don't own this resource",
        authorId:    task.authorId,
        requesterId: req.userId,
      });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch task" });
  }
};


exports.createTask = async (req, res) => {
  try {
    const { title, status, priority } = req.body;
    if (!title?.trim()) return res.status(422).json({ error: "title is required" });

    const task = await Task.create({
      title:    title.trim(),
      status:   status   || "todo",
      priority: priority || "medium",
      authorId: req.userId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("createTask:", err);
    res.status(500).json({ error: "Could not create task" });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

  
    if (task.authorId.toString() !== req.userId)
      return res.status(403).json({
        error:       "Forbidden — you don't own this resource",
        authorId:    task.authorId,
        requesterId: req.userId,
      });
    // ─────────────────────────────────────────────────────────────────────────

    const { title, status, priority } = req.body;
    if (title    !== undefined) task.title    = title.trim();
    if (status   !== undefined) task.status   = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("updateTask:", err);
    res.status(500).json({ error: "Could not update task" });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

   
    if (task.authorId.toString() !== req.userId)
      return res.status(403).json({
        error:       "Forbidden — you don't own this resource",
        authorId:    task.authorId,
        requesterId: req.userId,
      });
   

    await task.deleteOne();
    res.json({ deleted: req.params.id, title: task.title });
  } catch (err) {
    console.error("deleteTask:", err);
    res.status(500).json({ error: "Could not delete task" });
  }
};
