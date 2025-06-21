
// Firebase & Auth Configuration
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

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

const showOverlay = () => document.getElementById("verify-overlay").style.display = "flex";
const hideOverlay = () => document.getElementById("verify-overlay").style.display = "none";

window.toggleForm = () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
};

window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return alert("Please fill in all fields.");

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
};

window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || !confirm) return alert("All fields are required.");
  if (password !== confirm) return alert("Passwords do not match.");
  if (password.length < 6 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return alert("Password must contain a number, a special character and be at least 6 characters long.");
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", email, password, username }),
  });

  const data = await res.json();
  if (data.success) {
    showOverlay();
    const checkInterval = setInterval(async () => {
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;
      if (!idToken) return;

      const verifyRes = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "google", token: idToken }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.user.emailVerified) {
        clearInterval(checkInterval);
        localStorage.setItem("user", JSON.stringify(verifyData.user));
        window.location.href = "index.html";
      }
    }, 4000);
  } else {
    alert(data.error || "Signup failed.");
  }
};

window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token: idToken }),
    });

    const data = await res.json();
    if (data.success && data.user.emailVerified) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert("Please verify your email or complete registration.");
    }
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
};
