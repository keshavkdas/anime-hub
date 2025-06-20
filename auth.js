// Replace with your Worker URL
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

// 🔒 Login handler
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) return alert("Please fill in both fields.");

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
    alert(data.error || "Login failed");
  }
};

// 🔒 Signup handler
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !password || !confirm) return alert("All fields required.");
  if (password !== confirm) return alert("Passwords do not match.");

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", email, password }),
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } else {
    alert(data.error || "Signup failed");
  }
};

// 🧩 Toggle between forms
window.toggleForm = () => {
  const loginBox = document.getElementById("login-box");
  const signupBox = document.getElementById("signup-box");
  loginBox.classList.toggle("hidden");
  signupBox.classList.toggle("hidden");
};

// 🔐 Google login & signup trigger
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
let googleEmail = "";

window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    googleEmail = result.user.email;

    document.getElementById("google-email").value = googleEmail;
    document.getElementById("google-overlay").style.display = "flex";
    localStorage.setItem("google_token", token); // temporarily store

  } catch (err) {
    alert("Google Login Failed: " + err.message);
  }
};

window.closeGoogleOverlay = () => {
  document.getElementById("google-overlay").style.display = "none";
};

window.submitGoogleSignup = async () => {
  const username = document.getElementById("google-username").value.trim();
  const password = document.getElementById("google-password").value.trim();
  const confirm = document.getElementById("google-confirm").value.trim();
  const token = localStorage.getItem("google_token");

  if (!username || !password || password !== confirm) {
    alert("Please fill all fields correctly.");
    return;
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "google-signup",
      email: googleEmail,
      username,
      password,
      token
    }),
  });

  const data = await res.json();
  if (data.success) {
    alert("Check your inbox for a verification email.");
    window.location.href = "index.html";
  } else {
    alert(data.error || "Google Sign-up failed");
  }
};
