const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldLabel = { sku: 'SKU' };
    error.message = `이미 사용 중인 ${fieldLabel[field] || field}입니다`;
    return res.status(400).json({ success: false, message: error.message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: '리소스를 찾을 수 없습니다' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || '서버 오류가 발생했습니다',
  });
};

module.exports = errorHandler;
