const { getCountries, getCitiesByCountry } = require('../services/location')

const getCountriesList = async (req, res) => {
  const { search = '' } = req.query
  const countries = await getCountries(search)
  res.json(countries)
}

const getCitiesList = async (req, res) => {
  const { country } = req.params
  const { search = '' } = req.query
  const cities = await getCitiesByCountry(country, search)
  res.json(cities)
}

module.exports = {
  getCountriesList,
  getCitiesList,
}
