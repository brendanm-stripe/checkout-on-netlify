import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const SuccessPage = () => (
  <Layout>
    <SEO title="Checkout success!" />
    <h1>Success page</h1>
    <p>Welcome to the Success page</p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default SuccessPage
