import { rankThreads } from './threads.mjs';

// A reviewed snapshot, not an API response or a background browser import.
// The source author's continuation identifies each venue. Keep unresolved
// venues out of recommendations even when the post itself ranks highly.
export const threadsSnapshot = {
  query: '아이 아기 어린이 나들이',
  checkedAt: '2026-09-06',
  rankedAt: '2026-09-06T09:19:39.000Z',
  posts: [
    { id: 'Dbilvm-nbOm', username: 'bium_mom', timestamp: '2026-08-02T14:06:20.000Z',
      permalink: 'https://www.threads.com/@bium_mom/post/Dbilvm-nbOm',
      text: '어린이대공원 가서 상상나라만 보고 오면 하나 놓치는 거야. 바로 옆에 무료로 이용할 수 있는 아리수나라가 있거든. 보통 사전예약해야 한다고 생각하는데 나는 평일에 예약 없이 바로 들어갔어. 상상나라 예약을 못 했거나 시간이 남았다면 그냥 돌아가지 말고 여기부터 확인해 봐. 현장 입장할 때 알아둘 점은 댓글에 적어둘게.' },
    { id: 'Dc3Ul-bHYgu', username: 'jjaegani_baby', timestamp: '2026-09-04T11:51:54.000Z',
      permalink: 'https://www.threads.com/@jjaegani_baby/post/Dc3Ul-bHYgu',
      text: '오늘 날씨가 너무 가을 날씨라 나들이 가야 할 것만 같아서 애 데리고 버스 타고 어린이대공원 다녀왔다. 바람 선선하니 좋은데 해가 너무 뜨겁더라. 그래도 엄청 덥지 않아서 좋았어 사람도 얼마 없고 한가하니 좋더라! 동물원 구경하고 물도 사서 먹고 구경하고 잘 놀다왔다! 어린이대공원 지금 사자랑 호랑이는 없더라고 사육 환경 다시 조성한다고 다른 곳으로 옮겼데! 가려는 사람들 참고해!' },
    { id: 'DTtZ-snEuRs', username: 'jihee__dh', timestamp: '2026-01-19T22:44:01.000Z',
      permalink: 'https://www.threads.com/@jihee__dh/post/DTtZ-snEuRs',
      text: '내가 나중에 꺼내보려고 쓰는 글. 미취학 아동이 가기 좋은 서울 가볼한만 곳 리스트야. 국립중앙박물관 어린이박물관 (용산구) 전쟁기념관 어린이박물관 (용산구) 어린이정원 (용산구) 서대문자연사박물관 (서대문구) 롯데월드 (송파구) 올림픽공원 (송파구) 소마미술관 (송파구) 서울숲 (성동구) 어린이대공원(광진구) 상상나라 (광진구) 아리수나라 (광진구) 서울생활사박물관 (노원구) 화랑대철도공원 (노원구) 용마산폭포공원 (중랑구). 대부분 다 다녔던 곳들인데 인스타는 감성 챙기는 사진뿐이라 여기라도 놀러다녔던 기록 해볼까 싶고.' },
    { id: 'DZ4l_PVGI2i', username: 'ellenp85', timestamp: '2026-06-22T10:08:58.000Z',
      permalink: 'https://www.threads.com/@ellenp85/post/DZ4l_PVGI2i',
      text: '강동구에서 가정보육중인데 어린이회관, 서울형키즈카페, 아이맘강동 실내놀이터, 숲속도서관, 중앙도서관, 미사도서관, 천호도서관, 현대백화점 천호점, 더리버몰, 스타필드 하남, 현대프리미엄아울렛 스페이스원, 길동생태공원, 일자산공원, 나무고아원, 당정근린공원, 구리시곤충생태관, 미호박물관, 덕소자연사박물관, 암사동 유적, 송파책박물관, 백제어린이박물관, 어린이대공원 자주 가고 파믹스가든, 구리타워, 광진교8번가, 광진어린이영어도서관, 세미도서관, 주렁주렁, 비스타밸리, 라바파크 가 볼 예정이야! 이 밖에도 강동구에서 아이와 가기 좋은 곳들 추천 부탁해.' },
    { id: 'DZ6qJL0E1nm', username: 'sgbg_gongdong', timestamp: '2026-06-23T05:23:47.000Z',
      permalink: 'https://www.threads.com/@sgbg_gongdong/post/DZ6qJL0E1nm',
      text: '오늘의 먼나들이 장소는 하남 나무고아원입니다. 하남 나무고아원은 도시개발사업 등으로 인해 옮겨 심어야 하는 나무들을 보호하고 가꾸기 위해 조성된 곳이라고 해요. 넓은 숲과 자연 속에서 친구들은 마음껏 뛰어놀며 즐거운 시간을 보냈습니다. 나무와 꽃, 곤충들을 관찰하며 자연을 가까이에서 느껴보고, 다양한 놀이 시설과 넓은 공간에서 신나게 활동하며 웃음 가득한 하루를 보냈답니다. 자연 속에서 나무의 소중함을 배우고, 친구들과 함께 즐거운 추억을 만들 수 있었던 뜻깊은 시간이었습니다.' },
    { id: 'DbX3r1plJm7', username: 'mango_vin', timestamp: '2026-07-29T10:11:27.000Z',
      permalink: 'https://www.threads.com/@mango_vin/post/DbX3r1plJm7',
      text: '48개월 가정보육하면서 정말 많이 갔던 곳❤️\n볼거리가 많아 애정하는 박물관\n아이랑 가보고 좋았던데나 아이가 좋아했던 곳 있어?\n어딘지 댓글로 공유해주고 가주라 😄' },
    { id: 'DbDnDkYj4SV', username: 'luckybaby.zip', timestamp: '2026-07-21T13:21:20.000Z',
      permalink: 'https://www.threads.com/@luckybaby.zip/post/DbDnDkYj4SV',
      text: '여기 다들 잘 모르는 것 같아!\n작년에 개관한 과학관인데 아이랑\n가기 너무 좋은 곳이야!\n3층으로 되어있고 도서관, 전시실,\n생태교육실, 상상놀이터 등등 전시\n관람뿐만 아니라 체험공간이 많아!\n15개월 아기도 신기하게 구경했지만\n4세이상 아이가 간다면 체험할 것도\n정말 많더라구!!' },
  ],
  venues: [
    ...[
      { id: 'amsa-prehistory', title: '서울 암사동 유적', region: '서울 강동구', area: 'seoul', kind: '실내·야외',
        summary: '유적과 전시를 함께 살펴볼 역사 나들이 후보예요.', caveat: '실외 산책과 전시 관람을 구분해 계획하고, 체험 운영 여부를 확인해 주세요.' },
      { id: 'iljasan-park', title: '일자산공원', region: '서울 강동구', area: 'seoul', kind: '야외',
        summary: '강동에서 가볍게 걷는 숲 나들이 후보예요.', caveat: '선택한 코스의 경사와 유모차 이동 가능 여부를 확인해 주세요.' },
      { id: 'misa-library', title: '미사도서관', region: '경기 하남시', area: 'hanam', kind: '실내',
        summary: '그림책과 함께 조용히 쉬어갈 후보예요.', caveat: '어린이 자료실의 이용 시간과 휴관일을 확인해 주세요.' },
      { id: 'cheonho-library', title: '천호도서관', region: '서울 강동구', area: 'seoul', kind: '실내',
        summary: '천호에서 책 읽는 시간을 보내볼 후보예요.', caveat: '독서 공간의 이용 수칙과 프로그램 신청 조건을 확인해 주세요.' },
      { id: 'starfield-hanam', title: '스타필드 하남', region: '경기 하남시', area: 'hanam', kind: '실내',
        summary: '실내 외출을 계획할 때 비교해 볼 후보예요.', caveat: '몰 방문과 개별 유료 시설 이용은 달라요. 원하는 시설의 요금·연령 조건을 확인해 주세요.' },
    ].map(place => ({ ...place, postId: 'DZ4l_PVGI2i', nearby: true, evidenceType: '방문 장소 목록', verified: true,
      source: 'https://www.threads.com/@ellenp85/post/DZ4l_PVGI2i',
      fit: '강동에서 가정보육 중인 작성자가 자주 가는 장소로 언급했어요. 개별 시설의 상세 평가는 없는 목록이에요.' })),
    ...[
      { id: 'soma-museum', title: '소마미술관', region: '서울 송파구', nearby: true, kind: '실내',
        summary: '아이와 미술 관람을 계획할 때 살펴볼 후보예요.', caveat: '전시마다 내용과 요금이 달라요. 아이가 관심 가질 전시인지 확인해 주세요.' },
      { id: 'seoul-forest', title: '서울숲', region: '서울 성동구', nearby: false, kind: '야외',
        summary: '숲 산책을 계획할 때 비교해 볼 후보예요.', caveat: '출입구와 산책 구간을 미리 정하고 날씨를 확인해 주세요.' },
      { id: 'lotte-world', title: '롯데월드', region: '서울 송파구', nearby: true, kind: '실내·야외',
        summary: '놀이공원 외출을 고려할 때 살펴볼 후보예요.', caveat: '놀이기구별 키·연령 제한과 이용권 요금을 먼저 확인해 주세요.' },
      { id: 'seoul-life-museum', title: '서울생활사박물관', region: '서울 노원구', nearby: false, kind: '실내',
        summary: '생활사 전시를 살펴볼 박물관 후보예요.', caveat: '일반 전시와 어린이 공간의 이용 조건을 각각 확인해 주세요.' },
      { id: 'hwarangdae-rail-park', title: '화랑대철도공원', region: '서울 노원구', nearby: false, kind: '야외',
        summary: '기차에 관심 있는 아이와 비교해 볼 후보예요.', caveat: '철도공원과 인근 별도 시설의 운영시간·요금을 구분해 확인해 주세요.' },
      { id: 'yongma-waterfall-park', title: '용마산폭포공원', region: '서울 중랑구', nearby: false, kind: '야외',
        summary: '공원 산책을 계획할 때 살펴볼 후보예요.', caveat: '폭포 가동 여부와 시간은 방문 전에 확인해 주세요.' },
      { id: 'national-childrens-museum', title: '국립중앙박물관 어린이박물관', region: '서울 용산구', nearby: false, kind: '실내',
        summary: '어린이 박물관 관람을 계획할 때 비교해 볼 후보예요.', caveat: '어린이박물관의 회차별 예약과 동반 보호자 입장 조건을 확인해 주세요.' },
    ].map(place => ({ ...place, postId: 'DTtZ-snEuRs', area: 'seoul', evidenceType: '추천 목록', verified: true,
      source: 'https://www.threads.com/@jihee__dh/post/DTtZ-snEuRs',
      fit: '미취학 아이와 가볼 서울 장소 목록에 포함돼 있어요. 개별 장소에 대한 상세 후기는 아니에요.' })),
    { postId: 'Dbilvm-nbOm', id: 'arisu', title: '아리수나라', region: '서울 광진구', area: 'seoul', nearby: true, kind: '실내', evidenceType: '방문 후기', verified: true,
      source: 'https://www.threads.com/@bium_mom/post/Dbilvm-nbOm',
      summary: '어린이대공원 안에서 상상나라와 함께 비교해 볼 실내 나들이 후보예요.',
      fit: '작성자가 평일 현장 입장 경험과 예약에 관한 정보를 공유했어요. 공원 산책과 실내 방문을 묶고 싶을 때 살펴보세요.',
      caveat: '예약 없이 들어갔다는 개인 경험이 모든 날에 적용되지는 않아요. 현재 예약·현장 입장 조건을 확인해 주세요.' },
    { postId: 'Dc3Ul-bHYgu', id: 'children-grand-park', title: '서울어린이대공원', region: '서울 광진구', area: 'seoul', nearby: true, kind: '야외', evidenceType: '방문 후기', verified: true,
      source: 'https://www.threads.com/@jjaegani_baby/post/Dc3Ul-bHYgu',
      summary: '아이와 공원을 걷고 동물원을 함께 둘러보는 야외 나들이 후보예요.',
      fit: '아이를 데리고 버스로 다녀온 최근 후기가 있어요. 산책과 관찰을 좋아하는 아이에게 비교해 볼 만해요.',
      caveat: '9월 4일 게시글은 사자·호랑이를 볼 수 없었다고 전해요. 특정 동물을 보러 간다면 현재 전시 여부를 확인해 주세요.' },
    { postId: 'DTtZ-snEuRs', id: 'seoul-children-museum', title: '서울상상나라', region: '서울 광진구', area: 'seoul', nearby: true, kind: '실내', evidenceType: '추천 목록', verified: true,
      source: 'https://www.threads.com/@jihee__dh/post/DTtZ-snEuRs',
      summary: '실내에서 시간을 보내고 싶은 날 비교해 볼 어린이 체험 공간이에요.',
      fit: '미취학 아이와 가볼 서울 장소를 정리한 글에 포함돼 있어요. 개별 시설을 자세히 평가한 후기는 아니에요.',
      caveat: '공간별 대상 연령과 예약 조건이 달라요. 아기놀이터 등 이용할 공간의 안내를 먼저 확인해 주세요.' },
    { postId: 'DTtZ-snEuRs', id: 'olympic-park', title: '올림픽공원', region: '서울 송파구', area: 'seoul', nearby: true, kind: '야외', evidenceType: '추천 목록', verified: true,
      source: 'https://www.threads.com/@jihee__dh/post/DTtZ-snEuRs',
      summary: '아이와 짧게 걷고 쉬어가는 공원 나들이 후보예요.',
      fit: '미취학 아이와 가볼 곳을 정리한 글에서 송파구 장소로 소개됐어요. 긴 관람보다 자유로운 산책을 원할 때 비교해 보세요.',
      caveat: '공원이 넓어 입구와 목적지를 먼저 정하는 편이 좋아요. 계절 꽃·행사는 별도 확인이 필요해요.' },
    { postId: 'DZ4l_PVGI2i', id: 'gildong-eco', title: '길동생태공원', region: '서울 강동구', area: 'seoul', nearby: true, kind: '야외', evidenceType: '방문 장소 목록', verified: true,
      source: 'https://www.threads.com/@ellenp85/post/DZ4l_PVGI2i',
      summary: '강동 안에서 자연을 관찰하는 산책 후보예요.',
      fit: '강동에서 가정보육 중인 작성자가 자주 가는 장소로 언급했어요. 가까운 야외 활동을 찾을 때 비교해 보세요.',
      caveat: '개별 방문일과 아이 월령은 글에 나오지 않아요. 방문 전 입장·예약 안내를 확인해 주세요.' },
    { postId: 'DZ4l_PVGI2i', id: 'songpa-book', title: '송파책박물관', region: '서울 송파구', area: 'seoul', nearby: true, kind: '실내', evidenceType: '방문 장소 목록', verified: true,
      source: 'https://www.threads.com/@ellenp85/post/DZ4l_PVGI2i',
      summary: '책을 좋아하는 아이와 실내 관람을 계획할 때 비교해 볼 후보예요.',
      fit: '강동에서 아이를 키우는 작성자가 자주 가는 장소 목록에 넣었어요. 책과 전시에 관심 있는 아이에게 살펴볼 만해요.',
      caveat: '박물관 관람과 북키움 체험은 이용 조건이 다를 수 있어요. 원하는 공간의 대상 연령·예약 여부를 확인해 주세요.' },
    { postId: 'DZ6qJL0E1nm', id: 'hanam-tree', title: '하남 나무고아원', region: '경기 하남시', area: 'hanam', nearby: true, kind: '야외', evidenceType: '단체 나들이 기록', verified: true,
      source: 'https://www.threads.com/@sgbg_gongdong/post/DZ6qJL0E1nm',
      summary: '나무·꽃·곤충을 관찰하고 숲에서 움직이는 야외 나들이 후보예요.',
      fit: '아이들이 숲과 놀이 공간에서 활동한 기록에 장소명이 명확히 나와요. 자연 관찰과 몸놀이를 좋아한다면 살펴보세요.',
      caveat: '단체 활동 기록이므로 개인 방문 시 같은 프로그램이 제공되는 것은 아니에요. 날씨와 현장 이용 조건을 확인해 주세요.' },
    { postId: 'DbX3r1plJm7', id: 'seodaemun-natural-history', title: '서대문자연사박물관',
      region: '서울 서대문구', area: 'seoul', nearby: false, kind: '실내', evidenceType: '방문 후기', verified: true,
      source: 'https://www.threads.com/@mango_vin/post/DbX5l0BlGYz',
      summary: '공룡·동물·곤충 전시를 보고, 북파크에서 책을 읽으며 쉬어가는 실내 나들이예요.',
      fit: '48개월 아이와 방문했다는 후기예요. 전시 관찰과 책 읽기를 좋아하는 아이에게 후보로 추천해요.',
      caveat: '하남 소재는 아니에요. 강동 출발 이동시간과 현재 운영·예약·요금은 확인이 필요해요.' },
    { postId: 'DbDnDkYj4SV', id: 'hwapo-wetland', title: '화포천습지과학관',
      region: '경남 김해시', area: 'gimhae', verified: true,
      source: 'https://www.threads.com/@luckybaby.zip/post/DbDnC4XD4bp' },
  ],
};

export function recommendThreadPlaces(snapshot = threadsSnapshot, { areas = ['seoul', 'hanam'], now = Date.parse(snapshot.rankedAt) } = {}) {
  const ranked = rankThreads(snapshot.posts, snapshot.query, { now });
  const seen = new Set();
  return ranked.flatMap(post => {
    return snapshot.venues.filter(item => item.postId === post.id && item.verified).flatMap(venue => {
    if (!venue || !areas.includes(venue.area) || seen.has(venue.id)) return [];
    // Verification links are also checked through the same safe source parser.
    if (!rankThreads([{ ...post, permalink: venue.source }], snapshot.query, { now }).length) return [];
    seen.add(venue.id);
    return [{ ...venue, post }];
    });
  }).sort((a, b) => Number(Boolean(b.nearby)) - Number(Boolean(a.nearby)) || b.post.score - a.post.score);
}
