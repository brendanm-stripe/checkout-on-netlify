// with thanks https://github.com/alexmacarthur/netlify-lambda-function-example/blob/68a0cdc05e201d68fe80b0926b0af7ff88f15802/lambda-src/purchase.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = function(event, context, callback) {
  //-- We only care to do anything if this is our POST request.
  if (event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode: 400,
      headers,
      body: 'Invalid request.'
    })
  }

  const sig = event.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  }
  catch (err) {
    return callback(null, {
      statusCode: 400,
      headers,
      body: `Webhook Error: ${err.message}`
    });
  }

  // event verified, acknowledge
  callback(null, {
    statusCode: 200,
    headers,
    body: 'ACK'
  });

  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     const paymentIntent = event.data.object;
  //     console.log('PaymentIntent was successful!')
  //     break;
  //   default:
  //     // Unexpected event type
  //     return response.status(400).end();
  // }

  //do other stuff.

  return;
}
