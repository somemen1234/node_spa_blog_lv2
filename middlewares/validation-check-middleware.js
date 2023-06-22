//ObjectId의 타입을 활용하기 위해 할당
const { ObjectId } = require("mongoose").Types;

//시스템 강제 종료되는 부분을 예외 처리
//기본 검색이 ObjectId형식으로 검색을 하다보니 형식에 맞지 않으면 강제 종료가 되어 버림.
//강제 종료를 막기 위해 try catch를 사용했는데, 거의 모든 함수에서 사용해서 따로 미들웨어로 선언
module.exports = (req, res, next) => {
  const { postId } = req.params;
  try {
    if (!ObjectId.isValid(postId)) throw Error("데이터 형식이 올바르지 않습니다.");

    next();
  } catch (error) {
    return res.status(412).json({ success: false, errorMessage: error.message });
  }
};
