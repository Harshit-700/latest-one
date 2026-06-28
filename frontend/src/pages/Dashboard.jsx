import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { api } from "../lib/api";
import { StatusBadge, PriorityBadge, ToastStack, Avatar } from "../components/UI";

export default function Dashboard() {
  const { user, logout }      = useAuth();
  const { toasts, toast }     = useToast();
  const navigate              = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all", priority: "all" });
  const [newTask, setNewTask] = useState({ title: "", status: "todo", priority: "medium" });
  const [editId, setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [creating, setCreating] = useState(false);

  const loadTasks = useCallback(async (f = filters) => {
    try {
      const data = await api.getTasks(f);
      setTasks(data);
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login"); }
      else toast(err.message || "Could not load tasks", "danger");
    } finally {
      setLoading(false);
    }
  }, [filters, logout, navigate, toast]);

  useEffect(() => { loadTasks(); }, []); 
  useEffect(() => { loadTasks(filters); }, [filters]); 

  const handleCreate = async () => {
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      const task = await api.createTask(newTask);
      setTasks(prev => [task, ...prev]);
      setNewTask({ title: "", status: "todo", priority: "medium" });
      toast("Task created");
    } catch (err) {
      toast(err.message || "Create failed", "danger");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const task = await api.updateTask(id, editForm);
      setTasks(prev => prev.map(t => t._id === id ? task : t));
      setEditId(null);
      toast("Task updated");
    } catch (err) {
      toast(err.message || "Update failed", err.status === 403 ? "warning" : "danger");
    }
  };

 
  const handleDelete = (id) => {
    
    const snapshot = [...tasks];
  
    setTasks(prev => prev.filter(t => t._id !== id));
    toast("Task deleted");
   
    api.deleteTask(id).catch(err => {
      
      setTasks(snapshot);
      toast(err.message || "Delete failed — reverted", "danger");
    });
  };

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

  const counts = { todo: 0, "in-progress": 0, done: 0 };
  tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

  const styles = {
    card: { background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "11px 14px" },
    input: { padding: "7px 10px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3", fontSize: 13, outline: "none" },
    select: { padding: "6px 8px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3", fontSize: 12 },
    btn: (variant = "default") => ({
      padding: "6px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: "pointer", border: "1px solid",
      ...(variant === "primary"  ? { background: "#1f6feb", borderColor: "#1f6feb", color: "#fff" } : {}),
      ...(variant === "danger"   ? { background: "transparent", borderColor: "#da3633", color: "#f85149" } : {}),
      ...(variant === "default"  ? { background: "transparent", borderColor: "#30363d", color: "#c9d1d9" } : {}),
      ...(variant === "ghost"    ? { background: "transparent", borderColor: "transparent", color: "#6ea8fe" } : {}),
    }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "system-ui, sans-serif" }}>
      <ToastStack toasts={toasts} />
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #30363d", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#161b22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-stack-2" style={{ fontSize: 18, color: "#6ea8fe" }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>TaskFlow Pro</span>
          <span style={{ fontSize: 10, background: "#1a2340", color: "#6ea8fe", padding: "2px 7px", borderRadius: 99, fontWeight: 500 }}>
            {user?.plan || "free"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/pricing" style={{ fontSize: 12, color: "#7d8590", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <i className="ti ti-credit-card" style={{ fontSize: 13 }} /> Upgrade
          </Link>
          <Avatar initials={user?.name?.slice(0,2)?.toUpperCase()} size={28} />
          <span style={{ fontSize: 13, color: "#7d8590" }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate("/login"); }} style={styles.btn()}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total",       value: tasks.length,            icon: "ti-list" },
            { label: "To do",       value: counts["todo"],          icon: "ti-circle" },
            { label: "In progress", value: counts["in-progress"],   icon: "ti-refresh" },
            { label: "Done",        value: counts["done"],          icon: "ti-circle-check" },
          ].map(c => (
            <div key={c.label} style={{ ...styles.card }}>
              <div style={{ fontSize: 10, color: "#7d8590", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: 11 }} /> {c.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <i className="ti ti-filter" style={{ fontSize: 13, color: "#7d8590" }} />
          <select value={filters.status} onChange={setFilter("status")} style={styles.select}>
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <select value={filters.priority} onChange={setFilter("priority")} style={styles.select}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span style={{ fontSize: 11, color: "#7d8590", marginLeft: "auto" }}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Create form */}
        <div style={{ ...styles.card, marginBottom: 14 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#7d8590", display: "flex", alignItems: "center", gap: 5 }}>
            <i className="ti ti-plus" style={{ fontSize: 11 }} /> POST /api/tasks
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center" }}>
            <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="New task title…" style={{ ...styles.input, width: "100%" }} />
            <select value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))} style={styles.select}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={styles.select}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button onClick={handleCreate} disabled={creating} style={styles.btn("primary")}>
              {creating ? "Adding…" : "Add"}
            </button>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#7d8590" }}>Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#7d8590" }}>
            <i className="ti ti-inbox" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
            No tasks found
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map(task => (
              <div key={task._id} style={styles.card}>
                {editId === task._id ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 7, alignItems: "center" }}>
                    <input value={editForm.title || ""} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} style={styles.input} />
                    <select value={editForm.status || "todo"} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} style={styles.select}>
                      <option value="todo">To do</option>
                      <option value="in-progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                    <select value={editForm.priority || "medium"} onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))} style={styles.select}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <button onClick={() => handleUpdate(task._id)} style={styles.btn("primary")}>Save</button>
                    <button onClick={() => setEditId(null)} style={styles.btn()}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span style={{ fontSize: 10, color: "#7d8590", fontFamily: "monospace" }}>{task._id?.slice(-6)}</span>
                        <span style={{ fontSize: 10, color: "#7d8590" }}>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setEditId(task._id); setEditForm({ title: task.title, status: task.status, priority: task.priority }); }}
                        style={styles.btn()} title="Edit — PUT /api/tasks/:id">
                        <i className="ti ti-edit" style={{ fontSize: 13 }} />
                      </button>
                      <button onClick={() => handleDelete(task._id)}
                        style={styles.btn("danger")} title="Delete (optimistic) — DELETE /api/tasks/:id">
                        <i className="ti ti-trash" style={{ fontSize: 13 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
