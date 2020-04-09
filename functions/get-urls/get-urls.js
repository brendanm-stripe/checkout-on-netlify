// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        URL: process.env.URL, 
        DEPLOY_URL: process.env.DEPLOY_URL || 'https://www.missing.com', 
        DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL || 'https://www.missing.com',
        UNDEF: undefined,
        CANARY: 'tweet',
      })
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
