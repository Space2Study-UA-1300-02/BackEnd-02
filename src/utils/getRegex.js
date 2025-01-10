const getRegex = (regex = '') => ({
  $regex: regex.length > 0 ? regex : '.*'
})

module.exports = getRegex
