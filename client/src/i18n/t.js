import { STRINGS } from './homeStrings'

/** UI 문자열 조회 (한국어만) */
export function t(key, vars) {
  let s = STRINGS[key] ?? key
  if (vars && typeof s === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      s = s.split(`{${k}}`).join(String(v))
    })
  }
  return s
}
