const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/apiError')
const APIfeatures = require('../utils/apiFeatures')

exports.deleteOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndRemove(req.params.id)

    if (!doc) return next(new ApiError('No document found with this ID', 404))

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.createOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body)
    if (!doc) return next(new ApiError('No document found with this ID', 404))
    res.status(201).json({
      status: 'success',
      tour: doc
    })
  })

exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
      err => {
        if (err) {
          return next(new ApiError('No document found with this ID', 404))
        }
      }
    )
    res.status(200).json({
      status: 'success',
      data: doc
    })
  })

exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id, err => {
      if (err) return next(new ApiError('ID not found', 404))
    })
    if (populateOptions) query = query.populate(populateOptions) // adding populated enable a function to add actual user data into guides section according to IDs inside
    const doc = await query
    res.status(200).json({
      status: 'success',
      data: doc
    })
  })
exports.getAll = model =>
  catchAsync(async (req, res, next) => {
    // to allow nested get reviews on tour(small hack)
    // let filter = {}
    // if (req.params.tourId) filter = { tour: req.params.tourId }
    // result
    const features = new APIfeatures(model.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate()
    const doc = await features.query
    // const doc = await features.query.explain()
    // const allTours = await Tour.find().where('difficulty').equals('easy').where('price').gte(500)
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc
    })
  })
