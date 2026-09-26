const PAGE_SIZE = 12;
const PAGE_WINDOW = 5; // 한 번에 보여줄 페이지 번호 개수

const input = document.querySelector("#search-input");
const button = document.querySelector("#search-btn");
const list = document.querySelector("#record-list");
const pagination = document.querySelector("#pagination");

let allRecords = [];
let currentList = []; // 현재 화면 대상 (전체 또는 검색 결과)
let currentPage = 1;

function showMessage(text) {
  list.replaceChildren();
  pagination.replaceChildren();
  const li = document.createElement("li");
  li.className = "record-empty";
  li.textContent = text;
  list.appendChild(li);
}

function goToRecordInfo(record) {
  location.href = `../record_info/record_info.html?id=${encodeURIComponent(record.id)}`;
}

// 등록된 지 24시간 이내인 기록인지 확인
function isNewRecord(dateStr) {
  const recordDate = new Date(dateStr);
  if (isNaN(recordDate)) return false;

  const diffMs = Date.now() - recordDate.getTime();
  return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000;
}

function createItem(record) {
  const li = document.createElement("li");
  li.tabIndex = 0;
  li.setAttribute("role", "button");

  const title = document.createElement("strong");
  title.textContent = record.record_name;

  const holder = document.createElement("span");
  holder.textContent = `기록자: ${record.holder_name}`;

  const date = document.createElement("small");
  date.textContent = record.recorded_at;

  li.append(title, holder, date);

  if (isNewRecord(record.recorded_at)) {
    const badge = document.createElement("span");
    badge.className = "new-badge";
    badge.textContent = "NEW!";
    li.appendChild(badge);
  }

  li.addEventListener("click", () => goToRecordInfo(record));
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToRecordInfo(record);
    }
  });

  return li;
}

function createPageButton(
  label,
  page,
  { disabled = false, active = false } = {},
) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.disabled = disabled;
  if (active) btn.classList.add("active");
  btn.addEventListener("click", () => {
    currentPage = page;
    render();
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return btn;
}

function renderPagination(totalPages) {
  pagination.replaceChildren();
  if (totalPages <= 1) return;

  // 현재 페이지가 가운데 오도록 번호 범위 계산
  let start = Math.max(1, currentPage - Math.floor(PAGE_WINDOW / 2));
  let end = start + PAGE_WINDOW - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - PAGE_WINDOW + 1);
  }

  pagination.appendChild(
    createPageButton("<", currentPage - 1, { disabled: currentPage === 1 }),
  );
  for (let p = start; p <= end; p++) {
    pagination.appendChild(
      createPageButton(String(p), p, { active: p === currentPage }),
    );
  }
  pagination.appendChild(
    createPageButton(">", currentPage + 1, {
      disabled: currentPage === totalPages,
    }),
  );
}

function render() {
  if (currentList.length === 0) {
    showMessage("검색 결과가 없습니다.");
    return;
  }

  const totalPages = Math.ceil(currentList.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;

  const from = (currentPage - 1) * PAGE_SIZE;
  const pageItems = currentList.slice(from, from + PAGE_SIZE);

  list.replaceChildren(...pageItems.map(createItem));
  renderPagination(totalPages);
}

function search() {
  const keyword = input.value.trim().toLowerCase();

  currentList = keyword
    ? allRecords.filter((r) =>
        [r.record_name, r.holder_name, r.recorded_at]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      )
    : allRecords;

  currentPage = 1; // 검색할 때마다 첫 페이지로
  render();
}

async function loadRecords() {
  showMessage("불러오는 중...");

  try {
    const res = await fetch("http://localhost:3000/api/records");
    const result = await res.json();

    if (!res.ok) {
      showMessage(result.message);
      return;
    }

    // 최신순 (날짜가 같으면 늦게 등록한 기록이 먼저)
    allRecords = [...result].sort(
      (a, b) =>
        b.recorded_at.localeCompare(a.recorded_at) ||
        b.created_at.localeCompare(a.created_at),
    );
    currentList = allRecords;
    currentPage = 1;
    render();
  } catch (error) {
    console.error(error);
    showMessage("서버에 연결할 수 없습니다.");
  }
}

button.addEventListener("click", search);
input.addEventListener("input", search);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

loadRecords();
