import { Logger } from '@thanhhoajs/logger'
import fs from 'fs'
import { ServerWebSocket } from 'bun'

const logger = Logger.get('OTHER_SRVC')
import { pool } from '../db'

type WSResponse = {
  id: string
  success: boolean
  data?: Record<string, any> | any[]
  error?: string
}
function getWelcomeMail(keyy) {
  let ml = fs.readFileSync('./scripts/emails/welcome.html', 'utf8').toString()
  ml = ml.replace('[VERIFY_URL]', keyy)

  return ml
}

export function addRakeback(ws: ServerWebSocket, bet_amount, game, userid) {
  const rb_amount = bet_amount * 0.05 * 0.1

  // updateBalance2(userid, rb_amount)
  pool.query(
    'UPDATE `users` SET `rakeback` = `rakeback` + ? WHERE `userid` = ?',
    [rb_amount, userid],
    function (err2) {
      if (err2) return

      pool.query(
        'SELECT `rakeback` FROM `users` WHERE `userid` = ?',
        [userid],
        function (err1, row1: any) {
          if (err1) return
          if (row1.length == 0) return

          return ws.send(
            JSON.stringify({
              id: 'rb_update',
              success: true,
              data: { rakeback: row1[0].rakeback },
            }),
          )
        },
      )
    },
  )
}

export function collectRakeback(ws: ServerWebSocket, userid) {
  pool.query(
    'SELECT `rakeback` FROM `users` WHERE `userid` = ?',
    [userid],
    function (err1, row1: any) {
      if (err1)
        return ws.send(
          JSON.stringify({
            id: 'rb_error',
            success: false,
            error: err1.message,
          }),
        )
      if (row1.length == 0)
        return ws.send(
          JSON.stringify({
            id: 'rb_error',
            success: false,
            error: 'Invalid user',
          }),
        )

      if (row1[0].rakeback <= 0)
        return ws.send(
          JSON.stringify({
            id: 'rb_error',
            success: false,
            error: 'Not enough to be collected',
          }),
        )

      pool.query(
        'UPDATE `users` SET `rakeback` = 0, `balance` = `balance` + ? WHERE `userid` = ?',
        [row1[0].rakeback, userid],
        async function (err2) {
          if (err2) return

          const bl = await getBalance2(userid)

          ws.send(
            JSON.stringify({
              id: 'balance_update',
              success: true,
              data: { balance: bl },
            }),
          )
          ws.send(
            JSON.stringify({
              id: 'rb_update',
              success: true,
              data: { rakeback: '0.00' },
            }),
          )
        },
      )
    },
  )
}

export function getBalance(ws: ServerWebSocket, userid) {
  pool.query(
    'SELECT `balance` FROM `users` WHERE `userid` = ?',
    [userid],
    function (err1, row1: any) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        return
      }

      if (row1.length == 0) return

      ws.send(
        JSON.stringify({
          id: 'balance_update',
          success: true,
          data: { balance: row1[0].balance },
        }),
      )
    },
  )
}

function getBalance2(userid, getBonusBattlesBalance = false) {
  return new Promise((resolve, reject) => {
    const x = getBonusBattlesBalance ? 'balance_battles' : 'balance'

    pool.query(
      'SELECT ?? FROM `users` WHERE `userid` = ?',
      [x, userid],
      function (err1, row1: any) {
        if (err1) return resolve(0)
        if (row1.length == 0) return resolve(0)

        return resolve(
          getBonusBattlesBalance ? row1[0].balance_battles : row1[0].balance,
        )
      },
    )
  })
}

export function updateBalance2(
  ws: ServerWebSocket,
  userid,
  amount,
  set = false,
  getBonusBattlesBalance = false,
) {
  // amount * -1
  return new Promise((resolve, reject) => {
    getBalance2(userid, getBonusBattlesBalance).then((bal) => {
      bal += amount
      if (set) bal = amount

      const x = getBonusBattlesBalance ? 'balance_battles' : 'balance'

      pool.query(
        'UPDATE `users` SET ?? = ? WHERE `userid` = ?',
        [x, bal, userid],
        function (err2) {
          if (err2) return resolve(0)

          if (!getBonusBattlesBalance) {
            ws.send(
              JSON.stringify({
                id: 'balance_update',
                success: true,
                data: { balance: bal },
              }),
            )
          }

          return resolve(bal)
        },
      )
    })
  })
}

export function getLevel(ws: ServerWebSocket, userid) {
  pool.query(
    'SELECT `xp` FROM `users` WHERE `userid` = ?',
    [userid],
    function (err1, row1: any) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        return
      }

      if (row1.length == 0) return

      ws.send(
        JSON.stringify({
          id: 'level_update',
          success: true,
          data: { level: calculateLevel(row1[0].xp) },
        }),
      )
    },
  )
}

export function verifyRecaptcha(recaptcha, callback) {
  request(
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
      process.env.JWT_SECRET +
      '&response=' +
      recaptcha,
    function (err, response) {
      var verifiedRecaptcha = false

      if (err) {
        logger.error(err)
        writeError(err)
      } else {
        var res = JSON.parse(response.body)

        if (res.success !== undefined) {
          verifiedRecaptcha = res.success
        }
      }

      callback(verifiedRecaptcha)
    },
  )
}

export function saveTradelink(user, socket, tradelink, recaptcha) {
  setUserRequest(user.userid, 'tradelink', true, true)

  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid recaptcha!',
      })
      setUserRequest(user.userid, 'tradelink', false, true)
      return
    }

    var reg1 =
      /^(http|https):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/

    if (!reg1.test(tradelink)) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid tradelink!',
      })
      setUserRequest(user.userid, 'tradelink', false, true)
      return
    }

    pool.query(
      'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
      [user.userid, 'tradelink', tradelink, time()],
      function (err1: any) {
        if (err1) {
          logger.info(err1)
          writeError(err1)
          setUserRequest(user.userid, 'tradelink', false, true)
          return
        }

        pool.query(
          'UPDATE `users` SET `tradelink` = ? WHERE `userid` = ?',
          [tradelink, user.userid],
          function (err2) {
            if (err2) {
              logger.error(err2)
              writeError(err2)
              setUserRequest(user.userid, 'tradelink', false, true)
              return
            }

            socket.emit('message', {
              type: 'success',
              success: 'Tradelink saved!',
            })

            setUserRequest(user.userid, 'tradelink', false, false)
          },
        )
      },
    )
  })
}

export function saveApikey(user, socket, apikey, recaptcha) {
  setUserRequest(user.userid, 'apikey', true, true)

  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid recaptcha!',
      })
      setUserRequest(user.userid, 'apikey', false, true)
      return
    }

    socket.emit('message', {
      type: 'info',
      info: 'Processing your Apikey verify!',
    })

    offers_verifyApikey(user, apikey, function (err1) {
      if (err1) {
        socket.emit('message', {
          type: 'error',
          error: err1.message,
        })
        setUserRequest(user.userid, 'apikey', false, true)
        return
      }

      pool.query(
        'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
        [user.userid, 'apikey', apikey, time()],
        function (err2) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            setUserRequest(user.userid, 'apikey', false, true)
            return
          }

          pool.query(
            'UPDATE `users` SET `apikey` = ? WHERE `userid` = ?',
            [apikey, user.userid],
            function (err3) {
              if (err3) {
                logger.error(err3)
                writeError(err3)
                setUserRequest(user.userid, 'apikey', false, true)
                return
              }

              socket.emit('message', {
                type: 'success',
                success: 'Apikey saved!',
              })

              setUserRequest(user.userid, 'apikey', false, false)
            },
          )
        },
      )
    })
  })
}

export function profileSettings(user, socket, data) {
  setUserRequest(user.userid, 'settings', true, true)

  var allowed_settings = ['anonymous', 'private']

  if (!allowed_settings.includes(data.setting)) {
    socket.emit('message', {
      type: 'error',
      error: 'Error: Invalid setting!',
    })
    setUserRequest(user.userid, 'settings', false, true)
    return
  }

  pool.query(
    'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
    [user.userid, data.setting, data.value, time()],
    function (err1) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        setUserRequest(user.userid, 'settings', false, true)
        return
      }

      pool.query(
        'UPDATE `users` SET ?? = ? WHERE `userid` = ?',
        [data.setting, data.value, user.userid],
        function (err2) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            setUserRequest(user.userid, 'settings', false, true)
            return
          }

          setUserRequest(user.userid, 'settings', false, false)
        },
      )
    },
  )
}

export function accountExclusion(user, socket, exclusion, recaptcha) {
  setUserRequest(user.userid, 'exclusion', true, true)

  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid recaptcha!',
      })
      setUserRequest(user.userid, 'resend_verify', false, true)
      return
    }

    var allowed_exclusions = ['24hours', '7days', '30days']

    if (!allowed_exclusions.includes(exclusion)) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid exclusion!',
      })
      setUserRequest(user.userid, 'exclusion', false, true)
      return
    }

    if (user.exclusion > time()) {
      socket.emit('message', {
        type: 'error',
        error:
          'Error: You have already a exclusion. Please wait to end the currently exclusion!',
      })
      setUserRequest(user.userid, 'exclusion', false, true)
      return
    }

    var time_exclusion = getTimeString(exclusion)

    pool.query(
      'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
      [user.userid, 'exclusion', time_exclusion, time()],
      function (err1) {
        if (err1) {
          logger.error(err1)
          writeError(err1)
          setUserRequest(user.userid, 'settings', false, true)
          return
        }

        pool.query(
          'UPDATE `users` SET `exclusion` = ? WHERE `userid` = ?',
          [time_exclusion, user.userid],
          function (err2) {
            if (err2) {
              logger.error(err2)
              writeError(err2)
              setUserRequest(user.userid, 'exclusion', false, true)
              return
            }

            socket.emit('message', {
              type: 'success',
              success:
                'Exclusion successfully setted. The exclusion will expire ' +
                makeDate(new Date(time_exclusion * 1000)) +
                '.',
            })

            setUserRequest(user.userid, 'exclusion', false, false)
          },
        )
      },
    )
  })
}

export function resendVerifyProfile(user, socket, recaptcha, bypassrc = false) {
  // setUserRequest(user.userid, 'resend_verify', true, true);

  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      if (!bypassrc) {
        socket.emit('message', {
          type: 'error',
          error: 'Error: Invalid recaptcha!',
        })
        setUserRequest(user.userid, 'resend_verify', false, true)
        return
      }
    }

    if (user.initialized == 0) {
      if (bypassrc) return
      socket.emit('message', {
        type: 'error',
        error: 'Error: Your profile is not initialized!',
      })
      setUserRequest(user.userid, 'resend_verify', false, true)
      return
    }

    if (user.verified == 1) {
      if (bypassrc) return
      socket.emit('message', {
        type: 'error',
        error: 'Error: Your profile is already verified!',
      })
      setUserRequest(user.userid, 'resend_verify', false, true)
      return
    }

    pool.query(
      'SELECT * FROM `link_keys` WHERE `type` = ? AND `userid` = ? AND `used` = 0 AND `removed` = 0 AND (`expire` > ? OR `expire` = -1) AND `created` > ?',
      ['verify_profile', user.userid, time(), time() - 100],
      function (err1, row1: any) {
        if (err1) {
          if (bypassrc) return
          logger.error(err1)
          writeError(err1)
          setUserRequest(user.userid, 'resend_verify', false, true)
          return
        }

        if (row1.length > 0) {
          if (bypassrc) return
          socket.emit('message', {
            type: 'error',
            error:
              'Error: Please wait ' +
              100 +
              ' seconds before try again to resend the verify email!',
          })
          setUserRequest(user.userid, 'resend_verify', false, true)
          return
        }

        pool.query(
          'UPDATE `link_keys` SET `removed` = 1 WHERE `type` = ? AND `userid` = ? AND `used` = 0 AND `removed` = 0 AND (`expire` > ? OR `expire` = -1) AND `created` > ?',
          ['verify_profile', user.userid, time(), time() - 2 * 60],
          function (err2, row2: any) {
            if (err2) {
              if (bypassrc) return
              logger.error(err2)
              writeError(err2)
              setUserRequest(user.userid, 'resend_verify', false, true)
              return
            }

            var verify_key = generateHexCode(32)

            pool.query(
              'INSERT INTO `link_keys` SET `type` = ?, `userid` = ?, `key` = ?, `expire` = -1, `created` = ?',
              ['verify_profile', user.userid, verify_key, time()],
              function (err3) {
                if (err3) {
                  if (bypassrc) return
                  logger.error(err3)
                  writeError(err3)
                  setUserRequest(user.userid, 'resend_verify', false, true)
                  return
                }

                const verify_url =
                  'https://' +
                  'localhost:3000' +
                  '/' +
                  'auth/verifyprofile?key=' +
                  verify_key
                // var mail_message = 'Verify Profile Link: ' + (config.config_site.url + config.config_site.root) + 'auth/verifyprofile?key=' + verify_key;

                mailer_send(
                  user.email,
                  `${user.name}, welcome!`,
                  getWelcomeMail(verify_url),
                  function (err4, response4) {
                    if (err4) {
                      if (bypassrc) return
                      logger.error(err4)
                      writeError(err4)
                      setUserRequest(user.userid, 'resend_verify', false, true)
                      return
                    }

                    socket.emit('message', {
                      type: 'success',
                      success: 'Verify email successfully resent.',
                    })

                    setUserRequest(user.userid, 'resend_verify', false, false)
                  },
                )
              },
            )
          },
        )
      },
    )
  })
}

export function recoverAccount(socket, data, recaptcha) {
  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid recaptcha!',
      })
      return
    }

    pool.query(
      'SELECT `email`, `userid`, `initialized` FROM `users` WHERE `email` = ? OR `username` = ?',
      [data.username, data.username],
      function (err1, row1: any) {
        if (err1) {
          logger.error(err1)
          writeError(err1)

          return callback(new Error('Error'))
        }

        if (row1.length <= 0) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: Invalid username or e-mail.',
          })
          return
        }

        if (parseInt(row1[0].initialized) == 0) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: Your account is not initialized.',
          })
          return
        }

        pool.query(
          'UPDATE `link_keys` SET `removed` = 1 WHERE `type` = ? AND `userid` = ? AND `used` = 0 AND `removed` = 0 AND (`expire` > ? OR `expire` = -1)',
          ['reset_password', row1[0].userid, time()],
          function (err2) {
            if (err2) {
              logger.error(err2)
              writeError(err2)
              return
            }

            var recover_key = generateHexCode(32)

            pool.query(
              'INSERT INTO `link_keys` SET `type` = ?, `userid` = ?, `key` = ?, `expire` = ?, `created` = ?',
              [
                'reset_password',
                row1[0].userid,
                recover_key,
                time() + 10 * 60,
                time(),
              ],
              function (err3) {
                if (err3) {
                  logger.error(err3)
                  writeError(err3)
                  return
                }

                var mail_message =
                  'Reset Password Link(expires in 10 minutes): ' +
                  'localhost:3000/' +
                  'auth/recover?key=' +
                  recover_key

                mailer_send(
                  row1[0].email,
                  'Reset password',
                  mail_message,
                  function (err4, response4) {
                    if (err4) {
                      logger.error(err4)
                      writeError(err4)
                      return
                    }

                    socket.emit('message', {
                      type: 'success',
                      success: 'A e-mail with recover password link was sent!',
                    })
                  },
                )
              },
            )
          },
        )
      },
    )
  })
}

export function accountSettings(user, socket, data) {
  var pattern_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/
  var pattern_username = /^[a-z0-9_]{6,}$/

  if (!pattern_email.test(data.email)) {
    socket.emit('message', {
      type: 'error',
      error: 'Error: Invalid e-mail. Invalid format e-mail.',
    })
    return
  }

  if (!pattern_username.test(data.username)) {
    socket.emit('message', {
      type: 'error',
      error:
        'Error: Invalid username. At least 6 characters, only lowercase, numbers and underscore are allowed.',
    })
    return
  }

  pool.query(
    'SELECT * FROM `users` WHERE `email` = ' + pool.query(data.email),
    function (err1, row1: any) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        return
      }

      if (row1.length > 0) {
        if (row1[0].userid != user.userid) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: E-mail already taken.',
          })
          return
        }
      }

      pool.query(
        'SELECT * FROM `users` WHERE `username` = ' + pool.query(data.username),
        function (err2, row2: any) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            return
          }

          if (row2.length > 0) {
            if (row2[0].userid != user.userid) {
              socket.emit('message', {
                type: 'error',
                error: 'Error: Username already taken.',
              })
              return
            }
          }

          pool.query(
            'UPDATE `users` SET `verified` = ?, `username` = ?, `email` = ? WHERE `userid` = ?',
            [
              parseInt(user.verified).toString() == '1'
                ? user.email == data.email
                  ? '1'
                  : '0'
                : '0',
              data.username,
              data.email,
              user.userid,
            ],
            function (err3, row3: any) {
              if (err3) {
                logger.error(err3)
                writeError(err3)
                return
              }

              if (row3.affectedRows <= 0) {
                socket.emit('message', {
                  type: 'error',
                  error: 'Error: Account saved unsuccessfully.',
                })
                return
              }

              if (user.username !== data.username) {
                pool.query(
                  'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
                  [user.userid, 'username', data.username, time()],
                )
              }
              if (user.email !== data.email) {
                pool.query(
                  'INSERT INTO `users_changes` SET `userid` = ?, `change` = ?, `value` = ?, `time` = ?',
                  [user.userid, 'email', data.email, time()],
                )
              }

              socket.emit('message', {
                type: 'success',
                success: 'Your account has been saved!',
              })
            },
          )
        },
      )
    },
  )
}

export function userUnsetRestriction(user, socket, data, callback) {
  pool.query(
    'SELECT * FROM `users_restrictions` WHERE `removed` = 0 AND `restriction` = ? AND (`expire` = -1 OR `expire` > ?) AND `userid` = ?',
    [data.restriction, time(), data.userid],
    function (err1, row1: any) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        return
      }

      if (row1.length <= 0) {
        socket.emit('message', {
          type: 'error',
          error: "Error: This user don't have this restriction!",
        })
        return
      }

      pool.query(
        'UPDATE `users_restrictions` SET `removed` = 1 WHERE `removed` = 0 AND `restriction` = ? AND (`expire` = -1 OR `expire` > ?) AND `userid` = ?',
        [data.restriction, time(), data.userid],
        function (err2, row2: any) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            return
          }

          if (row2.affectedRows <= 0) {
            socket.emit('message', {
              type: 'error',
              error: 'Error: The user was unsuccessfully unrestricted!',
            })
            return
          }

          socket.emit('message', {
            type: 'success',
            success: 'The user was successfully unrestricted!',
          })

          if (callback != null) callback()
        },
      )
    },
  )
}

export function userSetRestriction(user, socket, data, callback) {
  var time_restriction = getTimeString(data.time)

  if (data.restriction == 'mute') {
    time_restriction = Math.round(+new Date() / 1000 + data.time * 60)
    if (!data.reason) data.reason = '[no specified reason]'
  }

  if (time_restriction == 0) {
    socket.emit('message', {
      type: 'error',
      error: 'Invalid restriction time!',
    })
    return
  }

  pool.query(
    'SELECT `name` FROM `users` WHERE `userid` = ?',
    [data.userid],
    function (err1, row1: any) {
      if (err1) {
        logger.error(err1)
        writeError(err1)
        return
      }

      if (row1.length == 0) {
        socket.emit('message', {
          type: 'error',
          error: 'Error: Unknown user!',
        })
        return
      }

      pool.query(
        'SELECT * FROM `users_restrictions` WHERE `removed` = 0 AND `restriction` = ? AND (`expire` = -1 OR `expire` > ?) AND `userid` = ?',
        [data.restriction, time(), data.userid],
        function (err2, row2: any) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            return
          }

          if (row2.length > 0) {
            socket.emit('message', {
              type: 'error',
              error: 'Error: This user have already this restriction!',
            })
            return
          }

          pool.query(
            'INSERT INTO `users_restrictions` SET `userid` = ?, `restriction` = ?, `reason` = ?, `byuserid` = ?, `expire` = ?, `time` = ?',
            [
              data.userid,
              data.restriction,
              data.reason,
              user.userid,
              time_restriction,
              time(),
            ],
            function (err3) {
              if (err3) {
                logger.error(err3)
                writeError(err3)
                return
              }

              if (data.restriction == 'play')
                var text_message =
                  'User ' +
                  row1[0].name +
                  ' was play banned by ' +
                  user.name +
                  ' for ' +
                  data.reason +
                  '. The restriction expires ' +
                  (time_restriction == -1
                    ? 'never'
                    : makeDate(new Date(time_restriction * 1000))) +
                  '.'
              else if (data.restriction == 'trade')
                var text_message =
                  'User ' +
                  row1[0].name +
                  ' was trade banned by ' +
                  user.name +
                  ' for ' +
                  data.reason +
                  '. The restriction expires ' +
                  (time_restriction == -1
                    ? 'never'
                    : makeDate(new Date(time_restriction * 1000))) +
                  '.'
              else if (data.restriction == 'site')
                var text_message =
                  'User ' +
                  row1[0].name +
                  ' was site banned by ' +
                  user.name +
                  ' for ' +
                  data.reason +
                  '. The restriction expires ' +
                  (time_restriction == -1
                    ? 'never'
                    : makeDate(new Date(time_restriction * 1000))) +
                  '.'
              else if (data.restriction == 'mute')
                var text_message =
                  'User ' +
                  row1[0].name +
                  ' was muted by ' +
                  user.name +
                  ' for ' +
                  data.reason +
                  '. The restriction expires ' +
                  (time_restriction == -1
                    ? 'never'
                    : makeDate(new Date(time_restriction * 1000))) +
                  '.'

              // TODO: Implement broadcast message functionality
              // Currently no direct websocket broadcast equivalent
              // Would need to track all connected websockets

              socket.emit('message', {
                type: 'success',
                success: 'The user was successfully restricted!',
              })

              if (callback != null) callback()
            },
          )
        },
      )
    },
  )
}

function sendCoins(
  ws: ServerWebSocket,
  user,
  socket,
  userid,
  amount,
  recaptcha,
) {
  setUserRequest(user.userid, 'send_coins', true, true)

  if (user.exclusion > time()) {
    socket.emit('message', {
      type: 'error',
      error:
        'Error: Your exclusion expires ' +
        makeDate(new Date(user.exclusion * 1000)) +
        '.',
    })
    setUserRequest(user.userid, 'send_coins', false, true)
    return
  }

  if (!user.verified) {
    socket.emit('message', {
      type: 'error',
      error:
        'Error: Your account is not verified. Please verify your account and try again.',
    })
    setUserRequest(user.userid, 'send_coins', false, true)
    return
  }

  verifyRecaptcha(recaptcha, function (verified) {
    if (!verified) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Invalid recaptcha!',
      })
      setUserRequest(user.userid, 'send_coins', false, true)
      return
    }

    if (user.userid == userid) {
      socket.emit('message', {
        type: 'error',
        error: "Error: You can't send coins to yourself!",
      })
      setUserRequest(user.userid, 'send_coins', false, true)
      return
    }
    function calculateLevel(xp: number): { level: number } {
      // Your existing logic here
      return { level: 0 }
    }
    if (calculateLevel(user.xp).level < 1) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: You need to have level ' + ' 1+',
        ' to send coins!': 0,
      })
      setUserRequest(user.userid, 'send_coins', false, true)
      return
    }

    verifyFormatAmount(amount, function (err1, amount) {
      if (err1) {
        socket.emit('message', {
          type: 'error',
          error: err1.message,
        })
        setUserRequest(user.userid, 'send_coins', false, true)
        return
      }

      if (amount < 100 || amount > 1000) {
        socket.emit('message', {
          type: 'error',
          error:
            'Error: Invalid send amount [' +
            getFormatAmountString(100) +
            '-' +
            getFormatAmountString(1000) +
            ']!',
        })
        setUserRequest(user.userid, 'send_coins', false, true)
        return
      }

      if (getFormatAmount(user.balance) < amount) {
        socket.emit('message', {
          type: 'error',
          error: "Error: You don't have enough money!",
        })
        setUserRequest(user.userid, 'send_coins', false, true)
        return
      }

      pool.query(
        'SELECT `name`, `exclusion`, `verified`, `initialized` FROM `users` WHERE `userid` = ?',
        [userid],
        function (err2, row2: any) {
          if (err2) {
            logger.error(err2)
            writeError(err2)
            setUserRequest(user.userid, 'send_coins', false, true)
            return
          }

          if (row2.length == 0) {
            socket.emit('message', {
              type: 'error',
              error: 'Error: Unknown user!',
            })
            setUserRequest(user.userid, 'send_coins', false, true)
            return
          }

          if (!row2[0].initialized) {
            socket.emit('message', {
              type: 'error',
              error: "Error: The recipient can't receive coins.",
            })
            setUserRequest(user.userid, 'send_coins', false, true)
            return
          }

          if (row2[0].exclusion > time()) {
            socket.emit('message', {
              type: 'error',
              error: "Error: The recipient can't receive coins.",
            })
            setUserRequest(user.userid, 'send_coins', false, true)
            return
          }

          if (!row2[0].verified) {
            socket.emit('message', {
              type: 'error',
              error: "Error: The recipient can't receive coins.",
            })
            setUserRequest(user.userid, 'send_coins', false, true)
            return
          }

          pool.query(
            'INSERT INTO `users_transfers` SET `from_userid` = ?, `to_userid` = ?, `amount` = ?, `time` = ?',
            [user.userid, userid, amount, time()],
            function (err3) {
              if (err3) {
                logger.error(err3)
                writeError(err3)
                setUserRequest(user.userid, 'send_coins', false, true)
                return
              }

              pool.query(
                'INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?',
                [user.userid, 'sent_coins', -amount, time()],
              )

              pool.query(
                'UPDATE `users` SET `balance` = `balance` - ? WHERE `userid` = ?',
                [amount, user.userid],
                function (err4) {
                  if (err4) {
                    logger.error(err4)
                    writeError(err4)
                    setUserRequest(user.userid, 'send_coins', false, true)
                    return
                  }

                  socket.emit('message', {
                    type: 'info',
                    info:
                      'You sent ' +
                      getFormatAmountString(amount) +
                      ' coins to ' +
                      row2[0].name +
                      '.',
                  })

                  getBalance(ws, user.userid)

                  pool.query(
                    'INSERT INTO `users_transactions` SET `userid` = ?, `service` = ?, `amount` = ?, `time` = ?',
                    [userid, 'received_coins', amount, time()],
                  )

                  pool.query(
                    'UPDATE `users` SET `balance` = `balance` + ? WHERE `userid` = ?',
                    [amount, userid],
                    function (err5) {
                      if (err5) {
                        logger.error(err5)
                        writeError(err5)
                        setUserRequest(user.userid, 'send_coins', false, true)
                        return
                      }

                      // TODO: Implement websocket message to recipient
                      // Would need to track recipient's websocket connection

                      getBalance(ws, userid)

                      setUserRequest(user.userid, 'send_coins', false, false)
                    },
                  )
                },
              )
            },
          )
        },
      )
    })
  })
}
function writeError(err: any) {
  logger.error(err)
  fs.appendFileSync(
    './error.log',
    `${new Date().toISOString()} - ${err.stack || err.message}\n`,
  )
}

function calculateLevel(xp: number): { level: number } {
  const levels = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]
  let level = 0
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i]) {
      level = i
    } else {
      break
    }
  }
  return { level }
}

function request(url: string, callback: (err: any, response: any) => void) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => callback(null, { body: JSON.stringify(data) }))
    .catch((err) => callback(err, null))
}

function time(): number {
  return Math.floor(Date.now() / 1000)
}

function offers_verifyApikey(
  user: any,
  apikey: string,
  callback: (err: any) => void,
) {
  // This would verify the Steam API key
  request(
    `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${apikey}`,
    (err, res) => callback(err ? new Error('Invalid API key') : null),
  )
}

function makeDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function generateHexCode(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
}

function mailer_send(
  email: string,
  subject: string,
  content: string,
  callback: (err: any, response: any) => void,
) {
  // This would send an email using a mail service
  // Implementation depends on the mail service being used
  callback(null, { status: 'sent' })
}

function verifyFormatAmount(
  amount: any,
  callback: (err: Error | null, amount: number) => void,
) {
  const num = parseFloat(amount)
  if (isNaN(num)) {
    callback(new Error('Invalid amount format'), 0)
  } else {
    callback(null, num)
  }
}

function getFormatAmountString(amount: number): string {
  return amount.toFixed(2)
}

function getFormatAmount(balance: any): number {
  return parseFloat(balance) || 0
}

function setUserRequest(
  userid: string,
  type: string,
  inProgress: boolean,
  isError: boolean,
) {
  // This would track user requests in the database
  pool.query(
    'INSERT INTO user_requests SET userid = ?, type = ?, in_progress = ?, is_error = ?, timestamp = ?',
    [userid, type, inProgress, isError, time()],
    (err) => {
      if (err) logger.error(err)
    },
  )
}
function getTimeString(time: number) {
  return new Date(time).toLocaleString()
}
