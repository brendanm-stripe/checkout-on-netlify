/* eslint-disable */
const fetch = require('node-fetch').default;
const stripe = require('stripe')
const Stripe = stripe(process.env.STRIPE_SECRET_KEY)
exports.handler = async function(event, context) {
  try {
    // const response = await Stripe.prices.list(); // not supported yet
    const response = await fetch('https://api.stripe.com/v1/prices?expand[]=data.product', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      // qs: {expand: ['data.product']}
      // body: JSON.stringify({expand: ['data.product']})
    });
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const { data } = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ products: data })
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
