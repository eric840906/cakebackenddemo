const Product = require('../model/productModel')
const handlerFactory = require('../controller/hanlderFactory')
const catchAsync = require('../utils/catchAsync')

exports.getAllProducts = handlerFactory.getAll(Product)
exports.createProduct = handlerFactory.createOne(Product)
exports.getProduct = handlerFactory.getOne(Product)
exports.updateProduct = handlerFactory.updateOne(Product)
exports.deleteProduct = handlerFactory.deleteOne(Product)
exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        numPosts: { $sum: 1 }
      }
    }
  ])
  res.status(200).json({
    status: 'success',
    data: stats
  })
})
