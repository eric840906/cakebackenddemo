const mongoose = require('mongoose')
const Product = require('./productModel')
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "review can't be empty"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      max: [5, '5 is the maximum rating'],
      min: [1, '1 is the minimum rating'],
      required: [true, 'please give a score']
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'review must belong to a product']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  // this.populate({
  //   path: 'user',
  //   select: 'name photo'
  // }).populate({
  //   path: 'product',
  //   select: 'name'
  // })
  // this.populate({
  //   path: 'product',
  //   select: 'name'
  // })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: productId // select the product to update
      }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])
  console.log(stats)
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

reviewSchema.index({ product: 1, user: 1 }, { unique: true })

reviewSchema.post('save', function () {
  // this point to current review
  this.constructor.calcAverageRatings(this.product)
})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne()
  console.log('thisr', this.r)
  next()
})
reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne() doesn't work here, cuz query has been executed
  await this.r.constructor.calcAverageRatings(this.r.product._id)
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
