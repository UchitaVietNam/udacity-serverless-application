import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../../utils/authorizationUtil'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { createRes } from '../../utils/responseUtil'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    try {
      await TodoService.deleteTodo(userId, todoId)
      createRes(200, {})
    } catch (error) {
      return createRes(404, error)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
