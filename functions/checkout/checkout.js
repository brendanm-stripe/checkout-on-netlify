// with thanks https://github.com/alexmacarthur/netlify-lambda-function-example/blob/68a0cdc05e201d68fe80b0926b0af7ff88f15802/lambda-src/purchase.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async function(event, context, callback) {
  //-- We only care to do anything if this is our POST request.
  // if (event.httpMethod !== 'POST' || !event.body) {
  //   callback(null, {
  //     statusCode,
  //     headers,
  //     body: ''
  //   })
  // }

  //-- Parse the body contents into an object.
  // const data = JSON.parse(event.body)
  // console.log({codata: data});

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
  try {
    const session = await stripe.checkout.sessions.create(
      {
        success_url: `${process.env.DEPLOY_URL}/success`,
        cancel_url: `${process.env.DEPLOY_URL}/cancel`,
        payment_method_types: ['card'],
        line_items: [
          {
            name: 'T-shirt',
            description: 'Comfortable cotton t-shirt',
            amount: 1200,
            currency: 'usd',
            quantity: 2,
          },
        ],
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
