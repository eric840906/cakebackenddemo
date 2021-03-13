const userController = require('../controller/userController')
const authController = require('../controller/authController')
const router = require('express').Router()
// const multer = require('multer')

router.post('/signup', authController.signUp)
router.post('/login', authController.logIn)
router.get('/logout', authController.logOut)
router.post('/forgot', authController.forgotPass)
router.patch('/reset/:token', authController.resetPass)

router.use(authController.protect) // protect everyroute after this middleware
router.patch('/updatepass', authController.updatePass)
router.patch('/updateme', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
router.delete('/deleteme', userController.deleteMe)

router.get('/me', userController.getMe, userController.getUser)

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
