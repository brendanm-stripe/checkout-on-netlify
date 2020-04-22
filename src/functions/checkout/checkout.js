// with thanks https://github.com/alexmacarthur/netlify-lambda-function-example/blob/68a0cdc05e201d68fe80b0926b0af7ff88f15802/lambda-src/purchase.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch').default;

const IS_PROD = process.env.CONTEXT && process.env.CONTEXT === 'production';
const IS_LOCAL = !process.env.NETLIFY;
const REDIRECT_URL = (IS_PROD || IS_LOCAL) ? process.env.URL : process.env.DEPLOY_PRIME_URL;
const GRC_TEST_SECRET = '6LdqhuwUAAAAABT6_aAtEHMjgdPVAB559N0OJ2LP';
// const GRC_TEST_V2 = '6LcjiOwUAAAAAKlEMIckfOGSEECmt8_Ra9NI8CAn';

const verifyRecaptchaToken = async (token) => {
  console.log('verifyRecaptchaToken');
  console.log({token});
  if (IS_LOCAL) return true;
  // fetch('https://www.google.com/recaptcha/api/siteverify');
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.RECAPTCHA_SECRET,
      // secret: process.env.GRC_TEST_SECRET,
      // secret: process.env.GRC_TEST_V2,
      response: token,
    }),
  });
  const data = await response.json();
  console.log({grcdata: data});
  return (data.success == true && data.score > 0.5);
}

const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async function(event, context, callback) {
  console.log('checkout function');
  console.log({REDIRECT_URL});

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

  const {cart, grctoken} = data;
  console.log({grctoken});
  const grcresult = await verifyRecaptchaToken(grctoken);
  console.log({grcresult});
  if( grcresult == false ){
    callback(null, {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error creating your checkout session!' })
    });
    return;
  }
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
  const items = Object.entries(cart).map(([priceId, num]) => ({
    price: priceId,
    quantity: num
  }));
  console.log({items});

  try {
    const session = await stripe.checkout.sessions.create(
      {
        success_url: `${REDIRECT_URL}/success`,
        cancel_url: `${REDIRECT_URL}/cancel`,
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
