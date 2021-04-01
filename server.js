const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config({ path: './config.env' })
const app = require('./app')
const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD)
if (process.env.NODE_ENV === 'development') {
  console.log(DB)
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  })
  .then(() => console.log('DATABASE CONNECTED'))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})

// unhandled rejection handling
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION, SERVER DOWN')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

// uncaught exception handling
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION, SERVER DOWN')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
