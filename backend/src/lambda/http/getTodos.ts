import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../../utils/authorizationUtil'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { TodoItem } from '../../models/TodoItem'
import { createRes } from '../../utils/responseUtil'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const LOGGER = createLogger(LOG_NAME.GENERATE_UPLOAD_URL)

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LOGGER.info(`Start get Todo items`)
    const userId = getUserId(event)
    const todoItems: TodoItem[] = await TodoService.getAllTodoByUserId(userId)
    return createRes(200, { items: todoItems })
  }
)

handler.use(
  cors({
    credentials: true
  })
)
