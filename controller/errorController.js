const ApiError = require('../utils/apiError')

const sendBugDev = (err, req, res) => {
  // api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  // render
  console.log(err)
  return res.status(err.statusCode).render('error', {
    title: 'Something wrong',
    message: err.message
  })
}
const sendBugPro = (err, req, res) => {
  // operational, trusted error : send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })

      // unknown error: don't leak error details
    }
    console.log(err)

    // 2. send generic message
    return res.status(500).json({
      status: 'fail',
      message: 'something wrong'
    })
  }
  if (err.isOperational) {
    console.log(err)
    return res.status(err.statusCode).render('error', {
      title: 'Something wrong',
      message: err.message
    })

    // unknown error: don't leak error details
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something wrong',
    message: 'try again later'
  })
}
const handleDuplicateDB = error => {
  const message = `Duplicate ${Object.keys(error.keyValue)}: ${
    error.keyValue.name
  }, please try another ${Object.keys(error.keyValue)}`
  return new ApiError(message, 400)
}
const handleValidationDB = error => {
  const errors = Object.values(error.errors).map(item => item.message)
  const message = `invalid input data: ${errors.join('. ')}`
  return new ApiError(message, 400)
}
const handleJWTError = () =>
  new ApiError('Invalid token, please log in again', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendBugDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    error.message = err.message
    // set DB errors to operational errors
    if (error.code === 11000) {
      error = handleDuplicateDB(error)
    }
    if (error._message === 'Validation failed') {
      error = handleValidationDB(error)
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError()
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTError()
    }
    sendBugPro(error, req, res)
  }
}
