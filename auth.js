// Replace with your Worker URL
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 📥 Login
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

// 🆕 Signup
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
      // Firebase needs to send verification
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      await sendEmailVerification(userCred.user);
      showVerifyOverlay();
      pollEmailVerification(userCred.user);
    } else {
      alert(data.error || "Signup failed.");
    }
  } catch (err) {
    alert("Signup error: " + err.message);
  }
};

// 🔐 Google Login
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
      if (data.user.verified) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        // Not verified yet
        await sendEmailVerification(result.user);
        showVerifyOverlay();
        pollEmailVerification(auth.currentUser);
      }
    } else {
      // User not found → redirect to signup
      alert("No account found. Complete signup.");
      window.location.href = "signup.html?email=" + encodeURIComponent(result.user.email);
    }
  } catch (err) {
    alert("Google login error: " + err.message);
    console.error(err);
  }
};

// 🧩 Toggle between login/signup forms
window.toggleForm = () => {
  document.getElementById("login-box")?.classList.toggle("hidden");
  document.getElementById("signup-box")?.classList.toggle("hidden");
};

// 📧 Show "verify your email" overlay
function showVerifyOverlay() {
  const overlay = document.getElementById("verify-overlay");
  if (overlay) overlay.style.display = "flex";
}

// 🔁 Poll for email verification
function pollEmailVerification(user) {
  const interval = setInterval(async () => {
    await user.reload();
    if (user.emailVerified) {
      clearInterval(interval);
      localStorage.setItem("user", JSON.stringify({
        email: user.email,
        uid: user.uid,
        verified: true,
      }));
      window.location.href = "index.html";
    }
  }, 3000);
}
