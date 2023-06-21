const mongoose = require("mongoose");

//Posts에 들어가는 인스턴스 모델 설정
const postsSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  nickname: {
    type: String,
  },
  title: {
    type: String,
  },
  content: {
    type: String,
  },
});
// postsSchema.virtual("postId").get(function () {
//   return this._id.toHexString();
// });
// postsSchema.set("toJSON", {
//   virtuals: true,
// });
//인스턴스 생성 시, 생성일자와 수정일자를 같이 저장하기 위해 set
postsSchema.set("timestamps", true);

module.exports = mongoose.model("Posts", postsSchema);
