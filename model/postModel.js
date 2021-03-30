const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel') // only needs to be imported if using embedded guides
// const validator = require('validator')
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post need a title']
    },
    slug: {
      type: String
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1],
      max: [5],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    article: {
      type: String,
      required: [true, 'Article field cannot be empty']
    },
    photo: {
      type: String,
      required: [true, 'Share a photo with others']
    },
    category: {
      type: String,
      enum: {
        values: ['News', 'Cakes', 'Cookies', 'Tips', 'Other'],
        message: 'only accept "News", "Cakes", "Cookies", "Tips" and "Other" as difficulty'
      },
      default: 'Other'
    },
    images: {
      type: [String]
    },
    created: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A post must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// postSchema.index({price: 1, reatingsAverage: 1})
// postSchema.index({slug: 1})
// postSchema.index({startLocation: '2dsphere'})

// postSchema.virtual('DurationWeeks').get(function () {
//   return this.duration / 7
// })
postSchema.virtual('comments', {
  ref: 'PostComment',
  foreignField: 'post', // post IDs are stored in PostComment model's post field
  localField: '_id',
  options: { sort: { createdAt: -1 }, limit: 5 }
})
// document middleware, runs before .save() and .create()
postSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true })
  next()
})
// runs after .save() and .create()
// postSchema.post('save', function (doc, next) {
//   console.log(doc)
//   next()
// })

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name email photo'
  })
  next()
})

// works with guides: Array in the model,  demonstrate how to embed user into guide array, however this is not very good in this situation, cuz ull have to check if certain user appears in post guide if they change their detail, the better way is referencing in this situation, which means only store user id in guides
// postSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(id => User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//   next()
// })

// referencing
// what im doing now, this way, guides only connect with user's ID, therefore we dont need to check user info in post when it's been modified
// postSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt'
//   })
//   next()
// })
// query middleware, runs b4 all method start with find
// postSchema.pre(/^find/, function (next) {
//   this.find({ secretPost: { $ne: true } })
//   this.start = Date.now()
//   next()
// })
// runs after all method start with find
// postSchema.post(/^find/, function (next) {
//   console.log(`${Date.now() - this.start}ms`)
//   next()
// })

// aggregation middleware
// postSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretPost: { $ne: true } } })
//   next()
// })
const Post = mongoose.model('Post', postSchema)

module.exports = Post
