'use strict'

describe('Cortical', () =>
{
	const Cortical = require('../lib/Cortical')
	const key = require('./support/key') // To run the tests an API key is required

	it('should reject calls without', (done) =>
	{
		const cortical = new Cortical()

		cortical.get('retinas')
			.then(() =>
			{
				done.fail()
			})
			.catch(e =>
			{
				expect(e.includes('Error 401')).toBe(true)
				done()
			})
	})

	it('should reject when the URL is invalid', (done) =>
	{
		const cortical = new Cortical({ url: '' })

		cortical.get('foo')
			.then(() =>
			{
				done.fail()
			})
			.catch(e =>
			{
				expect(e.message).toBe('Invalid URI "foo"')
				done()
			})
	})

	it('should get all retinas', (done) =>
	{
		const cortical = new Cortical({ key })

		cortical.get('retinas')
			.then(results =>
			{
				expect(Array.isArray(results)).toBe(true)
				expect(results.length > 1).toBe(true)
				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})

	it('should get a specific retina', (done) =>
	{
		const cortical = new Cortical({ key })
		const retina = 'en_associative'

		cortical.get('retinas', { retina_name: retina })
			.then(results =>
			{
				expect(results.length === 1).toBe(true)
				expect(results[0].retinaName).toBe(retina)
				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})

	it('should get the fingerprint for a text', (done) =>
	{
		const cortical = new Cortical({ key })

		cortical.getFingerprint('test')
			.then(fingerprint =>
			{
				expect(Array.isArray(fingerprint)).toBe(true)
				expect(fingerprint.length > 1).toBe(true)
				expect(typeof fingerprint[0]).toBe('number')
				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})

	it('should get the fingerprint for a text with a specific retina', (done) =>
	{
		const cortical = new Cortical({ key })
		const firstRetina = 'en_associative'
		const secondRetina = 'en_synonymous'

		let first = null

		cortical.getFingerprint('test', { retina_name: firstRetina })
			.then(fingerprint =>
			{
				first = fingerprint

				expect(Array.isArray(fingerprint)).toBe(true)
				expect(fingerprint.length > 1).toBe(true)

				return cortical.getFingerprint('test', { retina_name: secondRetina })
			})
			.then(fingerprint =>
			{
				expect(Array.isArray(fingerprint)).toBe(true)
				expect(fingerprint.length > 1).toBe(true)

				expect(typeof fingerprint[0]).not.toEqual(first)

				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})

	it('should get the fingerprints for a text', (done) =>
	{
		const cortical = new Cortical({ key })

		cortical.getFingerprints(['test', 'car'])
			.then(fingerprints =>
			{
				expect(Array.isArray(fingerprints)).toBe(true)
				expect(fingerprints.length > 1).toBe(true)

				const first = fingerprints[0]
				const second = fingerprints[1]

				expect(Array.isArray(first)).toBe(true)
				expect(first.length > 1).toBe(true)
				expect(typeof first[0]).toBe('number')

				expect(Array.isArray(second)).toBe(true)
				expect(second.length > 1).toBe(true)
				expect(typeof second[0]).toBe('number')

				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})

	it('should get an image for a text', (done) =>
	{
		const cortical = new Cortical({ key })

		cortical.post('image', { term: 'jaguar' })
			.then(image =>
			{
				expect(typeof image).toBe('string')
				expect(image.length > 1).toBe(true)

				done()
			})
			.catch(e =>
			{
				done.fail(e)
			})
	})
})
