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
  type: 'top' | 'bottom' | 'right'
  /** danmaku created time */
  date: number
}

interface ITcbPlayerOptions extends Exclude<DPlayerOptions, 'danmaku' | 'apiBackend'> {
  envId: string
}

const DB_NAME = 'tcb_danmaku'

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

async function getDanmaku(envId: string, playerId: string, cb: Function) {
  try {
    await tcbSign(envId)
    const db = app!.database()
    const result = await db.collection(DB_NAME).where({
      player: playerId
    }).get()
    cb(result.data)
  } catch (error) {
    console.log('failed to get danmaku', error)
  }
}

async function sendDanmaku(envId: string, danmaku: IDanmaku) {
  try {
    await tcbSign(envId)
    const db = app!.database()
    danmaku.date = +new Date()
    await db.collection(DB_NAME).add(danmaku)
  } catch (error) {
    console.log('failed to send danmaku', error)
  }
}

export default function TcbPlayer(options: ITcbPlayerOptions) {
  if (!options.envId) {
    throw new Error('tcb environment id is required')
  }
  const config = {
    danmaku: true,
    apiBackend: {
      read: (endPoint, cb) => getDanmaku(options.envId, cb),
      send: (endPoint, danmakuData, cb) =>

    }
  }
}