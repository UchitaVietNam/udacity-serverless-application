import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../../utils/authorizationUtil'
import { TodoItem } from '../../models/TodoItem'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { ReqCreateTodo } from '../../models/request/ReqTodoModels'
import { createRes } from '../../utils/responseUtil'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const LOGGER = createLogger(LOG_NAME.CREATE_TODO)

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LOGGER.info(`Start create a Todo item`)
    const req = JSON.parse(event.body)
    req.userId = getUserId(event)
    const res: TodoItem = await TodoService.createNewTodo(req as ReqCreateTodo)
    return createRes(200, { item: res })
  }
)

handler.use(
  cors({
    credentials: true
  })
)
