import * as AWS from 'aws-sdk'
import { ITodoService } from '../ITodoService'
import { TodoItem } from '../../models/TodoItem'
import { TodoUpdate } from '../../models/TodoUpdate'
import {
  ReqCreateTodo,
  ReqUpdateTodo
} from '../../models/request/ReqTodoModels'
import { TodoRepository } from '../../repositories/TodoRepository'
import ENVIROMENTS from '../../utils/enviromentsUtil'
import { LOG_NAME, createLogger } from '../../utils/loggerUtil'

const uuid = require('uuid')
const ENVS = ENVIROMENTS()
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const LOGGER = createLogger(LOG_NAME.TODO_SERVICE)

class TodoServiceImpl implements ITodoService {
  /** Todo repository */
  private readonly todoRepository: TodoRepository

  /** Constructor */
  constructor(todoRepository: TodoRepository = new TodoRepository()) {
    this.todoRepository = todoRepository
  }

  /**
   * Get all todo items
   * @param userId User id
   * @returns Todo items
   */
  async getAllTodoByUserId(userId: string): Promise<TodoItem[]> {
    LOGGER.info(`Getting Todo items by User Id : ${userId}`)
    return await this.todoRepository.getAll(userId)
  }

  /**
   * Get a Todo item by user id and todo id
   * @param userId User id
   * @param todoId Item id
   * @returns Todo item
   */
  async getByTodoId(userId: string, todoId: string): Promise<TodoItem> {
    LOGGER.info(
      `Getting a Todo item by User Id : ${userId} and Todo Id : ${todoId}`
    )
    const results: TodoItem[] = await this.todoRepository.getByTodoId(
      userId,
      todoId
    )
    return results.length > 0 ? results[1] : null
  }

  /**
   * Create a new Todo Item
   * @param req Create todo request model
   * @returns Created Todo Item
   */
  async createNewTodo(req: ReqCreateTodo): Promise<TodoItem> {
    LOGGER.info(`Creating a new Todo item : ${JSON.stringify(req)}`)
    const newTodoItem: TodoItem = {
      todoId: uuid.v4(),
      userId: req.userId,
      name: req.name,
      dueDate: req.dueDate,
      attachmentUrl: req.attachmentUrl || null,
      createdAt: new Date().toISOString(),
      done: false
    }
    return await this.todoRepository.create(newTodoItem)
  }

  /**
   * Update a Todo item
   * @param req Update a Todo Item request model
   * @returns Updated Todo Item
   */
  async updateTodo(req: ReqUpdateTodo): Promise<TodoItem> {
    LOGGER.info(`Updating a Todo item : ${JSON.stringify(req)}`)
    const toUpdate: TodoUpdate = {
      todoId: req.todoId,
      userId: req.userId,
      name: req.name,
      dueDate: req.dueDate,
      done: req.done
    }
    return await this.todoRepository.update(toUpdate)
  }

  /**
   * Delete a Todo Item
   * @param userId User id
   * @param todoId Todo id
   */
  async deleteTodo(userId: string, todoId: string): Promise<void> {
    LOGGER.info(
      `Deleting a Todo item by User Id : ${userId} and Todo Id : ${todoId}`
    )
    await this.todoRepository.delete(userId, todoId)
  }

  async updateAttachment(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem> {
    LOGGER.info(
      `Update attachment url of user ${userId} - todo ${todoId} to url ${attachmentUrl}`
    )
    return await this.todoRepository.updateAttachImage({
      userId: userId,
      todoId: todoId,
      attachmentUrl: attachmentUrl
    })
  }

  /**
   * Get a signed url of todo attachment image
   * @param todoId Todo id
   * @returns Signed url
   */
  async getSignedUrl(todoId: string): Promise<string> {
    LOGGER.info(`Getting SignedUrl by Todo Id : ${todoId}`)
    return await s3.getSignedUrl('putObject', {
      Bucket: ENVS.TODO_S3_BUCKET_NAME,
      Key: todoId,
      Expires: parseInt(ENVS.TODO_SIGNED_URL_EXP)
    })
  }

  /**
   * Create attachment url
   * @param todoid Todo id
   */
  createAttachmentUrl(todoId: string): string {
    return `https://${ENVS.TODO_S3_BUCKET_NAME}.s3.amazonaws.com/${todoId}`
  }
}

export const TodoService: ITodoService = new TodoServiceImpl()
