const token = localStorage.getItem("access_token");

if (!token) {
  alert("로그인이 필요한 페이지입니다.");
  location.href = "../login/login.html";
}
