const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { GitHubIntegration } = require('../models');

const encryptionKey = () => {
  // JWT_SECRET keeps local development working; production must set a separate
  // INTEGRATION_ENCRYPTION_KEY so OAuth credentials can be rotated independently.
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret || secret.length < 16) throw new Error('Set INTEGRATION_ENCRYPTION_KEY (or a strong JWT_SECRET) before connecting GitHub.');
  return crypto.createHash('sha256').update(secret).digest();
};
const encrypt = (value) => { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv); const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`; };
const decrypt = (value) => { const [iv, tag, encrypted] = value.split(':').map((part) => Buffer.from(part, 'hex')); const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv); decipher.setAuthTag(tag); return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'); };
const frontend = () => process.env.CLIENT_URL || 'http://localhost:5173';

const connectGitHub = (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) return res.status(503).json({ success: false, error: 'GitHub OAuth is not configured on the server.' });
  const state = jwt.sign({ userId: req.user.id, type: 'github-oauth' }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, redirect_uri: process.env.GITHUB_CALLBACK_URL, scope: 'read:user repo', state });
  res.json({ success: true, data: { authorizationUrl: `https://github.com/login/oauth/authorize?${params.toString()}` } });
};

const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const payload = jwt.verify(state, process.env.JWT_SECRET);
    if (!code || payload.type !== 'github-oauth') throw new Error('Invalid OAuth response');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: process.env.GITHUB_CALLBACK_URL }) });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error(tokenData.error_description || 'GitHub did not return an access token');
    const profileResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'PlanFlow' } });
    const profile = await profileResponse.json();
    if (!profileResponse.ok) throw new Error('Could not read GitHub profile');
    await GitHubIntegration.upsert({ userId: payload.userId, githubLogin: profile.login, githubAvatarUrl: profile.avatar_url, encryptedAccessToken: encrypt(tokenData.access_token), connectedAt: new Date() });
    res.redirect(`${frontend()}/integrations?github=connected`);
  } catch (error) {
    console.error('GitHub OAuth callback failed:', error.message);
    res.redirect(`${frontend()}/integrations?github=error`);
  }
};

const getGitHubStatus = async (req, res) => { const integration = await GitHubIntegration.findOne({ where: { userId: req.user.id }, attributes: ['githubLogin', 'githubAvatarUrl', 'connectedAt'] }); res.json({ success: true, data: integration ? { connected: true, ...integration.toJSON() } : { connected: false } }); };
const getRepositories = async (req, res) => { try { const integration = await GitHubIntegration.findOne({ where: { userId: req.user.id } }); if (!integration) return res.status(404).json({ success: false, error: 'GitHub is not connected.' }); const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', { headers: { Authorization: `Bearer ${decrypt(integration.encryptedAccessToken)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'PlanFlow' } }); const repos = await response.json(); if (!response.ok) throw new Error('GitHub repository request failed'); res.json({ success: true, data: repos.map((repo) => ({ id: repo.id, name: repo.name, fullName: repo.full_name, private: repo.private, updatedAt: repo.updated_at, url: repo.html_url, openIssues: repo.open_issues_count, language: repo.language })) }); } catch (error) { res.status(502).json({ success: false, error: error.message }); } };
const disconnectGitHub = async (req, res) => { await GitHubIntegration.destroy({ where: { userId: req.user.id } }); res.json({ success: true }); };
module.exports = { connectGitHub, githubCallback, getGitHubStatus, getRepositories, disconnectGitHub };
