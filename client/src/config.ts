// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// const apiId = '...'
// export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const apiEndpoint = 'http://localhost:3000/dev'

export const authConfig = {
  domain: 'uchita.jp.auth0.com',            // Auth0 domain
  clientId: 'fpE5XHGiOko9TikY3RgTIQ1YDiJpvvL9',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
