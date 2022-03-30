/**
 * ----------------------------------------------------------------------------------------------------
 * Get Document [Input]
 *
 * @author    Buildable Technologies Inc.
 * @access    open
 * @license   MIT
 * @docs      https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
 *
 * ----------------------------------------------------------------------------------------------------
 */

/**
 * Lets you select the input for your Node's run function
 *
 * @param {Params} params
 * @param {Object} $trigger - This Flow's request object
 * @param {Object} $nodes - Data from above Nodes
 */
const nodeInput = ({ $trigger, $nodes }) => {
  return {
    FIRESTORE_CONNECTION_KEY: $trigger.env.FIRESTORE_CONNECTION_KEY, // Required
    collection: "collection-1", // Required
    id: "61d62cf94bed0700133c866a", // Required
  };
};
