/** 장바구니/주문 금액 — 상품 정가·할인가 기준 */

export function getSaleUnitPrice(item) {
  const d = Number(item.discountPrice);
  return d > 0 ? d : Number(item.price ?? 0);
}

export function getListUnitPrice(item) {
  return Number(item.price ?? 0);
}

export function hasLineDiscount(item) {
  return Number(item.discountPrice) > 0;
}
