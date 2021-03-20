const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'email is required'],
    lowercase: true,
    validate: [validator.isEmail, 'invalid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    minlength: [8, 'password should have at least 8 characters'],
    required: [true, 'password is required'],
    select: false
  },
  description: {
    type: String
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (val) {
        return val === this.password
      },
      message: 'Passwords are not the same!'
    },
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true
  }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next() // if password not being modified, just go next step
  this.password = await bcrypt.hash(this.password, 12) // encrypt user password with bcrypt before saving
  // this.passwordConfirm = await bcrypt.hash(this.passwordConfirm, 12)
  this.passwordConfirm = undefined // only used for signing up, can be deleted after password validation
  next()
})
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000 // just to make sure the token will be created first after password's been changed
  next()
})
// only show active:true user
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})
// instance method, available for all user document
userSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass)
}
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  // doesn't change
  return false
}
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  console.log({ resetToken }, this.passwordResetToken)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}
const User = mongoose.model('User', userSchema)
module.exports = User
