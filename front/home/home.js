const newsTrack = document.querySelector(".record-news-track");
const currentNews = document.getElementById("news-current");
const nextNews = document.getElementById("news-next");

let newsRecords = [];
let newsIndex = 0;

const NEWS_INTERVAL = 3000;
const ANIMATION_TIME = 450;

// 기록 문장 만들기
function createNewsText(record) {
  return `${record.holder_name}, ${record.record_value} ${record.category} 신기록 달성`;
}

// 기록 링크 설정
function setNews(newsElement, record) {
  newsElement.textContent = createNewsText(record);
  newsElement.href = `../search/record_info.html?id=${record.id}`;
}

// Supabase에서 최신 기록 가져오기
async function loadRecordNews() {
  const { data, error } = await supabase
    .from("records")
    .select("id, category, holder_name, record_value, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("기록 뉴스를 불러오지 못했습니다:", error);

    currentNews.textContent = "기록을 불러오지 못했습니다.";

    return;
  }

  if (data.length === 0) {
    currentNews.textContent = "등록된 기록이 없습니다.";

    return;
  }

  newsRecords = data;

  // 첫 번째 뉴스 표시
  setNews(currentNews, newsRecords[0]);

  // 뉴스가 하나뿐이면 애니메이션 불필요
  if (newsRecords.length <= 1) {
    return;
  }

  // 일정 시간마다 다음 뉴스 표시
  setInterval(showNextNews, NEWS_INTERVAL);
}

// 다음 뉴스 표시
function showNextNews() {
  const nextIndex = (newsIndex + 1) % newsRecords.length;

  // 다음 뉴스 준비
  setNews(nextNews, newsRecords[nextIndex]);

  // 다음 뉴스가 아래에서 올라오도록 이동
  newsTrack.style.transform = "translateY(-45px)";

  // 애니메이션이 끝난 뒤 위치 초기화
  setTimeout(() => {
    newsIndex = nextIndex;

    setNews(currentNews, newsRecords[newsIndex]);

    // 애니메이션 없이 원래 위치로 이동
    newsTrack.style.transition = "none";
    newsTrack.style.transform = "translateY(0)";

    // transition 다시 활성화
    requestAnimationFrame(() => {
      newsTrack.style.transition = "transform 0.45s ease-in-out";
    });
  }, ANIMATION_TIME);
}

loadRecordNews();
