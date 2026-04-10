import { create } from 'zustand';
import { getCartAccountId } from '../utils/authStorage';
import {
  migrateLegacyCartStorage,
  mergeCartItemLists,
  readCartItemsForKey,
  writeCartSnapshot,
  persistCurrentCartForUserId,
} from '../utils/cartStorage';

migrateLegacyCartStorage();

/** JWT `id` 우선 — user JSON과 어긋나도 계정별로 장바구니 분리 */
function currentUserId() {
  return getCartAccountId();
}

function loadItems() {
  return readCartItemsForKey(currentUserId());
}

function saveItems(items) {
  writeCartSnapshot(currentUserId(), items);
}

const useCartStore = create((set, get) => ({
  /** 초기값은 빈 배열 — CartBootstrap에서 JWT·user 반영 후 reloadFromStorage로 채움 */
  items: [],

  /** 내부: 상태 + localStorage 동시 반영 */
  _replaceItems: (items) => {
    const next = Array.isArray(items) ? items : [];
    set({ items: next });
    saveItems(next);
  },

  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find((i) => i._id === product._id);
    let next;
    if (existing) {
      next = items.map((i) =>
        i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      next = [...items, { ...product, quantity }];
    }
    get()._replaceItems(next);
  },

  removeItem: (id) => {
    get()._replaceItems(get().items.filter((i) => i._id !== id));
  },

  removeItemsByIds: (ids) => {
    const setIds = new Set(ids);
    get()._replaceItems(get().items.filter((i) => !setIds.has(i._id)));
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) return;
    get()._replaceItems(
      get().items.map((i) => (i._id === id ? { ...i, quantity } : i))
    );
  },

  clearCart: () => {
    get()._replaceItems([]);
  },

  /**
   * 로그인/회원가입 직후: 세션 게스트(localStorage가 아닌 sessionStorage) + 해당 계정 저장분 병합
   * (메모리 스냅샷은 사용하지 않음 — 이전 로그아웃 고객의 장바구니가 메모리에 남아 섞이는 것 방지)
   */
  hydrateCartAfterAuth: () => {
    const uid = getCartAccountId();
    if (!uid) return;
    const fromGuest = readCartItemsForKey(null);
    const savedForUser = readCartItemsForKey(uid);
    const merged = mergeCartItemLists(fromGuest, savedForUser);
    set({ items: merged });
    writeCartSnapshot(uid, merged);
    writeCartSnapshot(null, []);
  },

  /** 로그아웃 직전: 현재 목록을 로그인 중인 사용자 키에 확실히 기록 */
  beforeLogoutPersist: () => {
    const uid = getCartAccountId();
    if (uid) {
      persistCurrentCartForUserId(uid, get().items);
    }
  },

  /**
   * 로그아웃 직후:
   * 이전 로그인 사용자의 카트가 다음 사용자(또는 게스트)로 이어지지 않도록 게스트 카트를 비움.
   */
  loadGuestCart: () => {
    set({ items: [] });
    writeCartSnapshot(null, []);
  },

  /**
   * 앱이 다른 탭에서 user를 바꾼 경우 등 — 필요 시 새로고침 없이 동기화
   * (선택: 페이지 포커스 시 호출 가능)
   */
  reloadFromStorage: () => {
    set({ items: loadItems() });
  },
}));

export default useCartStore;
