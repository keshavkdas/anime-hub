// Firebase & Auth Configuration
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged,
  linkWithPopup,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Overlay Control
const showOverlay = () => document.getElementById("verify-overlay").style.display = "flex";
const hideOverlay = () => document.getElementById("verify-overlay").style.display = "none";

// Toggle form view
window.toggleForm = () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
};

// Email/password login
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

// Email/password signup
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || !confirm) return alert("All fields required.");
  if (password !== confirm) return alert("Passwords do not match.");
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
    const user = result.user;
    const email = user.email;
    const idToken = await user.getIdToken();

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", token: idToken }),
    });

    const data = await res.json();

    if (data.success && data.user.emailVerified) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";

    } else if (data.needsSignup) {
      alert("Google account not registered. Please complete signup.");
      document.getElementById("signup-email").value = email;
      toggleForm();

    } else {
      alert(data.error || "Google login failed.");
    }
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      alert("Google login error: " + err.message);
    }
  }
};

// Google Account Linking (call only after login with password)
window.linkGoogle = async () => {
  const user = auth.currentUser;
  if (!user) return alert("User not logged in");

  const provider = new GoogleAuthProvider();
  try {
    await linkWithPopup(user, provider);
    alert("✅ Google account successfully linked.");
  } catch (err) {
    if (err.code === "auth/credential-already-in-use") {
      alert("⚠️ This Google account is already linked to another user.");
    } else {
      alert("Linking failed: " + err.message);
    }
  }
};

// Password Reset
window.resetPassword = async () => {
  const email = prompt("Enter your email to reset password:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Check your inbox.");
  } catch (err) {
    alert("Failed to send reset email: " + err.message);
  }
};

// Logout
window.logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    alert("Logged out.");
    window.location.href = "login.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
};
