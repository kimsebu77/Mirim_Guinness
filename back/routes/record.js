const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.post("/request", requireAuth, async (req, res) => {
  try {
    const { name, applicantType, email, description } = req.body;

    if (!name || !applicantType || !email || !description) {
      return res.status(400).json({ message: "모든 항목을 입력해주세요." });
    }

    const { error } = await supabase.from("record_requests").insert({
      user_id: req.user.id,
      name,
      applicant_type: applicantType,
      email,
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

module.exports = router;
