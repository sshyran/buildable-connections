/**
 * ----------------------------------------------------------------------------------------------------
 * Unblock User by User ID [Run]
 *
 * @description - Unblock user by user id using the Twitter API
 *
 * @author    Buildable Technologies Inc.
 * @access    open
 * @license   MIT
 * @docs      https://developer.twitter.com/en/docs/api-reference-index#twitter-api-v2
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
  const { TWITTER_BEARER_TOKEN, source_user_id, target_user_id } = input;

  verifyInput(input);

  try {
    const { data } = await axios({
      method: "delete",
      url: `https://api.twitter.com/2/users/${source_user_id}/blocking/${target_user_id}`,
      headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
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
  TWITTER_BEARER_TOKEN,
  source_user_id,
  target_user_id,
}) => {
  const ERRORS = {
    INVALID_TWITTER_BEARER_TOKEN:
      "A valid TWITTER_BEARER_TOKEN field (string) was not provided in the input.",
    INVALID_SOURCE_USER_ID:
      "A valid source_user_id field (string) was not provided in the input.",
    INVALID_TARGET_USER_ID:
      "A valid target_user_id field (string) was not provided in the input.",
  };

  if (typeof TWITTER_BEARER_TOKEN !== "string")
    throw new Error(ERRORS.INVALID_TWITTER_BEARER_TOKEN);
  if (typeof source_user_id !== "string")
    throw new Error(ERRORS.INVALID_SOURCE_USER_ID);
  if (typeof target_user_id !== "string")
    throw new Error(ERRORS.INVALID_TARGET_USER_ID);
};