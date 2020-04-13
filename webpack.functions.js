// Source: https://github.com/netlify/netlify-lambda/issues/59#issuecomment-486787942
const webpack = require('webpack')
module.exports = {
    plugins: [
        new webpack.EnvironmentPlugin(['DEPLOY_URL', 'DEPLOY_PRIME_URL', 'NODE_ENV', 'CONTEXT', 'NETLIFY', 'TEST_ENV'])
    ]
}