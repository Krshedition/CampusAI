import { db } from "./firebase.js";
import { login, logout, watchAuth } from "./auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ALLOWED_DOMAINS = [
  "mitsgwl.ac.in"
];

const userBox = document.getElementById("user");

watchAuth(async (user) => {
  if (!user) {
    userBox.textContent = "Not logged in";
    window.currentUser = null;
    return;
  }

  const email = user.email || "";
  const domain = email.split("@")[1];

  if (!ALLOWED_DOMAINS.includes(domain)) {
    alert("Only MITS Gwalior college emails are allowed.");
    await logout();
    return;
  }

  userBox.textContent = `Logged in as ${email}`;
  window.currentUser = user;
});


async function loginHandler() {
  await login(); // that's it
}

const API_KEY = "AIzaSyBNACXqlTyX1B0ZIrszztx1JnIV8rGLTJs";

async function analyzeComplaint() {
  if (!window.currentUser) {
    alert("Please login using your college email first.");
    return;
  }

  const text = document.getElementById("complaint").value;
  const resultBox = document.getElementById("result");

  if (!text.trim()) {
    resultBox.textContent = "Please enter a complaint.";
    return;
  }

  resultBox.textContent = "Analyzing...";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI system for a college campus.
Respond ONLY in valid JSON (no markdown, no backticks):

{
  "category": "",
  "priority": "",
  "action": ""
}

Complaint: ${text}
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      resultBox.textContent = "Error: " + data.error.message;
      return;
    }

    // 🔑 Extract raw text
    const rawText = data.candidates[0].content.parts[0].text;

    // 🔑 Parse JSON safely
    const aiResult = JSON.parse(rawText);

    // 🔥 SAVE TO FIRESTORE
    await addDoc(collection(db, "complaints"), {
      complaint: text,
      category: aiResult.category,
      priority: aiResult.priority,
      action: aiResult.action,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    // 🔎 Show output
    resultBox.textContent = JSON.stringify(aiResult, null, 2);

  } catch (err) {
    console.error(err);
    resultBox.textContent = "Something went wrong. Check console.";
  }
}

window.analyzeComplaint = analyzeComplaint;
window.login = loginHandler;
window.logout = logout;

