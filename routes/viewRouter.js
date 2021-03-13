const router = require('express').Router()
const authController = require('../controller/authController')
const viewController = require('../controller/viewController')

router.get('/me', authController.protect, viewController.getAccount)
// check logged in
router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLogIn)

module.exports = router
