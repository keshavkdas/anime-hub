// Firebase & Auth Configuration
const WORKER_URL = "https://anime-hub-auth.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPPYO5XN3-XQXSPgILze_JcgYBZTYBdz0",
  authDomain: "anime-hub-11eca.firebaseapp.com",
  projectId: "anime-hub-11eca",
  appId: "1:941643518907:web:68ae3fc01f18e00ecdaa9e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Overlay controls
const showOverlay = () => document.getElementById("verify-overlay").style.display = "flex";
const hideOverlay = () => document.getElementById("verify-overlay").style.display = "none";

// Toggle login/signup
window.toggleForm = () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
};

// Login with email/password
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
  if (data.success && data.user.emailVerified) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } else {
    alert(data.error || "Login failed.");
  }
};

// Signup with email/password
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || !confirm)
    return alert("All fields required.");
  if (password !== confirm)
    return alert("Passwords do not match.");
  if (password.length < 6 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return alert("Password must be 6+ chars, include a number and a special character.");
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", email, password, username }),
  });

  const data = await res.json();
  if (data.success) {
    showOverlay();

    onAuthStateChanged(auth, async (user) => {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        const poll = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(poll);
            hideOverlay();
            localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
            window.location.href = "index.html";
          }
        }, 4000);
      }
    });
  } else {
    alert(data.error || "Signup failed.");
  }
};

// Google Sign-In
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;
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
      alert(data.error || "Google login incomplete. Please finish signup.");
      document.getElementById("signup-email").value = email;
      toggleForm();
    }
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
};
