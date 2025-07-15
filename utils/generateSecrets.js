const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecrets() {
  const jwtSecret = generateSecret(64);
  const jwtRefreshSecret = generateSecret(64);
  
  console.log('=== Generated JWT Secrets ===');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
  console.log('==============================');
  console.log('Скопируйте эти строки в ваш .env файл');
  
  return {
    JWT_SECRET: jwtSecret,
    JWT_REFRESH_SECRET: jwtRefreshSecret
  };
}

function getDynamicSecret(uid, timestamp) {
  const baseSecret = process.env.FIREBASE_PROJECT_ID || 'onway-f988e';
  const dynamicString = `${baseSecret}_${uid}_${timestamp}`;
  return crypto.createHash('sha256').update(dynamicString).digest('hex');
}

if (require.main === module) {
  generateJWTSecrets();
}

module.exports = { 
  generateJWTSecrets, 
  generateSecret, 
  getDynamicSecret 
};