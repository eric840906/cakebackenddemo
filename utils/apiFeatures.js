class APIfeatures {
  constructor (query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter () {
    const queryObj = { ...this.queryString }
    console.log(queryObj)
    const excludeField = ['page', 'limit', 'sort', 'fields']
    excludeField.forEach(item => delete queryObj[item])
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    this.query.find(JSON.parse(queryStr))
    console.log(queryStr)
    return this
  }

  sort () {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '))
    } else {
      this.query = this.query.sort('-created -price')
    }
    return this
  }

  limit () {
    if (this.queryString.fields) {
      this.query = this.query.select(
        this.queryString.fields.split(',').join(' ')
      )
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate () {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

module.exports = APIfeatures
