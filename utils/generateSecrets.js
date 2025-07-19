const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecrets() {
  const jwtSecret = generateSecret(64);
  const jwtRefreshSecret = generateSecret(64);
  
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