const mongoose = require('mongoose')
const postCommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'please enter your comment']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'comment must belong to a post']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'comment must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

postCommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  // this.populate({
  //   path: 'user',
  //   select: 'name photo'
  // }).populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  next()
})

// postCommentSchema.index({ tour: 1, user: 1 }, { unique: true })

// findByIdAndUpdate
// findByIdAndDelete
// postCommentSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne()
//   console.log('thisr', this.r)
//   next()
// })
// postCommentSchema.post(/^findOneAnd/, async function () {
//   // this.r = await this.findOne() doesn't work here, cuz query has been executed
//   await this.r.constructor.calcAverageRatings(this.r.tour._id)
// })

const PostComment = mongoose.model('PostComment', postCommentSchema)
module.exports = PostComment
