# node_spa_blog_lv2

### 회원가입과 로그인을 통한 내 블로그 백엔드 서버 구현(게시판 / 댓글)

---

**users(회원가입)**

- 닉네임과 비밀번호, 비밀번호 확인을 입력해서 간단하게 가입할 수 있도록 구현
- 닉네임은 정규형을 통해 3~12자리의 숫자와 문자로만 구성이 가능하도록 유효성 검사
- 비밀번호는 4자리 이상이고 닉네임과 동일한 값이 포함이 되면 안되도록 설정
- 이미 존재하는 닉네임이면 가입이 되지 않도록 설정

**auth(로그인)**

- 몽고DB에 저장이 된 닉네임과 비밀번호가 일치할 경우 로그인이 되도록 구현
- 로그인 시, Authorization 이라는 access토큰을 발행 해 해당 토큰을 쿠키에 등록(만료기간은 1시간으로 설정)

**posts(게시글)**

- 전체 게시글은 생성 역순 즉 가장 최근에 생성된 순서로 보여지도록 구현, 작성된 게시글이 없다면 오류 반환
- 게시글 등록은 인증 미들웨어를 통해 먼저 유효한 토큰인지 검증을 실시
  - 토큰이 유효하지 않다면 로그인 후 이용할 수 있도록 문구를 남기며 오류 반환
  - 유효한 토큰일 때 DB에 현재 로그인된 유저의 id와 nickname도 같이 저장이 되도록 구현
- 게시글 상세 조회는 postId를 params로 받아 db에 해당하는 게시글을 보여주도록 구현
- 게시글 수정은 우선 미들웨어를 통해 유효한 토큰인지 검증을 하고 현재 로그인된 사용자가 해당 게시글에 저장된 사용자 정보와 일치하는지
  - 검사를 해서 일치하지 않으면 수정을 못하도록 오류를 반환하고 일치한다면 수정할 수 있도록 구현
  - 유효성 검사로는 게시글 내용이나 제목이 비어있으면 비어있다라는 오류와 해당 postId의 게시글이 없을 때는 찾을 수 없다라는 오류를 반환
- 게시글 삭제는 수정과 동일하게 쿠키가 유효한 토큰인지 검증을 하고 현재 검증된 사용자와 db에 저장되어있는 게시글의 사용자가 일치하는지
  검사를 해서 일치하면 삭제가 되도록 구현, 유효성 검사로는 해당 postId의 게시글이 없을 때 찾을 수 없다라는 오류 반환

**comments(댓글)**

- 댓글 작성은 우선 유효한 토큰인지 검증을 하고 해당 게시글이 있다면 작성이 되도록 구현
  - 이 때, 작성된 댓글을 저장 시, 수정/삭제를 하기 위한 권한을 주기 위해 댓글을 작성한 유저의 정보(즉 로그인된 유저의 정보)도 같이 저장
- 댓글 조회는 해당 게시글이 있다면 해당 게시글의 모든 댓글을 보여주도록 구현
- 댓글 수정은 유효한 토큰인지 검증을 하고 해당 댓글을 작성한 사람(db에 저장된 유저의 정보)이 동일하다면 수정을 할 수 있도록 구현
  - 이 떄, params로 게시글의 id와 댓글의 id 두 개를 받게 되는데 댓글이 해당 postId게시글의 댓글이 아니라면 수정이 되지 않도록 유효성 검사도 추가
- 댓글 삭제는 수정과 동일하게 구현(현재 로그인된 정보의 유저와 댓글을 작성한 유저의 정보가 동일하다면 삭제가 되도록)

**상세 API** https://charming-castanet-ba9.notion.site/a07625cfa9974bebb8e93cb4429d4013?v=f2dcfbd55f404756812f394677151c01&pvs=4
