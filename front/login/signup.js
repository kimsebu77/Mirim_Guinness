const form = document.querySelector("#signup-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const nickname = document.querySelector("#nickname").value.trim();

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        nickname,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    alert("회원가입 성공!");
    location.href = "./login.html";
  } catch (error) {
    console.error(error);
    alert("서버에 연결할 수 없습니다.");
  }
});
