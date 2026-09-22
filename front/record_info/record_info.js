const recordContainer = document.getElementById("record-container");
const recordTitle = document.getElementById("record-title");

const DUMMY_MODE = true;

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (DUMMY_MODE) {
  const data = {
    record_name: "가장 노트북에 스티커가 많은 사람",
    category: "기타",
    holder_name: "강태인",
    record_value: "스티커 37개",

    description:
      "미림마이스터고 학생 중 노트북에 가장 많은 스티커를 붙인 사람을 선정했다. \n노트북에 붙어 있는것이 확인 가능한 스티커의 개수를 기준으로 기록을 측정했다.",

    photo_url: "",
    recorded_at: "2026-09-21",
  };

  displayRecord(data);
} else {
  if (!id) {
    recordContainer.innerHTML = `
      <p>잘못된 기록입니다.</p>
    `;
  } else {
    loadRecord(id);
  }
}

// Supabase에서 기록 가져오기

async function loadRecord(id) {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("기록을 불러오는 중 오류 발생:", error);

    recordContainer.innerHTML = `
      <p>기록을 불러오지 못했습니다.</p>
    `;

    return;
  }

  displayRecord(data);
}

// 기록 화면에 출력

function displayRecord(data) {
  // 기록 이름을 제목으로 사용
  recordTitle.textContent = data.record_name;

  // 사진

  const photo = data.photo_url
    ? `
      <img
        src="${data.photo_url}"
        alt="${data.record_name}"
        class="record-photo"
      />
    `
    : `
      <div class="record-photo no-photo">
        사진
      </div>
    `;

  // 설명

  const description = data.description
    ? `
      <div class="record-description">
        ${data.description}
      </div>
    `
    : "";

  // 전체 내용

  recordContainer.innerHTML = `
    ${photo}

    ${description}


    <div class="record-info-grid">

      <!-- 기록자 -->

      <div class="record-item">

        <span class="record-label">
          기록자
        </span>

        <span class="record-holder">
          ${data.holder_name}
        </span>

      </div>


      <!-- 기록 -->

      <div class="record-item">

        <span class="record-label">
          기록
        </span>

        <span class="record-value">
          ${data.record_value}
        </span>

      </div>


      <!-- 기록 달성일 -->

      <div class="record-item record-date-item">

        <span class="record-label">
          기록 달성일
        </span>

        <span class="record-date">
          ${data.recorded_at}
        </span>

      </div>

    </div>
  `;
}
