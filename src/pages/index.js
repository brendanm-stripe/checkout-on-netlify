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

  const [products, setProducts] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);

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

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      // const stripe = await stripePromise;
      const response = await fetch("/.netlify/functions/get-products");
      const data = await response.json();
      console.log({products_data: data})
      setProducts(data.products);
      setProductsLoading(false);
    }
    fetchProducts();
  }, []);

  const checkout = useCallback(async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    const response = await fetch("/.netlify/functions/checkout");
    const {checkout_session} = await response.json();
    console.log({checkout_session})
    const stripe = await stripePromise;
    stripe.redirectToCheckout({sessionId: checkout_session});
    setIsCheckingOut(false);
  }, [pk]) // update the callback if the state changes

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
      { products &&
      <div>
        <ul>
          {products.map(p => <li><span>{`${p.product.name} - ${p.product.caption} - $${(p.unit_amount/100.0)}`}</span></li>)}
        </ul>
      </div>
      }
      <div>
        <input type="button" disabled={isCheckingOut} onClick={checkout} value="Checkout Now"/>
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
