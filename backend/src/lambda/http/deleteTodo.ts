import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../../utils/authorizationUtil'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { createRes } from '../../utils/responseUtil'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const LOGGER = createLogger(LOG_NAME.DELETE_TODO)

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LOGGER.info(`Start delete a Todo item`)
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
