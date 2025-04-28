import EventEmitter from 'node:events'
import { Database } from 'bun:sqlite'
// import PocketBase from 'pocketbase/cjs'
// import type {
//     PocketBase as TPocketBase, UsersRecord
// } from '../types/pocket-base'
// import { BunSQLiteCache } from "bun-sqlite-cache";
import fs from 'fs'
import { db } from '../bunshine/database'
import { useRequest } from './useRequest'
const { api } = useRequest()

export default function AdminService(
  emitter: EventEmitter,
  utils: any,
  queue: EventEmitter,
  userId: string,
  gameName: string,
  shopId: string,
  shop_id: number,
) {
  const sessionStorage: any = []
  const serverStorage: any = []
  let queryStr = ''
  let queryStr0 = ''
  let qs = ''
  let sm = 0
  const _self: any = {}
  const timezone = 'America/Chicago'
  _self.transactionTimeout = 0
  _self.tick = 0
  _self.conn = {
    connection: {
      _closing: false,
    },
  }

  _self.checkIntervalStarted = false
  _self.emitter = emitter
  _self.transactionInProgress = 0
  _self.no_user_count = 0
  _self.userId = userId
  _self.shopId = shopId
  _self.shop_id = shop_id
  _self.Config = {}
  _self.Config.prefix = 'w_'
  _self.userName = null
  _self.bankType = null
  _self.bankId = null
  _self.isGuest = true
  _self.gameBank = 0
  _self.gameName = gameName
  _self.pb = null
  _self.lockedTables = []
  _self.sessionId = 0
  _self.jpgs = []
  _self.shopCurrency = ''
  _self.shopPercent = 0
  _self.shopBlocked = 0
  _self.CreateConnection = async function () {
    // const pb = new PocketBase('http://localhost:8090') as unknown as TPocketBase;
    //  await pb.admins.authWithPassword('asdf@asdf.com', 'asdfasdfasdf');
    await api.authControllerLogin.send({
      data: { username: 'ash', password: 'asdfasdf' },
    })
    // _self.pb = pb
  }
  _self.SendQuery = function (qs: string, isSingle = true, isInsert = false) {
    // //console.log(qs)
    // //console.log(isSingle)
    // //console.log(isInsert)
    try {
      qs = qs.replaceAll('`', '')
      let rows
      if (qs.includes('INSERT') || qs.includes('UPDATE')) {
        // //console.log(db)
        db.exec(qs)
        // sbqueue.emit('PutQuery', qs)
      } else {
        const _rows: any = []

        const query = db.query(qs)
        if (isSingle) {
          rows = query.get()
          _rows.push(rows)
          rows = _rows
        } else {
          rows = query.all()
        }
      }

      const fields: any = []
      return [rows]
    } catch (e) {
      //console.log(qs);
      //console.log(e);
      _self.ClearTicker()
      //console.log("i am closing the socket");
      emitter.emit('CloseSocket', '')
    }
  }

  _self.SessionStorage = function (
    user: string | number,
    game: string | number,
    key: string | number,
    value = null,
  ) {
    const curTime = new Date()
    if (sessionStorage[user] === undefined) sessionStorage[user] = []

    if (sessionStorage[user][game] === undefined)
      sessionStorage[user][game] = []

    const ct = curTime.getTime()
    for (const u in sessionStorage) {
      for (const g in sessionStorage[u]) {
        for (const k in sessionStorage[u][g]) {
          try {
            if (sessionStorage[u][g][k].tl < ct) delete sessionStorage[u][g][k]
          } catch (e) {
            delete sessionStorage[u][g][k]
          }
        }
      }
    }
    if (value != null) {
      sessionStorage[user][game][key] = {
        payload: value,
        tl: curTime.getTime() + 7200000,
      }
    } else {
      if (sessionStorage[user][game][key] !== undefined)
        return sessionStorage[user][game][key].payload
      else return undefined
    }
  }

  _self.ServerStorage = function (
    user: string | number,
    game: string | number,
    key: string | number,
    value = null,
  ) {
    const curTime = new Date()
    if (serverStorage[user] === undefined) serverStorage[user] = []

    if (serverStorage[user][game] === undefined) serverStorage[user][game] = []

    if (value != null) {
      serverStorage[user][game][key] = {
        payload: value,
      }
    } else {
      if (serverStorage[user][game][key] !== undefined)
        return serverStorage[user][game][key].payload
      else return undefined
    }
  }
  _self.ConvertTime0 = function () {
    const d1 = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour12: false,
    })
    const tmpT1 = d1.split(',')
    const tmpT0 = tmpT1[0]!.split('/')
    // var tmpT1 = parseInt(_tmpT1)
    // @ts-ignore
    if (tmpT1[0] >= 24 && (tmpT1[1] > 0 || tmpT1[2] > 0)) {
      // @ts-ignore
      tmpT1[0] = 0
    }
    ///
    for (let i = 0; i < 3; i++) {
      // @ts-ignore
      tmpT1[i] = Number.parseInt(tmpT1[i])
      // @ts-ignore
      if (tmpT1[i] < 10) {
        // @ts-ignore
        tmpT1[i] = `0${tmpT1[i]}`
      }
    }
    // @ts-ignore
    return new Date(`${tmpT0[2]}-${tmpT0[0]}-${tmpT0[1]}-${tmpT1.join(':')}`)
  }
  _self.ConvertTime1 = function (d2: string) {
    const tmp0 = d2.split(', ')
    const tmp1 = tmp0[0].split('/')
    const tmpT1 = tmp0[1].split(':')
    if (tmpT1[1] == undefined) return
    if (tmpT1[0] == undefined) return
    if (tmpT1[2] == undefined) return
    if (tmp1[0] == undefined) return
    if (tmp1[1] == undefined) return
    if (
      parseInt(tmpT1[0]) >= 24 &&
      (parseInt(tmpT1[1]) > 0 || parseInt(tmpT1[2]) > 0)
    )
      tmpT1[0] = '0'
    ///
    for (let i = 0; i < 3; i++) {
      const nn = Number.parseInt(tmpT1[i]!)
      if (nn < 10) tmpT1[i] = `0${tmpT1[i]}`
    }
    if (Number.parseInt(tmp1[0]) < 10) tmp1[0] = `0${tmp1[0].toString()}`
    if (Number.parseInt(tmp1[1]) < 10) tmp1[1] = `0${tmp1[1].toString()}`
    const st = `${tmp1[2]}-${tmp1[0]}-${tmp1[1]} ${tmpT1.join(':')}`
    return new Date(st)
  }
  _self.ConvertTime = function () {
    const d1 = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour12: false,
    })
    const tmpT = d1.split(',')
    if (tmpT[0] == undefined) return
    if (tmpT[1] == undefined) return
    const tmpT0 = tmpT[0].split('/')
    const tmpT1 = tmpT[1].split(':')

    // @ts-ignore
    if (tmpT1[0] >= 24 && (tmpT1[1] > 0 || tmpT1[2] > 0)) {
      // @ts-ignore
      tmpT1[0] = 0
    }
    ///
    for (let i = 0; i < 3; i++) {
      // @ts-ignore
      tmpT1[i] = Number.parseInt(tmpT1[i])
      // @ts-ignore
      if (tmpT1[i] < 10) tmpT1[i] = `0${tmpT1[i]}`
    }
    /// //
    // @ts-ignore
    if (tmpT0[0] < 10) tmpT0[0] = `0${tmpT0[0]}`
    // @ts-ignore
    if (tmpT0[1] < 10) tmpT0[1] = `0${tmpT0[0]}`
    return `${tmpT0[2]}-${tmpT0[0]}-${tmpT0[1]} ${tmpT1.join(':')}`
  }

  _self.DestroyTransaction = function () {
    _self.Rollback()
    _self.InternalError('Transaction timeout. Destroy connection.')
    _self.transactionInProgress = 0
    process.exit(22)
  }
  _self.EndConnection = async function () {}

  _self.Debug = function () {}

  _self.InternalError = function (msg: any) {
    let strLog = ''
    try {
      strLog = fs.readFileSync(`./${_self.gameName}_Internal.log`, 'utf8')
    } catch (e) {
      strLog = ''
    }
    strLog += '\n'
    strLog += `{"responseEvent":"error","responseType":"${msg}","serverResponse":"InternalError"}`
    strLog += '\n'
    strLog += ' ############################################### '
    strLog += '\n'
    fs.writeFileSync(`./${_self.gameName}_Internal.log`, strLog)
    /// ///console.log('close 6')
    _self.ClearTicker()
    emitter.emit('CloseSocket', '')
  }
  _self.InternalErrorLog = function (msg: string) {
    let strLog = ''
    try {
      strLog = fs.readFileSync(`./${_self.gameName}_Internal.log`, 'utf8')
    } catch (e) {
      strLog = ''
    }
    strLog += '\n'
    strLog += msg
    strLog += '\n'
    strLog += ' ############################################### '
    strLog += '\n'
    fs.writeFileSync(`./${_self.gameName}_Internal.log`, strLog)
  }
  _self.StartTransaction = async function () {
    /* ------------- */
    queryStr = 'set autocommit=0;'
    await _self.SendQuery(queryStr)
    queryStr = 'BEGIN'
    /// ///console.log('sending transaction query ?')
    await _self.SendQuery(queryStr)
    _self.transactionTimeout = setTimeout(_self.DestroyTransaction, 3000)
    _self.transactionInProgress = 1
  }
  _self.Commit = async function () {
    const queryStr = 'COMMIT;'
    await _self.SendQuery(queryStr)
    clearTimeout(_self.transactionTimeout)
    _self.transactionInProgress = 0
  }
  _self.Rollback = async function () {
    /* -------------- */
    // await _self.EndConnection()
    // const s = async function () {
    //   await _self.CreateConnection()
    // }
    // s()
    // /* ------------- */
    // clearTimeout(_self.transactionTimeout)
    // const queryStr = 'rollback;'
    // _self.SendQuery(queryStr)
  }
  _self.SaveLogReport = async function (stat: { balance: 0; bet: 0; win: 0 }) {
    const cTime = _self.ConvertTime(new Date())
    const toGameBanks = _self.toGameBanks
    const toSlotJackBanks = _self.toSlotJackBanks
    const betProfit = _self.betProfit
    queryStr0 = `SELECT * FROM fish_bank WHERE shopId='${_self.shopId}' ;`
    const [rows] = await _self.SendQuery(queryStr0, true)
    const queryStr_ = `SELECT * FROM game_bank WHERE shopId='${_self.shopId}'; `
    const [rows_]: any = await _self.SendQuery(queryStr_, true)
    const totalBank =
      rows_[0].slots * 1 +
      rows_[0].bonus * 1 +
      rows[0].fish * 1 +
      rows_[0].table_bank * 1 +
      rows_[0].little * 1
    // (id, date_time, user_id, balance, bet, win, game, in_game, in_jpg, in_profit, denomination, slots_bank, bonus_bank, fish_bank, table_bank, little_bank, total_bank, shop_id) VALUES (NULL , '2024-04-13 05:06:41' , '41', '4998.92', '0.01', '0', 'ParadiseCQ9', '0.0074','0.0001', '0.0025', '1', 'undefined', 'undefined', '33115.9072', 'undefined', 'undefined', 'NaN', '1' );

    queryStr = `INSERT INTO stat_game (\`date_time\`, \`userId\`, \`balance\`, \`bet\`, \`win\`, \`game\`, \`in_game\`, \`in_jpg\`, \`in_profit\`, \`denomination\`, \`slots_bank\`, \`bonus_bank\`, \`fish_bank\`, \`table_bank\`, \`little_bank\`, \`total_bank\`, \`shopId\`) VALUES ('${cTime}' , '${_self.userId}', '${stat.balance}', '${stat.bet}', '${stat.win}', '${_self.gameName}', '${toGameBanks}','${toSlotJackBanks}', '${betProfit}', '1', '${rows_[0].slots}', '${rows_[0].bonus}', '${rows[0].fish}', '${rows_[0].table_bank}', '${rows_[0].little}', '${totalBank}', '${_self.shopId}' );`
    queue.emit('PutQuery', queryStr)

    // await _self.SendQuery(queryStr)
    _self.lockedTables = []

    queryStr = `UPDATE games SET bids=bids+1 ,  stat_in = stat_in +'${stat.bet}' , stat_out = stat_out +'${stat.win}'  WHERE name = '${_self.gameName}' AND shopId='${_self.shopId}'; `
    _self.lastBet = stat.bet
    _self.stat_in += stat.bet
    _self.stat_out += stat.win
    _self.ServerStorage(
      _self.shopId,
      _self.gameName,
      'stat_in',
      _self.ServerStorage(_self.shopId, _self.gameName, 'stat_in') + stat.bet,
    )
    _self.ServerStorage(
      _self.shopId,
      _self.gameName,
      'stat_out',
      _self.ServerStorage(_self.shopId, _self.gameName, 'stat_out') + stat.win,
    )
    queue.emit('PutQuery', queryStr)
    _self.TournamentStat('bet', _self.userId, stat.bet, stat.win)
  }
  // set count balance
  _self.SetCountBalance = async function (sum: any, bet: number) {
    //console.log("SetCountBalance ", sum);
    if (bet > 0) {
      const bbet0 = Math.abs(bet)
      if (_self.count_balance === 0) {
        sm = Math.abs(bet)
        if (_self.address < sm && _self.address > 0) _self.address = 0
        else if (_self.address > 0) _self.address -= sm
      } else if (_self.count_balance > 0 && bbet0 > _self.count_balance) {
        sm = bbet0 - _self.count_balance
        if (_self.address < sm && _self.address > 0) _self.address = 0
        else if (_self.address > 0) _self.address -= sm
      }
    }
    /* --------------------------------------------- */
    if (_self.count_balance <= 0 && bet > 0) {
      _self.count_tournaments -= bet
      if (_self.count_tournaments <= 0) _self.count_tournaments = 0
      _self.count_happyhours -= bet
      if (_self.count_happyhours <= 0) _self.count_happyhours = 0
      _self.count_refunds -= bet
      if (_self.count_refunds <= 0) _self.count_refunds = 0
      _self.count_progress -= bet
      if (_self.count_progress <= 0) _self.count_progress = 0
      _self.count_daily_entries -= bet
      if (_self.count_daily_entries <= 0) _self.count_daily_entries = 0
      _self.count_invite -= bet
      if (_self.count_invite <= 0) _self.count_invite = 0
      _self.count_welcomebonus -= bet
      if (_self.count_welcomebonus <= 0) _self.count_welcomebonus = 0
      _self.count_smsbonus -= bet
      if (_self.count_smsbonus <= 0) _self.count_smsbonus = 0
      _self.count_wheelfortune -= bet
      if (_self.count_wheelfortune <= 0) _self.count_wheelfortune = 0
    }
    //console.log(sum);
    const queryStr = `UPDATE users SET count_tournaments = '${_self.count_tournaments}', count_happyhours = '${_self.count_happyhours}', count_refunds = '${_self.count_refunds}', count_progress = '${_self.count_progress}', count_daily_entries = '${_self.count_daily_entries}', count_invite = '${_self.count_invite}', address = '${utils.FixNumber(_self.address)}' , count_welcomebonus = '${_self.count_welcomebonus}', count_smsbonus = '${_self.count_smsbonus}', count_wheelfortune = '${utils.FixNumber(_self.count_wheelfortune)}', count_balance = count_balance + (${sum})  WHERE id='${_self.userId}'; `
    // const queryStr = `UPDATE users SET  count_progress = '${_self.count_progress}', count_daily_entries = '${_self.count_daily_entries}', count_invite = '${_self.count_invite}', address = '${utils.FixNumber(_self.address)}' , count_welcomebonus = '${_self.count_welcomebonus}', count_smsbonus = '${_self.count_smsbonus}', count_wheelfortune = '${utils.FixNumber(_self.count_wheelfortune)}', count_balance = count_balance + (${sum})  WHERE id='${_self.userId}'; `
    //console.log(queryStr);
    await _self.SendQuery(queryStr, true, true)
  }
  _self.UpdateLevel = async function (type: string, sum: string | number) {
    if (_self.progress_active !== 1) return false
    /* ------------ */
    qs = `SELECT * FROM progress WHERE shop_id='${_self.shop_id}' AND \`rating\`=${_self.userRating + 1}; `
    const [r] = await _self.SendQuery(qs, false)
    /* ------------ */
    const progress = r[0]
    const cTime = _self.ConvertTime(new Date())
    if (progress !== undefined) {
      // //console.log(progress)
      qs = `SELECT * FROM progress_users WHERE \`userId\`='${_self.userId}'  AND \`rating\`=${progress.rating} ORDER BY id DESC  ;`
      const [r] = await _self.SendQuery(qs, false)
      let progressUser = r[0]
      // //console.log(progressUser)

      if (r[0] === undefined) {
        qs = `INSERT INTO progress_users ( \`userId\`, \`rating\`, \`sum\`, \`spins\`, \`progressId\`) VALUES ('${_self.userId}', '${progress.rating}', '0.0000', '0', '${progress.id}');`
        await _self.SendQuery(qs, true, true)
        progressUser = {
          user_id: _self.userId,
          rating: progress.rating,
          sum: 0.0,
          spins: 0,
          progress_id: progress.id,
        }
      }
      if (type === 'balance') {
        if (progress.type === 'one_pay' && sum >= progress.sum)
          progressUser.sum = sum
        if (progress.type === 'sum_pay')
          progressUser.sum = progressUser.sum + sum
      }
      if (type === 'bet') {
        // //console.log('sum ',Number.parseFloat(sum.toString()) )
        // //console.log('progress bet ',Number.parseFloat(progress.bet))
        if (
          Number.parseFloat(sum.toString()) >= Number.parseFloat(progress.bet)
        ) {
          progressUser.spins++
          queryStr = `UPDATE progress_users SET spins = '${progressUser.spins}'  WHERE user_id='${_self.userId}' AND \`rating\`=${progress.rating}; `
          // //console.log(queryStr)

          await _self.SendQuery(queryStr, true, true)
        }
      }
      if (
        Number.parseInt(progressUser.spins) >=
          Number.parseInt(progress.spins) &&
        Number.parseFloat(progressUser.sum) >= Number.parseFloat(progress.sum)
      ) {
        _self.userRating++
        if (progress.bonus > 0) {
          const pbonus =
            Number.parseFloat(progress.bonus) *
            Number.parseFloat(progress.wager)
          queryStr = `UPDATE users SET rating = '${_self.userRating}', balance = balance + (${pbonus}), progress = progress + (${pbonus}), count_progress = count_progress + (${pbonus}), address = address + (${pbonus})  WHERE id='${_self.userId}'; `
          const q1 = `INSERT INTO \`${_self.Config.prefix}messages\` (\`id\`, \`user_id\`, \`type\`, \`value\`, \`status\`, \`shop_id\`, \`created_at\`, \`updated_at\`) VALUES (NULL, '${_self.userId}', 'progress', '${pbonus}', '1', '${_self.shopId}', '${cTime}', '${cTime}');`
          const q2 = `INSERT INTO \`${_self.Config.prefix}statistics\` (\`id\`, \`title\`, \`user_id\`, \`payeer_id\`, \`system\`, \`old\`, \`sum\`, \`sum2\`, \`type\`, \`item_id\`, \`status\`, \`shop_id\`, \`created_at\`, \`updated_at\`) VALUES(NULL, 'PB', ${_self.userId}, ${_self.parentId}, 'progress', '0.0000', '${pbonus}', NULL, 'add', NULL, 1, ${_self.shopId}, '${cTime}', '${cTime}');`
          _self.address += pbonus
          await _self.SendQuery(queryStr, true, true)
          queue.emit('PutQuery', q1)
          queue.emit('PutQuery', q2)
        } else {
          queryStr = `UPDATE users SET rating = '${_self.userRating}'  WHERE id='${_self.userId}'; `
          await _self.SendQuery(queryStr, true, true)
        }
      }
    }
    return true
  }
  // update jackpots
  _self.GetJackpots = async function (lock = false) {
    /// ///console.log('GetJackpots')
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    if (lock) queryStr = `SELECT * FROM jpg  WHERE shopId='${_self.shopId}' ;  `
    else queryStr = `SELECT * FROM jpg  WHERE shopId='${_self.shopId}' ;  `
    const [rows] = await _self.SendQuery(queryStr)
    // const rows = await supabase.from('w_jpg').select('*').eq('id', _self.userId)
    _self.jpgs = rows
  }
  // update jackpots
  _self.UpdateJackpots = async function (bet: number) {
    /// ///console.log('UpdateJackpots')
    const count_balance = await _self.GetCountBalance()
    if (count_balance > 0 && count_balance < bet) {
      queryStr = `UPDATE jpg SET \`balance\` = \`balance\`+(${utils.FixNumber(count_balance)}/100*\`percent\`) WHERE shopId='${_self.shopId}'; `
      queue.emit('PutQuery', queryStr)
    } else if (count_balance > 0) {
      queryStr = `UPDATE jpg SET \`balance\` = \`balance\`+(${utils.FixNumber(bet)}/100*\`percent\`) WHERE shopId='${_self.shopId}'; `
      queue.emit('PutQuery', queryStr)
    }
    queryStr = `SELECT *  FROM jpg WHERE  shopId='${_self.shopId}';   `
    const [rows] = await _self.SendQuery(queryStr)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] !== undefined) {
        const cTime = _self.ConvertTime()
        const psArr = [
          [0, 0],
          [10, 20],
          [20, 30],
          [30, 40],
          [40, 50],
          [50, 60],
          [100, 110],
          [200, 210],
          [300, 310],
          [400, 410],
          [500, 510],
          [1000, 1010],
          [2000, 2010],
          [3000, 3010],
          [4000, 4010],
          [5000, 5010],
          [10000, 10010],
        ]
        const sbArr = [
          [1, 5],
          [5, 10],
          [10, 50],
          [50, 100],
          [100, 1000],
        ]
        const psum = utils.RandomInt(
          psArr[rows[i].pay_sum][0],
          psArr[rows[i].pay_sum][1],
        )
        const bssum = utils.RandomInt(
          sbArr[rows[i].start_balance][0],
          sbArr[rows[i].start_balance][1],
        )
        const bssum_min = sbArr[rows[i].start_balance][0]
        /// /////////////////////////
        let jackAccept = true
        if (
          rows[i].user_id !== undefined &&
          rows[i].user_id !== '' &&
          rows[i].user_id !== 'NULL'
        ) {
          if (rows[i].user_id !== _self.userName) jackAccept = false
        }
        if (rows[i].balance >= psum && rows[i].pay_sum > 0 && jackAccept) {
          queryStr0 = `UPDATE jpg SET \`balance\` = balance - (${psum}) WHERE shopId='${_self.shopId}' AND id=${rows[i].id} `
          const queryStr1 = `UPDATE users SET balance = balance + (${psum})  WHERE id='${_self.userId}'; `
          rows[i].balance -= parseInt(psum.toString())
          const stat = {
            win: psum,
            balance: (await _self.GetBalance()) + psum,
          }
          const queryStr2 = `INSERT INTO stat_game (\`date_time\`, \`user_id\`, \`balance\`, \`bet\`, \`win\`, \`game\`, \`in_game\`, \`in_jpg\`, \`in_profit\`, \`denomination\`, \`slots_bank\`, \`bonus_bank\`, \`fish_bank\`, \`table_bank\`, \`little_bank\`, \`total_bank\`, \`shop_id\`) VALUES ('${cTime}' , '${_self.userId}', '${stat.balance}', '${0}', '${stat.win}', '${_self.gameName} JPG ${rows[i].id}', '${0}','${0}', '${0}', '1', '${0}', '${0}', '${0}', '${0}', '${0}', '${0}', '${_self.shopId}');`
          queue.emit('PutQuery', queryStr1)
          queue.emit('PutQuery', queryStr2)
          await _self.SendQuery(queryStr0)
          // queue.emit('PutQuery', queryStr0)
        }
        if (rows[i].balance < bssum_min) {
          queryStr0 = `UPDATE jpg SET \`balance\` = balance + (${bssum}) WHERE shopId='${_self.shopId}' AND id='${rows[i].id}' `
          const q2 = `INSERT INTO \`${_self.Config.prefix}statistics\` (\`title\`, \`user_id\`, \`payeer_id\`, \`system\`, \`old\`, \`sum\`, \`sum2\`, \`type\`, \`item_id\`, \`status\`, \`shop_id\`, \`created_at\`, \`updated_at\`) VALUES( 'JPG ${rows[i].id}', '1' , NULL, 'jpg', '0.0000', '${bssum}', NULL, 'add', NULL, 1, ${_self.shopId}, '${cTime}', '${cTime}');`
          const q3 = `INSERT INTO \`${_self.Config.prefix}statistics_add\` (\`agent_in\`, \`agent_out\`, \`distributor_in\`, \`distributor_out\`, \`type_in\`, \`type_out\`, \`credit_in\`, \`credit_out\`, \`money_in\`, \`money_out\`, \`statistic_id\`, \`user_id\`, \`shop_id\`, \`created_at\`, \`updated_at\`) VALUES (NULL, NULL, NULL, NULL, '${bssum}', NULL, NULL, NULL, NULL, NULL, LAST_INSERT_ID(), '1', '${_self.shopId}', '${cTime}', '${cTime}');`
          await _self.SendQuery(queryStr0)
          queue.emit('PutQuery', q2)
          queue.emit('PutQuery', q3)
        }
      }
    }
  }
  // get limit state
  _self.GetLimits = async function () {
    /// ///console.log('GetLimits')
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    const queryStr = `SELECT advanced FROM games WHERE name = '${_self.gameName}' AND shopId='${_self.shopId}' ;  `
    const [rows] = await _self.SendQuery(queryStr)
    return rows[0].advanced
  }
  // set balance
  _self.SetBalance = async function (sum: number) {
    sum = utils.FixNumber(sum)
    //console.log("SetBalance ", sum);
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    if (sum < 0) {
      const cTime = _self.ConvertTime(new Date())
      queryStr = `UPDATE users SET last_bid = '${cTime}' , last_progress = '${cTime}' , balance = balance + (${sum})  WHERE id='${_self.userId}'; `
    } else {
      queryStr = `UPDATE users SET  balance = balance + (${sum})  WHERE id='${_self.userId}'; `
    }
    //console.log(queryStr);
    await _self.SendQuery(queryStr, true, true)
  }
  // get count balance
  _self.GetCountBalance = async function () {
    /// ///console.log('GetCountBalance')
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    const queryStr = `SELECT *  FROM users WHERE id='${_self.userId}';  `
    const [rows] = await _self.SendQuery(queryStr, true)
    // let rows: any = await supabase.from('w_users').select('*').eq('id', _self.userId)
    // @ts-ignore
    _self.count_tournaments = rows[0].count_tournaments
    _self.count_happyhours = rows[0].count_happyhours
    _self.count_refunds = rows[0].count_refunds
    _self.count_progress = rows[0].count_progress
    _self.count_daily_entries = rows[0].count_daily_entries
    _self.count_invite = rows[0].count_invite
    _self.count_balance = rows[0].count_balance
    _self.address = rows[0].address
    _self.count_welcomebonus = rows[0].count_welcomebonus
    _self.count_smsbonus = rows[0].count_smsbonus
    _self.count_wheelfortune = rows[0].count_wheelfortune
    if (_self.address === null) _self.address = 0
    _self.address = utils.FixNumber(_self.address)
    _self.userRating = rows[0].rating
    _self.parentId = rows[0].parent_id
    return utils.FixNumber(rows[0].count_balance)
  }
  // get balance
  _self.GetBalance = async function () {
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    const queryStr = `SELECT balance  FROM users WHERE id='${_self.userId}';  `
    const [rows] = await _self.SendQuery(queryStr, true)
    return utils.FixNumber(rows[0].balance)
    ////console.log(_self.userId)
    // const result = await supabase.from('w_users').select('balance').eq('id', _self.userId)
    // if (result === undefined) throw (new Error())
    // if (result.data === null) throw (new Error())
    // ////console.log(result.data[0].balance)
    // ////console.log(utils.FixNumber(result.data[0].balance))
    // return (result.data !== null) ? utils.FixNumber(result.data[0].balance) : 0
  }
  // get balance
  _self.GetBalanceB = async function () {
    // //console.log('getting balance b')
    /* -------------- */
    // ////console.log(conn.connection._closing)
    // if(conn.connection._closing){
    //  await _self.EndConnection();
    // await _self.CreateConnection();
    // }
    /* ------------- */
    const queryStr = `SELECT balance  FROM users WHERE id='${_self.userId}'  ;  `
    // //console.log(queryStr)
    const [rows] = await _self.SendQuery(queryStr, true)
    // const result = await supabase.from('w_users').select('balance').eq('id', _self.userId)
    // return (result.data !== null) ? utils.FixNumber(result.data[0].balance) : 0
    return utils.FixNumber(rows[0].balance)
  }
  // get bank
  _self.SetBank = async function (
    sum: number,
    slotEvent: string,
    requestId = '',
  ) {
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    const cBank = await _self.gameBank
    const decSum = cBank + sum
    if (decSum < 0) {
      _self.Rollback()
      _self.InternalError(
        `Invalid bank value : ${decSum} . ` +
          `Current Bank : ${cBank} . ` +
          ` Sum:  ${sum}`,
      )
      return
    }
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    const bbet = utils.FixNumber((sum / _self.shopPercent) * 100)
    const count_balance = await _self.GetCountBalance()
    _self.betRemains = undefined
    _self.betRemains0 = undefined
    if (sum > 0 && slotEvent === 'bet') {
      if (_self.count_balance === 0 && _self.address > 0) _self.shopPercent = 0
      else if (_self.count_balance === 0) _self.shopPercent = 100
      else _self.shopPercent = _self.shopPercentRaw
      if (_self.count_balance === 0) {
        const remains = []
        _self.betRemains = 0
        const sm = Math.abs(bbet)
        if (_self.address < sm && _self.address > 0) {
          // @ts-ignore
          remains[0] = sm - _self.address
          _self.betRemains = remains[0]
        }
      }
      /* --------------------------------------------- */
      if (_self.count_balance > 0 && bbet > _self.count_balance) {
        const remains0 = []
        const sm_ = bbet
        const tmpSum = sm_ - _self.count_balance
        _self.betRemains0 = tmpSum
        if (_self.address > 0) {
          _self.betRemains0 = 0
          if (_self.address < tmpSum && _self.address > 0) {
            // @ts-ignore
            remains0[0] = tmpSum - _self.address
            _self.betRemains0 = remains0[0]
          }
        }
      }
    }
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /// ////////////////////////
    //console.log("shoppercent ", _self.shopPercent);
    if (_self.shopPercent > 0) {
      /* ------------- */
      if (sum > 0 && slotEvent === 'bet') {
        _self.toGameBanks = 0
        _self.toSlotJackBanks = 0
        _self.toSysJackBanks = 0
        _self.betProfit = 0
        const prc = _self.shopPercent
        const gameBet = (sum / prc) * 100
        await _self.UpdateLevel('bet', gameBet)
        if (count_balance < gameBet && count_balance > 0) {
          const firstBid = count_balance
          let secondBid = gameBet - firstBid
          if (_self.betRemains0 !== undefined) secondBid = _self.betRemains0
          const bankSum = (firstBid / 100) * _self.shopPercent
          sum = bankSum + secondBid
        }
        for (let i = 0; i < _self.jpgs.length; i++) {
          //console.log("jpg, ", count_balance < gameBet && count_balance > 0);
          if (count_balance < gameBet && count_balance > 0)
            _self.toSlotJackBanks +=
              (count_balance / 100) * _self.jpgs[i].percent
          else if (count_balance > 0)
            _self.toSlotJackBanks += (gameBet / 100) * _self.jpgs[i].percent
        }
        _self.toGameBanks = sum
        _self.betProfit =
          gameBet -
          _self.toGameBanks -
          _self.toSlotJackBanks -
          _self.toSysJackBanks
        if (count_balance < gameBet && count_balance > 0)
          await _self.SetCountBalance(-count_balance, gameBet)
        else if (count_balance > 0)
          await _self.SetCountBalance(-gameBet, gameBet)
        else await _self.SetCountBalance(0, gameBet)
        if (
          count_balance <= 0 ||
          (count_balance < gameBet && count_balance > 0)
        )
          _self.shopPercent = 100
      }
      if (sum > 0 && slotEvent === 'bet') _self.toGameBanks = sum
      /// /////////////////////
      /// /////////////////////
    } else {
      /// ////////////////
      /// ////////////////
      /// ////////////////
      _self.toGameBanks = 0
      _self.toSlotJackBanks = 0
      _self.toSysJackBanks = 0
      _self.betProfit = 0
      const gameBet = sum
      if (count_balance < gameBet && count_balance > 0)
        await _self.SetCountBalance(-count_balance, gameBet)
      else if (count_balance > 0) await _self.SetCountBalance(-gameBet, gameBet)
      else await _self.SetCountBalance(0, gameBet)
    }
    /* ----------------- */
    if (
      _self.shopPercent === 0 &&
      slotEvent === 'bet' &&
      _self.betRemains !== undefined
    )
      sum = _self.betRemains
    /* ---------------- */
    if (sum !== 0) {
      const btype = 'fish'
      const queryStr = `UPDATE fish_bank SET ${btype} = ${btype}+(${utils.FixNumber(sum)}) WHERE id='${_self.bankId}'; `
      await _self.SendQuery(queryStr, true, true)
    }
    return true
  }
  // get bank
  _self.GetBank = async function (noLimit = false) {
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */

    const queryStr = `SELECT * FROM fish_bank WHERE id='${_self.bankId}'  ;  `
    const [rows] = await _self.SendQuery(queryStr, true)
    /* ---------------------- */
    _self.gameBank = rows[0].fish
    // return utils.FixNumber(rows[0].fish)
    /* ---------------------- */
    const stat_in = utils.FixNumber(
      _self.ServerStorage(_self.shopId, _self.gameName, 'stat_in'),
    )
    const stat_out = utils.FixNumber(
      _self.ServerStorage(_self.shopId, _self.gameName, 'stat_out'),
    )
    //console.log("stat out ", stat_out);
    //console.log("stat in ", stat_in);
    if (
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit') ===
      undefined
    ) {
      //console.log("a");
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit', 0)
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit0', 0)
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit1', 0)
    }

    if (
      stat_out >
        stat_in +
          _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit1') &&
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit') <= 0
    ) {
      //console.log("b");
      _self.ServerStorage(
        _self.shopId,
        _self.gameName,
        'spinWinLimit',
        utils.RandomInt(100, 200),
      )
      _self.ServerStorage(
        _self.shopId,
        _self.gameName,
        'spinWinLimit0',
        utils.RandomInt(1, 5),
      )
      _self.ServerStorage(
        _self.shopId,
        _self.gameName,
        'spinWinLimit1',
        utils.RandomInt(2, 5),
      )
    }
    if (
      _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit') > 0 &&
      !noLimit
    ) {
      const rbnull = utils.RandomInt(1, 3)
      if (rbnull !== 1) rows[0].fish = 0
      else if (
        _self.lastBet *
          _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit0') <
        rows[0].fish
      )
        rows[0].fish =
          _self.lastBet *
          _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit0')
      if (stat_out <= stat_in)
        _self.ServerStorage(
          _self.shopId,
          _self.gameName,
          'spinWinLimit',
          _self.ServerStorage(_self.shopId, _self.gameName, 'spinWinLimit') - 1,
        )
    }
    /*
     */
    /* ---------------------- */
    // //console.log(rows[0].fish)
    //console.log(utils.FixNumber(rows[0].fish));
    return utils.FixNumber(rows[0].fish)
  }
  // get settings
  _self.GetSettings = async function () {
    /// ///console.log('getting settings')
    /* -------------- */
    // if (conn.connection._closing) {
    //     await _self.EndConnection();
    //     await _self.CreateConnection();
    // }
    /* ------------- */
    queryStr0 = `SELECT * FROM shops WHERE  id='${_self.shopId}' ; `
    let [rows0] = await _self.SendQuery(queryStr0, true)
    // const _rows0 = await supabase.from('w_shops').select('*').eq('id', _self.shopId)
    // let rows0 = _rows0.data as unknown as any
    if (rows0 === null) rows0 = {}
    const queryStrB = `SELECT id FROM fish_bank WHERE  shopId='${_self.shopId}' ; `
    const [rowsB] = await _self.SendQuery(queryStrB, true)
    ////console.log(rowsB)
    // const _rowsB: any = await supabase.from('w_fish_bank').select('id').eq('shop_id', _self.shopId)
    // const rowsB = _rowsB.data as unknown as any
    // if (rowsB===null)

    // if (_rowsB.data === null) throw (new Error('wtf'))
    _self.bankId = rowsB[0].id
    _self.shopCurrency = rows0[0].currency
    _self.shopPercent = rows0[0].percent
    _self.shopPercentRaw = rows0[0].percent
    _self.shopBlocked = rows0[0].is_blocked
    _self.MaxWin = rows0[0].max_win
    _self.progress_active = rows0[0].progress_active
    const count_balance = await _self.GetCountBalance()
    if (count_balance <= 0) _self.shopPercent = 100
    await _self.GetJackpots(false)
    const queryStr = `SELECT * FROM games WHERE name = '${_self.gameName}' AND shopId='${_self.shopId}' ;  `
    let [rows] = await _self.SendQuery(queryStr)
    // const _rows = await supabase.from('w_games').select('*').eq('name', _self.gameName).eq('shop_id', _self.shopId)
    // let rows = _rows.data as unknown as any
    if (rows === null) rows = {}
    _self.game_id = rows[0]._id
    _self.stat_in = utils.FixNumber(Number.parseFloat(rows[0].stat_in))
    _self.stat_out = utils.FixNumber(Number.parseFloat(rows[0].stat_out))
    let qs = `SELECT * FROM games WHERE name = '${_self.gameName}' AND shop_id=0 ;  `
    let [r] = await _self.SendQuery(qs)
    // const _r = await supabase.from('w_games').select('*').eq('name', _self.gameName).eq('shop_id', _self.shopId)
    // let r = _r.data as unknown as any
    // if (r===null)
    // r = {}
    // qs = `SELECT * FROM game_categories WHERE game_id = '$ {r[0].id}'  ;  `;
    // [r] = await _self.SendQuery(qs)
    // r = await supabase.from('w_game_categories').select('*').eq('game_id', r[0].id)
    // _self.game_cat = [17]
    // for (let ri = 0; ri < r.length; ri++)
    //   _self.game_cat[ri] = r[ri].category_id
    // console.log(
    //   " (_self.ServerStorage(_self.shopId, _self.gameName, ) === undefined)",
    //   _self.ServerStorage(_self.shopId, _self.gameName, "stat_in") === undefined
    // );
    //console.log("stat in ", _self.stat_in);
    //console.log("stat out ", _self.stat_out);
    if (
      _self.ServerStorage(_self.shopId, _self.gameName, 'stat_in') === undefined
    ) {
      _self.ServerStorage(
        _self.shopId,
        _self.gameName,
        'stat_in',
        _self.stat_in,
      )
      _self.ServerStorage(
        _self.shopId,
        _self.gameName,
        'stat_out',
        _self.stat_out,
      )
    }
    // ////console.log(rows[0])
    /// ///console.log('end of getSettings')
    return rows[0]
  }
  _self.TournamentStat = async function (
    slotState: any,
    user_id: any,
    bet: number,
    win: number,
  ) {
    /// ///console.log('TournamentStat')
    // const cTime = _self.ConvertTime(new Date())
    // let tmpUsername = _self.userName.split('')
    // tmpUsername[utils.RandomInt(0, tmpUsername.length - 1)] = '*'
    // tmpUsername[utils.RandomInt(0, tmpUsername.length - 1)] = '*'
    // tmpUsername[utils.RandomInt(0, tmpUsername.length - 1)] = '*'
    // tmpUsername[utils.RandomInt(0, tmpUsername.length - 1)] = '*'
    // tmpUsername[utils.RandomInt(0, tmpUsername.length - 1)] = '*'
    // tmpUsername = tmpUsername.join('')
    // /*
    //  */
    // queryStr = `SELECT * FROM \`${_self.Config.prefix}tournaments\` WHERE shopId='${_self.shopId}' ;  `
    // const [rows] = await _self.SendQuery(queryStr)
    // // let rows = []
    // // const result = await supabase.from('tournaments').select('*').eq('shop_id', _self.shopId)
    // // if (result.data !== null)
    // // rows = result.data as unknown as any
    // ////console.log(rows[0])
    // let tournament
    // if (rows[0] !== undefined) {
    //   for (let i = 0; i < rows.length; i++) {
    //     tournament = rows[i]
    //     const options = {
    //       year: 'numeric',
    //       month: 'numeric',
    //       day: 'numeric',
    //       hour: 'numeric',
    //       minute: 'numeric',
    //       second: 'numeric',
    //       hour12: false,
    //     }
    //     const start = new Date(tournament.start)
    //     const end = new Date(tournament.end)
    //     const cti = _self.ConvertTime0()
    //     const sti = _self.ConvertTime1(start.toLocaleDateString('en-US', options))
    //     const eti = _self.ConvertTime1(end.toLocaleDateString('en-US', options))
    //     /// ///////console.log(cti<sti,cti>eti,bet < tournament.bet);
    //     if (cti < sti)
    //       continue
    //     if (cti > eti)
    //       continue
    //     if (bet < tournament.bet)
    //       continue
    //     /// //////////////
    //     if (tournament.games_selected === 1) {
    //       queryStr = `SELECT * FROM \`${_self.Config.prefix}tournament_games\` WHERE game_id = '${_self.game_id}' AND tournament_id=${tournament.id} ;  `
    //       const [r] = await _self.SendQuery(queryStr)
    //       if (r[0] === undefined)
    //         continue
    //     }
    //     else {
    //       queryStr = `SELECT * FROM \`${_self.Config.prefix}tournament_categories\` WHERE category_id IN (${_self.game_cat.join(',')}) AND tournament_id=${tournament.id} ;  `
    //       /// ///////console.log(queryStr);
    //       const [r] = await _self.SendQuery(queryStr)
    //       // const result = await supabase.from('w_tournament_categories').select('*').in('category_id', _self.game_cat.join(',')).eq('tournament_id', tournament.id)
    //       // r = result.data
    //       if (r[0] === undefined)
    //         continue
    //     }
    //     /// /////////////
    //     queryStr = `SELECT * FROM \`${_self.Config.prefix}tournament_stats\` WHERE tournament_id = '${tournament.id}' AND is_bot = 0 AND user_id=${user_id};  `
    //     const [rows0, fields0] = await _self.SendQuery(queryStr)
    //     // const result = await supabase.from('w_tournament_stats').select('*').eq('tournament_id', tournament.id).eq('is_bot', 0).eq('user_id', user_id)
    //     // const rows0 = result.data as unknown as any
    //     let stat = rows0[0]
    //     if (stat === undefined) {
    //       /// ///console.log('STOP updateing shit')
    //       const qs = `INSERT INTO \`${_self.Config.prefix}tournament_stats\` (\`id\`, \`tournament_id\`, \`user_id\`,\`username\`, \`is_bot\`, \`spins\`, \`sum_of_bets\`, \`sum_of_wins\`, \`points\`, \`prize_id\`, \`created_at\`, \`updated_at\`) VALUES (NULL, '${tournament.id}', '${user_id}','${tmpUsername}', '0', '0', '0.0000', '0.0000', '0.0000', '0', '${cTime}', '${cTime}');`
    //       queue.emit('PutQuery', qs)
    //       // await _self.SendQuery(qs);
    //       stat = {
    //         tournament_id: tournament.id,
    //         user_id,
    //         is_bot: 0,
    //         sum_of_bets: 0,
    //         sum_of_wins: 0,
    //         spins: 0,
    //         prize_id: 0,
    //         points: 0,
    //         created_at: cTime,
    //         updated_at: cTime,
    //       }
    //     }
    //     stat.sum_of_bets = bet
    //     stat.sum_of_wins = win
    //     stat.spins++
    //     let pinc = 0
    //     switch (tournament.type) {
    //       case 'amount_of_bets':
    //         pinc += bet
    //         break
    //       case 'amount_of_winnings':
    //         pinc += win
    //         break
    //       case 'win_to_bet_ratio':
    //         pinc += (win / bet)
    //         break
    //       case 'profit':
    //         pinc += (win - bet)
    //         break
    //     }
    //     /* update tournament stat */
    //     queryStr = `UPDATE \`${_self.Config.prefix}tournament_stats\` SET  \`updated_at\` = '${cTime}', \`spins\` = \`spins\`+1 , \`sum_of_bets\` = \`sum_of_bets\`+ ${stat.sum_of_bets}, \`sum_of_wins\` = \`sum_of_wins\` + ${stat.sum_of_wins}, \`points\` = \`points\` + ${pinc} WHERE  user_id = ${user_id} AND tournament_id=${tournament.id} ; `
    //     queue.emit('PutQuery', queryStr)
    //   }
    // }
  }
  _self.ClearTicker = async function () {
    clearInterval(_self.activeTicker)
  }
  _self.CheckActive = async function () {
    // //console.log('check active')
    _self.tick = _self.tick + 1
    if (_self.transactionInProgress) {
      return
    }
    // if (_self.userId == -1)
    ////console.log("_self.userId ", _self.userId, " _self.tick ", _self.tick)

    if (_self.tick > 4 && _self.userId == -1) _self.ClearTicker()
    // if(_self.userId !== -1){
    // emitter.emit('CloseSocket');
    // return;
    // }
    // //console.log(_self.userId)
    var queryStr2 = "SELECT * FROM users WHERE id='" + _self.userId + "'; "
    var [rows2, fields2] = await _self.SendQuery(queryStr2)
    if (rows2[0] == undefined) {
      //console.log("closing socket");
      emitter.emit('CloseSocket')
      return
    }
    var userBlocked = rows2[0].is_blocked
    var userStatus = rows2[0].status
    if (rows2[0] == undefined || userBlocked == 1 || userStatus == 'Banned') {
      //console.log("closing socket");
      emitter.emit('CloseSocket')
      return
    }
    var queryStr1 = "SELECT * FROM shops WHERE  id='" + _self.shopId + "' ; "
    // //console.log(queryStr1)
    var [rows1, fields1] = await _self.SendQuery(queryStr1)
    _self.progress_active = rows1[0].progress_active
    var shopBlocked = rows1[0].is_blocked
    let queryStr =
      'SELECT active FROM `' +
      _self.Config.prefix +
      "subsessions` WHERE user_id = '" +
      _self.userId +
      "' AND subsession=" +
      _self.sessionId +
      ' ;  '
    let [rows, fields] = await _self.SendQuery(queryStr)
    //////console.log(rows)
    if (rows[0] == undefined || _self.userId == -1 || shopBlocked == 1) {
      //console.log("closing socket");
      emitter.emit('CloseSocket')
      return
    }
    let sessActive = rows[0]['active']
    let queryStr0 =
      "SELECT view FROM games WHERE name = '" +
      _self.gameName +
      "' AND shopId='" +
      _self.shopId +
      "' ;  "
    // //console.log(queryStr0)
    let [rows0, fields0] = await _self.SendQuery(queryStr0)

    let gameView = rows0[0]['view']
    if (!sessActive || gameView != 1) {
      //console.log("closing socket");
      emitter.emit('CloseSocket')
    }
  }
  //get userId and shopId
  _self.Auth = async function (cookie: any, gameURL: any, sessionId: any) {
    //  //console.log('starting auth',cookie)
    //console.log("starting auth", sessionId);
    // const arr = cookie.split(';')
    // let token
    // // arr.forEach(cookie => {
    //   //////console.log(cookie)
    //   // if (cookie.includes('sb-access-token'))
    //     token = cookie

    // const cookies = ws.data.headers.get('cookie')?.split('; ')
    // let cookie
    // cookies?.forEach(_cookie =>{
    //   if(_cookie.includes('pb_auth'))
    //     cookie = _cookie
    // })\
    if (_self.pb == null) await _self.CreateConnection()
    _self.pb.authStore.loadFromCookie(cookie)
    //console.log(_self.pb.authStore.isValid);
    if (_self.pb.authStore.isValid == false) emitter.emit('Error', 'AuthError')
    const user = _self.pb.authStore.model
    // })
    // if (token === undefined) {
    //   arr.forEach(cookie => {
    //     if (cookie.includes('php-access-token'))
    //       token = cookie
    //   })
    // }
    // token = token.split('=')[1]/
    ////console.log(token)
    //   var decoded = jwt.verify(token, 'FKHTSJYdl5KbETaQdof7TULNg6qKN/mWCKSCRYfMslzNPqy9lE21RcgJEqqFm5djLwD3884Dhrhwl+vzF401AA==');
    //  //console.log(decoded)
    //   _self.sessionId = sessionId;
    // let param={
    // command:"CheckAuth"
    // };
    // let request = require('request');
    // let paramStr=JSON.stringify(param);
    // let options = {
    //   method: 'post',
    //   body: param,
    //   json: true,
    //   rejectUnauthorized: false,
    //   requestCert: false,
    //   agent: false,
    //   url: gameURL,
    //   headers: {
    // 	'Connection': 'keep-alive',
    // 	"Content-Type": "application/json",
    // 	'Content-Length': paramStr.length,
    //     'Cookie': cookie
    //   }
    // }
    // request(options, function (err, res, body) {
    //////console.error('AuthResponse',body);
    // const meta = decoded.user_metadata
    // const {
    //   data: sbuser,
    //   error
    // } = await supabase.from('users').select('crystals').eq('id', decoded.sub).single()
    // if (error) {
    //  ////console.log(error)
    //   emitter.emit('Error', 'AuthError');
    // }
    // //console.log(meta.php_id)
    try {
      // this.SetBalance(sbuser.crystals)
      // if(body.responseEvent=='CheckAuth'){
      var st = new Date()
      ;(_self.userId = user.id), (_self.shopId = user.shop_id)
      _self.userName = user.name
      _self.startTimeSystem = st.getTime()
      _self.startTimeServer = st.getTime()
      //console.log("_self ", _self);
      var cTime = _self.ConvertTime(new Date())
      var qs =
        'INSERT INTO `' +
        _self.Config.prefix +
        "subsessions` (`id`, `user_id`, `active`, `subsession`, `created_at`) VALUES (NULL, '" +
        _self.userId +
        "',  '1', '" +
        _self.sessionId +
        "', '" +
        cTime +
        "');"
      // //console.log(qs)
      // const [rows] = _self.SendQuery(qs, true, true);
      // //console.log('rows ',rows)

      // const crystal_value = sbuser.crystals / 100
      // var queryStr = "UPDATE `" + _self.Config.prefix + "users` SET  balance = " + crystal_value + "  WHERE id=" + _self.userId + "; ";
      // await _self.SendQuery(queryStr);
      //console.log("accepted auth");
      emitter.emit('AuthAccept')
      // }else{
      // emitter.emit('Error','AuthError');
      // }
    } catch (er) {
      //console.log(er);
      emitter.emit('Error', 'AuthError')
    }
  }
  _self.activeTicker = setInterval(_self.CheckActive, 5000)
  return _self
}

//
//   _self.CheckActive = async function () {
//     _self.checkIntervalStarted = true

//     if (_self.userId === -1) {
//       // emitter.emit('CloseSocket', '')
//       if (_self.no_user_count > 2) {
//         _self.ClearTicker()
//         emitter.emit('CloseSocket', '')
//         return
//       }
//       _self.no_user_count++
//       return
//     }
//     const queryStr1 = `SELECT * FROM \`${_self.Config.prefix}shops\` WHERE  id = 1;`
//     const [rows1] = await _self.SendQuery(queryStr1)
//     // let rows1: any = await supabase.from('w_shops').select('*').eq('id', _self.shopId)
//     // rows1 = rows1.data as unknown as any
//     _self.progress_active = rows1[0].progress_active
//     const shopBlocked = rows1[0].is_blocked

//     // const queryStr = `SELECT active FROM \`${_self.Config.prefix}subsessions\` WHERE user_id = ${_self.userId} AND subsession='${_self.sessionId.toString()}' ;  `
//     const _rows = await prisma.w_subsessions.findFirst({
//       where: {
//         active: 1,
//         user_id: _self.userId,
//         subsession: _self.sessionId.toString(),
//       }
//     })
//     const rows = [_rows]
//     // const [rows] = await _self.SendQuery(queryStr)

//     // let rows: any = await supabase.from('w_subsessions').select('active').eq('user_id', _self.userId).eq('subsession', _self.sessionId)
//     // rows = rows.data as unknown as any
//     if (rows[0] === undefined || _self.userId === -1 || shopBlocked === 1) {
//       /// ///console.log('closing4')
//       _self.ClearTicker()
//       emitter.emit('CloseSocket', '')
//     }
//     // let queryStr0="SELECT view FROM `"+_self.Config.prefix+"games` WHERE name = '"+_self.gameName+"' AND shop_id="+_self.shopId+" ;  ";
//     // let [rows0, fields0] = await _self.SendQuery(queryStr0);
//     // const [rows0] = await _self.conn.query('SELECT view FROM w_games WHERE name = '"+_self.gameName+"' AND shop_id = 1;')
//     // let rows = await supabase.from('w_games').select('active').eq('user_id', _self.userId).eq('subsession', _self.sessionId )
//     // const gameView = rows0[0]['view']
//     // if (!sessActive || gameView !==1) {
//     // / ///console.log('closing5')
//     // emitter.emit('CloseSocket', '')
//     // }

//   }
//   _self.Auth = async function (cookie: any, gameURL: any, sessionId: any) {
//     ////console.log('checking auth', sessionId)
//     _self.sessionId = sessionId
//     // _self.shop_id = 1
//     ////console.log(cookie)
// const decoded = jwt.verify(cookie, 'FKHTSJYdl5KbETaQdof7TULNg6qKN/mWCKSCRYfMslzNPqy9lE21RcgJEqqFm5djLwD3884Dhrhwl+vzF401AA==')
//     // @ts-ignore
// const meta = decoded.user_metadata

//     // const {
//     //   data: sbuser,
//     //   error
//     // } = await supabase.from('users').select('crystals').eq('id', decoded.sub).single()
//     // if (error) {
//     //   ////console.log(error)
//     //   emitter.emit('Error', 'AuthError');
//     // }
//     // const cTime = _self.ConvertTime(new Date())
//     let id: any = parseInt(meta.php_id)
//     // id = id.toString()
//     // id = id.trim()
//    ////console.log(id)
//     const time = new Date().toISOString()
//     const xs = await prisma.w_subsessions.create({
//       data: {
//         user_id: id,
//         subsession: _self.sessionId.toString(),
//         active: 1,
//         created_at: time
//       },
//     })
//     ////console.log(xs)
//     // const cTime = _self.ConvertTime(new Date())
//     const zz = await prisma.w_subsessions.findFirst({
//       where: {
//         active: 1,
//         user_id: id,
//         subsession: _self.sessionId.toString(),
//       }
//     })
//     ////console.log(zz)
//     // const qs = `INSERT INTO \`${_self.Config.prefix}subsessions\` (\`id\`, \`user_id\`, \`active\`, \`subsession\`) VALUES (null, '${_self.userId}',  '1', '${_self.sessionId}');`
//     // const time = Date.now()
//    ////console.log(time)
//    ////console.log(id.toString())
//    ////console.log(sessionId)

//     // const statement = db.prepare(`
//     //   INSERT INTO w_subsessions
//     //     (id, user_id, active, subsession, created_at)
//     //   VALUES
//     //   (null, ${parseInt(id)}, 1, '${sessionId}', '${time}'`);
//     const statement = db.prepare(`
//       INSERT INTO w_subsessions
//         (id, user_id, active, subsession, created_at)
//       VALUES
//       (null, 41, 1, '123233', '2021-10-17 08:19:37')`);
//     statement.run({
//       $user_id: id,
//       $subsession: _self.sessionId.toString(),
//       $active: 1,
//       $created_at: time
//     },)

//     // await _self.SendQuery(qs);
//     try {
//       // this.SetBalance(sbuser.crystals)
//       // if(body.responseEvent=='CheckAuth'){
//       const st = new Date()
//       _self.userId = parseInt(meta.php_id)
//       _self.shopId = 1
//       _self.userName = meta.username
//       _self.startTimeSystem = st.getTime()
//       _self.startTimeServer = st.getTime()
//       //       const qs = `INSERT INTO \`${_self.Config.prefix}subsessions\` (\`id\`, \`user_id\`, \`active\`, \`subsession\`, \`created_at\`) VALUES (NULL, '${_self.userId}',  '1', '${_self.sessionId}', '${cTime}');`
//       //       const subsession = {
//       //         user_id: parseInt(_self.userId),
//       //         active: 1,
//       //         subsession: `'${_self.sessionId}'`,
//       //         created_at: cTime,
//       //       }
//       //       const result = await _self.db`INSERT INTO w_subsessions ${_self.db({ id: null, user_id: _self.userId, active: 1, subsession: `'${_self.sessionId}'`, created_at: cTime })}`
//       //       const xs = await _self.db`
//       //   insert into w_subsessions (
//       //    id, user_id, active, subsession
//       //   ) values (
//       //    null,  41,  1, '1232323', ${cTime}
//       //   )

//       //   returning *
//       // `

//       //   const result = await _self.db`
//       //   insert into w_subsessions (
//       //     id,
//       //     user_id,
//       //     active,
//       //     subsession,
//       //     created_at
//       //   ) values (
//       //     null,
//       //     ${_self.userId},
//       //     1,
//       //     ${_self.sessionId},
//       //     ${cTime}
//       //   )
//       // `
//       // const result = await _self.SendQuery(qs)
//       // const crystal_value = sbuser!.crystals / 100
//       // queryStr = "UPDATE `" + _self.Config.prefix + "users` SET  balance = " + crystal_value + "  WHERE id=" + _self.userId + "; ";
//       // await _self.SendQuery(queryStr);
//       ////console.log('accepting')
//       emitter.emit('AuthAccept')
//       // }else{
//       // emitter.emit('Error','AuthError');
//       // }
//     }
//     catch (er) {
//       ////console.log(er)
//       emitter.emit('Error', 'AuthError')
//     }
//   }
//   if (_self.checkIntervalStarted === false)
//     _self.activeTicker = setInterval(_self.CheckActive, 5000)
//   _self.emitter.emit('test')
//   return _self
// }
