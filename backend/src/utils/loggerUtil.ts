import * as winston from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export const createLogger = (loggerName: string) => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { name: loggerName },
    transports: [new winston.transports.Console()]
  })
}

/** Logger name constants */
export const LOG_NAME = {
  DOC_CLIENTS: 'DocumentClient',
  AUTH0_AUTH: 'Auth0Authorizer',
  TODO_REPO: 'TodoRepositories',
  TODO_SERVICE: 'TodoService'
}
