// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ pk: process.env.STRIPE_PUBLISHABLE_KEY || 'MISSING_STRIPE_PUBLISHABLE_KEY' })
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
