import React, {useState, useEffect, useCallback} from "react"
import { Link } from "gatsby"
import {loadStripe} from '@stripe/stripe-js'

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

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
      const res = await fetch("/.netlify/functions/get-joke");
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
    setIsCheckingOut(true);
    const response = await fetch("/.netlify/functions/checkout",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cart),
    });
    const {checkout_session} = await response.json();
    const stripe = await stripePromise;
    stripe.redirectToCheckout({sessionId: checkout_session});
    setIsCheckingOut(false);
  }, [pk, cart]) // update the callback if the state changes

  const addToCart = useCallback((productId) => () => {
    const newCart = {
      ...cart,
      [productId]: (cart[productId] || 0) + 1
    };
    updateCart(newCart);
    // setTotal(getCartTotal(newCart));
  }, [cart, getCartTotal]);

  const removeFromCart = useCallback((productId) => () => {
    const newCart = {
      ...cart,
      [productId]: cart[productId] - 1
    };
    updateCart(newCart);
    // setTotal(getCartTotal(newCart));
  }, [cart, getCartTotal])

  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi!</h1>
      <p>Welcome to your new Gatsby-based e-commerce site.</p>
      <p>(WIP)</p>
      <p>Stripe PK Static: {stripePublishableKeyStatic}</p>
      <p>
        <span>Stripe PK Fetch:</span>
        <span>{pkLoading ? 'loading' : pk}</span>
      </p>
      <p>
        { !!joke ? 
          <React.Fragment>
            <span>A joke: </span>
            <span>{joke}</span>
          </React.Fragment>
          : (loading ? <span>...loading joke</span> : <span>{`No joke :(`}</span>)
        }
      </p>
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
      </div>
      { (Object.keys(products).length > 0) &&
      <div>
        <ul>
          {Object.values(products)
            .map(p =>
              <li key={p.id}>
                <span>{`${p.product.name} - ${p.product.caption} - $${(p.unit_amount/100.0)}`}</span>
                <input type="button" onClick={addToCart(p.id)} value="Add"/>
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
        <li><Link to="/page-2/">Go to page 2</Link></li>
        <li><Link to="/success/">Preview success page</Link></li>
        <li><Link to="/cancel/">Preview cancel page</Link></li>
      </ul>   
    </Layout>
  )
}

export default IndexPage
