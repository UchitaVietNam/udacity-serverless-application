import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createRes } from '../../utils/responseUtil'
import { TodoService } from '../../services/impl/TodoServiceImpl'
import { getUserId } from '../../utils/authorizationUtil'
import { TodoItem } from '../../models/TodoItem'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const LOGGER = createLogger(LOG_NAME.GENERATE_UPLOAD_URL)

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    // Create attachment url
    const attachmentUrl = TodoService.createAttachmentUrl(todoId)
    // Update attachment url
    const updatedTodo: TodoItem = await TodoService.updateAttachment(
      userId,
      todoId,
      attachmentUrl
    )
    LOGGER.info(`Todo image Updated with url ${updatedTodo.attachmentUrl}`)
    // Get signed url
    const signedUrl = await TodoService.getSignedUrl(todoId)
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
