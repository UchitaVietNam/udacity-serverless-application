import { APIGatewayProxyResult } from 'aws-lambda'

/**
 * Create API Gateway Proxy response
 * @param statusCode HTTP code
 * @param body Response body
 * @returns APIGateway Proxy Result
 */
export const createRes = (
  statusCode: number,
  body: Object
): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body)
  }
}
