// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const urls = { 
  URL: process.env.URL, 
  DEPLOY_URL: process.env.DEPLOY_URL || 'https://www.missing.com', 
  DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL || 'https://www.missing.com',
  UNDEF: undefined,
  CANARY: 'tweet',
};
console.log(urls);
exports.handler = async (event, context) => {
  console.log(urls);
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(urls),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
