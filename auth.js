const WORKER_URL = "https://anime-hub-auth.keshavkdas23.workers.dev/";
let googleCredResponse = null;

// Fetch and store profile in localStorage
async function fetchAndStoreProfile(uid) {
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getProfile", uid })
  });

  const data = await res.json();
  if (data.success && data.profile) {
    localStorage.setItem("profile", JSON.stringify(data.profile));
  }
}

// Google Sign-In (GSI) setup
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

// Handle GSI credential response
async function handleGoogleCredential(response) {
  googleCredResponse = response;
  const payload = JSON.parse(atob(response.credential.split(".")[1]));
  const email = payload.email;

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "checkUser", email })
  });

  const data = await res.json();

  if (data.exists) {
    localStorage.setItem("user", JSON.stringify({ uid: data.uid, email }));
    await fetchAndStoreProfile(data.uid);
    window.location.href = "index.html";
  } else {
    document.getElementById("signup-email").value = email;
    toggleForm();
    document.getElementById("signup-username").focus();
  }
}

// Enable/disable signup button based on form validity
function checkSignupValidity() {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  const validPassword =
    password.length >= 6 &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password) &&
    /[A-Z]/.test(password);

  const passwordsMatch = password === confirm;
  const allValid = email && username && validPassword && passwordsMatch;

  document.getElementById("signup-btn").disabled = !allValid;
}

// On page load
window.onload = () => {
  document.getElementById("verify-overlay").style.display = "none";
  loadGSI();

  // Real-time error clearing
  [
    "signup-email",
    "signup-username",
    "signup-password",
    "signup-confirm",
    "login-email",
    "login-password"
  ].forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById("error-" + id);
    if (input && error) {
      input.addEventListener("input", () => {
        if (input.value.trim()) error.textContent = "";
      });
    }
  });

  // Signup field listeners for button activation
  ["signup-email", "signup-username", "signup-password", "signup-confirm"]
    .forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener("input", checkSignupValidity);
    });

  // Flip between login and signup forms
  window.toggleForm = () => {
    const loginBox = document.getElementById("login-box");
    const signupBox = document.getElementById("signup-box");

    if (loginBox.classList.contains("visible")) {
      loginBox.classList.remove("visible");
      loginBox.classList.add("hidden");
      signupBox.classList.remove("hidden");
      signupBox.classList.add("visible");
    } else {
      signupBox.classList.remove("visible");
      signupBox.classList.add("hidden");
      loginBox.classList.remove("hidden");
      loginBox.classList.add("visible");
    }
  };
};

// Login logic
window.login = async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const errEmail = document.getElementById("error-login-email");
  const errPass = document.getElementById("error-login-password");

  errEmail.textContent = "";
  errPass.textContent = "";

  let valid = true;
  if (!email) {
    errEmail.textContent = "This is a required field.";
    valid = false;
  }
  if (!password) {
    errPass.textContent = "This is a required field.";
    valid = false;
  }

  if (!valid) return;

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    await fetchAndStoreProfile(data.user.uid);
    window.location.href = "index.html";
  } else {
    errPass.textContent = data.error || "Login failed.";
  }
};

// Signup logic
window.signup = async () => {
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  const errEmail = document.getElementById("error-signup-email");
  const errUser = document.getElementById("error-signup-username");
  const errPass = document.getElementById("error-signup-password");
  const errConfirm = document.getElementById("error-signup-confirm");

  errEmail.textContent = errUser.textContent = errPass.textContent = errConfirm.textContent = "";

  let valid = true;

  if (!email) {
    errEmail.textContent = "This is a required field.";
    valid = false;
  }
  if (!username) {
    errUser.textContent = "This is a required field.";
    valid = false;
  }
  if (!password) {
    errPass.textContent = "This is a required field.";
    valid = false;
  }
  if (!confirm) {
    errConfirm.textContent = "This is a required field.";
    valid = false;
  }
  if (password && confirm && password !== confirm) {
    errConfirm.textContent = "Passwords do not match.";
    valid = false;
  }
  if (
    password &&
    (password.length < 6 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password) || !/[A-Z]/.test(password))
  ) {
    errPass.textContent = "Password must be 6+ chars, include a number, special char, and uppercase.";
    valid = false;
  }

  if (!valid) return;

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
    errUser.textContent = data.error || "Signup failed.";
    return;
  }

  if (!data.verificationSent) {
    errEmail.textContent = "Failed to send verification email.";
    return;
  }

  document.getElementById("verify-overlay").style.display = "flex";
  const idToken = data.idToken;

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
      window.location.href = "create-profile.html";
    }
  }, 3000);
};
