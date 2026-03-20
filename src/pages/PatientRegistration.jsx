import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function PatientRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/patients/register`, formData);
      setMessage({ type: "success", text: "Registration successful! Redirecting to login..." });
      setTimeout(() => navigate("/patient-login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    color: "#F5F7FA",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0A1A3F 0%, #1F2A44 60%, #0A1A3F 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Georgia', serif",
    }}>

      {/* Decorative accents */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "320px", height: "320px",
        background: "radial-gradient(circle, rgba(255,90,31,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: "260px", height: "260px",
        background: "radial-gradient(circle, rgba(255,90,31,0.10) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* Thin orange top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "3px",
        background: "linear-gradient(90deg, transparent, #FF5A1F, transparent)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "440px",
        background: "rgba(31,42,68,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "28px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        padding: "40px 36px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#FF5A1F", flexShrink: 0,
            }} />
            <h1 style={{
              fontSize: "2.4rem",
              fontWeight: "900",
              color: "#F5F7FA",
              margin: 0,
              letterSpacing: "-1px",
              fontStyle: "italic",
            }}>ApexHMS</h1>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#FF5A1F", flexShrink: 0,
            }} />
          </div>
          <div style={{
            height: "2px", width: "48px",
            background: "#FF5A1F",
            margin: "10px auto",
            borderRadius: "2px",
          }} />
          <p style={{ color: "rgba(245,247,250,0.55)", fontSize: "0.82rem", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Patient Registration
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: "700",
            background: message.type === "error" ? "rgba(220,53,69,0.15)" : "rgba(40,167,69,0.15)",
            color: message.type === "error" ? "#ff8a95" : "#6ee7a0",
            border: `1px solid ${message.type === "error" ? "rgba(220,53,69,0.3)" : "rgba(40,167,69,0.3)"}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {[
            { type: "text", name: "name", placeholder: "Full Name" },
            { type: "email", name: "email", placeholder: "Email Address" },
            { type: "tel", name: "phone", placeholder: "Phone Number" },
            { type: "date", name: "dob", placeholder: "" },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              required
              style={inputStyle}
              value={formData[field.name]}
              onChange={handleChange}
              onFocus={e => {
                e.target.style.borderColor = "#FF5A1F";
                e.target.style.background = "rgba(255,90,31,0.07)";
                e.target.style.boxShadow = "0 0 0 3px rgba(255,90,31,0.12)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.12)";
                e.target.style.background = "rgba(255,255,255,0.06)";
                e.target.style.boxShadow = "none";
              }}
            />
          ))}

          {/* Password fields */}
          {["password", "confirmPassword"].map((fieldName) => (
            <div key={fieldName} style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name={fieldName}
                placeholder={fieldName === "password" ? "Password" : "Confirm Password"}
                required
                style={{ ...inputStyle, paddingRight: "48px" }}
                value={formData[fieldName]}
                onChange={handleChange}
                onFocus={e => {
                  e.target.style.borderColor = "#FF5A1F";
                  e.target.style.background = "rgba(255,90,31,0.07)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255,90,31,0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.background = "rgba(255,255,255,0.06)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px",
                  top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "rgba(245,247,250,0.4)",
                  cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "6px",
              background: loading ? "#c74410" : "#FF5A1F",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontWeight: "800",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.03em",
              transition: "all 0.2s ease",
              boxShadow: "0 6px 24px rgba(255,90,31,0.35)",
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = "#e04e18"; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = "#FF5A1F"; }}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "0.83rem", color: "rgba(245,247,250,0.55)", margin: 0 }}>
            Already have an account?{" "}
            <Link
              to="/patientlogin"
              style={{ color: "#FF5A1F", fontWeight: "700", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.textDecoration = "underline"}
              onMouseLeave={e => e.target.style.textDecoration = "none"}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: "16px",
        width: "100%", textAlign: "center",
        color: "rgba(245,247,250,0.35)",
        fontSize: "0.75rem",
        letterSpacing: "0.04em",
      }}>
        Precision in Practice, Excellence in Care • AMT Hospital Systems
      </div>
    </div>
  );
}