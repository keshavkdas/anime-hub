// Replace with your Worker URL
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ Firebase config (PUBLIC)
const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Login
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    if (!userCred.user.emailVerified) {
      showOverlay();
      pollEmailVerification(userCred.user);
      return;
    }

    const token = await userCred.user.getIdToken();
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    }
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      document.getElementById("login-box").style.display = "none";
      document.getElementById("signup-box").style.display = "block";
      document.getElementById("signup-email").value = email;
    } else {
      alert("Login error: " + err.message);
    }
  }
};

// ✅ Signup
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || password !== confirm)
    return alert("Check all fields.");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCred.user);

    showOverlay();
    pollEmailVerification(userCred.user);
  } catch (err) {
    alert("Signup error: " + err.message);
  }
};

// ✅ Google Login
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user);
      showOverlay();
      pollEmailVerification(result.user);
      return;
    }

    const token = await result.user.getIdToken();
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert(data.error || "Google login failed");
    }
  } catch (err) {
    alert("Google error: " + err.message);
  }
};

// ✅ Show email verification overlay
function showOverlay() {
  document.getElementById("verify-overlay").style.display = "flex";
}

// ✅ Poll until email verified
function pollEmailVerification(user) {
  const interval = setInterval(async () => {
    await user.reload();
    if (user.emailVerified) {
      clearInterval(interval);
      const token = await user.getIdToken();
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "google", token }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "index.html";
      }
    }
  }, 3000);
}
