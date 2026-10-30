function loadHeader() {
  fetch("../banner/header.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;

      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");
      const authButton = document.querySelector(".login-button");

      if (token && userStr) {
        const user = JSON.parse(userStr);

        authButton.innerHTML = `${user.nickname}님`;
        authButton.classList.add("nickname-button");

        authButton.onclick = () => {
          location.href = "../profile/profile.html";
        };

        checkApprovedRequests(token, user);
      }
    });
}

// 새로 승인된 신청이 있으면 오른쪽 위에 알림 표시
async function checkApprovedRequests(token, user) {
  if (user.role === "admin") return;

  try {
    const response = await fetch(
      "http://localhost:3000/api/record/my-requests",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return;

    const result = await response.json();
    const approved = (result.requests || []).filter(
      (req) => req.status === "approved",
    );

    // 이미 알림을 보여준 신청 id는 유저별로 저장
    const storageKey = `notified_approved_${user.id}`;
    const notified = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const newApproved = approved.filter((req) => !notified.includes(req.id));

    newApproved.forEach((req) => showToast(req));

    if (newApproved.length > 0) {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...notified, ...newApproved.map((req) => req.id)]),
      );
    }
  } catch (error) {
    console.error("승인 알림 확인 오류:", error);
  }
}

function showToast(req) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";

  const title = document.createElement("p");
  title.className = "toast-title";
  title.textContent = "신청한 기록이 승인되었습니다!";
  toast.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "toast-desc";
  desc.textContent = req.description;
  toast.appendChild(desc);

  if (req.comment) {
    const comment = document.createElement("p");
    comment.className = "toast-comment";
    comment.textContent = `관리자 코멘트: ${req.comment}`;
    toast.appendChild(comment);
  }

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => toast.remove());
  toast.appendChild(closeBtn);

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  location.href = "../home/home.html";
}

loadHeader();
