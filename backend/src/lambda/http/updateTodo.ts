import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { TodoItem } from '../../models/TodoItem'
import { ReqUpdateTodo } from '../../models/request/ReqTodoModels'
import { getUserId } from '../../utils/authorizationUtil'
import { createRes } from '../../utils/responseUtil'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const req = JSON.parse(event.body)
    req.userId = getUserId(event)
    req.getUserId(event)
    const res: TodoItem = await TodoService.updateTodo(req as ReqUpdateTodo)
    return createRes(200, res)
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
