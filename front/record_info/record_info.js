const recordContainer = document.getElementById("record-container");
const recordTitle = document.getElementById("record-title");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getYouTubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let vid = null;

    if (host === "youtu.be") {
      vid = url.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        vid = url.searchParams.get("v");
      } else if (
        url.pathname.startsWith("/shorts/") ||
        url.pathname.startsWith("/embed/")
      ) {
        vid = url.pathname.split("/")[2];
      }
    }

    return vid && /^[\w-]{11}$/.test(vid) ? vid : null;
  } catch {
    return null;
  }
}

if (!id) {
  showMessage("잘못된 접근입니다.");
} else {
  loadRecord(id);
}

function showMessage(text) {
  recordContainer.replaceChildren();

  const p = document.createElement("p");
  p.textContent = text;

  recordContainer.appendChild(p);
}

async function loadRecord(recordId) {
  showMessage("기록을 불러오는 중...");

  try {
    const res = await fetch("http://localhost:3000/api/records");
    const result = await res.json();

    if (!res.ok) {
      showMessage(result.message);
      return;
    }

    const data = result.find((r) => String(r.id) === recordId);

    if (!data) {
      showMessage("기록을 찾을 수 없습니다.");
      return;
    }

    displayRecord(data);
  } catch (error) {
    console.error("기록을 불러오는 중 오류 발생:", error);
    showMessage("서버에 연결할 수 없습니다.");
  }
}

function displayRecord(data) {
  document.title = `${data.holder_name} - 기록 정보`;
  recordTitle.textContent = data.record_name;

  recordContainer.replaceChildren();

  if (data.photo_url && isHttpUrl(data.photo_url)) {
    const img = document.createElement("img");

    img.src = data.photo_url;
    img.alt = data.holder_name;
    img.className = "record-photo";

    img.addEventListener("error", () => {
      img.replaceWith(createNoPhoto());
    });

    recordContainer.appendChild(img);
  } else {
    recordContainer.appendChild(createNoPhoto());
  }

  if (data.description) {
    const desc = document.createElement("div");

    desc.className = "record-description";
    desc.textContent = data.description;

    recordContainer.appendChild(desc);
  }

  const grid = document.createElement("div");

  grid.className = "record-info-grid";

  grid.appendChild(createItem("기록자", data.holder_name));
  grid.appendChild(createItem("기록", data.record_value));

  const dateItem = createItem("기록 달성일", data.recorded_at);

  dateItem.classList.add("record-date-item");

  grid.appendChild(dateItem);
  recordContainer.appendChild(grid);

  const divider = document.createElement("div");

  divider.className = "record-video-divider";

  recordContainer.appendChild(divider);

  const heading = document.createElement("div");

  heading.className = "record-video-heading";
  heading.textContent = "기록 영상 ▼";

  recordContainer.appendChild(heading);
  recordContainer.appendChild(createVideoArea(data));
}

function createVideoArea(data) {
  const videoId =
    data.youtube_url && isHttpUrl(data.youtube_url)
      ? getYouTubeId(data.youtube_url)
      : null;

  if (videoId) {
    const wrapper = document.createElement("div");

    wrapper.className = "record-video-wrapper";

    const frame = document.createElement("iframe");

    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
    frame.className = "record-video";
    frame.title = `${data.holder_name}의 기록 영상`;
    frame.allow = "encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.loading = "lazy";

    wrapper.appendChild(frame);

    return wrapper;
  }

  if (data.youtube_url && isHttpUrl(data.youtube_url)) {
    const wrapper = document.createElement("div");

    wrapper.className = "record-video-wrapper no-video";

    const link = document.createElement("a");

    link.href = data.youtube_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "▶ 영상 보러가기";
    link.className = "record-video-link";

    wrapper.appendChild(link);

    return wrapper;
  }

  const wrapper = document.createElement("div");

  wrapper.className = "record-video-wrapper no-video";
  wrapper.textContent = "영상 없음";

  return wrapper;
}

function createNoPhoto() {
  const div = document.createElement("div");

  div.className = "record-photo no-photo";
  div.textContent = "사진";

  return div;
}

function createItem(label, value) {
  const item = document.createElement("div");

  item.className = "record-item";

  const labelEl = document.createElement("span");

  labelEl.className = "record-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");

  valueEl.className = "record-value";
  valueEl.textContent = value;

  item.append(labelEl, valueEl);

  return item;
}
