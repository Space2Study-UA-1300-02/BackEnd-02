const router = require('express').Router()
const { getCountriesList, getCitiesList } = require('../controllers/location')

router.get('/countries', getCountriesList)
router.get('/cities/:country', getCitiesList)

module.exports = router


/**
 * @swagger
 * /location/countries:
 *   get:
 *     summary: Get list of countries
 *     description: Returns a list of all countries with search capability
 *     tags: [Location]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search string to filter countries
 *         example: "al"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of countries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountriesResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *
 * /location/cities/{country}:
 *   get:
 *     summary: Get list of cities for selected country
 *     description: Returns a list of all cities for the specified country
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the country
 *         example: "Albania"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of cities
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitiesResponse'
 *       404:
 *         description: Country not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 */
