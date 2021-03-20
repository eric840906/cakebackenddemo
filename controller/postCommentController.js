const PostComment = require('../model/postCommentModel')
const handlerFactory = require('../controller/hanlderFactory')

exports.setCommentUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.post = req.params.id
  if (!req.body.user) req.body.user = req.user.id
  console.log(req.body)
  next()
}
exports.getAllPostComments = handlerFactory.getAll(PostComment)
exports.createPostComment = handlerFactory.createOne(PostComment)
exports.getPostComment = handlerFactory.getOne(PostComment)
exports.updatePostComment = handlerFactory.updateOne(PostComment)
exports.deletePostComment = handlerFactory.deleteOne(PostComment)
