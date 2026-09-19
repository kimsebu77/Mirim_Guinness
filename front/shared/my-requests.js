const statusLabel = {
  pending: "심사 대기중",
  approved: "승인됨",
  rejected: "반려됨",
};

async function injectModal() {
  if (document.querySelector("#my-requests-modal")) return;

  const res = await fetch("../shared/my-requests-modal.html");
  const html = await res.text();
  document.body.insertAdjacentHTML("beforeend", html);

  document.querySelector("#modal-close-btn").addEventListener("click", () => {
    document.querySelector("#my-requests-modal").style.display = "none";
  });

  document
    .querySelector("#my-requests-modal")
    .addEventListener("click", (e) => {
      if (e.target.id === "my-requests-modal") {
        e.target.style.display = "none";
      }
    });
}

async function loadMyRequests() {
  await injectModal();

  const modal = document.querySelector("#my-requests-modal");
  const listContainer = document.querySelector("#my-requests-list");
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    location.href = "../login/login.html";
    return;
  }

  modal.style.display = "flex";
  listContainer.innerHTML = "<p>불러오는 중...</p>";

  try {
    const response = await fetch(
      "http://localhost:3000/api/record/my-requests",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const result = await response.json();

    if (!response.ok) {
      listContainer.innerHTML = `<p>${result.message}</p>`;
      return;
    }

    if (!result.requests || result.requests.length === 0) {
      listContainer.innerHTML = "<p>신청한 기록이 없습니다.</p>";
      return;
    }

    listContainer.innerHTML = "";
    const statusClass = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
    };

    result.requests.forEach((req) => {
      const item = document.createElement("div");
      item.className = "request-item";
      item.innerHTML = `
    <div class="request-item-header">
      <span>
        <span class="request-item-name">${req.name}</span>
        <span class="request-item-type">(${req.applicant_type === "student" ? "학생" : "선생님"})</span>
      </span>
      <span class="status-badge ${statusClass[req.status]}">${statusLabel[req.status]}</span>
    </div>
    <p class="request-item-desc">${req.description}</p>
  `;
      listContainer.appendChild(item);
    });
  } catch (error) {
    console.error(error);
    listContainer.innerHTML = "<p>서버에 연결할 수 없습니다.</p>";
  }
}

function setupMyRequestsModal(triggerSelector) {
  const openTrigger = document.querySelector(triggerSelector);

  openTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    loadMyRequests();
  });
}
