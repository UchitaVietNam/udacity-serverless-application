//import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import ENVIROMENTS from '../utils/enviromentsUtil'
import { LOG_NAME, createLogger } from '../utils/loggerUtil'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const LOGGER = createLogger(LOG_NAME.DOC_CLIENTS)
const ENVS = ENVIROMENTS()

/**
 * Create DynamoDB document client
 * @returns DocumentClient
 */
export const createDocumentClient = (): DocumentClient => {
  // Use dynamaDB local if offline
  if (process.env.IS_OFFLINE) {
    LOGGER.info('Use dynamaDB local because if offline')
    return new XAWS.DynamoDB.DocumentClient({
      region: ENVS.LOCAL_REGIONS,
      endpoint: ENVS.LOCAL_ENDPOINT
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
