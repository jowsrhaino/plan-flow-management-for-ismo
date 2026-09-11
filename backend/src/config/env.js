const requireEnv = (name) => {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getJwtSecret = () => requireEnv('JWT_SECRET');

module.exports = {
  requireEnv,
  getJwtSecret
};
