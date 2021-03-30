const ApiError = require('../utils/apiError')
const catchAsync = require('../utils/catchAsync')
const User = require('../model/userModel')

exports.addToCart = catchAsync(async (req, res, next) => {
  const query = await User.findById(req.params.id, err => {
    if (err) return next(new ApiError('ID not found', 404))
  })
  console.log(query[0].cart)
  const updateIndex = query[0].cart.findIndex(item => item.product._id + '' === req.body.product)
  console.log(updateIndex)
  if (updateIndex !== -1) {
    query[0].cart[updateIndex].quantity += req.body.quantity
  } else {
    query[0].cart.push(req.body)
  }
  await query[0].save()
  // doc[0].cart.push(req.body)
  // console.log(doc[0].cart)
  res.status(200).json({
    state: 'success'
  })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const query = await User.findById(req.params.id, err => {
    if (err) return next(new ApiError('ID not found', 404))
  })
  console.log(req.body)
  query[0].cart = query[0].cart.filter(item => item.product._id + '' !== req.body.product)
  const doc = await query[0].save()
  res.status(200).json({
    state: 'success',
    data: doc
  })
})
