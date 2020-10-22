import tcb from 'tcb-js-sdk'
import { Auth } from 'tcb-js-sdk/dist/auth'

/** tcb dbname */
export const DB_NAME = 'tcb_player_danmaku'

/**
 * parse url's query string to object
 * @param url url string with query
 */
export function parseQuery(url: string) {
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

/**
 * encode special chars to html entities
 * @param str 
 */
export function htmlEncode (str: string) {
  return str ? str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2f;') : '';
}

/**
 * normalize danmaku
 * @param danmaku 
 */
export function normalizeDanmaku(danmaku: any) {
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


// interface 

let auth: Auth | undefined
let app: typeof tcb | undefined

export async function tcbSign(envId: string | Function) {
  if (auth?.hasLoginState()) return {app, auth}
  if (!auth) {
    // use custom login method
    if (typeof envId === 'function') {
      const resp = await envId()
      app = resp.app
      auth = resp.app
    } else {
      app = tcb.init({
        env: envId
      })
      auth = app.auth({
        persistence: 'local'
      })
      await auth!.signInAnonymously()
    }
  }
  return { app, auth }
}


