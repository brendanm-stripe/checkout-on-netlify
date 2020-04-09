import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const CancelPage = () => (
  <Layout>
    <SEO title="Checkout cancel!" />
    <h1>Cancel page</h1>
    <p>Welcome to the Cancel page. Changed your mind I guess?</p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default CancelPage
