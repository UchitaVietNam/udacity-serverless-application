import 'source-map-support/register'
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify, decode, Algorithm } from 'jsonwebtoken'
import Axios from 'axios'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'
import ENVIROMENTS from '../../utils/enviromentsUtil'
import { createAuthorizerResult } from '../../utils/authorizationUtil'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'

const LOGGER = createLogger(LOG_NAME.AUTH0_AUTH)
const ENVS = ENVIROMENTS()
const JWK2PEM = require('jwk-to-pem')
const ALGORITHMS: Algorithm[] = ['RS256']

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    // Get jwt token from authorization header
    const token = getToken(event.authorizationToken)
    if (!token) {
      throw new Error('Token is not existed')
    }
    // Decode jwt token
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    // Verify token
    const jwtToken: JwtPayload = await Axios.get(ENVS.AUTHO_JWKS_UTL, {
      responseType: 'json'
    }).then((response) => {
      // Get keys from response
      const keys = response?.data?.keys
      // Verify keys
      if (!keys || !keys.length) {
        throw new Error('The JWKS is invalid')
      }
      const signingKey = keys.find(
        (key) =>
          key.use === 'sig' &&
          key.kty === 'RSA' &&
          key.kid &&
          key.x5c &&
          key.x5c.length &&
          key.kid === jwt.header.kid
      )
      if (!signingKey) {
        throw new Error('Invalid Signing key')
      }
      // Verufy token
      return verify(token, JWK2PEM(signingKey), {
        algorithms: ALGORITHMS
      }) as JwtPayload
    })
    // Return authorizer result
    return createAuthorizerResult(jwtToken.sub, 'Allow')
  } catch (e) {
    LOGGER.error('User not authorized', { error: e.message })
    return createAuthorizerResult()
  }
}

/**
 * Get token from header
 * @param authHeader Authorizer header
 * @returns Jwt token
 */
const getToken = (authHeader: string): string => {
  if (!authHeader) {
    throw new Error('No authentication header')
  } else if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  } else {
    const split: string[] = authHeader.split(' ')
    return split.length === 0 ? null : split[1]
  }
}
