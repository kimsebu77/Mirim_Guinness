const form = document.querySelector("#record-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const applicantType = document.querySelector("#applicant-type").value;
  const emailId = document.querySelector("#email-id").value.trim();
  const emailDomain = document.querySelector("#email-domain").value;
  const description = document.querySelector("#description").value.trim();

  if (!name || !emailId || !description) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  const email = emailId + emailDomain;
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch("http://localhost:3000/api/record/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        applicantType,
        email,
        description,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    alert("신청이 완료되었습니다!");
    location.href = "../home/home.html";
  } catch (error) {
    console.error(error);
    alert("서버에 연결할 수 없습니다.");
  }
});
