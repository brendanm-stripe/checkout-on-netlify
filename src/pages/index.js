import React, {useState, useEffect} from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = () => {
  const [hasError, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joke, setJoke] = useState(null);

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
  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
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
      <Link to="/page-2/">Go to page 2</Link>
    </Layout>
  )
}

export default IndexPage
