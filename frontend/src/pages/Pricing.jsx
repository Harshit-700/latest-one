import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ToastStack } from "../components/UI";
import { api } from "../lib/api";

const PLANS = [
  {
    id: "free", name: "Free", price: 0,
    features: ["10 tasks", "Basic CRUD", "REST API access", "JWT auth"],
    cta: "Current plan",
  },
  {
    id: "pro", name: "Pro", price: 12,
    features: ["Unlimited tasks", "Priority labels", "Stripe billing", "Webhook events", "Email support"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "teams", name: "Teams", price: 49,
    features: ["Everything in Pro", "Team members", "Admin dashboard", "SSO", "SLA support"],
    cta: "Upgrade to Teams",
  },
];

export default function PricingPage() {
  const { user }            = useAuth();
  const navigate            = useNavigate();
  const { toasts, toast }   = useToast();
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    if (!user) { navigate("/login"); return; }
    setLoading(planId);
    try {
      const { url } = await api.createCheckout(planId);
      
      window.location.href = url;
    } catch (err) {
      toast(err.message || "Checkout failed", "danger");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"system-ui,sans-serif" }}>
      <ToastStack toasts={toasts} />
      <style>{`* { box-sizing:border-box; }`}</style>

      
      <nav style={{ borderBottom:"1px solid #30363d", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#161b22" }}>
        <button onClick={() => navigate("/")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, color:"#e6edf3" }}>
          <i className="ti ti-arrow-left" style={{ fontSize:14 }} />
          <i className="ti ti-stack-2" style={{ fontSize:17, color:"#6ea8fe" }} />
          <span style={{ fontWeight:600 }}>TaskFlow Pro</span>
        </button>
        <span style={{ fontSize:13, color:"#7d8590" }}>Pricing</span>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 16px 64px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h1 style={{ margin:"0 0 10px", fontSize:32, fontWeight:700 }}>Simple, transparent pricing</h1>
          <p style={{ margin:0, color:"#7d8590", fontSize:15 }}>No hidden fees. Cancel anytime. Stripe Test Mode.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background:"#161b22",
              border: plan.popular ? "2px solid #1f6feb" : "1px solid #30363d",
              borderRadius:14, padding:"24px 20px", position:"relative",
            }}>
              {plan.popular && (
                <span style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", fontSize:11, fontWeight:600, background:"#1f6feb", color:"#fff", padding:"3px 12px", borderRadius:99, whiteSpace:"nowrap" }}>
                  Most popular
                </span>
              )}
              <p style={{ margin:"0 0 4px", fontWeight:600, fontSize:15 }}>{plan.name}</p>
              <p style={{ margin:"0 0 18px" }}>
                <span style={{ fontSize:26, fontWeight:700 }}>{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                {plan.price > 0 && <span style={{ fontSize:13, color:"#7d8590" }}>/mo</span>}
              </p>
              {plan.features.map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#c9d1d9", marginBottom:8 }}>
                  <i className="ti ti-check" style={{ fontSize:13, color: plan.id==="free"?"#7d8590":"#3fb950", flexShrink:0 }} /> {f}
                </div>
              ))}
              <button
                onClick={() => plan.price > 0 && handleCheckout(plan.id)}
                disabled={plan.price===0 || loading===plan.id}
                style={{
                  width:"100%", marginTop:20, padding:"9px", fontSize:13, fontWeight:500, borderRadius:7, border:"none", cursor: plan.price===0?"default":"pointer",
                  background: plan.popular ? "#1f6feb" : plan.price===0 ? "#21262d" : "#238636",
                  color: plan.price===0 ? "#7d8590" : "#fff",
                  opacity: loading===plan.id ? 0.7 : 1,
                }}>
                {loading === plan.id ? "Redirecting…" : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Stripe badge */}
        <div style={{ textAlign:"center", marginTop:32, color:"#7d8590", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <i className="ti ti-lock" style={{ fontSize:13 }} />
          Payments secured by Stripe · Test mode · No real charges
        </div>
      </div>
    </div>
  );
}
