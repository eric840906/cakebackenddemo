const productController = require('../controller/productController')
const router = require('express').Router()
const { protect, restriction } = require('../controller/authController')

router.route('/stats').get(productController.getProductStats)
router
  .route('/')
  .get(productController.getAllProducts)
  .post(protect, restriction('admin'), productController.createProduct)
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(protect, restriction('admin'), productController.updateProduct)
  .delete(protect, restriction('admin'), productController.deleteProduct)

module.exports = router
