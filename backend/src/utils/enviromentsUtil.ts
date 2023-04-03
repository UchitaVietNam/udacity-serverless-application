/**
 * Get enviroments
 * @returns enviroments
 */
const ENVIROMENTS = () => {
  return {
    // LOCAL ENVS
    LOCAL_REGIONS: 'localhost',
    LOCAL_ENDPOINT: 'http://localhost:8001',
    // AUTH ENVS
    AUTHO_JWKS_UTL: process.env.AUTHO_JWKS_UTL,
    // TODO ENVS
    TODOS_TABLE_NAME: process.env.TODOS_TABLE,
    TODO_S3_BUCKET_NAME: process.env.TODO_S3_BUCKET_NAME,
    TODO_SIGNED_URL_EXP: process.env.TODO_SIGNED_URL_EXP
  }
}

export default ENVIROMENTS
