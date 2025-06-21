// Replace with your Worker URL
const WORKER_URL = "https://delicate-wildflower-25e5.keshavkdas23.workers.dev/";

// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8FLDw94yeWozJUd7cdDfl4-VcsvLWWI",
  authDomain: "animehub-auth-7494b.firebaseapp.com",
  projectId: "animehub-auth-7494b",
  appId: "1:598601889716:web:0d58b958fb2a47b824e4e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
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
      if (!data.user.verified) {
        showVerifyOverlay();
        pollEmailVerification(email, password);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert(data.error || "Login failed.");
    }
  } catch (err) {
    alert("Login error: " + err.message);
  }
};

// Signup with Email/Password
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
    if (!data.success) throw new Error(data.error);

    // Firebase client-side to send email verification
    await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(auth.currentUser);
    showVerifyOverlay();
    pollEmailVerification(email, password);
  } catch (err) {
    alert("Signup error: " + err.message);
  }
};

// Google Login
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
      if (!data.user.verified) {
        await sendEmailVerification(auth.currentUser);
        showVerifyOverlay();
        pollEmailVerification(null, null, true);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert("No account found. Completing signup.");
      document.getElementById("signup-email").value = result.user.email;
      toggleForm('signup');
    }
  } catch (err) {
    alert("Google login error: " + err.message);
    console.error(err);
  }
};

// Show verify email overlay
function showVerifyOverlay() {
  document.getElementById("verify-overlay").style.display = "flex";
}

// Poll Firebase to check email verification every 3s
function pollEmailVerification(email, password, google = false) {
  const interval = setInterval(async () => {
    await auth.currentUser.reload();
    const isVerified = auth.currentUser.emailVerified;

    if (isVerified) {
      clearInterval(interval);
      document.getElementById("verify-overlay").style.display = "none";

      // Auto login after email verification (if email/pass available)
      if (!google && email && password) {
        login(); // Use existing login flow
      } else {
        // Google user verified
        localStorage.setItem("user", JSON.stringify({
          email: auth.currentUser.email,
          uid: auth.currentUser.uid,
          token: await auth.currentUser.getIdToken()
        }));
        window.location.href = "index.html";
      }
    }
  }, 3000);
}

// Toggle between login/signup forms
window.toggleForm = (to = 'signup') => {
  document.getElementById("login-box").classList.toggle("hidden", to === 'signup');
  document.getElementById("signup-box").classList.toggle("hidden", to === 'login');
};
