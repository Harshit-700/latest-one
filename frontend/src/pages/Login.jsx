import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ToastStack } from "../components/UI";
import { useToast } from "../hooks/useToast";

const S = {
  page:  { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", background:"#0d1117" },
  card:  { width:"100%", maxWidth:380 },
  logo:  { textAlign:"center", marginBottom:28 },
  tabs:  { display:"flex", background:"#161b22", borderRadius:8, padding:3, marginBottom:20, border:"1px solid #30363d" },
  tab:   (active) => ({ flex:1, padding:"7px", fontSize:13, fontWeight:500, borderRadius:6, border:"none", cursor:"pointer", textTransform:"capitalize", background:active?"#1f6feb":"transparent", color:active?"#fff":"#7d8590" }),
  box:   { background:"#161b22", border:"1px solid #30363d", borderRadius:12, padding:"22px 20px" },
  label: { fontSize:12, color:"#7d8590", display:"block", marginBottom:5 },
  input: { width:"100%", boxSizing:"border-box", padding:"8px 10px", background:"#0d1117", border:"1px solid #30363d", borderRadius:6, color:"#e6edf3", fontSize:14, outline:"none", marginBottom:14 },
  btn:   { width:"100%", padding:"9px", fontSize:14, fontWeight:500, background:"#1f6feb", border:"none", borderRadius:6, color:"#fff", cursor:"pointer" },
};

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate            = useNavigate();
  const { toasts, toast }   = useToast();
  const [tab, setTab]       = useState("login");
  const [form, setForm]     = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{`* { box-sizing:border-box; } input:focus { border-color:#1f6feb !important; }`}</style>
      <ToastStack toasts={toasts} />
      <div style={S.card}>
        <div style={S.logo}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <i className="ti ti-stack-2" style={{ fontSize:22, color:"#6ea8fe" }} />
            <span style={{ fontSize:18, fontWeight:600, color:"#e6edf3" }}>TaskFlow Pro</span>
          </div>
          <p style={{ margin:0, fontSize:13, color:"#7d8590" }}>JWT · REST · MongoDB · Stripe</p>
        </div>

        <div style={S.tabs}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={S.tab(tab===t)}>
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <div style={S.box}>
          {tab === "register" && (
            <>
              <label style={S.label}>Name</label>
              <input value={form.name} onChange={set("name")} placeholder="Harshit Pal" style={S.input} />
            </>
          )}
          <label style={S.label}>Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" style={S.input} />
          <label style={S.label}>Password</label>
          <input type="password" value={form.password} onChange={set("password")}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••" style={{ ...S.input, marginBottom: error ? 0 : 18 }} />

          {error && <p style={{ margin:"10px 0 16px", fontSize:12, color:"#f85149" }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ ...S.btn, opacity:loading?0.7:1, cursor:loading?"wait":"pointer" }}>
            {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </div>

        <p style={{ textAlign:"center", marginTop:14, fontSize:12, color:"#7d8590" }}>
          API health:{" "}
          <a href={`${import.meta.env.VITE_API_URL||""}/health`} target="_blank" rel="noreferrer"
            style={{ color:"#6ea8fe" }}>
            {import.meta.env.VITE_API_URL || "http://localhost:4000"}/health
          </a>
        </p>
      </div>
    </div>
  );
}
