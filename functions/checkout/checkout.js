// with thanks https://github.com/alexmacarthur/netlify-lambda-function-example/blob/68a0cdc05e201d68fe80b0926b0af7ff88f15802/lambda-src/purchase.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DEPLOY_URL = process.env.DEPLOY_URL;
console.log({DEPLOY_URL});

const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async function(event, context, callback) {
  console.log('checkout function');
  console.log({DEPLOY_URL});

  //-- We only care to do anything if this is our POST request.
  // if (event.httpMethod !== 'POST' || !event.body) {
  //   callback(null, {
  //     statusCode,
  //     headers,
  //     body: ''
  //   })
  // }

  //-- Parse the body contents into an object.
  const data = JSON.parse(event.body)
  console.log({codata: data});

  //-- Make sure we have all required data. Otherwise, escape.
  // if (!data.token || !data.amount || !data.idempotency_key) {
  //   console.error('Required information is missing.')

  //   callback(null, {
  //     statusCode,
  //     headers,
  //     body: JSON.stringify({ status: 'missing-information' })
  //   })

  //   return
  // }
  const items = Object.entries(data).map(([priceId, num]) => ({
    price: priceId,
    quantity: num
  }));
  console.log({items});

  try {
    const session = await stripe.checkout.sessions.create(
      {
        success_url: `${DEPLOY_URL}/success`,
        cancel_url: `${DEPLOY_URL}/cancel`,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: items,
      }
    );
    callback(null, {
      statusCode,
      headers,
      body: JSON.stringify({ checkout_session: session.id })
    })
  }
  catch (err) {
    console.log(err);
    callback(null, {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error creating checkout session!' })
    });
    return;
  }
}
