import * as assert from 'node:assert'
import { isValidGeoResponse } from '../../sensors/autolocale'

suite('Autolocale Test Suite', () => {
	suite('isValidGeoResponse', () => {
		test('should return true for valid geo response', () => {
			const validResponse = { lat: 52.52, lon: 13.405 }
			assert.strictEqual(isValidGeoResponse(validResponse), true)
		})

		test('should return true for response with zero coordinates', () => {
			const validResponse = { lat: 0, lon: 0 }
			assert.strictEqual(isValidGeoResponse(validResponse), true)
		})

		test('should return true for response with negative coordinates', () => {
			const validResponse = { lat: -33.8688, lon: -151.2093 }
			assert.strictEqual(isValidGeoResponse(validResponse), true)
		})

		test('should return false for null', () => {
			assert.strictEqual(isValidGeoResponse(null), false)
		})

		test('should return false for undefined', () => {
			assert.strictEqual(isValidGeoResponse(undefined), false)
		})

		test('should return false for non-object', () => {
			assert.strictEqual(isValidGeoResponse('string'), false)
			assert.strictEqual(isValidGeoResponse(123), false)
			assert.strictEqual(isValidGeoResponse(true), false)
		})

		test('should return false for missing lat', () => {
			const invalidResponse = { lon: 13.405 }
			assert.strictEqual(isValidGeoResponse(invalidResponse), false)
		})

		test('should return false for missing lon', () => {
			const invalidResponse = { lat: 52.52 }
			assert.strictEqual(isValidGeoResponse(invalidResponse), false)
		})

		test('should return false for string coordinates', () => {
			const invalidResponse = { lat: '52.52', lon: '13.405' }
			assert.strictEqual(isValidGeoResponse(invalidResponse), false)
		})

		test('should return false for null coordinates', () => {
			const invalidResponse = { lat: null, lon: null }
			assert.strictEqual(isValidGeoResponse(invalidResponse), false)
		})

		test('should return false for empty object', () => {
			assert.strictEqual(isValidGeoResponse({}), false)
		})

		test('should return true for response with extra properties', () => {
			const validResponse = {
				lat: 52.52,
				lon: 13.405,
				city: 'Berlin',
				country: 'Germany',
			}
			assert.strictEqual(isValidGeoResponse(validResponse), true)
		})
	})
})
