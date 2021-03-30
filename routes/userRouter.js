const userController = require('../controller/userController')
const authController = require('../controller/authController')
const cartController = require('../controller/cartController')
const router = require('express').Router()
// const multer = require('multer')

router.post('/signup', authController.signUp)
router.post('/login', authController.logIn)
router.get('/logout', authController.logOut)
router.post('/forgot', authController.forgotPass)
router.patch('/reset/:token', authController.resetPass)

router.use(authController.protect) // protect everyroute after this middleware
router.patch('/updatepass', authController.updatePass)
router.patch('/updateme', userController.updateMe)
router.delete('/deleteme', userController.deleteMe)

router.get('/me', userController.getMe, userController.getUser)
router.route('/cart')
  .post(userController.getMe, cartController.addToCart)
  .delete(userController.getMe, cartController.deleteProduct)

router.use(authController.restriction('admin'))

router
  .route('/')
  .get(userController.getAllUsers)
  // .post(userController.addUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
