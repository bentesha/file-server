const { ValidationError } = require('joi')

module.exports = (error, request, response, next) => {
  // Handle Joi errors
  if (ValidationError.isError(error)) {
    const errors = error.details.reduce((result, detail) => {
      result[detail.context.key] = detail.message
      return result
    }, {})
    return response.status(400).json(errors)
  }
  throw error
}
