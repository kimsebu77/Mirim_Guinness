const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

// 요청 본문 검증 + 정리 (POST, PUT 공용)
function parseRecordBody(body) {
  const record_name = String(body.record_name ?? "").trim();
  const holder_name = String(body.holder_name ?? "").trim();
  const record_value = String(body.record_value ?? "").trim();
  const description = String(body.description ?? "").trim();
  const photo_url = String(body.photo_url ?? "").trim();
  const youtube_url = String(body.youtube_url ?? "").trim();
  const recorded_at = String(body.recorded_at ?? "").trim();

  if (!record_name || !holder_name || !record_value || !recorded_at) {
    return { error: "필수 항목을 입력해주세요." };
  }
  if (record_name.length > 100) {
    return { error: "기록 제목은 100자 이하로 입력해주세요." };
  }
  if (holder_name.length > 50) {
    return { error: "기록 보유자는 50자 이하로 입력해주세요." };
  }
  if (record_value.length > 100) {
    return { error: "기록 값은 100자 이하로 입력해주세요." };
  }
  if (description.length > 500) {
    return { error: "설명은 500자 이하로 입력해주세요." };
  }
  if (!isValidDate(recorded_at)) {
    return { error: "기록 날짜 형식이 올바르지 않습니다." };
  }
  if (photo_url && !isHttpUrl(photo_url)) {
    return { error: "사진 URL은 http 또는 https 주소여야 합니다." };
  }
  if (youtube_url && !isHttpUrl(youtube_url)) {
    return { error: "유튜브 URL은 http 또는 https 주소여야 합니다." };
  }

  return {
    value: {
      record_name,
      holder_name,
      record_value,
      description: description || null,
      photo_url: photo_url || null,
      youtube_url: youtube_url || null,
      recorded_at,
    },
  };
}

// 전체 유저: 기록 목록 조회
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("recorded_at", { ascending: false });

  if (error) {
    console.error("records SELECT 오류:", error);
    return res.status(500).json({ message: "기록을 불러올 수 없습니다." });
  }

  res.status(200).json(data);
});

// 관리자: 기록 등록
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { error: validationError, value } = parseRecordBody(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { data, error } = await supabase
    .from("records")
    .insert(value)
    .select()
    .single();

  if (error) {
    console.error("records INSERT 오류:", error);
    return res.status(400).json({ message: "기록 등록에 실패했습니다." });
  }

  res.status(201).json(data);
});

// 관리자: 기록 수정
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { error: validationError, value } = parseRecordBody(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { data, error } = await supabase
    .from("records")
    .update(value)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("records UPDATE 오류:", error);
    return res.status(400).json({ message: "기록 수정에 실패했습니다." });
  }
  if (!data) {
    return res.status(404).json({ message: "기록을 찾을 수 없습니다." });
  }

  res.status(200).json(data);
});

// 관리자: 기록 삭제
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("records")
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) {
    console.error("records DELETE 오류:", error);
    return res.status(400).json({ message: "기록 삭제에 실패했습니다." });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ message: "기록을 찾을 수 없습니다." });
  }

  res.status(200).json({ message: "삭제되었습니다." });
});

module.exports = router;
