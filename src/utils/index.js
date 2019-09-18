export function EventTarget() {
  this.handler = {};
}
EventTarget.prototype = {
  constructor: EventTarget,
  addHander(type, handler) {
    //增加事件
    if (typeof this.handler[type] == 'undefined') {
      this.handler[type] = [];
    }
    this.handler[type].push(handler); //可能有很多方法，把方法做为数组
  },
  fire(event) {
    //触发事件，传入触发的事件名和参数
    if (!event.target) {
      //如果没有传入事件对象，把实例做为对象
      event.target = this;
    }
    //事件方法做为数组存在
    const handlers = this.handler[event.type];
    if (handlers instanceof Array) {
      const length = handlers.length;
      for (let k = 0; k < length; k++) {
        handlers[k](event);
      }
    }
  },
  removeHander(type, handler) {
    //删除事件
    const handlers = this.handler[type];
    if (handlers instanceof Array) {
      const length = handlers.length;
      for (let k = 0; k < length; k++) {
        if (handlers[k] == handler) {
          this.handler[type].splice(k, 1);
          break;
        }
      }
    }
  }
}

export function showError(msg) {
  document.body.innerHTML = msg || "出错了";
}

let xhr = new XMLHttpRequest();
export function ajax(options) {
  let { url ,type="GET", responseType="text", flag, callback, data=null } = options;
  if(!url) {
    return false;
  }
  xhr.abort();
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