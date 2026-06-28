import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function StatusBadge({ status }) {
  const map = {
    todo:          { bg:"#2d2a1e", color:"#d4a017", label:"To do" },
    "in-progress": { bg:"#1a2340", color:"#6ea8fe", label:"In progress" },
    done:          { bg:"#1a3028", color:"#3fb950", label:"Done" },
  };
  const s = map[status] || map.todo;
  return <span style={{ fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:99, background:s.bg, color:s.color }}>{s.label}</span>;
}

export function PriorityBadge({ priority }) {
  const map = {
    high:   { bg:"#2d1a1a", color:"#f85149" },
    medium: { bg:"#2d2a1e", color:"#d4a017" },
    low:    { bg:"#1e1e1e", color:"#666" },
  };
  const s = map[priority] || map.low;
  return <span style={{ fontSize:10, fontWeight:500, padding:"2px 7px", borderRadius:99, background:s.bg, color:s.color, textTransform:"capitalize" }}>{priority}</span>;
}

export function ToastStack({ toasts }) {
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:6, pointerEvents:"none" }}>
      {toasts.map(t => {
        const c = {
          success: { bg:"#1a3028", border:"#2ea043", color:"#3fb950" },
          danger:  { bg:"#2d1a1a", border:"#da3633", color:"#f85149" },
          warning: { bg:"#2d2a1e", border:"#9e6a03", color:"#d4a017" },
          info:    { bg:"#1a2340", border:"#1f6feb", color:"#6ea8fe" },
        }[t.type] || { bg:"#1a3028", border:"#2ea043", color:"#3fb950" };
        return (
          <div key={t.id} style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.color, borderRadius:8, padding:"9px 14px", fontSize:13, fontWeight:500, whiteSpace:"nowrap" }}>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:size, height:size, borderRadius:"50%", border:"2px solid #30363d", borderTopColor:"#6ea8fe", animation:"spin 0.7s linear infinite" }} />
    </>
  );
}

export function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"#1a2340", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:600, color:"#6ea8fe", flexShrink:0 }}>
      {initials}
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#0d1117" }}><Spinner size={32} /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}
