import "@/assets/css/reset.css";
import "./index.css";

import { BASEURL } from "@/utils/config.js";

//ajax
let xhr = new XMLHttpRequest();
function ajax(options) {
  let { url, type = "GET", responseType = "text", flag, callback, data = null } = options;
  if (!url) {
    return false;
  }
  xhr.responseType = responseType;
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      // 4表示整个请求过程已经完毕.
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        // 200 表示一个成功的请求
        callback({
          success: true,
          data: xhr.response
        });
      }
    }
  }
  xhr.onerror = (err) => {
    callback({
      success: false,
      data: err
    });
  }
  xhr.open(type, url, true); //true为异步，不写默认为true
  xhr.send(data);
}

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
      str += `<li class="list-item ellipsis" title="${musicList[i]}">${musicList[i]}</li>`;
    }
    obj.ele.innerHTML = str;
    obj.ele.addEventListener("click", obj.click);
  }
})

//webAudio
const audioContext = new window.AudioContext();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
let source = null,
  count = 0;
const obj = {
  ele: doc.getElementById("music_list"),
  click(e) {
    const target = e.target;
    if (!target || !target.classList.contains("list-item")) {
      return false;
    }
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
      bufferSource.connect(gainNode) //通过连接音量，间接连接到destination
      bufferSource.start() //开始播放
    });
  }
}
function loadMusic(title) {
  xhr.abort();
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