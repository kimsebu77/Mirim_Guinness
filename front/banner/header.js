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
      }
    });
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  location.href = "../home/home.html";
}

loadHeader();
