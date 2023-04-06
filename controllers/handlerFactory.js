const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures');

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument,
      },
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    // we finding the document by id, then updating it by the info we get from the req.body.
    // The third parameter is known as options. new = true means we return the new updated tour to the client.
    // runValidators validates the new information is accpetable by the schema.
    const updateDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updateDocument) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: updateDocument,
      },
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document was found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: doc,
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const docs = await features.query.explain();
    //Send Response
    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: docs,
    });
  });
};
