const UrlPattern = require('url-pattern')
const {createError} = require('micro')

const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

const ROUTES = SUPPORTED_METHODS.reduce(
  (result, method) => {
    result[method] = []
    return result
  },
  {}
)

const newRouteOfMethod = (key, routePath, fn) => {
  if (!routePath || !(routePath instanceof String)) {
    throw new Error(`Invalid Path`)
  }

  if (!fn) {
    throw new Error(`Invalid Function`)
  }

  const pattern = new UrlPattern(routePath)
  ROUTES[key].push({pattern, fn})
  return {pattern, fn}
}

const get = (routePath, fn) => {
  return newRouteOfMethod('GET', routePath, fn)
}

const post = (routePath, fn) => {
  return newRouteOfMethod('POST', routePath, fn)
}

const patch = (routePath, fn) => {
  return newRouteOfMethod('PATCH', routePath, fn)
}

const put = (routePath, fn) => {
  return newRouteOfMethod('PUT', routePath, fn)
}

const del = (routePath, fn) => {
  return newRouteOfMethod('DELETE', routePath, fn)
}

const pathMatches = (path, key) =>
  ROUTES[key].filter(({pattern}) => pattern.match(path) !== null)

const patternHandler = async (req, res) => {
  const [path] = req.url.split('?')
  const [route] = pathMatches(path, req.method)

  if (!route) throw createError(404, 'Not Found')

  const {pattern, fn} = route
  req.params = pattern.match(path)

  return fn(req, res)
}

const methodHandler = async (req, res) => {
  if (SUPPORTED_METHODS.includes(req.method)) {
    return patternHandler(req, res)
  }
  throw createError(405, `Method Not Allowed`)
}

const router = (...args) => methodHandler

module.exports = {
  router,
  get,
  post,
  patch,
  put,
  del
}
