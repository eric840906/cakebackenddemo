const Review = require('../model/reviewModel')
// const catchAsync = require('../utils/catchAsync')
// const ApiError = require('../utils/apiError')
const handlerFactory = require('../controller/hanlderFactory')

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  console.log(req.body)
  next()
}
exports.getAllReviews = handlerFactory.getAll(Review)
exports.createReview = handlerFactory.createOne(Review)
exports.getReview = handlerFactory.getOne(Review)
exports.updateReview = handlerFactory.updateOne(Review)
exports.deleteReview = handlerFactory.deleteOne(Review)
