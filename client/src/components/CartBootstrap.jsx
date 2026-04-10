import { useLayoutEffect, useEffect } from 'react'
import useCartStore from '../store/cartStore'

/**
 * 스토어 모듈 최초 평가 시점과 토큰/유저 타이밍이 어긋나면 잘못된 슬롯을 읽을 수 있어,
 * 마운트 직후·다른 탭에서 token/user 변경 시 항상 localStorage와 재동기화합니다.
 */
export default function CartBootstrap() {
  useLayoutEffect(() => {
    useCartStore.getState().reloadFromStorage()
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        useCartStore.getState().reloadFromStorage()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        useCartStore.getState().reloadFromStorage()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return null
}
