/**
 * @file test-data.ts
 * @description E2E 테스트에서 사용하는 공통 테스트 데이터
 */

// 테스트 URL 경로
export const TEST_URLS = {
  home: "/",
  products: "/products",
  cart: "/cart",
  checkout: "/checkout",
  mypage: "/mypage",
  signIn: "/sign-in",
  // 관리자 페이지
  admin: {
    dashboard: "/admin",
    products: "/admin/products",
    productNew: "/admin/products/new",
    orders: "/admin/orders",
    banners: "/admin/banners",
    bannerNew: "/admin/banners/new",
    users: "/admin/users",
    shipping: "/admin/shipping",
  },
} as const;

// 테스트용 선택자 (data-testid가 없는 경우 텍스트/역할 기반)
export const SELECTORS = {
  // 네비게이션
  navbar: {
    logo: "모두쇼핑",
    cartIcon: "장바구니",
    loginButton: "로그인",
    mypageIcon: "마이페이지",
  },

  // 홈페이지
  home: {
    categorySection: "카테고리",
    promotionSection: "프로모션",
    productGrid: "상품",
  },

  // 상품
  product: {
    addToCartButton: "장바구니",
    quantitySelector: "수량",
    priceText: "원",
  },

  // 장바구니
  cart: {
    emptyMessage: "장바구니가 비어있습니다",
    orderButton: "주문하기",
    deleteButton: "삭제",
  },

  // 체크아웃
  checkout: {
    nameInput: "수령인",
    phoneInput: "연락처",
    addressInput: "주소",
    submitButton: "결제하기",
  },

  // 주문 완료
  orderComplete: {
    successMessage: "주문이 완료되었습니다",
    orderNumber: "주문번호",
  },

  // 마이페이지
  mypage: {
    orderList: "주문 내역",
    orderDetail: "주문 상세",
  },

  // 관리자 페이지
  admin: {
    sidebar: {
      dashboard: "대시보드",
      products: "상품 관리",
      orders: "주문 관리",
      banners: "배너 관리",
      users: "회원 관리",
      shipping: "배송 관리",
    },
    dashboard: {
      totalOrders: "총 주문",
      totalRevenue: "총 매출",
      totalProducts: "총 상품",
      totalUsers: "총 회원",
      recentOrders: "최근 주문",
      lowStock: "재고 부족",
    },
    products: {
      newButton: "상품 등록",
      searchInput: "검색",
      categoryFilter: "카테고리",
      statusFilter: "상태",
    },
    orders: {
      statusFilter: "상태",
      searchInput: "검색",
      dateFilter: "날짜",
    },
    users: {
      searchInput: "검색",
      roleFilter: "역할",
      tierFilter: "등급",
    },
    shipping: {
      statusFilter: "상태",
      carrierFilter: "배송 업체",
      trackingInput: "운송장",
    },
  },
} as const;

// 테스트 대기 시간 (ms)
export const TIMEOUTS = {
  short: 1000,
  medium: 3000,
  long: 5000,
  navigation: 10000,
} as const;

