"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { rankPlaces } from "@/lib/recommendation.mjs";

type Category = "all" | "indoor" | "outdoor" | "free";
type Rating = "liked" | "disliked";
type Child = { id: string; month: number };

function naverMapSearchUrl(title: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(title)}`;
}
type Place = {
  id: string; title: string; district: string; category: "indoor" | "outdoor";
  minMonth: number; maxMonth: number; price: string; convenience: number;
  image: string; description: string; facts: string[]; drive: Record<string, number>; url: string;
};

// Static drive-minute estimates below are keyed to this origin; it's the fallback
// used whenever the visitor hasn't shared their location.
const DEFAULT_ORIGIN = "강동구청";
const places: Place[] = [
  { id:"gildong-eco", title:"길동생태공원", district:"강동구", category:"outdoor", minMonth:8, maxMonth:48, price:"무료", convenience:.72, image:"https://images.pexels.com/photos/27176993/pexels-photo-27176993/free-photo-of-happy-family-picnic-in-the-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"숲길과 연못을 천천히 둘러보며 풀잎, 새, 곤충을 만나는 생태 산책이에요.", facts:["사전예약","자연관찰","야외"], drive:{강동구청:8,천호동:12,암사동:10,고덕동:9,상일동:11}, url:"https://parks.seoul.go.kr/maps/gildong/gildong_map.pdf" },
  { id:"imom-seongnae", title:"아이맘강동 성내1동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.96, image:"https://images.pexels.com/photos/5865565/pexels-photo-5865565.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"영유아가 보호자와 함께 안전하게 움직이고 놀 수 있는 공공형 실내놀이터예요.", facts:["예약제","실내","영유아 맞춤"], drive:{강동구청:4,천호동:7,암사동:11,고덕동:15,상일동:18}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" },
  { id:"imom-godeok", title:"아이맘강동 고덕2동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.94, image:"https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"비 오는 날에도 부담 없이 갈 수 있는 소규모 서울형 키즈카페예요.", facts:["예약제","실내","보호자 동반"], drive:{강동구청:15,천호동:18,암사동:12,고덕동:5,상일동:8}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" },
  { id:"amsa-prehistory", title:"서울 암사동 유적", district:"강동구", category:"outdoor", minMonth:18, maxMonth:48, price:"무료", convenience:.76, image:"https://images.pexels.com/photos/29631068/pexels-photo-29631068.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"선사시대 움집과 넓은 야외 공간을 함께 둘러보는 가벼운 역사 나들이예요.", facts:["박물관","야외","체험 프로그램"], drive:{강동구청:10,천호동:9,암사동:5,고덕동:12,상일동:16}, url:"https://sunsa.gangdong.go.kr/" },
  { id:"olympic-park", title:"올림픽공원 들꽃마루", district:"송파구", category:"outdoor", minMonth:6, maxMonth:48, price:"무료", convenience:.84, image:"https://images.pexels.com/photos/35646451/pexels-photo-35646451/free-photo-of-family-enjoying-a-picnic-in-a-scenic-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"넓은 공원에서 유모차 산책과 계절 꽃 구경을 함께 할 수 있어요.", facts:["유모차","주차","넓은 잔디"], drive:{강동구청:13,천호동:12,암사동:17,고덕동:21,상일동:24}, url:"https://www.ksponco.or.kr/olympicpark/" },
  { id:"songpa-book", title:"송파책박물관 북키움", district:"송파구", category:"indoor", minMonth:18, maxMonth:48, price:"무료", convenience:.9, image:"https://images.pexels.com/photos/33744867/pexels-photo-33744867/free-photo-of-cute-child-reading-in-a-vibrant-library-setting.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"그림책 속 이야기를 몸으로 경험하는 어린이 책문화 체험 공간이에요.", facts:["실내","책놀이","회차 운영"], drive:{강동구청:18,천호동:16,암사동:21,고덕동:27,상일동:29}, url:"https://www.bookmuseum.go.kr/exhibit/exhibit_book_info.do" },
  { id:"seoul-children-museum", title:"서울상상나라 아기놀이터", district:"광진구", category:"indoor", minMonth:6, maxMonth:48, price:"36개월 미만 무료", convenience:.92, image:"https://images.pexels.com/photos/8613313/pexels-photo-8613313.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"월령별 발달을 고려한 신체·감각·상상 놀이를 한 공간에서 경험해요.", facts:["사전예약","실내","아기놀이터"], drive:{강동구청:22,천호동:18,암사동:20,고덕동:24,상일동:28}, url:"https://www.seoulchildrensmuseum.org/reservation/viewAdmission.do" },
  { id:"hanam-union", title:"하남유니온파크", district:"하남시", category:"outdoor", minMonth:10, maxMonth:48, price:"무료", convenience:.78, image:"https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"잔디광장과 생태연못을 가볍게 걷고 전망타워까지 둘러볼 수 있어요.", facts:["잔디광장","생태연못","전망대"], drive:{강동구청:19,천호동:23,암사동:18,고덕동:14,상일동:12}, url:"https://www.hanam.go.kr/DATA/newsletter/3902/20260107104038747_rjZx.pdf" }
  ,{ id:"imom-cheonho", title:"아이맘강동 천호2동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.94, image:"https://images.pexels.com/photos/5865565/pexels-photo-5865565.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"천호동에서 가까운 공동육아방으로 영유아와 보호자가 함께 놀기 좋아요.", facts:["예약제","실내","화~토 운영"], drive:{강동구청:7,천호동:3,암사동:8,고덕동:16,상일동:20}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"imom-gil", title:"아이맘강동 길동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.93, image:"https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"날씨와 상관없이 두 시간 동안 놀 수 있는 길동의 공동육아방이에요.", facts:["예약제","실내","화~토 운영"], drive:{강동구청:8,천호동:10,암사동:14,고덕동:11,상일동:15}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"imom-sangil", title:"아이맘강동 상일2동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.94, image:"https://images.pexels.com/photos/8613313/pexels-photo-8613313.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"상일동에서 가까운 서울형 키즈카페로 보호자와 함께 이용할 수 있어요.", facts:["예약제","실내","화~일 운영"], drive:{강동구청:17,천호동:20,암사동:16,고덕동:8,상일동:4}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"imom-sangil-2", title:"아이맘강동 상일2동 2호점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.92, image:"https://images.pexels.com/photos/33744867/pexels-photo-33744867/free-photo-of-cute-child-reading-in-a-vibrant-library-setting.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"상일2동 주민센터 안에 있어 가까운 실내 나들이로 선택하기 좋아요.", facts:["예약제","실내","주민센터 3층"], drive:{강동구청:18,천호동:21,암사동:17,고덕동:9,상일동:4}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"imom-seongnae-2", title:"아이맘강동 성내2동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.94, image:"https://images.pexels.com/photos/5865565/pexels-photo-5865565.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"성내동에서 부담 없이 방문할 수 있는 소규모 공공형 실내놀이터예요.", facts:["예약제","실내","화~일 운영"], drive:{강동구청:5,천호동:7,암사동:12,고덕동:16,상일동:19}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"imom-amsa", title:"아이맘강동 암사1동점", district:"강동구", category:"indoor", minMonth:6, maxMonth:48, price:"2,000원", convenience:.93, image:"https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"암사동에서 가까우며 영유아가 보호자와 안전하게 놀 수 있는 공동육아방이에요.", facts:["예약제","실내","월~토 운영"], drive:{강동구청:13,천호동:9,암사동:4,고덕동:14,상일동:17}, url:"https://gangdong.go.kr/web/newportal/contents/gdp_005_001_005_007_004" }
  ,{ id:"children-grand-park", title:"서울어린이대공원 동물원", district:"광진구", category:"outdoor", minMonth:8, maxMonth:48, price:"무료", convenience:.84, image:"https://images.pexels.com/photos/27176993/pexels-photo-27176993/free-photo-of-happy-family-picnic-in-the-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"유모차로 산책하며 동물원과 놀이터를 함께 둘러볼 수 있는 넓은 공원이에요.", facts:["동물원","놀이터","주차"], drive:{강동구청:24,천호동:20,암사동:22,고덕동:26,상일동:30}, url:"https://www.sisul.or.kr/open_content/childrenpark/guidance/animal/guide.jsp" }
  ,{ id:"jamsil-hangang", title:"잠실한강공원", district:"송파구", category:"outdoor", minMonth:6, maxMonth:48, price:"무료", convenience:.82, image:"https://images.pexels.com/photos/35646451/pexels-photo-35646451/free-photo-of-family-enjoying-a-picnic-in-a-scenic-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"잔디쉼터와 자연학습장을 따라 유모차 산책과 가족 피크닉을 즐기기 좋아요.", facts:["유모차","주차","자연학습장"], drive:{강동구청:20,천호동:17,암사동:22,고덕동:28,상일동:31}, url:"https://hangang.seoul.go.kr/www/contents/651.do?mid=444" }
  ,{ id:"misa-lake", title:"미사호수공원", district:"하남시", category:"outdoor", minMonth:6, maxMonth:48, price:"무료", convenience:.85, image:"https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"호수 산책로와 잔디광장, 휴식 공간이 있어 가벼운 가족 나들이에 잘 맞아요.", facts:["호수 산책","잔디광장","유모차"], drive:{강동구청:24,천호동:28,암사동:21,고덕동:17,상일동:14}, url:"https://www.hanam.go.kr/cleanh/cleanhBbsNttWebView.do?key=4348&nttNo=3325" }
  ,{ id:"tree-orphanage", title:"하남 나무고아원", district:"하남시", category:"outdoor", minMonth:10, maxMonth:48, price:"무료", convenience:.76, image:"https://images.pexels.com/photos/29631068/pexels-photo-29631068.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"아이에게는 숲 놀이터, 부모에게는 산책과 쉼을 주는 가족형 자연 공간이에요.", facts:["유아숲체험","산책로","자연놀이"], drive:{강동구청:23,천호동:27,암사동:20,고덕동:16,상일동:13}, url:"https://www.hanam.go.kr/cleanh/cleanhBbsNttWebView.do?key=4348&nttNo=3325" }
  ,{ id:"guri-jangja", title:"장자호수공원", district:"구리시", category:"outdoor", minMonth:8, maxMonth:48, price:"무료", convenience:.84, image:"https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"호수 산책로와 잔디광장, 어린이 몸놀이터를 한 번에 즐기는 도심 공원이에요.", facts:["놀이터","잔디광장","주차"], drive:{강동구청:25,천호동:22,암사동:18,고덕동:23,상일동:25}, url:"https://www.guri.go.kr/culture/selectTourCntntsWebView.do?ctgry=2&key=1190&pageIndex=3&pageUnit=9&searchCnd=all&tourNo=62" }
  ,{ id:"guri-insect", title:"구리 곤충생태관", district:"구리시", category:"indoor", minMonth:18, maxMonth:48, price:"무료", convenience:.82, image:"https://images.pexels.com/photos/8613313/pexels-photo-8613313.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"나비관과 곤충관, 표본전시실에서 다양한 곤충과 수생식물을 가까이 관찰해요.", facts:["실내","나비관","생태관찰"], drive:{강동구청:27,천호동:24,암사동:20,고덕동:25,상일동:27}, url:"https://www.guri.go.kr/culture/selectTourCntntsWebView.do?ctgry=7&key=1194&pageIndex=1&pageUnit=1000&searchCnd=all&sortTy=RECOMEND&tourNo=125" }
  ,{ id:"guri-forge", title:"고구려대장간마을", district:"구리시", category:"outdoor", minMonth:24, maxMonth:48, price:"무료", convenience:.7, image:"https://images.pexels.com/photos/29631068/pexels-photo-29631068.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"산자락에 재현된 고구려 마을과 대장간을 걸으며 색다른 풍경을 만나요.", facts:["역사체험","야외","경사진 길"], drive:{강동구청:22,천호동:19,암사동:15,고덕동:20,상일동:23}, url:"https://www.guri.go.kr/gbv/contents.do?key=1604" }
  ,{ id:"guri-eco-center", title:"장자호수생태체험관", district:"구리시", category:"indoor", minMonth:24, maxMonth:48, price:"무료", convenience:.8, image:"https://images.pexels.com/photos/33744867/pexels-photo-33744867/free-photo-of-cute-child-reading-in-a-vibrant-library-setting.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"습지 식물과 새, 양서류를 놀이와 관찰로 알아보는 작은 생태 체험 공간이에요.", facts:["예약 프로그램","실내","생태체험"], drive:{강동구청:25,천호동:22,암사동:18,고덕동:23,상일동:25}, url:"https://www.guri.go.kr/ecoedu/index.do" }
  ,{ id:"guri-hangang", title:"구리한강시민공원", district:"구리시", category:"outdoor", minMonth:6, maxMonth:48, price:"무료", convenience:.8, image:"https://images.pexels.com/photos/35646451/pexels-photo-35646451/free-photo-of-family-enjoying-a-picnic-in-a-scenic-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"넓은 잔디와 한강 풍경을 보며 유모차 산책이나 가족 피크닉을 즐기기 좋아요.", facts:["유모차","잔디광장","피크닉"], drive:{강동구청:26,천호동:23,암사동:19,고덕동:24,상일동:26}, url:"https://www.guri.go.kr/culture/index.do" }
  ,{ id:"guri-donggureung", title:"구리 동구릉", district:"구리시", category:"outdoor", minMonth:18, maxMonth:48, price:"만 6세 이하 무료", convenience:.75, image:"https://images.pexels.com/photos/27176993/pexels-photo-27176993/free-photo-of-happy-family-picnic-in-the-park.jpeg?auto=compress&fit=crop&w=1200&h=760", description:"숲길과 넓은 능역을 따라 아이와 조용히 걷기 좋은 세계유산 산책 코스예요.", facts:["숲길","역사산책","주차"], drive:{강동구청:31,천호동:28,암사동:24,고덕동:29,상일동:31}, url:"https://www.guri.go.kr/culture/index.do" }
];

type Coordinates = { lat:number; lng:number };
type Preferences = { saved:string[]; hidden:string[] };
type LocatedPlace = Place & { location:Coordinates };

const placeCoordinates: Record<string, Coordinates> = {
  "gildong-eco":{ lat:37.54081566319114, lng:127.15541883551022 },
  "imom-seongnae":{ lat:37.5291630951155, lng:127.122428670511 },
  "imom-godeok":{ lat:37.5569820102903, lng:127.15697461704 },
  "amsa-prehistory":{ lat:37.5605464139303, lng:127.130257802123 },
  "olympic-park":{ lat:37.51428559775014, lng:127.11633482132808 },
  "songpa-book":{ lat:37.49888597821397, lng:127.10438467827207 },
  "seoul-children-museum":{ lat:37.5508665042994, lng:127.077592558039 },
  "hanam-union":{ lat:37.5468164299143, lng:127.219481069891 },
  "imom-cheonho":{ lat:37.5434578953048, lng:127.125448391172 },
  "imom-gil":{ lat:37.5383628852452, lng:127.140524673607 },
  "imom-sangil":{ lat:37.55673355938838, lng:127.17232065064566 },
  "imom-sangil-2":{ lat:37.55517011378766, lng:127.17971855171162 },
  "imom-seongnae-2":{ lat:37.535992790021524, lng:127.1282667448609 },
  "imom-amsa":{ lat:37.55145457837783, lng:127.132574354499 },
  "children-grand-park":{ lat:37.5482386958136, lng:127.082318892024 },
  "jamsil-hangang":{ lat:37.5177992564873, lng:127.082357837214 },
  "misa-lake":{ lat:37.56165131759957, lng:127.18817527646752 },
  "tree-orphanage":{ lat:37.5816045145693, lng:127.195514124075 },
  "guri-jangja":{ lat:37.5858048257013, lng:127.141279538004 },
  "guri-insect":{ lat:37.5900077285893, lng:127.16048600935027 },
  "guri-forge":{ lat:37.5605552233289, lng:127.111057789347 },
  "guri-eco-center":{ lat:37.5830833927075, lng:127.138607047366 },
  "guri-hangang":{ lat:37.5756256414086, lng:127.142582525106 },
  "guri-donggureung":{ lat:37.61941522307722, lng:127.13205042833934 },
};
const locatedPlaces: LocatedPlace[] = places.map((place) => ({ ...place, location:placeCoordinates[place.id] }));

const DEFAULT_CHILDREN: Child[] = [{ id:"child-1", month:18 }];

function loadStoredChildren(): Child[] {
  try {
    const stored = JSON.parse(localStorage.getItem("todak-profile") ?? "{}");
    const children = Array.isArray(stored.children)
      ? stored.children.filter((child: unknown): child is Child => !!child && typeof (child as Child).id === "string" && Number.isFinite((child as Child).month))
      : [];
    return children.length ? children : DEFAULT_CHILDREN;
  } catch {
    return DEFAULT_CHILDREN;
  }
}

export default function Home() {
  const [children, setChildren] = useState<Child[]>(DEFAULT_CHILDREN);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [profile, setProfile] = useState({ children:DEFAULT_CHILDREN, location:null as Coordinates | null });
  const [category, setCategory] = useState<Category>("all");
  const [liveDrive, setLiveDrive] = useState<Record<string, number>>({});
  const [checkingDrive, setCheckingDrive] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({ saved:[], hidden:[] });
  const [feedback, setFeedback] = useState<Record<string, Rating>>({});
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const recommendations = useMemo(() => rankPlaces(locatedPlaces, profile.children.map((child) => child.month), DEFAULT_ORIGIN, profile.location, preferences.saved, feedback).filter((place: LocatedPlace) => !preferences.hidden.includes(place.id) && (category === "all" || place.category === category || (category === "free" && place.price.includes("무료")))), [profile, category, preferences, feedback]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("todak-preferences") ?? "{}");
      setPreferences({
        saved:Array.isArray(stored.saved) ? stored.saved.filter((id:unknown) => typeof id === "string") : [],
        hidden:Array.isArray(stored.hidden) ? stored.hidden.filter((id:unknown) => typeof id === "string") : []
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/feedback").then((response) => response.ok ? response.json() : { feedback:{} }).then((data) => setFeedback(data.feedback ?? {})).catch(() => {});
  }, []);

  useEffect(() => {
    const stored = loadStoredChildren();
    setChildren(stored);
    setProfile((current) => ({ ...current, children:stored }));
  }, []);

  function addChild() {
    setChildren((current) => [...current, { id:`child-${Date.now()}`, month:18 }]);
  }

  function removeChild(id: string) {
    setChildren((current) => current.length > 1 ? current.filter((child) => child.id !== id) : current);
  }

  function updateChildMonth(id: string, month: number) {
    setChildren((current) => current.map((child) => child.id === id ? { ...child, month } : child));
  }

  function submitFeedback(placeId: string, rating: Rating) {
    setFeedback((current) => ({ ...current, [placeId]:rating }));
    setRatingTarget(null);
    fetch("/api/feedback", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ placeId, rating }) }).catch(() => {});
  }

  function updatePreference(id: string, action: "saved" | "hidden" | "restore") {
    setPreferences((current) => {
      const next = action === "saved"
        ? { saved:current.saved.includes(id) ? current.saved.filter((item) => item !== id) : [...current.saved, id], hidden:current.hidden.filter((item) => item !== id) }
        : action === "hidden"
          ? { saved:current.saved.filter((item) => item !== id), hidden:[...new Set([...current.hidden, id])] }
          : { ...current, hidden:[] };
      try { localStorage.setItem("todak-preferences", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function submitProfile(event: FormEvent) {
    event.preventDefault();
    setProfile({ children, location });
    try { localStorage.setItem("todak-profile", JSON.stringify({ children })); } catch {}
    setLiveDrive({});
    document.querySelector("#feed")?.scrollIntoView({ behavior:"smooth" });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return setLocationStatus("이 브라우저는 위치 찾기를 지원하지 않아요.");
    setLocationStatus("현재 위치를 찾는 중…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLocation({ lat:coords.latitude, lng:coords.longitude });
      setLocationStatus("현재 위치를 찾았어요. 피드 보기를 눌러주세요.");
    }, () => setLocationStatus(`위치를 찾지 못했어요. ${DEFAULT_ORIGIN} 기준으로 추천할게요.`), { enableHighAccuracy:false, timeout:8000 });
  }

  async function checkDrive(place: LocatedPlace) {
    setCheckingDrive(place.id);
    try {
      const routeOrigin = profile.location ? { x:profile.location.lng, y:profile.location.lat } : DEFAULT_ORIGIN;
      const response = await fetch("/api/drive-times", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ origin:routeOrigin, places:[{ id:place.id, x:place.location.lng, y:place.location.lat }] }) });
      if (response.ok) {
        const data = await response.json();
        setLiveDrive((current) => ({ ...current, ...(data.times ?? {}) }));
      }
    } finally {
      setCheckingDrive("");
    }
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="토닥 홈"><span>토</span>닥</a>
      <p>강동구에서 시작하는 아기 나들이</p>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">이번 주말 고민, 10초 만에 끝</p>
        <h1><strong>우리 아이</strong>와<br />오늘 어디 갈까?</h1>
        <p className="hero-description">월령에 맞고 차로 가까운 장소부터 보여드려요. 강동구와 가까운 송파·광진·하남까지 골랐어요.</p>
        <div className="area-list"><span>강동구</span><span>송파구</span><span>광진구</span><span>하남시</span><span>구리시</span></div>
      </div>

      <form className="profile-card" onSubmit={submitProfile}>
        <div className="form-heading"><span>우리 아이 설정</span><b>{children.length}명</b></div>
        <div className="children-list">
          {children.map((child, index) => <div className="child-row" key={child.id}>
            <label className="field-label" htmlFor={`month-${child.id}`}>{index + 1}번째 아이 <strong>{child.month}개월</strong></label>
            <input id={`month-${child.id}`} type="range" min="1" max="48" value={child.month} onChange={(event) => updateChildMonth(child.id, Number(event.target.value))} />
            {children.length > 1 && <button type="button" className="remove-child-button" onClick={() => removeChild(child.id)}>이 아이 삭제</button>}
          </div>)}
        </div>
        <button type="button" className="add-child-button" onClick={addChild}>+ 아이 추가</button>
        <label className="field-label" htmlFor="location-button">지금 있는 곳</label>
        <button id="location-button" className="location-button" type="button" onClick={useCurrentLocation}>{location ? "✓ 현재 위치 사용 중" : "내 위치 사용하기"}</button>
        {locationStatus && <p className="location-status" role="status">{locationStatus}</p>}
        <button className="primary" type="submit">맞춤 피드 보기</button>
      </form>
    </section>

    <section className="feed-section" id="feed">
      <div className="feed-heading">
        <div><p className="eyebrow">{profile.location ? "현재 위치 · 직선거리 기준" : `${DEFAULT_ORIGIN} 출발 · 예상 시간`}</p><h2>가까우면서 잘 맞는 순서예요</h2></div>
        <p>월령·거리 기본 추천 + 내가 고른 취향 반영</p>
      </div>
      <div className="filters" aria-label="장소 유형 필터">
        {([["all","전체"],["indoor","실내"],["outdoor","야외"],["free","무료"]] as const).map(([value,label]) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>)}
        {preferences.hidden.length > 0 && <button className="restore-button" onClick={() => updatePreference("", "restore")}>숨긴 장소 {preferences.hidden.length}개 다시 보기</button>}
      </div>
      <div className="feed-grid">
        {recommendations.map((place: LocatedPlace & {driveMinutes:number;distanceKm:number|null;score:number;reason:string;visited:Rating|null}, index:number) => <article className="place-card" key={place.id}>
          <div className="photo"><img src={place.image} alt="" /><span>{index + 1}위 추천</span></div>
          <div className="place-body">
            <div className="meta"><b>{liveDrive[place.id] ? `실시간 ${liveDrive[place.id]}분` : place.distanceKm !== null ? `직선 ${place.distanceKm.toFixed(1)}km` : `차로 약 ${place.driveMinutes}분`}</b><span>{place.district} · {place.price}</span></div>
            <h3>{place.title}</h3><p>{place.description}</p>
            <div className="facts">{place.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
            <div className="preference-actions">
              <button type="button" aria-pressed={preferences.saved.includes(place.id)} onClick={() => updatePreference(place.id, "saved")}>{preferences.saved.includes(place.id) ? "♥ 가보고 싶음" : "♡ 가보고 싶음"}</button>
              <button type="button" onClick={() => updatePreference(place.id, "hidden")}>관심 없음</button>
            </div>
            <p className="reason"><b>왜 추천?</b> {place.reason}</p>
            <div className="match"><span>월령·거리 적합도</span><strong>{place.score}점</strong></div>
            <button className="drive-button" type="button" disabled={checkingDrive === place.id} onClick={() => checkDrive(place)}>{checkingDrive === place.id ? "확인 중…" : liveDrive[place.id] ? "자차 시간 다시 보기" : "실제 자차 시간 보기"}</button>
            {place.visited ? <p className="visited-note">{place.visited === "liked" ? "✓ 다녀왔어요 · 좋았어요" : "✓ 다녀왔어요 · 별로였어요"}</p>
              : ratingTarget === place.id ? <div className="visit-rating"><span>어떠셨나요?</span><button type="button" onClick={() => submitFeedback(place.id, "liked")}>좋아요</button><button type="button" onClick={() => submitFeedback(place.id, "disliked")}>별로예요</button></div>
              : <button className="visit-button" type="button" onClick={() => setRatingTarget(place.id)}>다녀왔어요</button>}
            <a href={place.url} target="_blank" rel="noreferrer">공식 정보 확인 <span aria-hidden="true">↗</span></a>
            <a href={naverMapSearchUrl(place.title)} target="_blank" rel="noreferrer">네이버 지도에서 후기 보기 <span aria-hidden="true">↗</span></a>
          </div>
        </article>)}
      </div>
      <p className="data-note">피드는 현재 위치와 장소의 직선거리로 빠르게 정렬하며, 위치는 서버에 저장하지 않아요. 실제 자차 시간은 원하는 카드에서 눌렀을 때만 카카오 길찾기로 확인합니다. 운영시간과 예약 가능 여부는 방문 전 공식 페이지에서 확인해 주세요.</p>
    </section>
  </main>;
}
