import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // replace with actual or injected at build time
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    await sendTokenToWorker(token);
  } catch (e) {
    alert(e.message);
  }
};

// Signup
window.signup = async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("confirm-password").value;
  if (password !== confirm) return alert("Passwords don't match");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    await sendTokenToWorker(token);
  } catch (e) {
    alert(e.message);
  }
};

// Google Login
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    await sendTokenToWorker(token);
  } catch (e) {
    alert(e.message);
  }
};

// Send token to your Cloudflare Worker
async function sendTokenToWorker(token) {
  const response = await fetch("https://<your-cloudflare-worker>.workers.dev/auth", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(data);
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html"; // or dashboard
  } else {
    alert(data.error || "Login failed");
  }
}
