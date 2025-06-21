// Replace with your Worker URL
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

// Login
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return alert("Email and password required.");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert(data.error || "Login failed.");
    }
  } catch (err) {
    alert("Login error: " + err.message);
  }
};

// Signup
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();
  if (!email || !password || !confirm) return alert("All fields required.");
  if (password !== confirm) return alert("Passwords do not match.");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", email, password }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Signup successful! Please verify your email.");
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert(data.error || "Signup failed.");
    }
  } catch (err) {
    alert("Signup error: " + err.message);
  }
};

// Google Login
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token: idToken }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      // Redirect to signup if user not found
      alert("No account found. Please complete signup.");
      window.location.href = "signup.html?email=" + encodeURIComponent(result.user.email);
    }
  } catch (err) {
    alert("Google login error: " + err.message);
    console.error(err);
  }
};

// Toggle
window.toggleForm = () => {
  document.getElementById("login-box")?.classList.toggle("hidden");
  document.getElementById("signup-box")?.classList.toggle("hidden");
};
