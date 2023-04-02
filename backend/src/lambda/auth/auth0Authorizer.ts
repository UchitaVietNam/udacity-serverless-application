import 'source-map-support/register'
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'
import ENVIROMENTS from '../../utils/enviromentsUtil'
import { createAuthorizerResult } from '../../utils/authorizationUtil'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'

const LOGGER = createLogger(LOG_NAME.AUTH0_AUTH)
const ENVS = ENVIROMENTS()

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  LOGGER.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    LOGGER.info('User was authorized', jwtToken)
    return createAuthorizerResult(jwtToken.sub, 'Allow')
  } catch (e) {
    LOGGER.error('User not authorized', { error: e.message })

    return createAuthorizerResult()
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  try {
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    const key = await getSigningKey(jwt.header.kid)

    return verify(token, key.publicKey, { algorithms: ['RS256'] }) as JwtPayload
  } catch (err) {
    LOGGER.error(err)
  }

  return null
}

interface ISignedKey {
  kid: string
  nbf: string
  publicKey: string
}

async function getSigningKey(jwtKid: string): Promise<ISignedKey> {
  if (!jwtKid) throw new Error('jwtKid arg is required')

  const response = await Axios.get(ENVS.AUTHO_JWKS_UTL, {
    responseType: 'json'
  })

  let keys = response?.data?.keys

  if (!keys || !keys.length)
    throw new Error('The JWKS endpoint did not contain any keys')

  const signedKeys: ISignedKey[] = (keys = keys
    .filter(
      (key) =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signing
        key.kty === 'RSA' && // We are only supporting RSA
        key.kid && // The `kid` must be present to be useful for later
        key.x5c &&
        key.x5c.length // Has useful public keys (we aren't using n or e)
    )
    .map((key) => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
    }))

  // If at least a single signing key doesn't exist we have a problem... Kaboom.
  if (!signedKeys.length)
    throw new Error('The JWKS endpoint did not contain any signing keys')

  const signingKey = signedKeys.find((key) => key.kid === jwtKid)

  if (!signingKey)
    throw new Error(`Unable to find a signing key that matches '${jwtKid}'`)

  return signingKey
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}
