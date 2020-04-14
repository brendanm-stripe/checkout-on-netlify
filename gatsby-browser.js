/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
const React = require("react")
const Helmet = require('react-helmet').Helmet;

exports.wrapRootElement = ({ element }) => {
  return (
    <React.Fragment>
      <Helmet>
        <script src="https://www.google.com/recaptcha/api.js?render=6LePjOkUAAAAAIlHjW_wLoCsUQPUzwOZZgYGRPR1"></script>
      </Helmet>
      {element}
    </React.Fragment>
  )
}