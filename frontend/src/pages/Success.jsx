import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function SuccessPage() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const [data, setData]   = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) { navigate("/"); return; }
    api.confirmSuccess(sessionId)
      .then(setData)
      .catch(err => setError(err.message || "Could not confirm payment"));
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"system-ui,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <style>{`* { box-sizing:border-box; }`}</style>
      <div style={{ width:"100%", maxWidth:440, textAlign:"center" }}>
        {error ? (
          <>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"#2d1a1a", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <i className="ti ti-x" style={{ fontSize:28, color:"#f85149" }} />
            </div>
            <h2 style={{ margin:"0 0 8px" }}>Something went wrong</h2>
            <p style={{ color:"#7d8590", fontSize:14 }}>{error}</p>
          </>
        ) : !data ? (
          <p style={{ color:"#7d8590" }}>Confirming payment…</p>
        ) : (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#1a3028", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <i className="ti ti-circle-check" style={{ fontSize:32, color:"#3fb950" }} />
            </div>
            <h2 style={{ margin:"0 0 8px" }}>Payment confirmed</h2>
            <p style={{ margin:"0 0 4px", color:"#c9d1d9", fontSize:14 }}>
              You're now on <strong style={{ color:"#6ea8fe" }}>TaskFlow {data.plan?.charAt(0).toUpperCase() + data.plan?.slice(1)}</strong>
            </p>
            <p style={{ margin:"0 0 24px", fontSize:12, color:"#7d8590" }}>
              ${(data.amount/100).toFixed(2)} {data.currency?.toUpperCase()}/mo · {data.customer}
            </p>

            {/* Session payload */}
            <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"14px 16px", textAlign:"left", marginBottom:20 }}>
              <p style={{ margin:"0 0 8px", fontSize:11, color:"#7d8590", fontFamily:"monospace", fontWeight:500 }}>
                Stripe checkout.session.completed payload
              </p>
              <pre style={{ margin:0, fontSize:11, fontFamily:"monospace", color:"#c9d1d9", whiteSpace:"pre-wrap" }}>
{JSON.stringify({ status: data.status, plan: data.plan, amount_total: data.amount, currency: data.currency, sessionId: data.sessionId }, null, 2)}
              </pre>
            </div>

            <button onClick={() => navigate("/")}
              style={{ padding:"9px 24px", fontSize:14, fontWeight:500, background:"#1f6feb", border:"none", borderRadius:7, color:"#fff", cursor:"pointer" }}>
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
