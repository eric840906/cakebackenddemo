const router = require('express').Router({ mergeParams: true }) // in order to access parameters from tourRouter
const reviewController = require('../controller/reviewController')
const { protect, restriction } = require('../controller/authController')

router.use(protect)

router
  .route('/')
  .post(
    restriction('user', 'guide', 'lead-guide'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews)
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    restriction('user', 'guide', 'admin', 'lead-guide'),
    reviewController.updateReview
  )
  .delete(restriction('admin', 'lead-guide'), reviewController.deleteReview)
module.exports = router
