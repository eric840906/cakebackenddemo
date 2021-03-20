const router = require('express').Router()
const postController = require('../controller/postController')
// const reviewRouter = require('../routes/reviewRouter')
const { protect, restriction } = require('../controller/authController')

// router.param('id', postController.checkID)
router.route('/stats').get(postController.getPostStats)

router.route('/recent').get(protect, postController.getMyRecent)

router
  .route('/top5-post')
  .get(postController.aliasTopFive, postController.getAllPosts)

router
  .route('/')
  .get(postController.getAllPosts)
  .post(protect, postController.addPost)

router
  .route('/:id')
  .get(postController.getPost)
  .patch(protect, restriction('admin', 'lead-guide'), postController.updatePost)
  .delete(
    protect,
    restriction('admin', 'lead-guide'),
    postController.deletePost
  )
// router.use('/:postId/reviews', reviewRouter)

module.exports = router
