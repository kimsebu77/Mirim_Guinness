function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// 유튜브 주소에서 영상 ID만 뽑아냄 (실패하면 null)
function getYouTubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let id = null;

    if (host === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else if (
        url.pathname.startsWith("/shorts/") ||
        url.pathname.startsWith("/embed/")
      ) {
        id = url.pathname.split("/")[2];
      }
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function createModalMessage(text) {
  const p = document.createElement("p");
  p.className = "record-modal-empty";
  p.textContent = text;
  return p;
}

// 모달 HTML을 처음 한 번만 불러와서 body에 삽입
async function injectRecordModal() {
  if (document.querySelector("#record-modal")) return true;

  try {
    const res = await fetch("../shared/record-detail-modal.html");
    if (!res.ok) throw new Error("모달 파일을 불러올 수 없습니다.");
    document.body.insertAdjacentHTML("beforeend", await res.text());
  } catch (error) {
    console.error(error);
    alert("상세 화면을 불러올 수 없습니다.");
    return false;
  }

  const modal = document.querySelector("#record-modal");

  document
    .querySelector("#record-modal-close")
    .addEventListener("click", closeRecordModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeRecordModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeRecordModal();
    }
  });

  return true;
}

async function openRecordModal(record) {
  if (!(await injectRecordModal())) return;

  document.querySelector("#record-modal-holder").textContent =
    record.holder_name;
  document.querySelector("#record-modal-value").textContent =
    record.record_value;
  document.querySelector("#record-modal-date").textContent = record.recorded_at;

  const items = [];

  if (record.photo_url && isHttpUrl(record.photo_url)) {
    const img = document.createElement("img");
    img.src = record.photo_url;
    img.alt = `${record.holder_name}의 기록 사진`;
    img.className = "record-modal-photo";
    img.addEventListener("error", () => {
      img.replaceWith(createModalMessage("사진을 불러올 수 없습니다."));
    });
    items.push(img);
  }

  if (record.youtube_url && isHttpUrl(record.youtube_url)) {
    const videoId = getYouTubeId(record.youtube_url);

    if (videoId) {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
      frame.className = "record-modal-video";
      frame.title = `${record.holder_name}의 기록 영상`;
      frame.allow = "encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.loading = "lazy";
      items.push(frame);
    } else {
      const link = document.createElement("a");
      link.href = record.youtube_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "▶ 영상 보러가기";
      link.className = "record-modal-link";
      items.push(link);
    }
  }

  if (items.length === 0) {
    items.push(createModalMessage("등록된 사진이나 영상이 없습니다."));
  }

  document.querySelector("#record-modal-media").replaceChildren(...items);
  document.querySelector("#record-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeRecordModal() {
  const modal = document.querySelector("#record-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.querySelector("#record-modal-media").replaceChildren(); // 영상 정지
  document.body.style.overflow = "";
}
