const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true, maxlength: 200 },
  status:   { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });


taskSchema.index({ authorId: 1, status: 1 });
taskSchema.index({ authorId: 1, priority: 1 });

module.exports = mongoose.model("Task", taskSchema);
