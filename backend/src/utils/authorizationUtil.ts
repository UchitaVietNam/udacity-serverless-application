import { APIGatewayProxyEvent, CustomAuthorizerResult } from 'aws-lambda'
import { parseUserId } from '../auth/utils'

/**
 * Get user id from authorization headers
 * @param event an Event input from API Gateway
 * @returns a User id from a JWT token
 */
export const getUserId = (event: APIGatewayProxyEvent): string => {
  // Get JWT token from authorization headers
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  // Get user id from JWT token
  return parseUserId(jwtToken)
}

/** Effect type */
type TEffect = 'Allow' | 'Deny'

/**
 * Create Custom Authorizer Result
 * @param sub JWT Token's sub
 * @param effect Effect
 * @returns Custom Authorizer Result
 */
export const createAuthorizerResult = (
  sub?: string,
  effect?: TEffect
): CustomAuthorizerResult => {
  return {
    principalId: sub || 'unauthorized user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect || 'Deny',
          Resource: '*'
        }
      ]
    }
  }
}
