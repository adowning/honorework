/* eslint-disable no-use-before-define */
/* eslint-disable no-throw-literal */
/* eslint-disable vars-on-top */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
// var nolimitApiFactory = require('./nolimit-api');
import { info } from './info'
import { nolimitApiFactory } from './nolimit-api'

// var info = require('./info');

let CDN = 'https://{ENV}'
// var LOADER_URL = '{CDN}/loader/loader-{DEVICE}.html?operator={OPERATOR}&game={GAME}&language={LANGUAGE}';
let LOADER_URL = './'

let REPLACE_URL = '{CDN}/loader/game-loader.html?{QUERY}'
let GAMES_URL = '{CDN}/games'

let DEFAULT_OPTIONS = {
  'device': 'desktop',
  'environment': 'partner',
  'language': 'en',
  'nolimit.js': '__VERSION__'
}

const nolimit = {
  /**
   * @property {string} version current version of nolimit.js
   */
  version: '__VERSION__',

  options: {},

  /**
   * Initialize loader with default parameters. Can be skipped if the parameters are included in the call to load instead.
   *
   * @param {object}  options
   * @param {string}  options.operator the operator code for the operator
   * @param {string}  [options.language] the language to use for the game
   * @param {string}  [options.device] type of device: 'desktop' or 'mobile'. Recommended to always set this to make sure the correct device is used.
   * @param {string}  [options.environment] which environment to use; usually 'partner' or the name of a production environment. This overrides the environment part of the hostname.
   * @param {boolean} [options.fullscreen] set to false to disable automatic fullscreen on mobile (Android only)
   * @param {boolean} [options.clock] set to false to disable in-game clock
   * @param {boolean} [options.autoplay] set to false to disable and remove the auto play button.
   * @param {boolean} [options.mute] start the game without sound
   * @param {boolean} [options.hideCurrency] hide currency symbols/codes in the game
   * @param {string}  [options.quality] force asset quality. Possible values are 'high', 'medium', 'low'. Defaults to smart loading in each game.
   * @param {object}  [options.jurisdiction] force a specific jurisdiction to enforce specific license requirements and set specific options and overrides. See README for jurisdiction-specific details.
   * @param {object}  [options.jurisdiction.name] the name of the jurisdiction, for example "MT", "DK", "LV", "RO", "UKGC", "PT", "ES", "IT" or "SE".
   * @param {object}  [options.realityCheck] set options for reality check. See README for more details.
   * @param {object}  [options.realityCheck.enabled] set to false to disable reality-check dialog.
   * @param {number}  [options.realityCheck.interval] Interval in minutes between showing reality-check dialog.
   * @param {number}  [options.realityCheck.sessionStart] override session start, default is Date.now().
   * @param {number}  [options.realityCheck.nextTime] next time to show dialog, defaults to Date.now() + interval.
   * @param {number}  [options.realityCheck.bets] set initial bets if player already has bets in the session.
   * @param {number}  [options.realityCheck.winnings] set initial winnings if player already has winnings in the session.
   * @param {number}  [options.realityCheck.message] Message to display when dialog is opened. A generic default is provided.
   * @param {string}  [options.playForFunCurrency] currency to use when in playing for fun mode. Uses EUR if not specified.
   * @param {boolean} [options.hideExitButton] set to true to control closing of mobile games from outside of game area.
   * @param {boolean} [options.showExitButtonDesktop] set to true to show exit button also in desktop mode.
   * @param {boolean} [options.useReplayLinkPopup] set to true to show a popup for loading replays instead of trying to open directly.
   * @param {boolean} [options.googleAnalytics] set to false to completely disable the use of analytics.
   * @param {string}  [options.lobbyUrl] URL to redirect back to lobby on mobile, if not using a target
   * @param {string}  [options.depositUrl] URL to deposit page, if not using a target element
   * @param {string}  [options.supportUrl] URL to support page, if not using a target element
   * @param {boolean} [options.depositEvent] instead of using URL, emit "deposit" event (see event documentation)
   * @param {boolean} [options.lobbyEvent] instead of using URL, emit "lobby" event (see event documentation) (mobile only)
   * @param {string}  [options.accountHistoryUrl] URL to support page, if not using a target element
   *
   * @example
   * nolimit.init({
   *    operator: 'SMOOTHOPERATOR',
   *    language: 'sv',
   *    device: 'mobile',
   *    environment: 'partner',
   *    currency: 'SEK',
   *    jurisdiction: {
   *        name: 'SE'
   *    },
   *    realityCheck: {
   *        interval: 30
   *    }
   * });
   */
  init(options) {
    this.options = options
  },

  /**
   * Load game, replacing target with the game.
   *
   * <li> If target is a HTML element, it will be replaced with an iframe, keeping all the attributes of the original element, so those can be used to set id, classes, styles and more.
   * <li> If target is a Window element, the game will be loaded directly in that.
   * <li> If target is undefined, it will default to the current window.
   *
   * @param {object} options see init for details
   * @see {@link nolimit.init} for details on more options
   * @param {string}              options.game case sensitive game code, for example 'DragonTribe' or 'Wixx'
   * @param {HTMLElement|Window}  [options.target] the HTMLElement or Window to load the game in
   * @param {string}              [options.token] the token to use for real money play
   * @param {string}              [options.version] force specific game version such as '1.2.3', or 'development' to disable cache
   *
   * @returns {nolimitApi}        The API connection to the opened game.
   *
   * @example
   * var api = nolimit.load({
   *    game: 'DragonTribe',
   *    target: document.getElementById('game'),
   *    token: realMoneyToken,
   *    mute: true
   * });
   */
  load(options) {
    options = processOptions(mergeOptions(this.options, options))
    // console.log(options.target)
    let target = options.target || window
    // var target = document.querySelector(".game") //options.target || window;
    // console.log(target)
    if (target.Window && target instanceof target.Window) {
      // console.log('using div')
      target = document.createElement('div')
      target.setAttribute(
        'style',
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;'
      )
      document.body.appendChild(target)
    }

    if (target.ownerDocument && target instanceof target.ownerDocument.defaultView.HTMLElement) {
      // console.log('using iframe')
      let iframe = makeIframe(target)
      target.parentNode.replaceChild(iframe, target)

      let nolimitApi = nolimitApiFactory(iframe, () => {
        html(iframe.contentWindow, options)
      })

      return nolimitApi
    } else {
      throw `Invalid option target: ${target}`
    }
  },

  /**
   * Load game in a new, separate page. This offers the best isolation, but no communication with the game is possible.
   *
   * @param {object} options see init for details
   * @see {@link nolimit.init} for details on more options
   * @param {string}              options.game case sensitive game code, for example 'DragonTribe' or 'Wixx'
   * @param {string}              [options.token] the token to use for real money play
   * @param {string}              [options.version] force specific game version such as '1.2.3', or 'development' to disable cache
   *
   * @example
   * var api = nolimit.replace({
   *    game: 'DragonTribe',
   *    target: document.getElementById('game'),
   *    token: realMoneyToken,
   *    mute: true
   * });
   */
  replace(options) {
    location.href = this.url(options)

    function noop() {}

    return { on: noop, call: noop }
  },

  /**
   * Constructs a URL for manually loading the game in an iframe or via redirect.
   * @param {object} options see init for details
   * @see {@link nolimit.init} for details on options
   * @return {string}
   */
  url(options) {
    let gameOptions = processOptions(mergeOptions(this.options, options))

    let gameUrl = REPLACE_URL.replace('{CDN}', gameOptions.cdn).replace(
      '{QUERY}',
      makeQueryString(gameOptions)
    )
    // console.log(gameUrl)
    return gameUrl
  },

  /**
   * Load information about the game, such as: current version, preferred width/height etc.
   *
   * @param {object}      options
   * @param {string}      [options.environment] which environment to use; usually 'partner' or the name of a production environment. This overrides the environment part of the hostname.
   * @param {string}      options.game case sensitive game code, for example 'DragonTribe' or 'Wixx'
   * @param {string}      [options.version] force specific version of game to load.
   * @param {Function}    callback  called with the info object, if there was an error, the 'error' field will be set
   *
   * @example
   * nolimit.info({game: 'DragonTribe'}, function(info) {
   *     var target = document.getElementById('game');
   *     target.style.width = info.size.width + 'px';
   *     target.style.height = info.size.height + 'px';
   *     //console.log(info.name, info.version);
   * });
   */
  info(options, callback) {
    options = processOptions(mergeOptions(this.options, options))
    info.load(options, callback)
  }
}

function makeQueryString(options) {
  let query = []
  for (let key in options) {
    let value = options[key]
    if (typeof value === 'undefined') {
      continue
    }
    if (value instanceof HTMLElement) {
      continue
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  }
  return query.join('&')
}

function makeIframe(element) {
  let iframe = document.createElement('iframe')
  copyAttributes(element, iframe)

  iframe.setAttribute('frameBorder', '0')
  iframe.setAttribute('allowfullscreen', '')
  iframe.setAttribute('allow', 'autoplay; fullscreen')
  iframe.setAttribute(
    'sandbox',
    'allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups'
  )

  let name = generateName(iframe.getAttribute('name') || iframe.id)
  iframe.setAttribute('name', name)

  return iframe
}

function mergeOptions(globalOptions, gameOptions) {
  delete globalOptions.version
  delete globalOptions.replay
  delete globalOptions.token
  let options = {}
  let name
  for (name in DEFAULT_OPTIONS) {
    options[name] = DEFAULT_OPTIONS[name]
  }
  for (name in globalOptions) {
    options[name] = globalOptions[name]
  }
  for (name in gameOptions) {
    options[name] = gameOptions[name]
  }
  return options
}

function insertCss(document) {
  let style = document.createElement('style')
  document.head.appendChild(style)
  style.appendChild(document.createTextNode(import('./nolimit.css'))) // require('./nolimit.css')));
}

function setupViewport(head) {
  let viewport = head.querySelector('meta[name="viewport"]')
  if (!viewport) {
    head.insertAdjacentHTML(
      'beforeend',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
    )
  }
}

function processOptions(options) {
  options.device = options.device.toLowerCase()
  options.mute = options.mute || false
  let environment = options.environment.toLowerCase()
  if (!environment.includes('.')) {
    environment += '.nolimitcdn.com'
  }
  // options.cdn = options.cdn || CDN.replace('{ENV}', environment);
  options.cdn = 'https://api.cashflowcasino.com/games/nolimit' // options.cdn || CDN.replace('{ENV}', environment);

  // options.staticRoot = options.staticRoot || GAMES_URL.replace('{CDN}', options.cdn);
  options.staticRoot = options.cdn // options.staticRoot || GAMES_URL.replace('{CDN}', options.cdn);

  options.playForFunCurrency = options.playForFunCurrency || options.currency
  if (options.language === 'pe' || options.language === 'cl') {
    options.language = 'es'
  }
  return options
}

function html(window, options) {
  let document = window.document

  window.focus()

  insertCss(document)
  setupViewport(document.head)

  let loaderElement = document.createElement('iframe')
  loaderElement.setAttribute('frameBorder', '0')
  loaderElement.style.backgroundColor = 'black'
  loaderElement.style.width = '100vw'
  loaderElement.style.height = '100vh'
  loaderElement.style.position = 'relative'
  loaderElement.style.zIndex = '2147483647'
  loaderElement.classList.add('loader')

  loaderElement.src = LOADER_URL.replace('{CDN}', options.cdn)
    .replace('{DEVICE}', options.device)
    .replace('{OPERATOR}', options.operator)
    .replace('{GAME}', options.game)
    .replace('{LANGUAGE}', options.language)

  document.body.innerHTML = ''

  loaderElement.onload = function () {
    window.on('error', (error) => {
      if (loaderElement && loaderElement.contentWindow) {
        loaderElement.contentWindow.postMessage(JSON.stringify({ error }), '*')
      }
    })
    window.on('message', (message) => {
      if (loaderElement && loaderElement.contentWindow) {
        loaderElement.contentWindow.postMessage(JSON.stringify({ message }), '*')
      }
    })
    window.on('*', (message) => {
      if (loaderElement && loaderElement.contentWindow) {
        loaderElement.contentWindow.postMessage(JSON.stringify({ message }), '*')
      }
    })
    nolimit.info(options, (info) => {
      if (info.error) {
        window.trigger('error', info.error)
        loaderElement.contentWindow.postMessage(JSON.stringify(info), '*')
      } else {
        window.trigger('info', info)

        let gameElement = document.createElement('script')
        gameElement.src = `${info.staticRoot}/game.js`

        options.loadStart = Date.now()
        window.nolimit = nolimit
        window.nolimit.options = options
        window.nolimit.options.version = info.version
        window.nolimit.options.info = info

        document.body.appendChild(gameElement)
      }
    })

    loaderElement.onload = function () {}
  }

  document.body.appendChild(loaderElement)
}

function copyAttributes(from, to) {
  let attributes = from.attributes
  for (let i = 0; i < attributes.length; i++) {
    let attr = attributes[i]
    to.setAttribute(attr.name, attr.value)
  }
}

// eslint-disable-next-line no-var
var generateName = (function () {
  let generatedIndex = 1
  return function (name) {
    return name || `Nolimit-${generatedIndex++}`
  }
})()
/**
 * @exports nolimit
 */
export default nolimit
