// const fs = require('fs')
const Post = require('../model/postModel')
const ApiError = require('../utils/apiError')
// const APIfeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const handlerFactory = require('./hanlderFactory')

exports.aliasTopFive = (req, res, next) => {
  req.query.limit = 5
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

exports.getMyRecent = catchAsync(async (req, res, next) => {
  const recentPosts = await Post.find().where('author').equals(req.user._id).select('photo title article -author created').sort({ created: -1 }).limit(5)
  res.status(200).json({
    state: 'success',
    data: recentPosts
  })
})

exports.checkBody = (req, res, next) => {
  const bodyMap = new Map(Object.entries(req.body))
  console.log(bodyMap)
  if (!bodyMap.has('name') || !bodyMap.has('price')) {
    return res.status(400).json({
      status: 'failed',
      data: 'data should contain name and price'
    })
  }
  next()
}
exports.getAllPosts = handlerFactory.getAll(Post)
exports.getPost = handlerFactory.getOne(Post, 'comments')
exports.addPost = catchAsync(async (req, res, next) => {
  console.log(req.body)
  req.body.author = req.user._id
  const doc = await Post.create(req.body)
  if (!doc) return next(new ApiError('No document found with this ID', 404))
  res.status(201).json({
    status: 'success',
    post: doc
  })
})
exports.updatePost = handlerFactory.updateOne(Post)
exports.deletePost = handlerFactory.deleteOne(Post)

// aggregation pipeline

exports.getPostStats = catchAsync(async (req, res, next) => {
  const stats = await Post.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numPosts: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' }
      }
    },
    {
      $sort: { avgPrice: -1 }
    }
    // {
    //   // $match: { _id: { $ne: 'EASY' } }  //$ne = no equal to
    // }
  ])
  res.status(200).json({
    status: 'success',
    data: stats
  })
})
