const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

const STATUSES = ["pending", "approved", "rejected"];
const APPLICANT_TYPES = ["student", "teacher"];

// ===== 관리자 =====

// 전체 신청 목록
router.get("/admin/requests", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("record_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/requests 조회 오류:", error);
    return res.status(500).json({ message: "신청 목록을 불러올 수 없습니다." });
  }

  res.status(200).json({ requests: data });
});

// 신청 상세보기
router.get(
  "/admin/requests/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { data, error } = await supabase
      .from("record_requests")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) {
      console.error("admin/requests 상세 조회 오류:", error);
      return res.status(400).json({ message: "신청을 불러올 수 없습니다." });
    }
    if (!data) {
      return res.status(404).json({ message: "신청 내역을 찾을 수 없습니다." });
    }

    res.status(200).json({ request: data });
  },
);

// 신청 상태 변경 (승인 / 거절 / 반려 / 대기)
router.patch(
  "/admin/requests/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { status } = req.body;
    const comment = String(req.body.comment ?? "").trim();

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "올바르지 않은 상태값입니다." });
    }
    if (comment.length > 500) {
      return res
        .status(400)
        .json({ message: "코멘트는 500자 이하로 입력해주세요." });
    }

    const { data, error } = await supabase
      .from("record_requests")
      .update({ status, comment: comment || null })
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("상태 변경 오류:", error);
      return res.status(400).json({ message: "상태 변경에 실패했습니다." });
    }
    if (!data) {
      return res.status(404).json({ message: "신청을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "처리되었습니다.", request: data });
  },
);

// ===== 일반 유저 =====

// 기록 신청
const submitting = new Set(); // 신청 처리 중인 유저 (연타 방지)

router.post("/request", requireAuth, async (req, res) => {
  const userId = req.user.id;

  // 이미 처리 중이면 바로 거절 (연속 클릭 방지)
  if (submitting.has(userId)) {
    return res
      .status(409)
      .json({ message: "기록 신청은 하루에 한 번만 할 수 있습니다." });
  }
  submitting.add(userId);

  try {
    const { name, applicantType, phone, email, recordDate, description } =
      req.body;

    if (
      !name ||
      !applicantType ||
      !phone ||
      !email ||
      !recordDate ||
      !description
    ) {
      return res.status(400).json({ message: "모든 항목을 입력해주세요." });
    }

    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ message: "연락처는 010-1234-5678 형식으로 입력해주세요." });
    }

    // 오늘 0시 ~ 내일 0시 (한국 시간 기준)
    const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
    const startMs = new Date(`${today}T00:00:00+09:00`).getTime();
    const dayStart = new Date(startMs).toISOString();
    const dayEnd = new Date(startMs + 24 * 60 * 60 * 1000).toISOString();

    const { data: existing, error: checkError } = await supabase
      .from("record_requests")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .lt("created_at", dayEnd)
      .limit(1);

    if (checkError) {
      console.error("신청 중복 확인 오류:", checkError);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }

    if (existing && existing.length > 0) {
      return res
        .status(409)
        .json({ message: "기록 신청은 하루에 한 번만 할 수 있습니다." });
    }

    const { error } = await supabase.from("record_requests").insert({
      user_id: userId,
      name,
      applicant_type: applicantType,
      phone,
      email,
      record_date: recordDate,
      description,
    });

    if (error) {
      console.error("record_requests INSERT 오류:", error);
      return res
        .status(400)
        .json({ message: "신청 처리 중 오류가 발생했습니다." });
    }

    res.status(201).json({ message: "신청이 완료되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  } finally {
    submitting.delete(userId); // 어떤 경우든 잠금 해제
  }
});

// 내 신청 목록
router.get("/my-requests", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("record_requests")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("my-requests 조회 오류:", error);
      return res
        .status(400)
        .json({ message: "신청 목록을 불러올 수 없습니다." });
    }

    res.status(200).json({ requests: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
