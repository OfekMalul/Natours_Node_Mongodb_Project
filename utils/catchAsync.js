module.exports = (fn) => {
  // the anonymous function will be called with the req, res and next
  // then the fn will be called with those params.
  // the fn changes according to the request of the user.
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
