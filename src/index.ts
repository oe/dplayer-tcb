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
    acc[decodeURIComponent(parts[0])] = decodeURIComponent(parts[0] || '')
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
async function readDanmaku(envId: string, options: IReadDanmakuOptions) {
  try {
    const queryCond = parseDanmaQuery(options.url)
    if (!queryCond || !queryCond.id) {
      throw new Error('danmaku id is required')
    }
    await tcbSign(envId)
    const db = app!.database()
    const query = db.collection(DB_NAME).where({
      player: queryCond.id
    })
    if (queryCond.max) query.limit(queryCond.max)
    const result = await query.get()
    let dammakus = result.data || []
    dammakus.forEach((item: any) => {
      item.time = item.time || 0
      item.type = item.type || 0
      item.color = item.color || 16777215
      item.author = htmlEncode(item.author) || 'DPlayer'
      item.text = htmlEncode(item.text) || ''
    })
    options.success && options.success(dammakus)
    console.log('xx')
  } catch (error) {
    console.warn('failed to get danmaku', error)
    options.error && options.error()
  }
}


interface ISendDanmakuOptions {
  url: string
  data: object
  success?: Function
  error?: Function
}
async function sendDanmaku(envId: string, options: ISendDanmakuOptions) {
  try {
    await tcbSign(envId)
    const db = app!.database()
    // @ts-ignore
    options.data.date = +new Date()
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
  const config = {
    apiBackend: {
      read: (param: IReadDanmakuOptions) => readDanmaku(options.envId, param),
      send: (param: ISendDanmakuOptions) => sendDanmaku(options.envId, param)
    }
  }
}