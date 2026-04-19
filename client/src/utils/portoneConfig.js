/**
 * PortOne V2 결제 설정.
 * KG이니시스 등: PC는 INIStdPay(iframe 등), 모바일 웹은 리다이렉션·모바일 채널이 필요할 수 있음.
 * @see https://developers.portone.io/sdk/ko/v2-sdk/payment-request
 */

export function isLikelyMobileBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPhone, iPad, iOS Chrome(CriOS), Firefox iOS(FxiOS), Android 등
  if (/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|CriOS|FxiOS/i.test(ua)) {
    return true;
  }
  if (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) {
    return true;
  }
  return false;
}

/**
 * 모바일(iOS Safari 등)에서 결제창 표시를 위해 필수에 가깝습니다.
 * 리다이렉트 방식일 때는 이 URL로 복귀하며 쿼리로 paymentId 등이 붙습니다.
 */
export function getPortOneRedirectUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/payment/callback`;
}

export function getPortOneStoreId() {
  return import.meta.env.VITE_PORTONE_STORE_ID || 'store-27f79d89-3fe2-450b-9186-0e429bb9befc';
}

/**
 * PC/모바일 채널 분리 시: Vercel 등에 VITE_PORTONE_CHANNEL_KEY_MOBILE 설정.
 * 미설정 시 PC용 키와 동일(모바일 전용 채널을 콘솔에서 만든 뒤 env에 넣는 것을 권장).
 */
export function getPortOneChannelKey() {
  const desktop =
    import.meta.env.VITE_PORTONE_CHANNEL_KEY || 'channel-key-3eb55181-75ab-4e79-b6c3-2e96b5662439';
  const mobileOnly = import.meta.env.VITE_PORTONE_CHANNEL_KEY_MOBILE;
  if (isLikelyMobileBrowser() && mobileOnly) {
    return mobileOnly;
  }
  return desktop;
}

/** 모바일: PG가 허용하면 리다이렉션 결제창(PC용 INIStdPay iframe과 구분). */
export function getPortOneWindowType() {
  if (!isLikelyMobileBrowser()) return undefined;
  return { mobile: 'REDIRECTION' };
}

const pendingPrefix = 'portone_pending_';

/** PG 리다이렉트 복귀 후 주문 생성에 쓰는 임시 데이터 (iOS Safari 등에서 sessionStorage만 비는 경우 대비해 localStorage에도 저장). */
export function setPortOnePendingPayload(paymentId, payload) {
  const key = pendingPrefix + paymentId;
  const blob = JSON.stringify(payload);
  try {
    sessionStorage.setItem(key, blob);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(key, blob);
  } catch {
    /* quota / private mode */
  }
}

export function peekPortOnePendingPayload(paymentId) {
  const key = pendingPrefix + paymentId;
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

export function clearPortOnePendingPayload(paymentId) {
  const key = pendingPrefix + paymentId;
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}
