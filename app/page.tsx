"use client";

import { FormEvent, useMemo, useState } from "react";
import { rankPlaces } from "@/lib/recommendation.mjs";

type Gender = "girl" | "boy" | "none";
type Category = "all" | "indoor" | "outdoor" | "free";
type Place = {
  id: string; title: string; district: string; category: "indoor" | "outdoor";
  minMonth: number; maxMonth: number; price: string; convenience: number;
  image: string; description: string; facts: string[]; drive: Record<string, number>; url: string;
};

const origins = ["강동구청", "천호동", "암사동", "고덕동", "상일동"];
const places: Place[] = [
  { id:"gildong-eco", title:"길동생태공원", district:"강동구", category:"outdoor", minMonth:8, maxMonth:48, price:"무료", convenience:.72, image:"https://images.pexels.com/photos/27176993/pexels-photo-27176993/free-photo-of-happy-family-picnic-in-the-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"숲길과 연못을 천천히 둘러보며 풀잎, 새, 곤충을 만나는 생태 산책이에요.", facts:["사전예약","자연관찰","야외"], drive:{강동구청:8,천호동:12,암사동:10,고덕동:9,상일동:11}, url:"https://parks.seoul.go.kr/maps/gildong/gildong_map.pdf" },
  { id:"imom-seongnae", title:"아이맘강동 성내1동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.96, image:"https://images.pexels.com/photos/5865565/pexels-photo-5865565.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"영유아가 보호자와 함께 안전하게 움직이고 놀 수 있는 공공형 실내놀이터예요.", facts:["예약제","실내","영유아 맞춤"], drive:{강동구청:4,천호동:7,암사동:11,고덕동:15,상일동:18}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" },
  { id:"imom-godeok", title:"아이맘강동 고덕2동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.94, image:"https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"비 오는 날에도 부담 없이 갈 수 있는 소규모 서울형 키즈카페예요.", facts:["예약제","실내","보호자 동반"], drive:{강동구청:15,천호동:18,암사동:12,고덕동:5,상일동:8}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" },
  { id:"amsa-prehistory", title:"서울 암사동 유적", district:"강동구", category:"outdoor", minMonth:18, maxMonth:48, price:"무료", convenience:.76, image:"https://images.pexels.com/photos/29631068/pexels-photo-29631068.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"선사시대 움집과 넓은 야외 공간을 함께 둘러보는 가벼운 역사 나들이예요.", facts:["박물관","야외","체험 프로그램"], drive:{강동구청:10,천호동:9,암사동:5,고덕동:12,상일동:16}, url:"https://sunsa.gangdong.go.kr/" },
  { id:"olympic-park", title:"올림픽공원 들꽃마루", district:"송파구", category:"outdoor", minMonth:6, maxMonth:48, price:"무료", convenience:.84, image:"https://images.pexels.com/photos/35646451/pexels-photo-35646451/free-photo-of-family-enjoying-a-picnic-in-a-scenic-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"넓은 공원에서 유모차 산책과 계절 꽃 구경을 함께 할 수 있어요.", facts:["유모차","주차","넓은 잔디"], drive:{강동구청:13,천호동:12,암사동:17,고덕동:21,상일동:24}, url:"https://www.ksponco.or.kr/olympicpark/" },
  { id:"songpa-book", title:"송파책박물관 북키움", district:"송파구", category:"indoor", minMonth:18, maxMonth:48, price:"무료", convenience:.9, image:"https://images.pexels.com/photos/33744867/pexels-photo-33744867/free-photo-of-cute-child-reading-in-a-vibrant-library-setting.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"그림책 속 이야기를 몸으로 경험하는 어린이 책문화 체험 공간이에요.", facts:["실내","책놀이","회차 운영"], drive:{강동구청:18,천호동:16,암사동:21,고덕동:27,상일동:29}, url:"https://www.bookmuseum.go.kr/exhibit/exhibit_book_info.do" },
  { id:"seoul-children-museum", title:"서울상상나라 아기놀이터", district:"광진구", category:"indoor", minMonth:6, maxMonth:48, price:"36개월 미만 무료", convenience:.92, image:"https://images.pexels.com/photos/8613313/pexels-photo-8613313.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"월령별 발달을 고려한 신체·감각·상상 놀이를 한 공간에서 경험해요.", facts:["사전예약","실내","아기놀이터"], drive:{강동구청:22,천호동:18,암사동:20,고덕동:24,상일동:28}, url:"https://www.seoulchildrensmuseum.org/reservation/viewAdmission.do" },
  { id:"hanam-union", title:"하남유니온파크", district:"하남시", category:"outdoor", minMonth:10, maxMonth:48, price:"무료", convenience:.78, image:"https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"잔디광장과 생태연못을 가볍게 걷고 전망타워까지 둘러볼 수 있어요.", facts:["잔디광장","생태연못","전망대"], drive:{강동구청:19,천호동:23,암사동:18,고덕동:14,상일동:12}, url:"https://www.hanam.go.kr/DATA/newsletter/3902/20260107104038747_rjZx.pdf" }
];

export default function Home() {
  const [month, setMonth] = useState(18);
  const [gender, setGender] = useState<Gender>("none");
  const [origin, setOrigin] = useState("강동구청");
  const [profile, setProfile] = useState({ month:18, gender:"none" as Gender, origin:"강동구청" });
  const [category, setCategory] = useState<Category>("all");
  const recommendations = useMemo(() => rankPlaces(places, profile.month, profile.origin).filter((place: Place) => category === "all" || place.category === category || (category === "free" && place.price.includes("무료"))), [profile, category]);

  function submitProfile(event: FormEvent) {
    event.preventDefault();
    setProfile({ month, gender, origin });
    document.querySelector("#feed")?.scrollIntoView({ behavior:"smooth" });
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="토닥 홈"><span>토</span>닥</a>
      <p>강동구에서 시작하는 아기 나들이</p>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">이번 주말 고민, 10초 만에 끝</p>
        <h1><strong>{profile.month}개월 아기</strong>와<br />오늘 어디 갈까?</h1>
        <p className="hero-description">월령에 맞고 차로 가까운 장소부터 보여드려요. 강동구와 가까운 송파·광진·하남까지 골랐어요.</p>
        <div className="area-list"><span>강동구</span><span>송파구</span><span>광진구</span><span>하남시</span></div>
      </div>

      <form className="profile-card" onSubmit={submitProfile}>
        <div className="form-heading"><span>우리 아기 설정</span><b>성별은 추천 순위에 영향 없음</b></div>
        <label className="field-label" htmlFor="month">월령 <strong>{month}개월</strong></label>
        <input id="month" type="range" min="1" max="48" value={month} onChange={(event) => setMonth(Number(event.target.value))} />
        <div className="range-label"><span>1개월</span><span>48개월</span></div>
        <fieldset>
          <legend>성별 <small>선택</small></legend>
          <div className="segments">
            {([["girl","여아"],["boy","남아"],["none","선택 안 함"]] as const).map(([value,label]) => <button key={value} type="button" className={gender === value ? "active" : ""} onClick={() => setGender(value)}>{label}</button>)}
          </div>
        </fieldset>
        <label className="field-label" htmlFor="origin">출발 지역</label>
        <select id="origin" value={origin} onChange={(event) => setOrigin(event.target.value)}>{origins.map((item) => <option key={item}>{item}</option>)}</select>
        <button className="primary" type="submit">맞춤 피드 보기</button>
      </form>
    </section>

    <section className="feed-section" id="feed">
      <div className="feed-heading">
        <div><p className="eyebrow">{profile.origin} 출발 예시</p><h2>가까우면서 잘 맞는 순서예요</h2></div>
        <p>월령 45% · 자차시간 35% · 편의성 15% · 공식정보 5%</p>
      </div>
      <div className="filters" aria-label="장소 유형 필터">
        {([["all","전체"],["indoor","실내"],["outdoor","야외"],["free","무료"]] as const).map(([value,label]) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>)}
      </div>
      <div className="feed-grid">
        {recommendations.map((place: Place & {driveMinutes:number;score:number}, index:number) => <article className="place-card" key={place.id}>
          <div className="photo"><img src={place.image} alt="" /><span>{index + 1}위 추천</span></div>
          <div className="place-body">
            <div className="meta"><b>차로 약 {place.driveMinutes}분</b><span>{place.district} · {place.price}</span></div>
            <h3>{place.title}</h3><p>{place.description}</p>
            <div className="facts">{place.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
            <div className="match"><span>월령·거리 적합도</span><strong>{place.score}점</strong></div>
            <a href={place.url} target="_blank" rel="noreferrer">공식 정보 확인 <span aria-hidden="true">↗</span></a>
          </div>
        </article>)}
      </div>
      <p className="data-note">이동시간은 지도 API 연결 전 강동구 내 출발지별 예시입니다. 운영시간과 예약 가능 여부는 방문 전 공식 페이지에서 확인해 주세요.</p>
    </section>
  </main>;
}
