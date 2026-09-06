import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = protocol + "://" + host + "/og.png";
  return {
    title: "토닥 | 강동구 아기 나들이 추천",
    description: "아이 월령과 지금 계신 위치에 맞춰 가까운 나들이 장소를 추천합니다.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "토닥 | 아기와 오늘, 어디 갈까?", description: "강동구에서 가까운 아기 나들이 추천", images: [image] },
    twitter: { card: "summary_large_image", title: "토닥 | 아기와 오늘, 어디 갈까?", description: "강동구에서 가까운 아기 나들이 추천", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<footer className="policy-footer"><nav aria-label="개인정보 안내"><a href="/privacy">개인정보처리방침</a><a href="/data-deletion">데이터 삭제 안내</a><a href="mailto:netla@naver.com">문의</a></nav></footer></body></html>;
}
