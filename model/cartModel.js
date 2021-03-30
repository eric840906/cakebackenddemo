const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number
    }
  }
)
module.exports = cartSchema
