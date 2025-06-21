// Firebase & Auth Configuration
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Overlay control
const showOverlay = () => document.getElementById("verify-overlay").style.display = "flex";
const hideOverlay = () => document.getElementById("verify-overlay").style.display = "none";

// Form toggling
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
  if (data.success) {
    if (!data.user.token) return alert("Email not verified.");
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } else {
    alert(data.error || "Login failed.");
  }
};

// Signup
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || !confirm) return alert("All fields are required.");
  if (password !== confirm) return alert("Passwords do not match.");
  if (password.length < 6 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return alert("Password must include a number, a special character, and be at least 6 characters long.");
  }

  const takenUsernames = JSON.parse(localStorage.getItem("takenUsernames") || "[]");
  if (takenUsernames.includes(username)) return alert("Username is already taken.");

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", email, password }),
  });

  const data = await res.json();
  if (data.success) {
    takenUsernames.push(username);
    localStorage.setItem("takenUsernames", JSON.stringify(takenUsernames));

    // Send Firebase verification email
    onAuthStateChanged(auth, async user => {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        showOverlay();

        const poll = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(poll);
            hideOverlay();
            localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
            window.location.href = "index.html";
          }
        }, 3000);
      }
    });
  } else {
    alert(data.error || "Signup failed.");
  }
};

// Google Sign-in
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
    if (data.success) {
      if (!data.user.verified) {
        await sendEmailVerification(auth.currentUser);
        showOverlay();

        const poll = setInterval(async () => {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            clearInterval(poll);
            hideOverlay();
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "index.html";
          }
        }, 3000);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert("Account not registered. Please sign up.");
      document.getElementById("signup-email").value = email;
      toggleForm();
    }
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
};
