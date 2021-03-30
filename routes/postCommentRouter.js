const router = require('express').Router({ mergeParams: true }) // in order to access parameters from tourRouter
const postCommentController = require('../controller/postCommentController')
const { xssFilter } = require('../utils/xssfilter')
const { protect, restriction } = require('../controller/authController')

router.use(protect)

router
  .route('/')
  .post(
    restriction('user', 'guide', 'lead-guide'),
    postCommentController.setCommentUserIds,
    postCommentController.createPostComment
  )
  .get(postCommentController.getAllPostComments)
router.use(xssFilter)
router
  .route('/:id')
  .get(postCommentController.getPostComment)
  .post(
    postCommentController.setCommentUserIds,
    postCommentController.createPostComment
  )
  .patch(
    restriction('user', 'guide', 'admin', 'lead-guide'),
    postCommentController.updatePostComment
  )
  .delete(restriction('admin', 'lead-guide'), postCommentController.deletePostComment)
module.exports = router
