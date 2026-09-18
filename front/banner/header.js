function loadHeader() {
  fetch("../banner/header.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;

      const token = localStorage.getItem("access_token");
      const authButton = document.querySelector(".login-button");
      const authIcon = authButton.querySelector("img");

      if (token) {
        authButton.onclick = () => {
          location.href = "../profile/profile.html";
        };
      }
    });
}

loadHeader();
