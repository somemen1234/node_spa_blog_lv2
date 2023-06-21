const mongoose = require("mongoose");

//Comments에 들어가는 인스턴스 모델 설정
const commentsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
  },
  nickname: {
    type: String,
  },
  content: {
    type: String,
  },
});
//인스턴스 생성 시, 생성일자와 수정일자를 같이 저장하기 위해 set
commentsSchema.set("timestamps", true);

module.exports = mongoose.model("Comments", commentsSchema);
