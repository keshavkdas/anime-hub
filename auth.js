
// auth.js
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const overlay = document.getElementById("verify-overlay");

let currentCaptcha = "";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  currentCaptcha = "";
  for (let i = 0; i < 6; i++) {
    currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captcha-box").innerText = currentCaptcha;
}
generateCaptcha();

window.toggleForm = () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
};

window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  document.getElementById("login-email-error").innerText = "";
  document.getElementById("login-password-error").innerText = "";

  if (!email.includes("@")) return document.getElementById("login-email-error").innerText = "Invalid email";
  if (password.length < 6) return document.getElementById("login-password-error").innerText = "Password too short";

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
  const captchaInput = document.getElementById("captcha-answer").value.trim();

  document.getElementById("username-error").innerText = "";

  if (!email || !username || !password || !confirm || !captchaInput) {
    alert("All fields are required.");
    return;
  }
  if (password !== confirm) return alert("Passwords do not match.");
  if (!/[a-z]/i.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return alert("Password must contain letters, numbers, and special characters.");
  }
  if (captchaInput.toUpperCase() !== currentCaptcha) {
    alert("Captcha incorrect");
    return generateCaptcha();
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", email, password, username }),
  });

  const data = await res.json();
  if (data.success) {
    overlay.style.display = "flex";
    const interval = setInterval(async () => {
      const idToken = (await auth.currentUser?.getIdToken(true)) || null;
      if (!idToken) return;
      const check = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "google", token: idToken }),
      });
      const verifyData = await check.json();
      if (verifyData.user?.verified) {
        clearInterval(interval);
        localStorage.setItem("user", JSON.stringify(verifyData.user));
        window.location.href = "index.html";
      }
    }, 4000);
  } else {
    document.getElementById("username-error").innerText = data.error || "Signup failed.";
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
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else if (data.needSignup) {
      document.getElementById("signup-email").value = data.email;
      toggleForm();
    } else {
      alert(data.error || "Google Login failed.");
    }
  } catch (err) {
    alert("Google login error: " + err.message);
  }
};
