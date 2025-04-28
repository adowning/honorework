/* eslint-disable prefer-const */
/**
 * @exports nolimitApiFactory
 * @private
 */
export function nolimitApiFactory(target, onload) {
  let listeners = {}
  let unhandledEvents = {}
  let unhandledCalls = []
  let port

  function handleUnhandledCalls(port) {
    while (unhandledCalls.length > 0) {
      port.postMessage(unhandledCalls.shift())
    }
  }

  function addMessageListener(gameWindow) {
    gameWindow.addEventListener('message', (e) => {
      if (e.ports && e.ports.length > 0) {
        port = e.ports[0]
        port.onmessage = onMessage
        handleUnhandledCalls(port)
      }
    })
    gameWindow.trigger = trigger
    gameWindow.on = on
    onload()
  }

  if (target.nodeName === 'IFRAME') {
    if (
      target.contentWindow
      && target.contentWindow.document
      && target.contentWindow.document.readyState === 'complete'
    ) {
      addMessageListener(target.contentWindow)
    } else {
      target.addEventListener('load', () => {
        addMessageListener(target.contentWindow)
      })
    }
  } else {
    addMessageListener(target)
  }

  function onMessage(e) {
    // console.log(e)
    trigger(e.data.method, e.data.params)
  }

  function sendMessage(method, data) {
    // console.log(data)
    let message = {
      jsonrpc: '2.0',
      method
    }

    if (data) {
      message.params = data
    }

    if (port) {
      try {
        port.postMessage(message)
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (ignored) {
        port = undefined
        unhandledCalls.push(message)
      }
    } else {
      unhandledCalls.push(message)
    }
  }

  function registerEvents(events) {
    sendMessage('register', events)
  }

  function trigger(event, data) {
    if (listeners[event]) {
      listeners[event].forEach((callback) => {
        callback(data)
      })
    } else {
      unhandledEvents[name] = unhandledEvents[name] || []
      unhandledEvents[name].push(data)
    }
  }

  function on(event, callback) {
    listeners[event] = listeners[event] || []
    listeners[event].push(callback)
    while (unhandledEvents[event] && unhandledEvents[event].length > 0) {
      trigger(event, unhandledEvents[event].pop())
    }

    registerEvents([event])
  }

  /**
   * Connection to the game using MessageChannel
   * @exports nolimitApi
   */
  let nolimitApi = {
    /**
     * Add listener for event from the started game
     *
     * @function on
     * @param {string}   event    name of the event
     * @param {Function} callback callback for the event, see specific event documentation for any parameters
     *
     * @example
     * api.on('deposit', function openDeposit () {
     *     showDeposit().then(function() {
     *         // ask the game to refresh balance from server
     *         api.call('refresh');
     *     });
     * });
     */
    on,

    /**
     * Call method in the open game
     *
     * @function call
     * @param {string} method name of the method to call
     * @param {object} [data] optional data for the method called, if any
     *
     * @example
     * // reload the game
     * api.call('reload');
     */
    call: sendMessage,

    /**
     * Triggers a named event
     *
     * @function trigger
     * @param {string} event  name of the event
     * @param {object} [data] optional data for the event, if any
     */
    trigger
  }

  return nolimitApi
}

// module.exports = nolimitApiFactory;
