import TcbPlayer  from '../src/index'
import Hls from 'hls.js'


// @ts-ignore
window.livePlayer = TcbPlayer({
  container: document.getElementById('live-stream'),
  envId: 'tcb-demo-10cf5b',
  live: true,
  video: {
    url: 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
  },
  screenshot: true,
  danmaku: {
    id: 'live-stream-test',
    api: 'xxx'
  }
})

// @ts-ignore
window.staticPlayer = TcbPlayer({
  container: document.getElementById('player'),
  envId: 'tcb-demo-10cf5b',
  live: false,
  video: {
    url: 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
  },
  screenshot: true,
  danmaku: {
    id: 'player',
    api: 'xxx'
  },
})