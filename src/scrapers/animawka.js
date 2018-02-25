const x = require('x-ray')()
const api = require('../utls/api')
const _ = require('lodash')
const mp4upload = require('../videoplayers/Mp4UploadCom')

const utils = require('../utls/utils')

const BASE_URL = 'https://animawka.pl'

const getAnimes = async () => {
  const response = await api.get(`${BASE_URL}/anime`)
  return new Promise((resolve, reject) => {
    x(response.data, {
      title: ['div[class="container"] > div[class="row"] > div[class="col s12"] > div[class="card medium hide-on-large-only"] > div[class="card-image waves-effect waves-block waves-light"] > span[class="card-title boldtitle activator"]'],
      url: ['div[class="container"] > div[class="row"] > div[class="col s12"] > div[class="card medium hide-on-large-only"] > div[class="card-action"] > a@href'],
      description: ['div[class="container"] > div[class="row"] > div[class="col s12"] > div[class="card medium hide-on-large-only"] > div[class="card-reveal"] > p'],
      image: ['div[class="container"] > div[class="row"] > div[class="col s12"] > div[class="card medium hide-on-large-only"] > div[class="card-image waves-effect waves-block waves-light"] > img@src']
    })((err, obj) => {
      if (err) {
        reject(err)
      }

      const list = _.compact(obj.title).map((el, i) => {
        return ({
          title: el,
          url: BASE_URL + obj.url[i],
          description: obj.description[i],
          image: obj.image[i]
        })
      })
      resolve(list)
    })
  })
}
const getAnime = async (q) => {
  const response = await api.get(`${BASE_URL}/anime/${q}`)
  return new Promise((resolve, reject) => {
    x(response.data, {
      url: ['div[class="col s12 m6"] > div[class="card"] > div[class="collection"] > a[class="collection-item black-text"]@href'],
      description: ['div[class="col s12 m6"] > div[class="card"] > div[class="collection"] > a[class="collection-item black-text"]']
    })((err, obj) => {
      if (err) {
        reject(err)
      }

      const list = _.compact(obj.url).map((el, i) => {
        return ({
          number: i + 1,
          url: BASE_URL + el,
          // number: obj.description[i].match(/[0-9]+/g)[0],
          // obj.description[i].replace(/\t|\n|(.*)\Odcinek {2}\b(.*)|-/g, ''),
          description: obj.description[i].replace(/\t|\n/g, '')
        })
      })
      resolve(list)
    })
  })
}

const getAnimePlayers = async (q, n) => {
  const response = await api.get(`${BASE_URL}/anime/${q}/${n}`)
  return new Promise((resolve, reject) => {
    x(response.data, {
      host: ['div[class="card-tabs"] > ul[class="tabs tabs-fixed-width tabs-transparent"] > li[class="tab"] > a'],
      players: ['div[class="video-container"] > iframe@src']
    })(async (err, obj) => {
      if (err) {
        reject(err)
      }

      const list = _.map(_.zip(obj.host, obj.players), (objZiped) => {
        console.log(objZiped)
        return ({
          host: objZiped[0],
          player: objZiped[1]
        })
      })

      const returnList = []

      const toDecode = []

      _.forEach(list, (item, index) => {
        const domain = utils.getDomainName(item.player)
        if (domain === 'mp4upload.com') {
          toDecode.push(item)
        } else {
          returnList.push(item)
        }
      })

      // TODO to change !!
      if (toDecode.length === 1) {
        const result = await mp4upload.getVideo(toDecode[0].player)
        returnList.push({
          host: toDecode[0].host,
          player: result.url
        })
      }

      resolve(returnList)
    })
  })
}

// getAnimes().then(el => console.log(el)).catch(err => console.log(err))
// getAnime('citrus').then(el => console.log(el)).catch(err => console.log(err))
// getAnimePlayers('citrus', '1').then(el => console.log(el)).catch(err => console.log(err))
module.exports = {
  getAnimes,
  getAnime,
  getAnimePlayers
}
