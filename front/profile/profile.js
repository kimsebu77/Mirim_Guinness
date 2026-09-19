async function loadProfile() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("로그인이 필요한 페이지입니다.");
    location.href = "../login/login.html";
    return;
  }

  try {
    const meResponse = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meResult = await meResponse.json();

    if (!meResponse.ok) {
      alert(meResult.message);
      return;
    }

    document.querySelector("#nickname").value = meResult.nickname;
    document.querySelector("#email").value = meResult.email;
    document.querySelector("#job").value =
      meResult.role === "admin" ? "관리자" : "일반회원";
  } catch (error) {
    console.error(error);
    alert("서버에 연결할 수 없습니다.");
  }
}

loadProfile();
