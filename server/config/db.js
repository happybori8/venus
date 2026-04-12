const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

/** 로컬 개발용 기본값 (MONGODB_ATLAS_URI·MONGO_URI 모두 없을 때만 사용) */
const LOCAL_MONGO_DEFAULT = 'mongodb://127.0.0.1:27017/venus';

function resolveMongoUri() {
  const atlas = process.env.MONGODB_ATLAS_URI?.trim();
  if (atlas) return { uri: atlas, source: 'MONGODB_ATLAS_URI' };
  const legacy = process.env.MONGO_URI?.trim();
  if (legacy) return { uri: legacy, source: 'MONGO_URI' };
  return { uri: LOCAL_MONGO_DEFAULT, source: '로컬 기본값' };
}

const connectDB = async () => {
  try {
    const { uri, source } = resolveMongoUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB 연결 성공 [${source}]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB 연결 실패: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
