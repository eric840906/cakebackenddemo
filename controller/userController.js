const User = require('../model/userModel')
const ApiError = require('../utils/apiError')
const handlerFactory = require('../controller/hanlderFactory')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     // user-userid-timestamp.jpg
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true)
  }
  cb(new ApiError('Only images are accepted', 400), false)
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next()
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
}

const filterObject = (obj, ...allowFields) => {
  const newObj = {}
  Object.keys(obj).forEach(item => {
    if (allowFields.includes(item)) {
      newObj[item] = obj[item]
    }
  })
  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = async (req, res, next) => {
  console.log(req.file)
  console.log(req.body)
  // 1. create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new ApiError('this route is not for password update', 400))
  }
  // 2. filter unwanted fieldnames which are not allow to be updated
  const filteredBody = filterObject(req.body, 'name', 'email') // only allow name and email to be updated
  if (req.file) filteredBody.photo = req.file.filename
  // 3. update user account
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
}
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id, { active: false })
  res.status(204).json({
    status: 'success',
    data: null
  })
})
exports.getAllUsers = handlerFactory.getAll(User)

// exports.addUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'not yet defined, please use /signup'
//   })
// }
exports.getUser = handlerFactory.getOne(User)
exports.updateUser = handlerFactory.updateOne(User)
exports.deleteUser = handlerFactory.deleteOne(User)
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'not yet defined'
//   })
// }
