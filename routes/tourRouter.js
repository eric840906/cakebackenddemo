const router = require('express').Router()
const tourController = require('../controller/tourController')
const reviewRouter = require('../routes/reviewRouter')
const { protect, restriction } = require('../controller/authController')

// router.param('id', tourController.checkID)
router.route('/stats').get(tourController.getTourStats)
router
  .route('/month-plan/:year')
  .get(
    protect,
    restriction('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  )
router
  .route('/top5-tour')
  .get(tourController.aliasTopFive, tourController.getAllTours)

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)
// /tours-within/233/center/-40,45/unit/mile

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistance)
router
  .route('/')
  .get(tourController.getAllTours)
  .post(protect, restriction('admin', 'lead-guide'), tourController.addTour)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(protect, restriction('admin', 'lead-guide'), tourController.updateTour)
  .delete(
    protect,
    restriction('admin', 'lead-guide'),
    tourController.deleteTour
  )
router.use('/:tourId/reviews', reviewRouter)

module.exports = router
