/** Cloudinary Upload Widget v2 — 스크립트 로드 및 위젯 실행 */

const SCRIPT_URL = 'https://upload-widget.cloudinary.com/latest/global/all.js'

let scriptPromise = null

export function loadCloudinaryWidgetScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저에서만 사용할 수 있습니다'))
  }
  if (window.cloudinary?.createUploadWidget) {
    return Promise.resolve()
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`)
      if (existing) {
        const done = () => {
          if (window.cloudinary?.createUploadWidget) resolve()
          else reject(new Error('Cloudinary 스크립트 로드 실패'))
        }
        if (window.cloudinary?.createUploadWidget) {
          done()
          return
        }
        existing.addEventListener('load', done)
        existing.addEventListener('error', () => reject(new Error('Cloudinary 스크립트 로드 실패')))
        return
      }
      const s = document.createElement('script')
      s.src = SCRIPT_URL
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Cloudinary 스크립트 로드 실패'))
      document.body.appendChild(s)
    })
  }
  return scriptPromise.then(() => {
    if (!window.cloudinary?.createUploadWidget) {
      throw new Error('Cloudinary 위젯 API를 찾을 수 없습니다')
    }
  })
}

/**
 * @param {object} opts
 * @param {string} opts.cloudName
 * @param {string} [opts.uploadPreset] — unsigned 업로드 시 필수
 * @param {string} [opts.apiKey] — 서명 업로드 시 필수 (공개 API Key)
 * @param {(params: object) => Promise<string>} [opts.getSignature] — 서명 업로드 시 필수
 * @param {(secureUrl: string) => void} opts.onSuccess
 * @param {(err: unknown) => void} [opts.onError]
 */
export function openCloudinaryUploadWidget({
  cloudName,
  uploadPreset,
  apiKey,
  getSignature,
  onSuccess,
  onError,
}) {
  const cloudinary = window.cloudinary
  if (!cloudinary?.createUploadWidget) {
    onError?.(new Error('Cloudinary 위젯을 사용할 수 없습니다'))
    return
  }

  const base = {
    cloudName,
    sources: ['local', 'url', 'camera'],
    multiple: true,
    maxFiles: 12,
    resourceType: 'image',
    // 형식 제한을 두면 URL/원격 업로드가 막히는 경우가 있어 두지 않음
    showAdvancedOptions: false,
    showUploadMoreButton: true,
  }

  let widgetOptions
  if (getSignature && apiKey) {
    widgetOptions = {
      ...base,
      apiKey: String(apiKey).trim(),
      uploadSignature: async (callback, paramsToSign) => {
        try {
          const signature = await getSignature(paramsToSign)
          callback(signature)
        } catch (e) {
          onError?.(e)
          callback(null)
        }
      },
    }
  } else if (uploadPreset) {
    widgetOptions = {
      ...base,
      uploadPreset: String(uploadPreset).trim(),
    }
  } else {
    onError?.(new Error('uploadPreset(비서명) 또는 apiKey+서명 API(서명) 설정이 필요합니다'))
    return
  }

  const widget = cloudinary.createUploadWidget(widgetOptions, (error, result) => {
    if (error) {
      onError?.(error)
      return
    }
    if (!result) return
    if (result.event === 'success' && result.info?.secure_url) {
      onSuccess(result.info.secure_url)
    }
  })

  widget.open()
}
