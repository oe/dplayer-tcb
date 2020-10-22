import DPlayer,{ DPlayerOptions } from 'dplayer'
import readDanmaku, { IReadDanmakuOptions } from './read'
import sendDanmaku, { ISendDanmakuOptions } from './send'
import { ITpOptions } from './types'



export interface ITcbPlayerOptions extends Exclude<DPlayerOptions, 'danmaku' | 'apiBackend'> {
  envId: string | Function
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
