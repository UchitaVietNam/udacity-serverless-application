import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createDocumentClient } from './DocumentClient'
import { AWSError } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { LOG_NAME, createLogger } from '../utils/loggerUtil'
import { TodoUpdate, TodoUpdateImage } from '../models/TodoUpdate'
import ENVIROMENTS from '../utils/enviromentsUtil'

const LOGGER = createLogger(LOG_NAME.TODO_REPO)
const ENVS = ENVIROMENTS()

/** Todos repositories */
export class TodoRepository {
  private readonly docClient: DocumentClient
  private readonly todosTableName: string

  constructor(docClient: DocumentClient = createDocumentClient()) {
    this.docClient = docClient
    this.todosTableName = ENVS.TODOS_TABLE_NAME
  }

  /**
   * Execute a get query
   * @param query Query
   * @returns Result
   */
  private async directlyAccess(
    query: DocumentClient.QueryInput
  ): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> {
    LOGGER.info(`Start Execute A Get Query '${query}'`)
    return await this.docClient.query(query).promise()
  }

  /**
   * Execute a update query
   * @param query Query
   * @returns Result
   */
  private async editsItem(
    query: DocumentClient.UpdateItemInput
  ): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> {
    LOGGER.info(`Start Execute A Update Query '${query}'`)
    return await this.docClient.update(query).promise()
  }

  /**
   * Execute a insert query
   * @param query Query
   * @returns Result
   */
  private async createsItem(
    query: DocumentClient.PutItemInput
  ): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {
    LOGGER.info(`Start Execute A Insert Query '${query}'`)
    return await this.docClient.put(query).promise()
  }

  /**
   * Get all todo record by user id
   * @param userId user id
   * @returns All record todos of target user id
   */
  async getAll(userId: string): Promise<TodoItem[]> {
    LOGGER.info(`Start Get All Todos Record By User Id '${userId}'`)
    const query: DocumentClient.QueryInput = {
      TableName: this.todosTableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    return (await this.directlyAccess(query)).Items as TodoItem[]
  }

  /**
   * Get todo by user id and todo id
   * @param userId User id
   * @param todoId Todo id
   * @returns Todo
   */
  async getByTodoId(userId: string, todoId: string): Promise<TodoItem[]> {
    LOGGER.info(
      `Start Get Todo By User Id : '${userId}' And Todo Id : ${todoId}`
    )
    const query: DocumentClient.QueryInput = {
      TableName: this.todosTableName,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    }
    return (await this.directlyAccess(query)).Items as TodoItem[]
  }

  /**
   * Insert new todo
   * @param todo Todo item
   * @returns Inserted todo
   */
  async create(todo: TodoItem): Promise<TodoItem> {
    LOGGER.info(`Start Insert A New Todo Item: ${JSON.stringify(todo)}`)
    const query: DocumentClient.PutItemInput = {
      TableName: this.todosTableName,
      Item: todo
    }
    await this.createsItem(query)
    LOGGER.info(`Todo Item Inserted: ${JSON.stringify(todo)}`)
    return todo
  }

  /**
   * Update a todo
   * @param updateTodo Update todo
   * @returns Updated todo
   */
  async update(updateTodo: TodoUpdate): Promise<TodoItem> {
    LOGGER.info(`Start Update Todo Item: ${JSON.stringify(updateTodo)}`)
    const query: DocumentClient.UpdateItemInput = {
      TableName: this.todosTableName,
      Key: {
        todoId: updateTodo.todoId,
        userId: updateTodo.userId
      },
      ExpressionAttributeNames: { nameAttr: 'name' },
      UpdateExpression:
        'set nameAttr = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': updateTodo.name,
        ':dueDate': updateTodo.dueDate,
        ':done': updateTodo.done
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.editsItem(query)
    LOGGER.info(`Todo Item Updated: ${JSON.stringify(updateTodo)}`)
    return updateTodo as TodoItem
  }

  /**
   * Update attachment image url
   * @param updateTodo Update info
   * @returns Updated info
   */
  async updateAttachImage(updateTodo: TodoUpdateImage): Promise<TodoItem> {
    LOGGER.info(
      `Start Update Todo attachment image ${JSON.stringify(updateTodo)}'`
    )
    const query: DocumentClient.UpdateItemInput = {
      TableName: this.todosTableName,
      Key: {
        todoId: updateTodo.todoId,
        userId: updateTodo.userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': updateTodo.attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.editsItem(query)
    LOGGER.info(`Todo attachment image Updated: ${JSON.stringify(updateTodo)}`)
    return updateTodo as TodoItem
  }

  /**
   * Delete a todo
   * @param userId User id
   * @param todoId Todo id
   */
  async delete(userId: string, todoId: string): Promise<void> {
    LOGGER.info(
      `Start Delete Todo Item By ID '${todoId}' And User ID '${userId}'`
    )
    await this.docClient
      .delete({
        TableName: this.todosTableName,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
    LOGGER.info(`Todo Item By ID '${todoId}' And User ID '${userId}' Deleted`)
  }
}
