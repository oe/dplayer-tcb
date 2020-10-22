import DPlayer,{ DPlayerOptions } from 'dplayer'

export interface IDanmaku {
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

export interface ITpOptions {
  live?: boolean
  dp?: DPlayer
}