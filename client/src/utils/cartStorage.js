/** zustand persist와 동일한 스냅샷 형식 */
const PERSIST_VERSION = 0
const PREFIX = 'venus-cart-v2'
const V1_PREFIX = 'venus-cart-v1'
const LEGACY_KEY = 'cart-storage'

/** 로그인 사용자: localStorage(기기·브라우저 간 유지). 게스트: sessionStorage(탭·세션 단위, PC 공유 시 이전 고객과 섞이지 않게) */
export function getCartStorageKey(userId) {
  if (userId) return `${PREFIX}:${String(userId)}`
  return `${PREFIX}:guest`
}

function guestReadRaw() {
  const key = getCartStorageKey(null)
  return (
    sessionStorage.getItem(key) ??
    localStorage.getItem(key) /* 구버전 마이그레이션·첫 읽기 */
  )
}

function guestWriteRaw(blob) {
  const key = getCartStorageKey(null)
  sessionStorage.setItem(key, blob)
  localStorage.removeItem(key)
}

/**
 * v1·구 키를 v2로 옮기고 삭제.
 * 예: venus-cart-v1:uid, venus-cart-v1-uid(하이픈), venus-cart-v1:guest, cart-storage
 */
export function migrateLegacyCartStorage() {
  try {
    const guestKeyV2 = getCartStorageKey(null)

    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy && !guestReadRaw()) {
      guestWriteRaw(legacy)
    }
    if (legacy) localStorage.removeItem(LEGACY_KEY)

    const lsGuest = localStorage.getItem(guestKeyV2)
    if (lsGuest && !sessionStorage.getItem(guestKeyV2)) {
      sessionStorage.setItem(guestKeyV2, lsGuest)
      localStorage.removeItem(guestKeyV2)
    }

    const allKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) allKeys.push(k)
    }
    const keysToRemove = []
    for (const k of allKeys) {
      if (k === LEGACY_KEY) continue
      if (!k.startsWith(V1_PREFIX)) continue

      let rest = null
      if (k.startsWith(`${V1_PREFIX}:`)) {
        rest = k.slice(V1_PREFIX.length + 1)
      } else if (k.startsWith(`${V1_PREFIX}-`)) {
        rest = k.slice(V1_PREFIX.length + 1)
      } else {
        continue
      }

      const userId = rest === 'guest' ? null : rest
      const v2key = getCartStorageKey(userId)
      const val = localStorage.getItem(k)
      if (val == null) continue
      if (userId) {
        if (!localStorage.getItem(v2key)) localStorage.setItem(v2key, val)
      } else if (!guestReadRaw()) {
        guestWriteRaw(val)
      }
      keysToRemove.push(k)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export function parsePersistedCartItems(raw) {
  if (raw == null || raw === '') return []
  try {
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    const items = state?.items
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function readCartItemsForKey(userId) {
  const raw = userId
    ? localStorage.getItem(getCartStorageKey(userId))
    : guestReadRaw()
  return parsePersistedCartItems(raw)
}

/** 동일 상품은 수량 합산 */
export function mergeCartItemLists(...lists) {
  const map = new Map()
  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (!item?._id) continue
      const id = String(item._id)
      const q = Math.max(1, Number(item.quantity) || 1)
      const prev = map.get(id)
      if (prev) {
        map.set(id, { ...prev, quantity: prev.quantity + q })
      } else {
        map.set(id, { ...item, quantity: q })
      }
    }
  }
  return Array.from(map.values())
}

export function writeCartSnapshot(userId, items) {
  const blob = JSON.stringify({
    state: { items: Array.isArray(items) ? items : [] },
    version: PERSIST_VERSION,
  })
  if (userId) {
    localStorage.setItem(getCartStorageKey(userId), blob)
  } else {
    guestWriteRaw(blob)
  }
}

/** persist setItem이 잘못된 키에 쓰기 전에, 로그아웃 시 현재 세션 장바구니를 확실히 해당 사용자 키에 기록 */
export function persistCurrentCartForUserId(userId, items) {
  if (!userId) return
  writeCartSnapshot(userId, items)
}

/**
 * localStorage에 남은 다른 계정·구버전 guest 키를 지워, 동일 JSON이 여러 키에 복제된 것처럼 보이는 상태를 정리.
 * (한 origin에는 토큰이 하나이므로 활성 계정 하나만 유지해도 됨.)
 */
export function pruneStaleCartKeys(keepUserId) {
  if (!keepUserId) return
  try {
    const keepKey = getCartStorageKey(keepUserId)
    const prefix = `${PREFIX}:`
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(prefix)) continue
      if (k !== keepKey) toRemove.push(k)
    }
    toRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
