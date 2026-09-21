const recordContainer = document.getElementById("record-container");

// URL에서 id 가져오기
const params = new URLSearchParams(window.location.search);

const id = params.get("id");

// id가 없는 경우
if (!id) {
  recordContainer.innerHTML = `
    <p>잘못된 기록입니다.</p>
  `;
} else {
  loadRecord(id);
}

// 기록 하나 불러오기
async function loadRecord(id) {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .single();

  // 오류 발생
  if (error) {
    console.error("기록을 불러오는 중 오류 발생:", error);

    recordContainer.innerHTML = `
      <p>기록을 불러오지 못했습니다.</p>
    `;

    return;
  }

  // 기록 출력
  recordContainer.innerHTML = `
    ${
      data.photo_url
        ? `<img
            src="${data.photo_url}"
            alt="${data.category}"
            class="record-photo"
          />`
        : ""
    }

    <p class="record-category">
      ${data.category}
    </p>

    <h2 class="record-holder">
      ${data.holder_name}
    </h2>

    <p class="record-value">
      기록: ${data.record_value}
    </p>

    <p class="record-date">
      기록 달성일: ${data.recorded_at}
    </p>
  `;
}
