/**
 * ----------------------------------------------------------------------------------------------------
 * Mint NFT [Run]
 *
 * @description - Mint nft using the Tatum API
 *
 * @author    Buildable Technologies Inc.
 * @access    open
 * @license   MIT
 * @docs      https://tatum.io/apidoc.php#operation/NftMintErc721
 *
 * ----------------------------------------------------------------------------------------------------
 */

const axios = require("axios");

/**
 * The Node’s executable function
 *
 * @param {Run} input - Data passed to your Node from the input function
 */
const run = async (input) => {
  const {
    TATUM_API_URL,
    TATUM_API_KEY,
    fromPrivateKey,
    url,
    to,
    tokenId,
    chain,
    testnetType,
    contractAddress,
    erc20,
    provenance,
    authorAddresses,
    cashbackValues,
    fixedValues,
    nonce,
    fee,
  } = input;

  verifyInput(input);

  try {
    const { data } = await axios({
      method: "post",
      url: `${TATUM_API_URL}/v3/nft/mint`,
      headers: {
        "x-api-key": `${TATUM_API_KEY}`,
        ...(testnetType ? { "x-testnet-type": `${testnetType}` } : {}),
      },
      params: {},
      data: {
        fromPrivateKey,
        url,
        to,
        tokenId,
        chain,
        ...(contractAddress ? { contractAddress } : {}),
        ...(erc20 ? { erc20 } : {}),
        ...(provenance ? { provenance } : {}),
        ...(authorAddresses ? { authorAddresses } : {}),
        ...(cashbackValues ? { cashbackValues } : {}),
        ...(fixedValues ? { fixedValues } : {}),
        ...(nonce ? { nonce } : {}),
        ...(fee ? { fee } : {}),
      },
    });

    return data;
  } catch (error) {
    return {
      failed: true,
      message: error.message,
      data: error.response.data,
    };
  }
};

/**
 * Verifies the input parameters
 */
const verifyInput = ({
  TATUM_API_KEY,
  TATUM_API_URL,
  fromPrivateKey,
  url,
  to,
  tokenId,
  chain,
}) => {
  const ERRORS = {
    INVALID_TATUM_API_KEY:
      "A valid TATUM_API_KEY field (string) was not provided in the input.",
    INVALID_TATUM_API_URL:
      "A valid TATUM_API_URL field (string) was not provided in the input.",
    INVALID_FROM_PRIVATE_KEY:
      "A valid fromPrivateKey field (string) was not provided in the input.",
    INVALID_URL: "A valid url field (string) was not provided in the input.",
    INVALID_TO: "A valid to field (string) was not provided in the input.",
    INVALID_TOKEN_ID:
      "A valid tokenId field (string) was not provided in the input.",
    INVALID_CHAIN:
      "A valid chain field (string) was not provided in the input.",
  };

  if (typeof TATUM_API_KEY !== "string")
    throw new Error(ERRORS.INVALID_TATUM_API_KEY);
  if (typeof TATUM_API_URL !== "string")
    throw new Error(ERRORS.INVALID_TATUM_API_URL);
  if (typeof fromPrivateKey !== "string")
    throw new Error(ERRORS.INVALID_FROM_PRIVATE_KEY);
  if (typeof url !== "string") throw new Error(ERRORS.INVALID_URL);
  if (typeof to !== "string") throw new Error(ERRORS.INVALID_TO);
  if (typeof tokenId !== "string") throw new Error(ERRORS.INVALID_TOKEN_ID);
  if (typeof chain !== "string") throw new Error(ERRORS.INVALID_CHAIN);
};
