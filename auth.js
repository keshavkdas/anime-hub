const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return alert("Email and password required.");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
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

window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();
  if (!email || !password || !confirm) return alert("All fields required.");
  if (password !== confirm) return alert("Passwords do not match.");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
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

// 🔐 Google Login with redirect fallback to Signup Toggle
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
    const email = result.user.email;

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token: idToken }),
    });

    const data = await res.json();
    if (data.success) {
      // If verified user exists
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      // Show signup form with email pre-filled
      toggleForm("signup");
      document.getElementById("signup-email").value = email;
      alert("Google account not registered. Please complete signup.");
    }
  } catch (err) {
    alert("Google login error: " + err.message);
    console.error(err);
  }
};

// Form toggle logic
window.toggleForm = (target) => {
  const loginBox = document.getElementById("login-box");
  const signupBox = document.getElementById("signup-box");

  if (target === "signup") {
    loginBox.classList.add("hidden");
    signupBox.classList.remove("hidden");
  } else if (target === "login") {
    loginBox.classList.remove("hidden");
    signupBox.classList.add("hidden");
  } else {
    // Toggle if no specific target passed
    loginBox.classList.toggle("hidden");
    signupBox.classList.toggle("hidden");
  }
};

// Auto-fill email if redirected with ?email=...
window.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href);
  const email = url.searchParams.get("email");
  if (email) {
    toggleForm("signup");
    document.getElementById("signup-email").value = email;
  }
});
