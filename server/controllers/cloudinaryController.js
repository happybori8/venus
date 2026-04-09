const cloudinary = require('cloudinary').v2;

function trimEnv(v) {
  if (v == null) return '';
  return String(v).trim().replace(/\r$/, '');
}

/** @returns {{ secret: string }} */
function ensureConfig() {
  const name = trimEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const key = trimEnv(process.env.CLOUDINARY_API_KEY);
  const secret = trimEnv(process.env.CLOUDINARY_API_SECRET);
  if (!name || !key || !secret) {
    const err = new Error(
      '서버에 CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET 를 server/.env 에 설정하세요'
    );
    err.statusCode = 503;
    throw err;
  }
  cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret,
  });
  return { secret };
}

/** Cloudinary 규칙: `file`(로컬 바이너리·원격 URL)은 서명에 포함하지 않음 */
function paramsForUploadSignature(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const params = { ...raw };
  delete params.file;
  delete params.signature;
  return params;
}

/** POST /api/cloudinary/sign — Upload Widget 서명 업로드용 (관리자만) */
exports.signUpload = (req, res, next) => {
  try {
    const { secret } = ensureConfig();
    let raw = req.body.params_to_sign;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return res.status(400).json({ success: false, message: 'params_to_sign 파싱 실패' });
      }
    }
    const params = paramsForUploadSignature(raw);
    if (!params || Object.keys(params).length === 0) {
      return res.status(400).json({ success: false, message: 'params_to_sign 객체가 필요합니다' });
    }
    let signature;
    try {
      signature = cloudinary.utils.api_sign_request(params, secret);
    } catch (signErr) {
      const msg = String(signErr.message || signErr);
      const hint =
        /wrong|invalid|cloud/i.test(msg) || msg.includes('Cloud name')
          ? 'Cloud name·API Key·Secret이 Cloudinary 대시보드(동일 계정)와 일치하는지 확인하세요. 비서명 업로드는 client/.env 에서 VITE_CLOUDINARY_USE_SIGNED=false 와 Upload preset 을 쓰면 서버 서명이 필요 없습니다.'
          : msg;
      console.error('Cloudinary api_sign_request:', signErr);
      return res.status(400).json({ success: false, message: hint, errors: { message: msg } });
    }
    res.json({ success: true, signature });
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }
    next(error);
  }
};
