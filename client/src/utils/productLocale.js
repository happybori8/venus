/**
 * 상품 표시명·설명 (한국어 필드만 사용)
 * @param {object} product
 */
export function getProductName(product) {
  if (!product) return ''
  return (
    (product.name && String(product.name).trim()) ||
    (product.nameKo && String(product.nameKo).trim()) ||
    ''
  )
}

export function getProductDescription(product) {
  if (!product) return ''
  const d = product.description
  return (d && String(d).trim()) || ''
}
