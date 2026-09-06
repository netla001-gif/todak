import type { Metadata } from "next";

export const metadata: Metadata = { title: "데이터 삭제 안내 | 토닥" };

export default function DataDeletionPage() {
  return <main className="policy-page">
    <a href="/" className="policy-home">← 토닥 홈</a>
    <h1>데이터 삭제 안내</h1>
    <p>저장한 정보의 종류에 따라 삭제 방법이 다릅니다. 브라우저 설정 삭제와 서버에 저장된 공유 평가 삭제를 구분해 주세요.</p>
    <section><h2>1. 아이 월령·선호 삭제</h2>
      <ol><li>다른 탭에서 열어 둔 토닥 페이지를 닫습니다.</li><li>브라우저 설정에서 ‘사이트 데이터’ 또는 ‘웹사이트 데이터’를 엽니다.</li><li>현재 접속한 토닥 사이트 주소를 찾아 저장 데이터를 삭제합니다. 방문 기록만 지우면 월령·선호가 남을 수 있습니다.</li><li>토닥을 다시 열면 기본 월령과 빈 선호 목록으로 시작합니다. 다른 브라우저나 기기에 저장한 정보는 각각 삭제해 주세요.</li></ol>
      <p>현재 위치는 페이지를 새로고침하거나 닫으면 초기화됩니다. 위치 접근 허용도 취소하려면 브라우저의 토닥 사이트 권한에서 ‘위치’를 차단해 주세요.</p>
    </section>
    <section><h2>2. 서버 정보 삭제 요청</h2>
      <p><a href="mailto:netla@naver.com?subject=%ED%86%A0%EB%8B%A5%20%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EC%82%AD%EC%A0%9C%20%EC%9A%94%EC%B2%AD">netla@naver.com으로 삭제 요청 보내기</a></p>
      <p>제목은 ‘토닥 데이터 삭제 요청’으로 하고, 본문에 다음 내용을 적어 주세요.</p>
      <ul><li>이용한 토닥 사이트 주소</li><li>삭제하려는 정보와 관련 장소명·평가 또는 Threads 사용자명·게시물 링크</li><li>요청 확인에 필요한 이용 시점 등 최소한의 설명</li></ul>
      <p>비밀번호, 인증 코드, 액세스 토큰, 아이의 이름이나 생년월일은 보내지 마세요. 운영자는 요청과 저장 여부를 확인하고, 추가 확인이 필요한 항목·삭제 범위·처리 결과 또는 삭제가 어려운 사유를 이메일로 안내합니다.</p>
      <p>방문 평가는 사용자 계정과 연결하지 않은 공유 데이터입니다. 같은 장소의 평가를 다른 이용자가 변경할 수 있고, 특정 개인이 작성한 이력만 분리해서 삭제할 수는 없습니다. 공유 평가 삭제는 다른 이용자에게도 반영됩니다.</p>
    </section>
    <section><h2>3. Threads 연결 해제</h2>
      <p>토닥 앱 연결을 승인한 계정이라면 <a href="https://www.threads.com/settings/website_permissions" target="_blank" rel="noreferrer">Threads 웹사이트 권한 설정</a>에서 토닥(todak)을 찾아 연결을 해제할 수 있습니다. 앱 연결 해제는 앞으로의 접근을 철회하는 절차이며, 이미 전달된 정보의 삭제와는 별개입니다.</p>
      <p>토닥 검색 화면에서는 운영자 계정의 인증으로 공개 게시물을 조회하며, 일반 이용자의 Threads 계정 연결은 받지 않습니다. 검색 결과는 데이터베이스에 보관하지 않으며 페이지를 닫거나 새로 검색하면 이전 결과가 사라집니다. 연동 시험에 참여한 계정의 관련 정보 삭제도 위 이메일로 요청할 수 있습니다. Threads 자체의 원본 게시물·댓글을 삭제하려면 Threads에서 직접 삭제해야 합니다.</p>
    </section>
    <p>운영자: 토닥 운영자 · 문의: <a href="mailto:netla@naver.com">netla@naver.com</a></p>
    <a href="/privacy">개인정보처리방침 보기</a>
  </main>;
}
