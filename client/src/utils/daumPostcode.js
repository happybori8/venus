const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

let loadPromise = null;

function loadDaumPostcodeScript() {
  if (typeof window !== 'undefined' && window.daum?.Postcode) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const done = () => {
      if (window.daum?.Postcode) resolve();
      else reject(new Error('Postcode API missing'));
    };
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (window.daum?.Postcode) {
        done();
      } else {
        existing.addEventListener('load', done);
        existing.addEventListener('error', () => reject(new Error('postcode script')));
      }
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = done;
    s.onerror = () => reject(new Error('postcode script'));
    document.head.appendChild(s);
  });
  return loadPromise;
}

/**
 * 카카오(다음) 우편번호 팝업. 사용자가 주소를 고르면 폼에 넣을 값 반환, 취소 시 null.
 * @returns {Promise<{ zipCode: string, city: string, street: string } | null>}
 */
export function openDaumPostcode() {
  return new Promise((resolve, reject) => {
    loadDaumPostcodeScript()
      .then(() => {
        if (!window.daum?.Postcode) {
          reject(new Error('Postcode unavailable'));
          return;
        }
        let settled = false;
        const finish = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };

        new window.daum.Postcode({
          oncomplete: (data) => {
            const extra = data.buildingName ? ` (${data.buildingName})` : '';
            const street = `${data.roadAddress || data.jibunAddress || ''}${extra}`.trim();
            const city = [data.sido, data.sigungu].filter(Boolean).join(' ').trim();
            finish({
              zipCode: String(data.zonecode || '').trim(),
              city,
              street,
            });
          },
          onclose: (state) => {
            if (state === 'FORCE_CLOSE') finish(null);
          },
        }).open();
      })
      .catch(reject);
  });
}
