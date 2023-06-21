const express = require("express");
const router = express.Router();

const User = require("../schemas/user.js");

//회원가입 API
router.post("/users", async (req, res) => {
  try {
    const { nickname, password, confirmPassword } = req.body;
    let nicknameReg = new RegExp(/^[\w]{3,12}$/g);

    if (!nicknameReg.test(nickname)) {
      res.status(412).json({
        success: false,
        errorMessage: "닉네임은 3 ~ 12자리이면서 알파벳이나 숫자로만 구성해주세요.",
      });
      return;
    }

    if (password.length < 4 || password.includes(nickname)) {
      res.status(412).json({
        success: false,
        errorMessage: "패스워드는 4자리이상이고 닉네임과 같은 값이 포함이 되면 안됩니다.",
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(412).json({
        success: false,
        errorMessage: "패스워드와 패스워드확인이 다릅니다.",
      });
      return;
    }

    const existUser = await User.findOne({ nickname: nickname });
    if (existUser) {
      res.status(412).json({
        success: false,
        errorMessage: "이미 존재하는 닉네임입니다.",
      });
      return;
    }

    const user = new User({ nickname, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: "회원가입에 성공했습니다.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
    return;
  }
});

module.exports = router;
