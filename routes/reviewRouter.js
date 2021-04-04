const router = require('express').Router({ mergeParams: true }) // in order to access parameters from tourRouter
const reviewController = require('../controller/reviewController')
const { protect, restriction } = require('../controller/authController')

router
  .route('/')
  .post(
    protect,
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews)
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    protect,
    restriction('user', 'guide', 'admin', 'lead-guide'),
    reviewController.updateReview
  )
  .delete(protect, restriction('admin', 'lead-guide'), reviewController.deleteReview)
module.exports = router
