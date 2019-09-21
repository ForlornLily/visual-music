import "@/assets/css/reset.css";
import "./index.css";

import { BASEURL, size } from "@/utils/config.js";
import { ajax, throttle } from "@/utils/index.js";
const doc = document;
//请求歌曲列表
ajax({
  url: `${BASEURL}/media`,
  callback(data) {
    if (!data.success) {
      return;
    }
    const musicList = JSON.parse(data.data) || [],
      length = musicList.length;
    let str = "";
    for (let i = 0; i < length; i++) {
      str += `<li class="list-item" title="${musicList[i]}">${musicList[i]}</li>`;
    }
    obj.ele.innerHTML = str;
    obj.ele.addEventListener("click", obj.click);
  }
})

//webAudio
const audioContext = new window.AudioContext();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = size * 2;
analyserNode.connect(gainNode);
let source = null,
  count = 0;
const obj = {
  ele: doc.getElementById("music_list"),
  click(e) {
    const target = e.target;
    if (!target || !target.classList.contains("list-item")) {
      return false;
    }
    const list = obj.ele.querySelectorAll(".list-item"),
          length = list.length;
    for(let j=length;j--;) {
      list[j].classList.remove("selected");
    }
    target.classList.add("selected");
    count++;
    loadMusic(target.title)
  },
  handleAudio(data) {
    if (source) {
      source.stop();
    }
    const n = count;
    const ac = audioContext;
    ac.decodeAudioData(data, (buffer) => {
      if (n != count) {
        if (source) {
          source.stop();
        }
        return;
      }
      const bufferSource = ac.createBufferSource();
      source = bufferSource;
      bufferSource.buffer = buffer; //音频资源赋值
      // bufferSource.connect(ac.destination);//连接到AudioDestinationNode，！此处直接链接无效
      // bufferSource.connect(gainNode) //通过连接音量，间接连接到destination
      bufferSource.connect(analyserNode);
      bufferSource.start() //开始播放
    });
  }
}
function loadMusic(title) {
  ajax({
    url: `${BASEURL}/single?name=${title}`,
    // url: "../../static/media/"+title,
    responseType: "arraybuffer",
    callback(data) {
      if (!data.success) {
        return;
      }
      obj.handleAudio(data.data);
    }
  })
}

const inputObj = {
  ele: doc.getElementById("control"),
  handleVolume(e) {
    const value = this.value / this.max;
    gainNode.gain.value = value * value;
  }
}
inputObj.ele.addEventListener("change", inputObj.handleVolume);

//分析音频
function visualizer() {
  let arr = new Uint8Array(analyserNode.frequencyBinCount)//长度是fftsize的一半。也就是frequencyBinCount
  function loop() {
    analyserNode.getByteFrequencyData(arr) //将数据放到Uint8Array数组里面
    draw(arr);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
visualizer();

const canvasTarget = doc.getElementById("canvas");
let ctx = canvasTarget.getContext("2d");
let line;
const listTarget = doc.getElementsByClassName("music-list")[0];
let mainWidth, mainHeight;
//监听window窗口改变，重新绘制canvas
function handleSize() {
  mainWidth = canvasTarget.clientWidth;
  let listWidth = 0;
  if(mainWidth >= 764) {
    listWidth = listTarget.clientWidth;
    mainWidth = mainWidth - listWidth - 10;
  }
  mainHeight = canvasTarget.clientHeight - 10;
  canvasTarget.width = mainWidth;
  line = ctx.createLinearGradient(0,0,0,mainHeight);//绘制渐变
  line.addColorStop(0, "red") //生成随机渐变色
  line.addColorStop(0.3, "green")
  line.addColorStop(0.5, "yellow")
  ctx.fillStyle = line;
}
const resize = throttle(handleSize, 1000);
window.addEventListener("resize", resize)
handleSize();
function draw(arr) {
  const length = size;
  let canvasWidth = mainWidth,
        canvasHeight = mainHeight;
  //重绘之间清除上一次绘制
  ctx.clearRect(0,0, canvasWidth, canvasHeight);
  let width = canvasWidth / length; //宽度是canvas总宽度然后等分
  for(let i=0;i<length;i++) {
    let height = arr[i] / 256 * canvasHeight; //高度是音频数据占据fftsize的百分比，然后乘以canvas总高度
    /*
    x坐标: 宽度 * 索引
    y坐标: y往下，所以坐标其实是canvas高度减去height
    宽度：让柱和柱之间有间隙，宽度再给个百分比缩小
    */
    ctx.fillRect(width * i, canvasHeight - height, width * 0.6, height);
  }
}
let pauseObj = {
  el: doc.getElementById("pause"),
  click() {
    if (source) {
      source.stop();
    }
  }
}
pauseObj.el.addEventListener("click", pauseObj.click);