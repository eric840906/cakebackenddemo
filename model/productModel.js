const mongoose = require('mongoose')
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'average rating cannot be less than 1'],
      max: [5, 'average rating cannot be greater than 1'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price']
    },
    discountPrice: {
      type: Number
    },
    quantity: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ['cake', 'cookie', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A prodcut needs a description']
    },
    images: {
      type: [String],
      required: [true, 'Put some images to introduce your prodcut']
    },
    created: {
      type: Date,
      default: Date.now,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product', // product IDs are stored in Review model's product field
  localField: '_id'
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product
