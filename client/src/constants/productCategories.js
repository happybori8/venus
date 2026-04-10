/** 서버 `server/constants/productCategories.js` 와 동일한 목록 유지 */
export const PRODUCT_CATEGORIES = ['마스크팩', '클렌저', '크림']

export function getCategoryLabel(cat) {
  return cat || ''
}
