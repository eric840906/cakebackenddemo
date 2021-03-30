const router = require('express').Router()
const postController = require('../controller/postController')
const { xssFilter } = require('../utils/xssfilter')
// const reviewRouter = require('../routes/reviewRouter')
const { protect, restriction } = require('../controller/authController')

// router.param('id', postController.checkID)
router.route('/stats').get(postController.getPostStats)

router.route('/recent').get(protect, postController.getMyRecent)

router
  .route('/top5-post')
  .get(postController.aliasTopFive, postController.getAllPosts)
router.use(xssFilter)
router
  .route('/')
  .get(postController.getAllPosts)
  .post(protect, postController.addPost)

router
  .route('/:id')
  .get(postController.getPost)
  .patch(protect, postController.updatePost)
  .delete(
    protect,
    restriction('admin'),
    postController.deletePost
  )
// router.use('/:postId/reviews', reviewRouter)
router.use(xssFilter)
router.route('/xsstest').post((req, res) => {
  console.log(req.body)
  res.status(200).json({
    state: 'success',
    data: req.body
  })
})

module.exports = router
