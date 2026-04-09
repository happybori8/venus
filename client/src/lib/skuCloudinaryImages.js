/**
 * Cloudinary에 업로드한 파일명이 SKU와 동일한 규칙일 때 URL 생성
 * 예: public_id 가 `venus-shop/m-1` 이면 메인, `venus-shop/m-1_2` ~ `m-1_20` 은 상세 스토리 이미지
 */

function encodeCloudinaryPath(segments) {
  return segments
    .filter(Boolean)
    .map((s) => encodeURIComponent(String(s)))
    .join('/')
}

/**
 * @param {string} sku
 * @param {string} [suffix]  '' | '_2' | '_3' ...
 */
export function cloudinarySkuImageUrl(sku, suffix = '') {
  const cloud = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()
  const folder = String(import.meta.env.VITE_CLOUDINARY_SKU_IMAGE_FOLDER || 'venus-shop')
    .trim()
    .replace(/^\/+|\/+$/g, '')
  if (!cloud || !sku) return null
  const base = String(sku).trim()
  const fileBase = suffix ? `${base}${suffix}` : base
  const path = encodeCloudinaryPath([folder, fileBase])
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${path}`
}

/** DB images 우선. 없으면 SKU 기준 메인 1장만 */
export function resolveProductGalleryImages(product) {
  const db = Array.isArray(product?.images)
    ? product.images.map((x) => String(x).trim()).filter(Boolean)
    : []
  if (db.length) return db
  const one = cloudinarySkuImageUrl(product?.sku)
  return one ? [one] : []
}

/**
 * 긴 스토리 영역: DB에 여러 장이면 2번째부터 사용.
 * 한 장뿐(또는 없음)이면 Cloudinary에서 `{sku}_2` … `{sku}_N` 후보를 시도(로드 실패 시 숨김)
 */
export function getStoryImageCandidates(product, maxAuto = 20) {
  const db = Array.isArray(product?.images)
    ? product.images.map((x) => String(x).trim()).filter(Boolean)
    : []
  if (db.length > 1) return db.slice(1).map((url) => ({ url, key: url }))

  if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || !product?.sku) return []

  const sku = String(product.sku).trim()
  const out = []
  for (let i = 2; i <= maxAuto; i++) {
    const url = cloudinarySkuImageUrl(sku, `_${i}`)
    if (url) out.push({ url, key: `${sku}_${i}` })
  }
  return out
}
