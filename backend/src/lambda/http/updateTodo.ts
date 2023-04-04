import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { TodoItem } from '../../models/TodoItem'
import { ReqUpdateTodo } from '../../models/request/ReqTodoModels'
import { getUserId } from '../../utils/authorizationUtil'
import { createRes } from '../../utils/responseUtil'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const LOGGER = createLogger(LOG_NAME.UPDATE_TODO)

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LOGGER.info(`Start update a Todo item`)
    const req = JSON.parse(event.body)
    req.userId = getUserId(event)
    req.todoId = event.pathParameters.todoId
    const res: TodoItem = await TodoService.updateTodo(req as ReqUpdateTodo)
    return createRes(200, res)
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
