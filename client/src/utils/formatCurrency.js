/** 금액 표시 (원화) */
export function formatCurrency(amount) {
  const n = Number(amount ?? 0)
  return `${n.toLocaleString('ko-KR')}원`
}
