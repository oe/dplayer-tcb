/**
 * send danmaku
 */
import { tcbSign, DB_NAME, updateSentDMIds } from './utils'
import { ITpOptions } from './types'

export interface ISendDanmakuOptions {
  url: string
  data: object
  success?: Function
  error?: Function
}

export default async function sendDanmaku(envId: string | Function, options: ISendDanmakuOptions, tpOptions: ITpOptions) {
  try {
    const { app } = await tcbSign(envId)
    const db = app!.database()
    const data: any = options.data
    data.date = +new Date()
    data.player = data.id
    delete data.id
    const result = await db.collection(DB_NAME).add(options.data)
    // @ts-ignore
    if (tpOptions.dp?.options.live) {
      updateSentDMIds(result.id)
    }
    options.success && options.success({code: 0, data: result})
  } catch (error) {
    console.warn('failed to send danmaku', error)
    options.error && options.error()
  }
}