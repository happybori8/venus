export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * API는 `user.id`, Mongoose 문서는 `_id`로 올 수 있음 — 장바구니 등 계정 구분용
 * @returns {string|null}
 */
export function getStoredUserId() {
  const u = getStoredUser()
  if (!u) return null
  const id = u._id ?? u.id
  return id != null ? String(id) : null
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token).split('.')
    if (parts.length < 2) return null
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) base64 += '='.repeat(4 - pad)
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * JWT `id`가 객체·ObjectId 형태로 올 때 `String(id)` → "[object Object]" 가 되어
 * 모든 사용자가 `venus-cart-v2:[object Object]` 한 키를 공유하는 문제 방지
 */
function normalizeObjectIdLike(raw) {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const t = raw.trim()
    return t || null
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw)
  }
  if (typeof raw === 'object') {
    if (typeof raw.$oid === 'string' && raw.$oid.trim()) return raw.$oid.trim()
    if (typeof raw.id === 'string' && raw.id.trim()) return raw.id.trim()
    if (typeof raw._id === 'string' && raw._id.trim()) return raw._id.trim()
    if (typeof raw.toHexString === 'function') {
      const h = raw.toHexString()
      if (typeof h === 'string' && h.trim()) return h.trim()
    }
  }
  const s = String(raw).trim()
  if (!s || s === '[object Object]') return null
  return s
}

/**
 * 서버 JWT 페이로드의 `id` (authController generateToken({ id: user._id }))
 * localStorage `user` 형식과 무관하게 로그인 세션 기준으로 계정을 맞춤
 */
export function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = decodeJwtPayload(token)
    if (!payload || typeof payload !== 'object') return null
    return normalizeObjectIdLike(payload.id)
  } catch {
    return null
  }
}

/**
 * 장바구니 저장 키에 쓸 계정 ID — 오직 유효한 JWT가 있을 때만 사용자별 슬롯 사용.
 * 토큰이 없으면 항상 게스트(세션) 슬롯. localStorage `user`만 남은 경우 다른 계정 장바구니와 섞이지 않게 함.
 * @returns {string|null} null 이면 비로그인(게스트) 슬롯
 */
export function getCartAccountId() {
  const token = localStorage.getItem('token')
  if (!token) return null
  const fromToken = getUserIdFromToken()
  if (fromToken) return fromToken
  return getStoredUserId()
}
