// ESLint 9 and some plugins still require the callable CommonJS API.
const entry = require.resolve("minimatch");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Adapt the CommonJS export before ESLint loads.
const api = require(entry);

if (typeof api !== "function") {
  const callable = Object.assign(api.minimatch, api);
  callable.default = callable;
  Object.defineProperty(callable, "__esModule", { value: true });
  require.cache[entry].exports = callable;
}
