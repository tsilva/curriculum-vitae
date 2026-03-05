export const versionInfo = {
  buildDate: new Date().toISOString(),
  gitCommit: process.env.GIT_COMMIT_HASH || 'dev',
};
