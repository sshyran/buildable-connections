/**
 * ----------------------------------------------------------------------------------------------------
 * Update Row [Run]
 *
 * @description - Update a row by its ID in a PostgreSQL table
 *
 * @author    Buildable Technologies Inc.
 * @access    open
 * @license   MIT
 * @docs      https://knexjs.org
 *
 * ----------------------------------------------------------------------------------------------------
 */

const { getConnection } = require("@buildable/knex");

/**
 * The Node’s executable function
 *
 * @param {Run} input - Data passed to your Node from the input function
 */
const run = async (input) => {
  const { POSTGRESQL_CONNECTION_KEY, tableName, id, ...fieldsToUpdate } = input;

  verifyInput(input);

  try {
    const db = await getConnection(POSTGRESQL_CONNECTION_KEY);

    const results = await db(tableName)
      .where({ id })
      .update({ ...fieldsToUpdate });

    return results;
  } catch (error) {
    return {
      failed: true,
      message: error.message,
      data: {
        ...error.data,
      },
    };
  }
};

const verifyInput = ({ POSTGRESQL_CONNECTION_KEY, tableName, id }) => {
  const ERRORS = {
    NO_POSTGRESQL_CONNECTION_KEY: `A valid POSTGRESQL_CONNECTION_KEY is required. 
                                You can add one to your environment variables at 
                                https://app.buildable.dev/settings/environment-variables. 
                                You may also need to add a PostgreSQL Datasource to your project.`,
    NO_TABLE_NAME: "A valid tableName name is required.",
    NO_ID: "A valid id is required.",
  };

  if (!POSTGRESQL_CONNECTION_KEY) throw new Error(ERRORS.NO_POSTGRESQL_CONNECTION_KEY);
  if (!tableName || typeof tableName !== "string") throw new Error(ERRORS.NO_TABLE_NAME);
  if (!id) throw new Error(ERRORS.NO_ID);
};
