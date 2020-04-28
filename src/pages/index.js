import React, {useState, useEffect, useCallback} from "react"
import { Link } from "gatsby"
import {loadStripe} from '@stripe/stripe-js'
import Img from 'react-image';

import Layout from "../components/layout"
// import Image from "../components/image"
import SEO from "../components/seo"
import Loader from "../components/loader"

// const googleRecaptchaPublishableKey = '6LePjOkUAAAAAIlHjW_wLoCsUQPUzwOZZgYGRPR1';
const googleRecaptchaPublishableKey = '6LdqhuwUAAAAABgVyvQzKyoyZPQCYUjmD0NiMp8k'; // LOCAL TEST key
// const googleRecaptchaPublishableKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // GLOBAL TEST key
// const googleRecaptchaPublishableKey = '6LcjiOwUAAAAAAJzQblwM8pLMsTKe3VZm3ukN4fD'; // v2 key
const safeGrecaptcha = ({action}) => {
  if (typeof window !== `undefined`) {
    // return the Promise
    return window.grecaptcha.execute(googleRecaptchaPublishableKey, {action});
  }
  else return Promise.resolve('RECAPTCHA_UNAVAILABLE');
}
const stripePublishableKeyStatic = `${process.env.GATSBY_STRIPE_PUBLISHABLE_KEY}`;
console.log({stripePublishableKeyStatic})
// let stripePromise = loadStripe(stripePublishableKeyStatic);
let stripePromise;

const IndexPage = () => {
  const [hasError, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joke, setJoke] = useState(null);
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [pk, setPk] = useState(null);
  const [pkLoading, setPkLoading] = useState(false);

  const [products, setProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  const [cart, setCart] = useState({});
  const [cartIsEmpty, setCartIsEmpty] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/.netlify/functions/get-joke", {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      res
        .json()
        .then(res => setJoke(res.msg))
        .catch(err => setErrors(err))
        .finally(() => setLoading(false));
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/.netlify/functions/get-urls");
      res
        .json()
        .then(res => console.log(res))
        .catch(err => setErrors(err))
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchPk() {
      setPkLoading(true);
      const res = await fetch("/.netlify/functions/get-publishable-key");
      res
        .json()
        .then(res => {
          setPk(res.pk);
          stripePromise = loadStripe(res.pk);
        })
        .catch(err => setErrors(err))
        .finally(() => setPkLoading(false));
    }

    fetchPk();
  }, []);

  const getCartTotal = useCallback((cart) => {
    const newTotal = Object.entries(cart)
      .filter(([p, num]) => num > 0)
      .reduce((acc, [p, num]) => acc + (products[p].unit_amount * num),0)
    return newTotal;
  }, [productsLoading])

  const updateCart = useCallback((cart) => {
    setCart(cart);
    setCartIsEmpty(Object.entries(cart).filter(([p, num]) => num > 0).length === 0);
    setTotal(getCartTotal(cart));
  }, [getCartTotal]);

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      const response = await fetch("/.netlify/functions/get-products");
      const data = await response.json();
      const productsHash = data.products.reduce((acc, p) => ({...acc, [p.id]: p}), {} )
      setProducts(productsHash);
      setProductsLoading(false);
    }
    fetchProducts();
  }, []);

  const checkout = useCallback(async () => {
    if (isCheckingOut) return;
    // const token = await grecaptcha.execute(googleRecaptchaPublishableKey, {action: 'checkout'});
    const token = await safeGrecaptcha({action: 'checkout'});
    console.log({token});
    setIsCheckingOut(true);
    const response = await fetch("/.netlify/functions/checkout",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({cart, grctoken: token}),
    });
    const {checkout_session} = await response.json();
    const stripe = await stripePromise;
    stripe.redirectToCheckout({sessionId: checkout_session});
    setIsCheckingOut(false);
  }, [isCheckingOut, pk, cart]);

  const addToCart = useCallback((productId) => () => {
    // grecaptcha.execute(googleRecaptchaPublishableKey, {action: 'cart-add'});
    safeGrecaptcha({action: 'cartadd'});
    const newCart = {
      ...cart,
      [productId]: (cart[productId] || 0) + 1
    };
    updateCart(newCart);
    // setTotal(getCartTotal(newCart));
  }, [cart, getCartTotal]);

  const removeFromCart = useCallback((productId) => () => {
    // grecaptcha.execute(googleRecaptchaPublishableKey, {action: 'cart-remove'});
    safeGrecaptcha({action: 'cartremove'});

    const newCart = {
      ...cart,
      [productId]: cart[productId] - 1
    };
    updateCart(newCart);
    // setTotal(getCartTotal(newCart));
  }, [cart, getCartTotal]);

  // const grcV2callbackTest = val => {
  //   console.log('grcV2callbackTest', val );
  // }

  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi!</h1>
      {/* <div class="g-recaptcha"
        data-sitekey={`${googleRecaptchaPublishableKey}`}
        data-callback={grcV2callbackTest}
        data-size="invisible">
      </div> */}
      <p>Welcome to your new Netlify-hosted Gatsby-based e-commerce site.</p>
      <p>(Still a work in progress!)</p>
      { productsLoading ? <Loader /> : (Object.keys(products).length > 0) &&
      <div>
        <ul>
          { Object.values(products)
            .map(p =>
              <li key={p.id}>
                <span>{`${p.product.name} - ${p.product.caption} - $${(p.unit_amount/100.0)}`}</span>
                <input type="button" onClick={addToCart(p.id)} value="Add"/>
                <div>
                <Img
                  src={ p.product.images }
                  style={{ width: '150px' }}
                  loader={<Loader />}
                />
                </div>
              </li>
            )
          }
        </ul>
      </div>
      }
      <div>
      { !cartIsEmpty ?
        <div>
          <span>Cart:</span>
          <ul>
            {
              Object.entries(cart)
              .filter(([p, num]) => num > 0)
              .map(([p, num]) =>
                <li key={p}>
                  <span>{`${products[p].product.name}: ${num}`}</span>
                  <input type="button" onClick={removeFromCart(p)} value="-"/>
                  <input type="button" onClick={addToCart(p)} value="+"/>
                </li>
              )
            }
          </ul>
          <span>Total: ${(total/100.0)}</span>
        </div>
        : <p>Cart is empty.</p>
      }
      </div>
      <div>
        <input type="button" disabled={isCheckingOut || cartIsEmpty} onClick={checkout} value="Checkout Now"/>
      </div>
      <ul>
        <li><Link to="/success/">Preview success page</Link></li>
        <li><Link to="/cancel/">Preview cancel page</Link></li>
      </ul>   
    </Layout>
  )
}

export default IndexPage
