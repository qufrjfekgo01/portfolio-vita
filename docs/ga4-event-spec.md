# GA4 이벤트 설계안 — portfolio-vita

대상: https://qufrjfekgo01.github.io/portfolio-vita/  
근거: 실사이트 DOM/화면 확인 + 저장소 `index.html`, `result.html`, `assets/privacy.js` 대조  
상태: 사용자 검토용 초안. 승인 후 별도 구현 PR에서 적용.

## 측정 원칙

- GA4 권장 이벤트 이름은 의미가 정확히 맞는 경우에 사용하고, 나머지는 소문자 `snake_case`의 명확한 커스텀 이벤트로 통일합니다.
- 클릭을 전부 이벤트로 만들지 않습니다. 구매 여정, 콘텐츠 참여, 핵심 UI 반응만 수집합니다.
- 이름/연락처 등 입력값, 폼 필드값, URL 쿼리의 개인정보는 GA4로 전송하지 않습니다.
- 이 페이지는 실습용이며 결제/회원가입이 실제로 일어나지 않습니다. `purchase`, `sign_up`은 보내지 않습니다.
- “구매하기” 클릭과 완료를 분리합니다. 제출 시 유효성 검증과 안내 모달 동의 이후 완료 페이지로 이동하며, 완료는 완료 페이지에서만 기록합니다.
- 현 코드의 개인정보 모달 동의 시 `generate_lead` 훅을 호출하므로, 권장안은 이 이벤트를 완료 페이지에서 한 번만 발화하도록 조정하는 것입니다(중복 방지).

## 이벤트/화면 명세

| 화면·요소 | 사용자 행동 | 이벤트 이름 | 파라미터 제안 | 주요 이벤트 후보 | 구현/측정 조건 |
|---|---|---|---|---|---|
| 랜딩 페이지 전체 | 페이지 진입/조회 | `page_view` (GA4 자동) | 기본: `page_location`, `page_title`, `page_referrer` | — | 향상된 측정 또는 기본 태그에서 자동 수집. `page_view` 중복 전송 여부 확인 |
| 상단 구매 안내 배너 | 배너 클릭 | `select_promotion` | `promotion_name: top_purchase_banner`, `creative_slot: top_banner`, `link_url: #apply` | 후보 | 배너를 실제 클릭 가능한 요소로 만들었을 때만 |
| 상단 로고 | 홈/처음 이동 | `navigation_click` | `navigation_item: logo`, `destination: home`, `link_url: ./` | — | 같은 페이지 최상단/홈으로 이동 |
| 검색 영역 | 검색 시도 | `search` | `search_term` | 후보(검색 기능 구현 시) | 현재는 텍스트 장식 영역이며 입력/검색이 동작하지 않아 현재 구현 범위 밖 |
| 메뉴 햄버거(≡) | 전체 메뉴 열기 | `menu_open` | `menu_location: primary` | — | 현재 텍스트 표시만 있고 버튼 동작 없음. 동작 구현 후 추적 |
| 상단/주 메뉴 ‘전제품’ | 신청 영역으로 이동 | `navigation_click` | `navigation_item: all_products`, `destination: apply`, `link_url: #apply` | — | 해당 링크 클릭 |
| 상단/주 메뉴 ‘구매’ | 구매 신청 섹션으로 이동 | `select_item` | `item_id: vita_gummy`, `item_name: 뉴트젠 멀티구미 성인용 멀티비타민 구미`, `item_list_name: header_navigation` | 후보 | 상품 선택 의도 신호로만 해석(구매 완료 아님) |
| 상단/주 메뉴 ‘멀티비타민’, ‘구미’ | 상세정보로 이동 | `navigation_click` | `navigation_item: multivitamin` 또는 `gummy`, `destination: detail`, `link_url: #detail` | — | 앵커 이동 |
| 상단/주 메뉴 ‘Q&A’ | FAQ로 이동 | `navigation_click` | `navigation_item: q_and_a`, `destination: faq`, `link_url: #faq` | — | 앵커 이동 |
| 상단/주 메뉴 ‘리뷰’ | 구매 후기 위치로 이동 | `navigation_click` | `navigation_item: reviews`, `destination: apply` | — | 현재 href가 #apply. 리뷰 목록/후기 섹션은 없음 |
| 혜택/로그인/회원가입 유틸 링크 | 신청 영역으로 이동 | `navigation_click` | `navigation_item: member_benefit` / `login` / `join`, `destination: apply` | — | 실제 로그인/가입 동작 없음. `sign_up`으로 해석하지 않음 |
| 신규회원 쿠폰 | 쿠폰 혜택 클릭 | `select_promotion` | `promotion_name: new_member_coupon`, `creative_slot: product_info`, `destination: apply` | 후보 | 쿠폰 발급/다운로드가 실제 발생하진 않으므로 쿠폰 발급완료로 기록하지 않음 |
| 옵션 1통/2통/3통 칩 | 구성 선택 | `select_item` | `item_id: vita_gummy`, `item_variant: 1_bottle / 2_bottles / 3_bottles`, `quantity: 1 / 2 / 3` | **1순위 후보** | 실제 선택 상태/총액 변경이 구현돼 있는지 검토 필요. 현재 화면상 1통만 활성 스타일이고 칩 텍스트에는 동작 표식 없음 |
| 리뷰 사진/평점 | 리뷰 이미지/후기 확인 | `select_content` | `content_type: review_photo`, `content_id: review_hand / review_office / review_dinner / review_night` | 후보 | 이미지 클릭 동작/리뷰 상세가 현재 없어, 구현된 클릭 요소가 아니라면 제외. 뷰 자체는 이벤트 대신 engagement로 고려 |
| 상품 CTA ‘☆’ | 찜 시도 | `add_to_wishlist` | `item_id: vita_gummy`, `item_name: 뉴트젠 멀티구미` | 후보 | 현재 링크는 #apply 앵커일 뿐 찜 상태 저장 없음. 실제 찜 기능 연결 후 사용 |
| 상품 CTA ‘장바구니 담기’ | 장바구니 담기 시도 | `add_to_cart` | `currency: KRW`, `value: 22900`, `items: [{item_id: vita_gummy, item_name: 뉴트젠 멀티구미, price: 22900, quantity: 1}]` | 후보 | 실제 장바구니 기능 없음. 기능 연결 전에는 이벤트를 보내지 않음 |
| 상품 CTA ‘구매’ / 상단·하단 구매하기 | 신청 섹션으로 이동/시작 | `begin_checkout` 또는 커스텀 `purchase_cta_click` | `currency: KRW`, `value: 22900`, `items: [{item_id: vita_gummy, quantity: 1}]`, `cta_location: product / footer / sticky` | **후보(시작 신호)** | 결제는 없으므로 `begin_checkout`은 의미상 부정확할 수 있음. 추천은 `purchase_cta_click`; 전환으로 표시하지 않음 |
| 상세/리뷰/Q&A 탭 | 섹션 이동 | `navigation_click` | `tab_name: detail / reviews / q_and_a`, `destination: detail / apply / faq` | — | 실제 탭 콘텐츠 전환이 아니라 앵커 링크 이동 |
| 상세 콘텐츠 이미지/포인트 | 콘텐츠 확인/스크롤 | `scroll` 자동 이벤트 또는 `content_view` | `content_section: product_story / benefit_01 / benefit_02 / nutrition / recommendation` | 후보 | GA4 향상된 측정의 scroll은 페이지 90% 도달 기준. 섹션 노출 분석 필요 시 IntersectionObserver 커스텀 이벤트를 별도 정의 |
| FAQ 질문/답변 | FAQ 열기/확인 | `faq_open` | `faq_question: dosage / sugar / timing` | **2순위 후보** | 현재 FAQ는 질문·답변이 모두 펼쳐진 정적 텍스트이며 열기/닫기 조작은 없음. 아코디언으로 바뀔 때만 |
| 신청 폼 이름/연락처 | 입력/수정 | **수집 금지** | — | — | 입력값, 전화번호, 이름, 필드 텍스트/값은 GA4/GTM에 보내지 않음. 입력 이벤트 자체도 기본안에서 제외 |
| 신청 폼 제출 버튼 | 제출 시도 | `form_submit_attempt` | `form_id: lead_form`, `form_name: purchase_inquiry`, `form_valid: true/false` | — | 이름/연락처 값 제외. 클릭과 유효성 실패를 분리해 계측 가능 |
| 제출 폼 유효성 실패 | 형식/필수값 미충족 | `form_validation_error` | `form_id: lead_form`, `field_name: name / contact`, `error_type: required / pattern` | **3순위 후보** | 개인정보가 아닌 필드 식별자와 오류 유형만. 오류 메시지/입력값은 금지 |
| 개인정보 안내 열기(상단/폼/푸터) | 안내 모달 열기 | `privacy_notice_open` | `entry_point: header / form / footer`, `modal_mode: info / submit` | — | 일반 정보 열기와 제출 직전 안내 열기를 구분 |
| 개인정보 안내 체크박스 | 확인 동의 체크 | `privacy_notice_consent` | `consent_context: info / submit`, `action: checked` | — | 동의 로그를 수집한다면 목적과 보존 정책 검토 필요. 분석 동의와 개인정보 처리 동의는 다른 개념 |
| 개인정보 안내 ‘닫기’/바깥 클릭/Esc | 모달 닫기/이탈 | `privacy_notice_dismiss` | `consent_context: info / submit`, `dismiss_method: button / backdrop / escape` | 후보(폼 이탈 진단) | 사용자 선택 진단용. 정보성 모달 닫기와 제출 중단을 분리 |
| 개인정보 확인 버튼(정보 열람) | 안내 확인 후 닫기 | `privacy_notice_acknowledge` | `consent_context: info` | — | 제출 완료 의미 아님 |
| 개인정보 확인 후 폼 완료 | 정보 삭제 및 완료 페이지 이동 | `generate_lead` | `currency: KRW`, `value: 22900`(선택), `lead_type: purchase_inquiry`, `item_id: vita_gummy`, `item_variant: 선택된 구성`(선택) | **주요 이벤트 후보 1순위** | 완료 시점 이벤트. 개인식별 데이터 전송 금지. 현재 훅은 완료 확인 클릭 시 발생하므로 result 페이지 이벤트와 중복되지 않게 한 곳에서만 발화 |
| 감사/완료 페이지 조회 | 완료 화면 도달 | `lead_complete` (커스텀) | `form_id: lead_form`, `completion_type: simulated_inquiry` | **주요 이벤트 후보 1순위 대안** | 성공 완료 지표는 `generate_lead`와 둘 중 하나를 표준으로 선택. result.html은 직접 URL 진입도 가능하므로 완료 토큰/상태 없이 page_view만 전환 처리하면 과대계상될 수 있음 |
| 완료 페이지 ‘처음 화면으로’ | 랜딩 재방문 | `navigation_click` | `navigation_item: back_to_home`, `destination: home` | — | 완료 이벤트와 별도 기록 |

## 주요 이벤트(키 이벤트) 후보

GA4의 ‘주요 이벤트(키 이벤트)’로 지정할 이벤트는 소수로 시작하는 것을 권장합니다. 현재 페이지가 실습용이고 실제 구매가 없다는 점을 전제로 한 후보입니다.

| 우선순위 | 후보 이벤트 | 지정 권고 | 정의/이유 | 주의점 |
|---|---|---|---|---|
| 1 | `generate_lead` | **우선 후보** | 폼 검증 통과 + 안내/확인 흐름 완료 후 완료 페이지로 이동한 단일 전환을 대표 | 실제 판매 리드가 아닌 실습용 신청 완료. `value`는 의도 분석용 모의 값이며 매출로 보고하지 않기 |
| 1 대안 | `lead_complete` | 선택 대안 | 완료 화면 도달을 별도 커스텀 이벤트로 명확히 부를 때 | `generate_lead`와 동시에 주요 이벤트로 만들지 않기. 직접 URL 진입 중복/오집계 방지 |
| 2 | `purchase_cta_click` | 초기엔 비주요 이벤트 권고 | 구매 CTA의 관심/퍼널 시작 의도 측정 | 성공 전환이 아니며 클릭만으로 키 이벤트로 지정하면 성과 과대계상 |
| 3 | `add_to_cart` | 기능 구현 후 재평가 | 실제 장바구니에 상품이 담길 때는 고의도 행동 | 현재 UI는 앵커 이동만 하므로 이벤트 미발화 |
| 4 | `select_promotion` | 기본은 비주요 | 쿠폰 링크/배너 관심도를 비교 | 쿠폰 발급이 발생하지 않음 |
| 5 | `form_validation_error` | 진단용, 비주요 | 폼 마찰/입력 오류를 발견 | 성공 지표가 아니며 키 이벤트에 적합하지 않음 |

**최종 추천:** 우선 `generate_lead` 하나만 키 이벤트로 지정하고, 실제 제출 완료를 사용자 동의 후 페이지 이동으로 정의합니다. 실습 목적상 GA4에서 전환 건수를 실제 매출/실제 리드로 오해하지 않도록 보고서 명칭을 ‘모의 구매 신청 완료’로 설명합니다. `purchase`는 실제 결제와 transaction_id가 없으므로 사용하지 않습니다.

## 사용자 확인이 필요한 결정

1. 제출 완료 표준을 `generate_lead` 하나로 둘지, `lead_complete`로 명확히 분리할지.
2. 페이지 진입/제출 흐름만 1차 적용하고, 현재 동작하지 않는 찜·장바구니·옵션·아코디언 이벤트는 기능 구현 전까지 제외할지.
3. `form_validation_error` 계측 시 비식별 `field_name` / `error_type`만 허용할지.

## 구현 전 검토 메모

- GA4 이벤트/사용자 정의 파라미터는 이름·연락처·폼 입력 내용 없이 설계합니다.
- 스크롤 이벤트는 향상된 측정의 90% 기준과 섹션별 노출 이벤트 중복을 피합니다.
- GitHub Pages 프로젝트 경로가 있으므로 GA4의 페이지 위치/기본 URL 설정이 루트 경로가 아니라 `/portfolio-vita/`를 포함하는지 확인합니다.
- 이 문서는 계측 구현이나 GA4 속성 설정, PR 생성, 커밋을 수행하지 않은 검토 초안입니다.
