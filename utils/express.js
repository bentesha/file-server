
exports.awaited = (handler) => (request, response, next) => {
  handler(request, response, next).catch(next)
}