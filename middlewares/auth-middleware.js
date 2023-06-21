const jwt = require("jsonwebtoken");
const User = require("../schemas/user.js");

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;

  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (authType !== "Bearer" || !authToken) {
    res.status(403).json({
      success: false,
      errorMessage: "로그인 후에 이용할 수 있는 기능입니다.",
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "secret-login-key");

    const user = await User.findById(userId);
    res.locals.user = user;
    res.locals.userNickname = user.nickname;

    next();
  } catch (error) {
    res.clearCookie("Authorization");
    res.status(403).json({
      success: false,
      errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
    });
    return;
  }
};
