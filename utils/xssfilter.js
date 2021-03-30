const xss = require('xss')
exports.xssFilter = (req, res, next) => {
  const options = {
    whiteList: {
    }
  }
  if (req.body.title) req.body.title = xss(req.body.title, options)
  if (req.body.article) req.body.article = xss(req.body.article, options)
  if (req.body.photo) req.body.photo = xss(req.body.photo)
  console.log(req.body)
  next()
}
