/**
 * read danmaku
 */
import DPlayer from 'dplayer'
import { parseQuery, tcbSign, DB_NAME, normalizeDanmaku, isDMNotExists } from './utils'
import { ITpOptions } from './types'

export interface IReadDanmakuOptions {
  url: string
  success?: Function
  error?: Function
}

const READ_PER_PAGE = 1000

export default async function readDanmaku(envId: string | Function, options: IReadDanmakuOptions, tpOptions: ITpOptions) {
  if (!options.success) return
  try {
    const queryCond = parseQuery(options.url)
    if (!queryCond || !queryCond.id) {
      throw new Error('danmaku id is required')
    }
    const { app } = await tcbSign(envId)
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
            .filter(isDMNotExists)
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

