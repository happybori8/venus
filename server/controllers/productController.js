const Product = require('../models/Product');
const { PRODUCT_CATEGORIES } = require('../constants/productCategories');

function normalizeCategory(value) {
  if (value == null) return '';
  return String(value).trim().normalize('NFC');
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    상품 목록 조회
// @route   GET /api/products  (?skuPrefix=m-  SKU 접두사 필터)
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 12, skuPrefix } = req.query;
    const query = {};

    if (skuPrefix) {
      const p = String(skuPrefix).trim();
      if (p) query.sku = { $regex: new RegExp(`^${escapeRegex(p)}`, 'i') };
    }
    if (category) query.category = normalizeCategory(category);
    if (search) query.name = { $regex: search, $options: 'i' };

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortBy).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    상품 단건 조회
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    상품 등록 (관리자)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.category = normalizeCategory(data.category);
    if (data.category && !PRODUCT_CATEGORIES.includes(data.category)) {
      return res.status(400).json({
        success: false,
        message: `카테고리는 다음 중 하나여야 합니다: ${PRODUCT_CATEGORIES.join(', ')}`,
      });
    }
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    상품 수정 (관리자)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
      data.category = normalizeCategory(data.category);
      if (data.category && !PRODUCT_CATEGORIES.includes(data.category)) {
        return res.status(400).json({
          success: false,
          message: `카테고리는 다음 중 하나여야 합니다: ${PRODUCT_CATEGORIES.join(', ')}`,
        });
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    상품 삭제 (관리자)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다' });
    }
    res.json({ success: true, message: '상품이 삭제되었습니다' });
  } catch (error) {
    next(error);
  }
};

// @desc    상품 리뷰 작성
// @route   POST /api/products/:id/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: '이미 리뷰를 작성했습니다' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: '리뷰가 등록되었습니다' });
  } catch (error) {
    next(error);
  }
};
