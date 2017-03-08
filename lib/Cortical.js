'use strict'

const request = require('request')

const DEFAULTS = {
	key: null,
	language: 'en',
	url: 'http://api.cortical.io/rest/',
	retina: 'en_associative',
	client: 'js_1.0'
}

/**
 * Constructor options
 * @typedef {Object} CorticalOptions
 * @prop {String} key API key
 * @prop {String} language Language
 * @prop {String} url Cortical API URL
 * @prop {String} retina Retina name
 * @prop {String} client API-client identifier string
 */

/**
 * Promise based wrapper for the Cortical.io API
 */
class Cortical {

	/**
	 * Creates an instance of Cortical.
	 * @param {CorticalOptions} options Options
	 */
	constructor(options)
	{
		this.options = Object.assign({}, DEFAULTS, options)
	}

	/**
	 * Get the fingerprint for a given text.
	 *
	 * @param {String} text Input text
	 * @param {Object} [params={}] Request parameters
	 * @returns {Array} The fingerprint: an array of positions
	 */
	getFingerprint(text, params = {})
	{
		return this.post('text', text, params)
			.then(data =>
			{
				return data[0].positions
			})
	}

	/**
	 * Get the fingerprints for a given array of texts.
	 *
	 * @param {Array} texts Input texts
	 * @param {Object} [params={}] Request parameters
	 * @returns {Array} An array of fingerprints
	 */
	getFingerprints(texts, params = {})
	{
		const arr = []

		for (const text of texts)
		{
			arr.push({ text })
		}

		return this.post('text/bulk', arr, params)
			.then(data =>
			{
				return data.map(item => item.positions)
			})
	}

	/**
	 * Send a GET request to the API.
	 *
	 * @param {String} path The URL path
	 * @param {Object} [params={}] The request parameters
	 * @returns {Promise} The results
	 */
	get(path, params = {})
	{
		return this.request(path, 'GET', null, params)
	}

	/**
	 * Send a POST request to the API.
	 *
	 * @param {String} path The URL path
	 * @param {Object} data The data to be sent in the request body
	 * @param {Object} [params={}] The request parameters
	 * @returns {Promise} The results
	 */
	post(path, data, params = {})
	{
		return this.request(path, 'POST', data, params)
	}

	/**
	 * Check if the given URL should expext an image in the response.
	 *
	 * @param {String} url The request URL
	 * @returns {Boolean} True is an image is expected
	 */
	isImageRequest(url)
	{
		return url.includes('/image') && !url.includes('/bulk')
	}

	/**
	 * Send a request to the API.
	 *
	 * @param {any} path The URL path
	 * @param {any} method The request method
	 * @param {any} [data=null] The data to be send in the body of a POST request
	 * @param {any} [params={}] The request parameters in the query string
	 * @returns {Promise<*>} The results
	 */
	request(path, method, data = null, params = {})
	{
		const url = this.getUrl(path)
		const accept = this.isImageRequest(url) ? 'image/png' : 'application/json'

		if (typeof params.retina_name === 'undefined' && !url.includes('/retinas'))
		{
			params.retina_name = this.options.retina
		}

		return new Promise((resolve, reject) =>
		{
			request({
				url,
				method,
				qs: params,
				headers: {
					Accept: accept,
					'Content-type': 'application/json',
					'api-key': this.options.key,
					'api-client': this.options.client
				},
				json: data
			}, (error, response, body) =>
			{
				if (error)
				{
					reject(error)
					return
				}

				if (response.statusCode !== 200)
				{
					const message = `Error ${ response.statusCode }: ${ body }`

					reject(message)
					return
				}

				if (this.isImageRequest(url))
				{
					resolve(body)
				}

				try
				{
					const json = JSON.parse(body)

					resolve(json)
				}
				catch (e)
				{
					resolve(body)
				}
			})
		})
	}

	/**
	 * Construct a URL by appending the base URL
	 *
	 * @param {string} path The URL path
	 * @returns {string} The URL
	 */
	getUrl(path)
	{
		return this.options.url + path
	}
}

module.exports = Cortical
