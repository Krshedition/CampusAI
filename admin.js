import { auth, db } from "./firebase.js";
import { login, logout, watchAuth } from "./auth.js";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const adminUser = document.getElementById("admin-user");
const complaintsDiv = document.getElementById("complaints");

async function isAdmin(email) {
  const ref = doc(db, "admins", email);
  const snap = await getDoc(ref);
  return snap.exists();
}

watchAuth(async (user) => {
  console.log("AUTH STATE:", user);

  if (!user) {
    adminUser.textContent = "Admin: Not logged in";
    complaintsDiv.innerHTML = "<p>Please login as admin.</p>";
    return;
  }

  adminUser.textContent = `Admin: Logged in as ${user.email}`;
  complaintsDiv.innerHTML = "Checking admin access...";

  const allowed = await isAdmin(user.email);

  if (!allowed) {
    alert("Access denied. Admins only.");
    if (!allowed) {
      document.body.innerHTML = `
    <div style="padding:40px; text-align:center;">
      <h2>Access Denied</h2>
      <p>This account is not an admin.</p>
      <button onclick="logout()">Logout</button>
    </div>
  `;
      return;
    }

    return;
  }

  loadComplaints();
});

async function loadComplaints() {
  complaintsDiv.innerHTML = "Loading complaints...";

  const status = document.getElementById("statusFilter").value;
  const priority = document.getElementById("priorityFilter").value;

  let q = collection(db, "complaints");
  let conditions = [];

  if (status !== "all") {
    conditions.push(where("status", "==", status));
  }

  if (priority !== "all") {
    conditions.push(where("priority", "==", priority));
  }

  if (conditions.length > 0) {
    q = query(q, ...conditions);
  }

  const snapshot = await getDocs(q);
  complaintsDiv.innerHTML = "";

  if (snapshot.empty) {
    complaintsDiv.innerHTML = "<p>No complaints found.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "complaint-card";

    // 🔥 STATUS BADGE LOGIC
    const statusClass =
      data.status === "Resolved" ? "resolved" : "pending";

    div.innerHTML = `
  <p><b>Complaint:</b> ${data.complaint}</p>

  <div class="complaint-meta">
    <p><b>Category:</b> ${data.category}</p>
    <p><b>Priority:</b> ${data.priority}</p>
    <p>
      <b>Status:</b>
      <span class="status-badge ${statusClass}">
        ${data.status}
      </span>
    </p>
  </div>

  <div class="ai-action">
    <b>Suggested Action (AI)</b><br />
    ${data.action || "No action suggested"}
  </div>

  <div class="reported-by">
    Reported by: <span>${data.userEmail || "Unknown"}</span>
  </div>

  <div class="complaint-actions">
    <button ${data.status === "Resolved" ? "disabled" : ""}>
      ${data.status === "Resolved" ? "✔ Resolved" : "Mark Resolved"}
    </button>
  </div>
`;


    const button = div.querySelector("button");

    if (data.status !== "Resolved") {
      button.onclick = async () => {
        await updateDoc(doc(db, "complaints", docSnap.id), {
          status: "Resolved"
        });
        loadComplaints();
      };
    }

    complaintsDiv.appendChild(div);
  });
}

window.login = login;
window.logout = logout;
window.loadComplaints = loadComplaints;
