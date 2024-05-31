const bitcore = require('bitcore-lib');

// Function to create a legacy wallet
function createLegacyWallet(network) {
  const keyPair = bitcore.PrivateKey.random();
  const address = keyPair.toAddress(network).toString();
  return {
    privateKey: keyPair.toString(),
    address: address
  };
}

module.exports = {
  createLegacyWallet
};
