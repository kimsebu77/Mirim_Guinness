const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// 전체 유저: 기록 목록 조회
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("recorded_at", { ascending: false });

  if (error) {
    return res.status(500).json({ message: "기록을 불러올 수 없습니다." });
  }

  res.status(200).json(data);
});

// 관리자: 기록 등록
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const {
    holder_name,
    record_value,
    description,
    photo_url,
    youtube_url,
    recorded_at,
  } = req.body;

  if (!holder_name || !record_value || !recorded_at) {
    return res.status(400).json({ message: "필수 항목을 입력해주세요." });
  }

  const { data, error } = await supabase
    .from("records")
    .insert({
      holder_name,
      record_value,
      description,
      photo_url,
      youtube_url,
      recorded_at,
    })
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
  const {
    holder_name,
    record_value,
    description,
    photo_url,
    youtube_url,
    recorded_at,
  } = req.body;

  const { data, error } = await supabase
    .from("records")
    .update({
      holder_name,
      record_value,
      description,
      photo_url,
      youtube_url,
      recorded_at,
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    console.error("records UPDATE 오류:", error);
    return res.status(400).json({ message: "기록 수정에 실패했습니다." });
  }

  res.status(200).json(data);
});

// 관리자: 기록 삭제
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from("records")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(400).json({ message: "기록 삭제에 실패했습니다." });
  }

  res.status(200).json({ message: "삭제되었습니다." });
});

module.exports = router;
