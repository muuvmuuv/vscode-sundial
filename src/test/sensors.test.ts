import * as assert from 'node:assert'
import { isValidGeoResponse } from '../sensors/autolocale.js'

suite('Sensors API Test Suite', () => {
	suite('ip-api.com Geolocation API', () => {
		const API_URL = 'http://ip-api.com/json/?fields=lat,lon'

		test('API should be reachable', async () => {
			const response = await fetch(API_URL)
			assert.ok(response.ok, `API should return OK status, got ${response.status}`)
		})

		test('API should return valid JSON', async () => {
			const response = await fetch(API_URL)
			const data = await response.json()
			assert.ok(typeof data === 'object', 'Response should be an object')
			assert.ok(data !== null, 'Response should not be null')
		})

		test('API response should match expected schema', async () => {
			const response = await fetch(API_URL)
			const data: unknown = await response.json()

			assert.ok(
				isValidGeoResponse(data),
				`Response should have lat and lon as numbers. Got: ${JSON.stringify(data)}`,
			)
		})

		test('API should return valid latitude range (-90 to 90)', async () => {
			const response = await fetch(API_URL)
			const data = (await response.json()) as { lat: number; lon: number }

			assert.ok(
				data.lat >= -90 && data.lat <= 90,
				`Latitude ${data.lat} should be between -90 and 90`,
			)
		})

		test('API should return valid longitude range (-180 to 180)', async () => {
			const response = await fetch(API_URL)
			const data = (await response.json()) as { lat: number; lon: number }

			assert.ok(
				data.lon >= -180 && data.lon <= 180,
				`Longitude ${data.lon} should be between -180 and 180`,
			)
		})

		test('API with extended fields should still include lat/lon', async () => {
			// Test that even if we request more fields, lat/lon are present
			const response = await fetch('http://ip-api.com/json/?fields=status,lat,lon,city,country')
			const data: unknown = await response.json()

			assert.ok(isValidGeoResponse(data), 'Response should still have valid lat/lon')
		})
	})

	suite('suncalc library', () => {
		// Import suncalc dynamically to test it
		let getTimes: typeof import('suncalc').getTimes

		suiteSetup(async () => {
			const suncalc = await import('suncalc')
			getTimes = suncalc.getTimes
		})

		test('should calculate sunrise/sunset for known location', () => {
			// Berlin, Germany
			const latitude = 52.52
			const longitude = 13.405
			const date = new Date('2024-06-21T12:00:00Z') // Summer solstice

			const tides = getTimes(date, latitude, longitude)

			assert.ok(tides.sunrise instanceof Date, 'sunrise should be a Date')
			assert.ok(tides.sunset instanceof Date, 'sunset should be a Date')
			assert.ok(!Number.isNaN(tides.sunrise.getTime()), 'sunrise should be a valid date')
			assert.ok(!Number.isNaN(tides.sunset.getTime()), 'sunset should be a valid date')
		})

		test('should have sunrise before sunset', () => {
			const latitude = 52.52
			const longitude = 13.405
			const date = new Date('2024-06-21T12:00:00Z')

			const tides = getTimes(date, latitude, longitude)

			assert.ok(tides.sunrise.getTime() < tides.sunset.getTime(), 'Sunrise should be before sunset')
		})

		test('should handle equator coordinates', () => {
			const latitude = 0
			const longitude = 0
			const date = new Date()

			const tides = getTimes(date, latitude, longitude)

			assert.ok(tides.sunrise instanceof Date, 'sunrise should be a Date at equator')
			assert.ok(tides.sunset instanceof Date, 'sunset should be a Date at equator')
		})

		test('should handle southern hemisphere', () => {
			// Sydney, Australia
			const latitude = -33.8688
			const longitude = 151.2093
			const date = new Date('2024-06-21T12:00:00Z') // Winter in southern hemisphere

			const tides = getTimes(date, latitude, longitude)

			assert.ok(tides.sunrise instanceof Date, 'sunrise should be a Date')
			assert.ok(tides.sunset instanceof Date, 'sunset should be a Date')
			assert.ok(
				tides.sunrise.getTime() < tides.sunset.getTime(),
				'Sunrise should be before sunset in southern hemisphere',
			)
		})

		test('should handle extreme latitudes', () => {
			// Near Arctic Circle - Tromsø, Norway
			const latitude = 69.6496
			const longitude = 18.956
			const date = new Date('2024-03-21T12:00:00Z') // Spring equinox

			const tides = getTimes(date, latitude, longitude)

			// At equinox, even extreme latitudes should have sunrise/sunset
			assert.ok(tides.sunrise instanceof Date, 'sunrise should exist at equinox')
			assert.ok(tides.sunset instanceof Date, 'sunset should exist at equinox')
		})

		test('should return consistent results for same input', () => {
			const latitude = 52.52
			const longitude = 13.405
			const date = new Date('2024-06-21T12:00:00Z')

			const tides1 = getTimes(date, latitude, longitude)
			const tides2 = getTimes(date, latitude, longitude)

			assert.strictEqual(
				tides1.sunrise.getTime(),
				tides2.sunrise.getTime(),
				'Sunrise should be consistent',
			)
			assert.strictEqual(
				tides1.sunset.getTime(),
				tides2.sunset.getTime(),
				'Sunset should be consistent',
			)
		})
	})
})
