// Constants
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

// Firebase client libs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config (safe to include here)
const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};
initializeApp(firebaseConfig);
const fbAuth = getAuth();

// --- DOM Elements ---
const loginBox = document.getElementById("login-box"),
      signupBox = document.getElementById("signup-box");
const overlay = document.getElementById("overlay");

// ----------------- Form Toggle -----------------
window.toggleForm = () => {
  loginBox.classList.toggle("hidden");
  signupBox.classList.toggle("hidden");
};

// ----------------- Login Flow -----------------
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value.trim();
  if (!email || !pass) return alert("Fill both fields.");

  const res = await fetch(WORKER_URL, {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ action:"login", email, password:pass })
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    location.href = "index.html";
  } else {
    alert(data.error || "Login failed.");
  }
};

// ----------------- Signup Flow -----------------
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const user = document.getElementById("signup-username").value.trim();
  const pass = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (![email,user,pass,confirm].every(Boolean))
    return alert("All fields required.");
  if (pass !== confirm)
    return alert("Passwords must match.");

  const captcha = grecaptcha.getResponse();
  if (!captcha)
    return alert("Please complete CAPTCHA.");

  const res = await fetch(WORKER_URL, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      action:"signup",
      email, password:pass,
      username:user,
      captcha
    })
  });
  const data = await res.json();
  if (data.success) {
    overlay.classList.remove("hidden");
    pollVerification(email);
  } else alert(data.error || "Signup failed.");
};

// -------- Google Sign-Up/Login --------
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(fbAuth, provider);
    const idToken = await result.user.getIdToken();
    const payload = { action:"google", token:idToken };

    const res = await fetch(WORKER_URL, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      // Existing user?
      if (data.user.exists) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return location.href = "index.html";
      }
      // New user: prompt for extra info
      document.getElementById("signup-email").value = data.user.email;
      document.getElementById("googleEmail")?.remove();
      const input = document.createElement("input");
      input.id = "googleEmail";
      input.readOnly = true;
      input.value = data.user.email;
      input.style.cssText = "background:#333;color:#aaa;margin-bottom:10px;";
      signupBox.insertBefore(input, signupBox.firstChild);

      toggleForm();  // switch to signup form
    }
    else alert(data.error || "Google login failed.");
  } catch (e) {
    alert(e.message);
  }
};

// -------- Email Verification Poll --------
async function pollVerification(email) {
  const interval = setInterval(async () => {
    const resp = await fetch(WORKER_URL + `?action=check&email=${encodeURIComponent(email)}`, {
      headers: {"Content-Type": "application/json"}
    });
    const jq = await resp.json();
    if (jq.verified) {
      clearInterval(interval);
      overlay.classList.add("hidden");
      alert("Email verified! Please login.");
      toggleForm();
    }
  }, 3000);
}
