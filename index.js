require('dotenv').config()
const axios = require('axios');
const moment = require('moment')

const { 
	API_URL,
	API_PLAYLIST_PATH,
	API_PLAYLIST_ID,
	API_VIDEO_PATH,
	API_KEY,
	API_PART,
	API_MAX_RESULTS
} = process.env

const getVideoIdsFromPlaylist = async playlistId => {
	return new Promise( async (resolve,reject) => {
		const config = {
			url: `${API_URL}/${API_PLAYLIST_PATH}?playlistId=${playlistId}&part=${API_PART}&maxResults=${API_MAX_RESULTS}&key=${API_KEY}`
		}
		try {
			const { data: { items: videos } } = await axios(config)
			const listOfIds = videos.map(videoItem => {
				const { contentDetails: { videoId } } = videoItem
				return videoId
			})
			resolve(listOfIds)
		} catch(error) {
			reject(error)
		}
	})
}

const getVideosDurationFromIds = videoIds => {
	return new Promise(async(resolve,reject) => {
		const videoIdsList = videoIds.join()
		const config = {
			url: `${API_URL}/${API_VIDEO_PATH}?id=${videoIds}&part=${API_PART}&key=${API_KEY}`
		}
		try {
			const { data: { items: videos } } = await axios(config)
			const listOfDuration = videos.map(videoItem => {
				const { contentDetails: { duration } } = videoItem
				return duration
			})
			resolve(listOfDuration)			
		} catch (error) {
			reject(error)
		}
	})
}
const getTotalDurationInSeconds = videosDurationISO => {
	return videosDurationISO
		.map(singleDuration => moment.duration(singleDuration).asSeconds())
		.reduce((prevSeconds,currSeconds) => prevSeconds+currSeconds,0)
}

const getHoursMinutesSeconds = totalDuration => {
	const hours = Math.floor(moment.duration(totalDuration,"seconds").asHours())
	const minutes = moment.duration(totalDuration,"seconds").minutes()
	const seconds = moment.duration(totalDuration,"seconds").seconds()
	return { 
		hours, 
		minutes, 
		seconds
	} 
}

(async() =>{
	try {
		const videoIds = await getVideoIdsFromPlaylist(API_PLAYLIST_ID)	
		const videosDurationISO = await getVideosDurationFromIds(videoIds)
		const totalDuration = getTotalDurationInSeconds(videosDurationISO)
		const data = getHoursMinutesSeconds(totalDuration)
		console.log(data)
	} catch(error) {
		console.log(error)
	}
})()

