import TcbPlayer  from '../src/index'
import Hls from 'hls.js'


// const dp = TcbPlayer({
//   container: document.getElementById('player'),
//   envId: 'tcb-demo-10cf5b',
//   video: {
//     url: 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
//   },
//   screenshot: true,
//   danmaku: {
//     id: 'xxxxxx',
//     api: 'xx'
//   }
// })

const ldp = TcbPlayer({
  container: document.getElementById('live-stream'),
  envId: 'tcb-demo-10cf5b',
  live: true,
  video: {
    // url: 'http://keonline.shanghai.liveplay.qq.com/live/program/live/sdwshd/4000000/mnf.m3u8',
    url: 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
    // type: 'hls'
  },
  screenshot: true,
  danmaku: {
    id: 'live-stream-test',
    api: 'xxx'
  },
  // customType: {
  //   customHls: function (video: any, player: any) {
  //       const hls = new Hls();
  //       hls.loadSource(video.src);
  //       hls.attachMedia(video);
  //   }
  // }
})