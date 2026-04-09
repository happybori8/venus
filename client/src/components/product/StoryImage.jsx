import { useState } from 'react'

/** Cloudinary SKU 후보 URL 등 — 로드 실패 시 행 자체를 숨김 */
export default function StoryImage({ url, imgClassName }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !url) return null
  return (
    <figure className="pd-story-figure">
      <img
        src={url}
        alt=""
        className={imgClassName || 'pd-story-img'}
        loading="lazy"
        decoding="async"
        onError={() => setVisible(false)}
      />
    </figure>
  )
}
