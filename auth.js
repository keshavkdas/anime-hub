// auth.js

const WORKER_URL = "https://anime-hub-auth.keshavkdas23.workers.dev/";
let googleCredResponse = null;

// Load Google Identity Services (GSI)
function loadGSI() {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: "581458997616-8qcfq9uovc7gdspojr2s73ujr58ja2f9.apps.googleusercontent.com",
      callback: handleGoogleCredential
    });
    window.google.accounts.id.renderButton(
      document.getElementById("gsi-button"),
      { theme: "outline", size: "large", width: "100%" }
    );
  };
  document.head.appendChild(script);
}

function handleGoogleCredential(response) {
  googleCredResponse = response;
  const payload = JSON.parse(atob(response.credential.split(".")[1]));
  document.getElementById("signup-email").value = payload.email;
  toggleForm();
  document.getElementById("signup-username").focus();
}

// Toggle between login and signup forms
window.toggleForm = () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
};

// Login handler
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return alert("Please fill in both fields.");

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } else {
    alert(data.error || "Login failed.");
  }
};

// Signup handler
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!email || !username || !password || !confirm)
    return alert("All fields are required.");
  if (password !== confirm)
    return alert("Passwords do not match.");
  if (password.length < 6 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return alert("Password must be 6+ chars, include a number & a special character.");
  }

  const body = { action: "signup", email, username, password };
  if (googleCredResponse) {
    body.token = googleCredResponse.credential;
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.error || "Signup failed.");
    return;
  }

  // ✅ Get idToken to poll for verification
  const idToken = data.idToken;
  if (!idToken) {
    alert("Failed to send verification email.");
    return;
  }

  // Show overlay & start polling for verification
  document.getElementById("verify-overlay").style.display = "flex";

  const poll = setInterval(async () => {
    const verify = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "checkVerify",
        uid: data.user.uid,
        idToken
      })
    });
    const vd = await verify.json();
    if (vd.verified) {
      clearInterval(poll);
      document.getElementById("verify-overlay").style.display = "none";
      localStorage.setItem("user", JSON.stringify(data.user));
      googleCredResponse = null;
      window.location.href = "index.html";
    }
  }, 3000);
};


  // Now use Firebase Auth (client) to send verification email
  try {
    const { getAuth, signInWithEmailAndPassword, sendEmailVerification } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"
    );

    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
    );

    const firebaseApp = initializeApp({
      apiKey: "AIzaSyBPPYO5XN3-XQXSPgILze_JcgYBZTYBdz0",
      authDomain: "anime-hub-11eca.firebaseapp.com",
      projectId: "anime-hub-11eca",
    });

    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    console.log("📨 Verification email sent.");

    document.getElementById("verify-overlay").style.display = "flex";

    const poll = setInterval(async () => {
      await userCredential.user.reload();
      if (userCredential.user.emailVerified) {
        clearInterval(poll);
        document.getElementById("verify-overlay").style.display = "none";
        localStorage.setItem("user", JSON.stringify(data.user));
        googleCredResponse = null;
        window.location.href = "index.html";
      }
    }, 3000);

  } catch (err) {
    console.warn("❌ Failed to send verification email:", err.message);
    alert("Failed to send verification email.");
  }
};

// On load
window.onload = () => {
  document.getElementById("verify-overlay").style.display = "none";
  loadGSI();
};
