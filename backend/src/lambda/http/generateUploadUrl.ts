import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createRes } from '../../utils/responseUtil'
import { TodoService } from '../../services/impl/TodoServiceImpl'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const signedUrl = TodoService.getSignedUrl(todoId)
    return createRes(200, {
      uploadUrl: signedUrl
    })
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
