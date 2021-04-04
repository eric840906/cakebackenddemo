const path = require('path')
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
// const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const helmet = require('helmet')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const ApiError = require('./utils/apiError')
const errorController = require('./controller/errorController')
const userRouter = require('./routes/userRouter')
const productRouter = require('./routes/productRouter')
const postRouter = require('./routes/postRouter')
const postCommentRouter = require('./routes/postCommentRouter')
const reviewRouter = require('./routes/reviewRouter')
const cors = require('cors')
const app = express()

const corsOptions = {
  origin: ['http://localhost:8080', 'http://192.168.100.5:8081', 'http://127.0.0.1:5501', 'https://eric840906.github.io'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
}

// set up pug engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, 'public')))
// set security http
app.use(helmet())
const addTime = (req, res, next) => {
  req.requestTime = new Date().toISOString()
  console.log(req.requestTime)
  next()
}
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
// const limiter = rateLimit({
//   // maximum 100 request from same ip in an hour
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'too many request, rest for an hour'
// })
// limit request from same IP
// app.use('/api', limiter)
// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })) // 將json轉成能用的物件
// cookie parser
app.use(cookieParser())
// app.use((req,res,next)=> {console.log(req.cookies)
// next()
// })
// data sanitization against noSQL query injection
app.use(mongoSanitize())
// data sanitization against XSS
// app.use(xss())
// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
)
app.use(compression())
app.use(addTime)
// app.get('/', (req, res) => {
//   res.status(200).json({message: 'hello express', app: 'naposts'})
// })

// app.post('/', (req, res) => {
//   res.status(200).send('posting')
// })

///
// app.use('/', viewRouter)

app.use('/api/post', postRouter)
app.use(xss())
app.use('/api/user', userRouter)
app.use('/api/postcomment', postCommentRouter)
app.use('/api/product', productRouter)
app.use('/api/review', reviewRouter)

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   state: 'failed',
  //   message: `route ${req.originalUrl} doesn't exist`
  // })
  // const error = new Error(`route ${req.originalUrl} doesn't exist`)
  // error.statusCode = 404
  // error.status = 'fail'
  next(new ApiError(`route ${req.originalUrl} doesn't exist`, 404))
})

app.use(errorController)
module.exports = app
