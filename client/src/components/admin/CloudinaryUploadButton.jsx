import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { loadCloudinaryWidgetScript, openCloudinaryUploadWidget } from '../../lib/cloudinaryWidget'
import { cloudinarySignUpload } from '../../api/adminApi'

function errorMessage(err) {
  if (err == null) return '알 수 없는 오류'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  return String(err)
}

export default function CloudinaryUploadButton({ onUploaded, disabled }) {
  const [busy, setBusy] = useState(false)

  const handleClick = useCallback(async () => {
    const cloudName = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()
    const uploadPreset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim()
    const apiKey = String(import.meta.env.VITE_CLOUDINARY_API_KEY || '').trim()
    const useSigned = String(import.meta.env.VITE_CLOUDINARY_USE_SIGNED || '').toLowerCase() === 'true'

    if (!cloudName) {
      toast.error('client/.env에 VITE_CLOUDINARY_CLOUD_NAME 을 설정하세요.')
      return
    }

    const signedMode = useSigned && apiKey
    const unsignedMode = !signedMode && uploadPreset

    if (!signedMode && !unsignedMode) {
      toast.error('Cloudinary: 비서명 프리셋 또는 서명용 API 설정이 필요합니다.(.env 안내 확인)')
      return
    }

    setBusy(true)
    try {
      await loadCloudinaryWidgetScript()

      const onSuccess = (url) => {
        onUploaded?.(url)
        toast.success('이미지가 업로드되어 목록에 추가되었습니다')
      }

      const onWidgetError = (err) => {
        console.error(err)
        toast.error(`업로드 실패: ${errorMessage(err)}`)
      }

      if (signedMode) {
        openCloudinaryUploadWidget({
          cloudName,
          apiKey,
          getSignature: async (paramsToSign) => {
            try {
              const { data } = await cloudinarySignUpload(paramsToSign)
              if (!data?.signature) {
                throw new Error(data?.message || '서명을 받지 못했습니다')
              }
              return data.signature
            } catch (e) {
              const msg = e?.response?.data?.message || e?.message || '서명 요청 실패'
              console.error('Cloudinary sign:', e?.response?.data || e)
              toast.error(msg)
              throw new Error(msg)
            }
          },
          onSuccess,
          onError: onWidgetError,
        })
      } else {
        openCloudinaryUploadWidget({
          cloudName,
          uploadPreset,
          onSuccess,
          onError: onWidgetError,
        })
      }
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || e?.message || 'Cloudinary 위젯을 열 수 없습니다')
    } finally {
      setBusy(false)
    }
  }, [onUploaded])

  return (
    <button type="button" className="admin-btn admin-btn-ghost" onClick={handleClick} disabled={disabled || busy}>
      {busy ? '준비 중…' : 'Cloudinary에 업로드 (선택)'}
    </button>
  )
}
