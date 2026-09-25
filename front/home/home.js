// home.js
// Express API(/api/records)에서 "필요한 만큼만" 최근 기록을 가져와
// 카드 그리드와 "기네스 뉴스" 티커를 채움 (search.js처럼 전체 테이블을 받아오지 않음)

const CARD_COUNT = 4; // 카드로 보여줄 개수
const TICKER_COUNT = 8; // 뉴스 티커에 흘려보낼 개수 (카드용 4개 포함)

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/records?limit=${TICKER_COUNT}`,
    );
    const records = await res.json();

    if (!res.ok) {
      console.error("기록 불러오기 실패:", records.message);
      document.getElementById("news-current").textContent =
        records.message || "기록을 불러오지 못했습니다.";
      return;
    }

    // 서버가 recorded_at desc로 이미 정렬해서 주므로 그대로 사용
    renderCards(records.slice(0, CARD_COUNT));
    setupNewsTicker(records);
  } catch (error) {
    console.error(error);
    document.getElementById("news-current").textContent =
      "서버에 연결할 수 없습니다.";
  }
});

function renderCards(records) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  if (!records.length) {
    container.innerHTML = `<div class="card-empty">등록된 기록이 없습니다.</div>`;
    return;
  }

  records.forEach((record, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    // 첫 카드는 크게, 두번째 카드는 넓게 (원한다면 규칙 바꿔도 됨)
    if (i === 0) card.classList.add("card-large");
    else if (i === 1) card.classList.add("card-wide");

    card.innerHTML = `
      <img
        src="${record.photo_url || "../banner/Guinness.png"}"
        alt="${record.record_name}"
        onerror="this.onerror=null;this.src='../banner/Guinness.png';"
      />
      <div class="card-text">
        <div class="card-title">${record.record_name}</div>
      </div>
    `;

    const goToDetail = () => {
      location.href = `../record_info/record_info.html?id=${record.id}`;
    };

    card.addEventListener("click", goToDetail);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToDetail();
      }
    });

    container.appendChild(card);
  });
}

function setupNewsTicker(records) {
  const currentEl = document.getElementById("news-current");
  const nextEl = document.getElementById("news-next");
  const track = document.querySelector(".record-news-track");

  if (!records.length) {
    currentEl.textContent = "등록된 기록이 없습니다.";
    return;
  }

  const newsText = (r) => `${r.record_name}`;

  let index = 0;
  currentEl.textContent = newsText(records[0]);
  currentEl.href = `../record_info/record_info.html?id=${records[0].id}`;

  if (records.length < 2) return; // 기록이 1개뿐이면 넘길 필요 없음

  setInterval(() => {
    const next = records[(index + 1) % records.length];
    nextEl.textContent = newsText(next);
    nextEl.href = `../record_info/record_info.html?id=${next.id}`;

    track.style.transition = "transform 0.45s ease-in-out";
    track.style.transform = "translateY(-45px)";

    track.addEventListener(
      "transitionend",
      () => {
        track.style.transition = "none";
        track.style.transform = "translateY(0)";
        index = (index + 1) % records.length;
        currentEl.textContent = newsText(records[index]);
        currentEl.href = `../record_info/record_info.html?id=${records[index].id}`;
        nextEl.textContent = "";
      },
      { once: true },
    );
  }, 4000);
}
