import TcbPlayer  from '../src/index'


const dp = TcbPlayer({
  container: document.getElementById('player'),
  envId: 'tcb-demo-10cf5b',
  video: {
    url: 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
  },
  screenshot: true,
  danmaku: {
    id: 'xxxxxx',
    api: 'xx'
  }
})