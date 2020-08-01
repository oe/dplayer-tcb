import DPlayer,{ DPlayerOptions } from 'dplayer'
import tcb from 'tcb-js-sdk'
import { Auth } from 'tcb-js-sdk/dist/auth'
interface IDanmaku {
  /** player id */
  player: string,
  /** creator */
  author?: string,
  /** danmaku time at video*/
  time: number
  /** danmaku content */
  text: string
  /** color in number*/
  color: number
  /** danmaku type */
  type: number
  /** danmaku created time */
  date: number
}

interface ITcbPlayerOptions extends Exclude<DPlayerOptions, 'danmaku' | 'apiBackend'> {
  envId: string
}

interface ITpOptions {
  live?: boolean
  dp?: DPlayer
}

const DB_NAME = 'tcb_player_danmaku'

let auth: Auth | undefined
let app: typeof tcb | undefined

async function tcbSign(envId: string) {
  if (auth?.hasLoginState()) return true
  if (!auth) {
    app = tcb.init({
      env: envId
    })
    
    auth = app.auth({
      persistence: 'local'
    })
  }
    
  await auth!.signInAnonymously()
  return true
}

function parseDanmaQuery(url: string) {
  let query = url.split('?').pop()
  return query?.split('&').reduce((acc, cur) => {
    const parts = cur.split('=')
    const key = decodeURIComponent(parts[0])
    acc[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '')
    if (key === 'max') {
      acc.max = parseInt(acc.max, 10)
    }
    return acc
  }, {} as any) || null
}

function htmlEncode (str: string) {
  return str ? str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2f;') : '';
}


interface IReadDanmakuOptions {
  url: string
  success?: Function
  error?: Function
}

const READ_PER_PAGE = 1000

async function readDanmaku(envId: string, options: IReadDanmakuOptions, tpOptions: ITpOptions) {
  if (!options.success) return
  try {
    const queryCond = parseDanmaQuery(options.url)
    if (!queryCond || !queryCond.id) {
      throw new Error('danmaku id is required')
    }
    await tcbSign(envId)
    const collection = app!.database().collection(DB_NAME)
    
    // just watch db if is live video
    if (tpOptions.live) {
      options.success([])
      watchDanmaku(collection, queryCond.id, tpOptions.dp)
      return
    }
    
    const danmaku = await _getDanmaku(collection, 0, queryCond.id)
    if (danmaku.length === READ_PER_PAGE) {
      console.log('there maybe more danmaku to read')
    }
    options.success(danmaku)
    
  } catch (error) {
    console.warn('failed to get danmaku', error)
    options.error && options.error()
  }
}

let watcher: any

function watchDanmaku(collection: any, playerId: string, dp?: DPlayer) {
  watcher?.close()

  watcher = collection
    .where({
      player: playerId
    })
    .orderBy('time', 'asc')
    .watch({
      onChange: (snapshot: any) => {
        console.warn('snapshot', snapshot)
        if (!snapshot.docChanges || !snapshot.docChanges.length) return
        normalizeDanmaku(
          snapshot.docChanges
            .filter((item: any) => item.dataType === 'add')
            .map((item: any) => item.doc)
        ).forEach((item: any) => {
          dp?.danmaku.draw(item)
        })
      },
      onError: (err: any) => {
        console.log('watch error', err)
      }
    })

}

async function _getDanmaku(collection: any, offset: number, playerId: string) {
  const result = await collection.where({
    player: playerId
  }).orderBy('time', 'asc').skip(offset).limit(READ_PER_PAGE).get()
  
  return normalizeDanmaku(result.data)
}

function normalizeDanmaku(danmaku: any) {
  if (!danmaku) return []
  danmaku.forEach((item: any) => {
    item.time = item.time || 0
    item.type = item.type || 0
    item.color = item.color || 16777215
    item.author = htmlEncode(item.author) || 'DPlayer'
    item.text = htmlEncode(item.text) || ''
  })
  return danmaku
}

interface ISendDanmakuOptions {
  url: string
  data: object
  success?: Function
  error?: Function
}
async function sendDanmaku(envId: string, options: ISendDanmakuOptions, tpOptions: ITpOptions) {
  try {
    await tcbSign(envId)
    const db = app!.database()
    const data: any = options.data
    data.date = +new Date()
    data.player = data.id
    delete data.id
    const result = await db.collection(DB_NAME).add(options.data)
    options.success && options.success({code: 0, data: result})
  } catch (error) {
    console.warn('failed to send danmaku', error)
    options.error && options.error()
  }
}

export default function TcbPlayer(options: ITcbPlayerOptions) {
  if (!options.envId) {
    throw new Error('tcb environment id is required')
  }
  const tpOptions: ITpOptions = {live: options.live}
  const config = {
    apiBackend: {
      read: (param: IReadDanmakuOptions) => readDanmaku(options.envId, param, tpOptions),
      send: (param: ISendDanmakuOptions) => sendDanmaku(options.envId, param, tpOptions)
    }
  }
  const dp = new DPlayer(Object.assign({}, options, config))
  tpOptions.dp = dp
  return dp
}