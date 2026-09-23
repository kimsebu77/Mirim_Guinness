const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

const STATUSES = ["pending", "approved", "rejected", "returned"];
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
router.post("/request", requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const applicantType = String(req.body.applicantType ?? "").trim();
    const phone = String(req.body.phone ?? "").trim();
    const email = String(req.body.email ?? "").trim();
    const recordDate = String(req.body.recordDate ?? "").trim();
    const description = String(req.body.description ?? "").trim();

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
    if (!APPLICANT_TYPES.includes(applicantType)) {
      return res
        .status(400)
        .json({ message: "신청자 유형이 올바르지 않습니다." });
    }
    if (name.length > 50) {
      return res
        .status(400)
        .json({ message: "이름은 50자 이하로 입력해주세요." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return res
        .status(400)
        .json({ message: "이메일 형식이 올바르지 않습니다." });
    }
    if (!/^[0-9\-+\s]{8,20}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "전화번호 형식이 올바르지 않습니다." });
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(recordDate) ||
      isNaN(Date.parse(recordDate))
    ) {
      return res
        .status(400)
        .json({ message: "날짜 형식이 올바르지 않습니다." });
    }
    if (description.length > 500) {
      return res
        .status(400)
        .json({ message: "설명은 500자 이하로 입력해주세요." });
    }

    const { error } = await supabase.from("record_requests").insert({
      user_id: req.user.id,
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
module.exports = router;
