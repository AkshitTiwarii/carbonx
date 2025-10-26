// Minimal shim for @react-native-async-storage/async-storage used in some SDKs
// Exports a no-op async storage API so bundlers/SDKs that import it won't fail.

module.exports = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
};
