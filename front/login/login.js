const form = document.querySelector("#login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nickname = document.querySelector("#nickname").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    localStorage.setItem("access_token", result.session.access_token);
    localStorage.setItem("user", JSON.stringify(result.user));

    console.log("로그인 응답 user:", result.user);

    alert("로그인 성공!");
    location.href =
      result.user.role === "admin"
        ? "../admin/admin_requests/admin_requests.html"
        : "../home/home.html";
  } catch (error) {
    console.error(error);
    alert("서버에 연결할 수 없습니다.");
  }
});
