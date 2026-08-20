import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      console.log("token found:", token);
      if (token) {
        // localStorage.setItem("pp_token", token);
        setToken(token);
        navigate("/dashboard");
      } else {
        console.log("no token, going home");
        navigate("/");
      }
    } catch (err) {
      console.error("Auth error:", err);
      navigate("/");
    }
  }, []);

  return <p style={{ color: "white", padding: "2rem" }}>Signing you in...</p>;
}
