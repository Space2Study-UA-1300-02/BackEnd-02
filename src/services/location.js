const countriesData = require('../consts/countries-cities.json')

const getCountries = async (search = '') => {
  const filteredCountries = countriesData.data
    .map(item => item.country)
    .filter(country =>
      country.toLowerCase().includes(search.toLowerCase())
    )

  return {
    error: false,
    data: filteredCountries,
    total: filteredCountries.length
  }
}

const getCitiesByCountry = async (countryName) => {
  const country = countriesData.data.find(
    item => item.country.toLowerCase() === countryName.toLowerCase()
  )

  if (!country) {
    return {
      error: true,
      msg: 'Country not found',
      data: []
    }
  }

  return {
    error: false,
    msg: 'Cities retrieved successfully',
    data: country.cities
  }
}

module.exports = {
  getCountries,
  getCitiesByCountry,
}
