const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/apiError')
const sendEmail = require('../utils/email')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false, // only send in https,
    httpOnly: true //
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)
  user.password = undefined
  res.status(statusCode).json({
    state: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  })
  createSendToken(newUser, 201, res)
})

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  // 1. check if email and password exist
  if (!email || !password) {
    return next(new ApiError('please provide email or password', 400))
  }
  // 2. check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.correctPassword(password, user.password))) {
    // only check password if there's a user
    return next(new ApiError('invalid email or password', 401))
  }

  // 3. send a token to client if everything is fine
  createSendToken(user, 200, res)
})

// log out, send another token to replace the logged in one
exports.logOut = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true
  })
  res.status(200).json({
    state: 'success'
  })
}

exports.protect = catchAsync(async (req, res, next) => {
  // 1. get token and check if it exists
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    next(new ApiError('not logged in', 401))
  }
  // 2. token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  console.log(decoded)
  // 3. check if user still exist
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(new ApiError('User of this token does not exist', 401))
  }
  // 4. check if user have changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new ApiError('User password changed, log in again', 401))
  }
  // 5. access protected route
  req.user = currentUser
  res.locals.user = currentUser // template will have access to user
  next()
})
exports.restriction = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('No permission to do this', 403))
    }
    next()
  }
}
exports.forgotPass = catchAsync(async (req, res, next) => {
  // 1. get user email
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(new ApiError('user does not exist', 404))
  // 2. generate a random reset token
  const resetToken = user.createResetToken()
  await user.save({ validateBeforeSave: false })
  // 3. send it to user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset/${resetToken}`
  const message = `forgot your password? send your new password to ${resetURL} with a patch request, if you didn't, just ignore this email`

  try {
    await sendEmail({
      email: user.email,
      subject: 'PASSWORD RESET',
      message
    })
    res.status(200).json({
      statis: 'success',
      message: 'token sent'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new ApiError('OPPS! An error occurred when sending the email', 500)
    )
  }
})
exports.resetPass = catchAsync(async (req, res, next) => {
  // 1. get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')
  console.log('hashedToken =' + hashedToken)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() }
  })

  // 2. if the token hasn't expired, and user exist, set new password
  if (!user) return next(new ApiError('Token is invalid or has expired', 400))
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save() // y dont use update? cuz save() triggers all of the validation process again

  // 3. update passwordChangedAt property of current user

  // 4. log user in, send JWT
  createSendToken(user, 200, res)
})

exports.updatePass = catchAsync(async (req, res, next) => {
  // 1. get user from collection
  const user = await User.findById(req.user.id).select('+password')
  // 2. check if old password is correct
  if (!(await user.correctPassword(req.body.oldpass, user.password))) {
    return next(new ApiError('wrong password', 401))
  }

  // 3. update password
  user.password = req.body.newpass
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  // 4. log user in, send JWT
  createSendToken(user, 200, res)
})

// only for render pages' log in check
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1. token verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )
      console.log(decoded)
      // 2. check if user still exist
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next()
      }
      // 3. check if user have changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }
      // 4. there's a logged in user
      res.locals.user = currentUser // template will have access to user
      return next()
    } catch (error) {
      return next()
    }
  }
  next()
}
