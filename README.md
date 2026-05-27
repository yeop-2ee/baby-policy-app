# 육아 정조준

> 정책 조목조목 준비하는 맞춤형 육아 정책 안내 서비스

거주지·소득·자녀 정보를 입력하면 중앙정부 및 지자체 전용 정책을 자동으로 매칭하고, 신청 준비부터 D-Day 알림까지 한 곳에서 관리할 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **맞춤 정책 매칭** | 프로필 기반 정책 자동 필터링 + 매칭 점수(0-100점) 산출 |
| **정책 알림** | D-Day 기반 신청 마감·시작 알림 |
| **정책 인포그래픽** | 카드 이미지로 한눈에 보는 정책 요약 |
| **모의 계산기** | 아동수당·육아휴직 급여 등 수령 가능 혜택 금액 계산 |
| **정책 리뷰** | 실수령자들의 리뷰·꿀팁 커뮤니티 |
| **서류 준비 가이드** | 정책 신청에 필요한 서류 목록 원클릭 제공 |
| **북마크** | 관심 정책 저장 및 관리 |
| **체크리스트** | 임신·출산 전후 단계별 준비 목록 |
| **AI 챗봇** | 정책 관련 질문에 AI 답변 |
| **프로필 설정** | 거주지·소득·임신 여부·자녀 정보 관리 |

---

## 서비스 흐름

```
프로필 설정 (거주지·소득·임신 여부·자녀 정보)
        ↓
맞춤 정책 목록 (매칭 점수 순 정렬)
  ├─ 중앙정부 정책
  └─ 지자체 전용 정책
        ↓
정책 상세 보기
  ├─ 자격 요건 확인
  ├─ 혜택 금액 계산기
  ├─ 필요 서류 목록
  └─ 실수령자 리뷰·꿀팁
        ↓
북마크 저장 · 알림 설정
        ↓
체크리스트로 진행 상황 관리
```

---

## 기술 스택

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)

| 기술 | 버전 | 용도 |
|------|------|------|
| [Next.js](https://nextjs.org) | 16 | 풀스택 프레임워크 (App Router) |
| [React](https://react.dev) | 19 | UI 라이브러리 |
| [TypeScript](https://www.typescriptlang.org) | 5 | 타입 안전성 |
| [Tailwind CSS](https://tailwindcss.com) | 4 | 스타일링 |
| [Prisma](https://www.prisma.io) | 6 | ORM |
| [PostgreSQL](https://www.postgresql.org) | - | 데이터베이스 |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | 클라이언트 상태 관리 |
| [TanStack Query](https://tanstack.com/query) | 5 | 서버 상태 관리 |
| [React Hook Form](https://react-hook-form.com) | 7 | 폼 관리 |
| [date-fns](https://date-fns.org) | 4 | 날짜 유틸리티 |

---

## 프로젝트 구조

```
baby-policy-app/
│
├── app/                               # Next.js App Router
│   ├── api/                           # API 라우트
│   │   ├── policies/route.ts          # 정책 목록 (매칭 점수 포함)
│   │   ├── policy/[id]/route.ts       # 정책 상세
│   │   ├── profile/route.ts           # 프로필 조회·저장
│   │   ├── bookmarks/route.ts         # 북마크 목록
│   │   ├── bookmark/route.ts          # 북마크 토글
│   │   ├── chat/route.ts              # AI 챗봇
│   │   ├── checklist/route.ts         # 체크리스트 CRUD
│   │   └── checklist/init/route.ts    # 초기 체크리스트 생성
│   ├── page.tsx                       # 홈 (대시보드)
│   ├── profile/page.tsx               # 프로필 설정
│   ├── policies/page.tsx              # 정책 목록
│   ├── policy/[id]/page.tsx           # 정책 상세
│   ├── calculator/page.tsx            # 혜택 계산기
│   ├── notifications/page.tsx         # 알림 목록
│   ├── reviews/page.tsx               # 리뷰 커뮤니티
│   ├── documents/page.tsx             # 서류 준비 가이드
│   ├── bookmarks/page.tsx             # 저장한 정책
│   ├── checklist/page.tsx             # 체크리스트
│   ├── layout.tsx                     # 루트 레이아웃
│   └── providers.tsx                  # React Query·Zustand 프로바이더
│
├── components/                        # 재사용 UI 컴포넌트
│   ├── Navbar.tsx                     # 하단 네비게이션
│   └── Chatbot.tsx                    # AI 챗봇 위젯
│
├── lib/
│   ├── prisma.ts                      # Prisma 클라이언트 싱글턴
│   ├── utils.ts                       # 유틸리티 함수
│   └── storage.ts                     # localStorage 관리
│
├── prisma/
│   ├── schema.prisma                  # DB 스키마 정의
│   ├── seed.ts                        # 초기 데이터 시드
│   └── migrations/                    # 마이그레이션 이력
│
├── public/                            # 정적 파일
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 시작하기 (로컬 개발)

### 사전 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | 18+ |
| PostgreSQL | 14+ |

### 1. 저장소 클론

```bash
git clone <repository-url>
cd baby-policy-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일을 생성합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/baby_policy?schema=public"
```

### 4. DB 마이그레이션

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. (선택) 초기 샘플 데이터 삽입

```bash
npm run db:seed
```

### 6. 개발 서버 실행

```bash
npm run dev
```

- 서비스: http://localhost:3000

---

## DB 스키마

| 모델 | 설명 |
|------|------|
| `User` | 사용자 계정 |
| `UserProfile` | 거주지·소득·임신·맞벌이 정보 |
| `Child` | 자녀 정보 (생년월일·나이) |
| `Policy` | 정책 (카테고리·대상 조건·혜택·신청 정보) |
| `UserPolicy` | 사용자-정책 매칭 (점수·북마크·신청 여부) |
| `Notification` | 정책 신청 마감·시작 알림 |
| `Review` | 정책 리뷰·꿀팁 |
| `Calculation` | 계산기 결과 저장 |
| `Checklist` | 임신·출산 체크리스트 항목 |

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/policies` | 정책 목록 (매칭 점수 포함) |
| GET | `/api/policy/[id]` | 정책 상세 조회 |
| GET/POST | `/api/profile` | 프로필 조회·저장 |
| GET | `/api/bookmarks` | 북마크 목록 |
| POST | `/api/bookmark` | 북마크 토글 |
| POST | `/api/chat` | AI 챗봇 응답 |
| GET/POST | `/api/checklist` | 체크리스트 CRUD |
| GET | `/api/checklist/init` | 초기 체크리스트 생성 |
