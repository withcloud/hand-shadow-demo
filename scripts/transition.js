// 網絡地址
const HOST = "https://pincode-beta.vercel.app"; //指定服務端口
let pinInput = ""; // pin碼值
let local_user = {}; // pin對象
const scoresData = [];

const items = [
  "數據科學",
  "謎",
  "機器都識學習",
  "你畫我猜",
  "5G的速度",
  "姿勢捕捉",
  "聲音中的喜怒哀樂",
];

// 重新開始遊戲
function again() {
  window.location.reload(); //重新加載會有閃爍現象
}

// 選擇語言
function language_game(number) {
  chinese = document.getElementById("introduction_chinese");
  english = document.getElementById("introduction_english");
  portuguese = document.getElementById("introduction_portuguese");
  main = document.getElementById("main");
  main.style.display = "none";
  switch (parseInt(number)) {
    case 1:
      chinese.style.display = "block";
      english.style.display = "none";
      portuguese.style.display = "none";
      break;
    case 2:
      chinese.style.display = "none";
      english.style.display = "block";
      portuguese.style.display = "none";
      break;
    case 3:
      chinese.style.display = "none";
      english.style.display = "none";
      portuguese.style.display = "block";
      break;
  }

  // 語言頁面倒計時
  window.languageCarNum = 60;
  $("#introduction_start").text(`開始（${window.languageCarNum}）`);
  window.languageCarTimer = setInterval(() => {
    window.languageCarNum -= 1;
    $("#introduction_start").text(`開始（${window.languageCarNum}）`);
    if (window.languageCarNum <= 0) {
      again();
    }
  }, 1000);
}

function language_start() {
  pin_code = document.getElementById("pin_code");
  introduction_chinese = document.getElementById("introduction_chinese");
  introduction_chinese.style.display = "none";
  pin_code.style.display = "block";
  clearInterval(window.languageCarTimer); //清除語言頁面倒計時
}

function pin_code_start() {
  pin_code = document.getElementById("pin_code");
  hand_shodow = document.getElementById("hand_shodow");
  pin_code.style.display = "none";
  hand_shodow.style.display = "block";

  sight(); //開啟攝像頭進行手影比對
}

let model, webcam, labelContainer, maxPredictions;
let state = false; //用来关闭不管猜测的数据
let hand_shadow_name = ""; //猜測的手影名稱

// 加載圖像模型並設置網絡攝像頭
async function sight() {
  console.log(111);

  const modelURL = "./model/model.json";
  const metadataURL = "./model/metadata.json";

  model = await tmImage.load(modelURL, metadataURL); // 加載模型

  maxPredictions = model.getTotalClasses(); // 所有模型類

  webcam = new tmImage.Webcam(300, 300, true); // canvas width , canvas height, canvas 是否翻轉網絡攝像頭

  try {
    await webcam.setup(); // 請求訪問網絡攝像頭

    webcam.play(); // 開啟網絡攝像頭
    // 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。
    state = true;
    window.requestAnimationFrame(loop);

    $("#hand_shodow canvas").replaceWith(webcam.canvas); //手影視線窗口

    // 進入手影比對頁面
    window.handShodowNextNum = 60;
    $("#hand_shodow_button_nextPage").text(
      `下一頁（${window.handShodowNextNum}）`
    );
    window.handShodowNextTimer = setInterval(() => {
      window.handShodowNextNum -= 1;
      $("#hand_shodow_button_nextPage").text(
        `下一頁（${window.handShodowNextNum}）`
      );
      if (window.handShodowNextNum <= 0) {
        hand_shodow_next(); //進入拍照頁面
      }
    }, 1000);
  } catch (error) {
    alert("未開啟攝像頭，請重新開始，並允許請求攝像頭權限！");
  }
}

async function loop() {
  if (state) {
    webcam.update(); // 實時更新網絡攝像頭框架
    await predict(); // 實時更新概率
    window.requestAnimationFrame(loop); //實時更新動畫
  }
}

async function predict() {
  if (state) {
    const prediction = await model.predict(webcam.canvas); //實時類的概率

    for (let i = 0; i < maxPredictions; i++) {
      // 概率大於0.7的手影圖片，突出邊框
      if (prediction[i].probability.toFixed(2) > 0.7) {
        hand_shadow_name = prediction[i].className; //記錄猜測的手影名稱
        $(`#${hand_shadow_name}-img`).addClass("active");
      }
      for (let j = 0; j < maxPredictions; j++) {
        if (prediction[i].className !== hand_shadow_name) {
          $(`#${prediction[i].className}-img`).removeClass("active");
        }
      }

      // BigCrad Goat Kitten Owl RedBird Trukey
      $(`#${prediction[i].className}-percentage`).text(
        "相似度：" + prediction[i].probability.toFixed(1) * 100 + "%"
      );
    }
  }
}

async function hand_shodow_next() {
  clearInterval(window.handShodowNextTimer); // 清空定時器
  // 顯示拍照頁面
  // qrcode = document.getElementById('qrcode')
  // qrcode.style.display = 'block'
  // 清空內容
  // clear()
  // 開啟拍照攝像頭
  // openMedia()
  qrcode_next();
}

let isStart = false;
// 拍照
async function photograph_start() {
  webcam = new tmImage.Webcam(300, 300, false); // canvas width , canvas height, canvas 是否翻轉網絡攝像頭
  await webcam.setup();
  webcam.play(); // 開啟網絡攝像頭

  window.requestAnimationFrame(photograph_loop); //實時更新動畫
  $("#qrcode_avatar_1 canvas").replaceWith(webcam.canvas); //拍照視線窗口
}

function photograph_loop() {
  webcam.update(); // 實時更新網絡攝像頭框架
  window.requestAnimationFrame(photograph_loop); //實時更新動畫
}

// 頭像截取
function intercept() {
  qrcode_avatar = document.getElementById("qrcode_avatar");
  qrcode_avatar.appendChild(webcam.canvas);
  photograph_start(); //重新截取會保留上一時刻的東西
}

// 進入到結束頁面
function qrcode_next() {
  hand_shodow = document.getElementById("hand_shodow");
  hand_shodow.style.display = "none";
  end_card = document.getElementById("end_card");
  end_card.style.display = "block";

  createScore(); // 建立分數
  $("#showPinLabel").text(pinInput); // 顯示pin碼

  clear();
  // 結束頁面倒計時
  window.endCarNum = 10;
  $("#endButton").text(`再來！（${window.endCarNum}）`);
  window.endCarTimer = setInterval(() => {
    window.endCarNum -= 1;
    $("#endButton").text(`再來！（${window.endCarNum}）`);
    if (window.endCarNum <= 0) {
      again();
    }
  }, 1000);

  // 關掉拍照
  // closeMedia()
}

// 摄影停止
async function clear() {
  if (state) state = false; // 停止手影猜測
  // 手影比對視線窗口還原
  $("#hand_shodow canvas").replaceWith(
    '<canvas width="300" height="300"></canvas>'
  );
  // 拍照還原
  $("#video").replaceWith('<video id="video" autoplay="autoplay"></video>');
  $("#imgTag").replaceWith(
    '<img id="imgTag" src="assets/image/avatar.jpg" alt="imgTag"/>'
  );
}

let mediaStreamTrack = null; // 视频对象(全局)

// 開始攝像頭
function openMedia() {
  let constraints = {
    video: { width: 300, height: 300 },
    audio: false,
  };
  //获得video摄像头
  let video = document.getElementById("video");
  let promise = navigator.mediaDevices.getUserMedia(constraints);
  promise.then((mediaStream) => {
    mediaStreamTrack =
      typeof mediaStream.stop === "function"
        ? mediaStream
        : mediaStream.getTracks()[1];
    video.srcObject = mediaStream;
    video.play();
  });

  window.openMediaNum = 10;
  $("#qrcode_p").text(`拍照（${window.openMediaNum}）`);
  window.openMediaNumTimer = setInterval(() => {
    window.openMediaNum -= 1;
    $("#qrcode_p").text(`拍照（${window.openMediaNum}）`);
    if (window.openMediaNum <= 0) {
      //  過兩秒進入下一頁
      clearInterval(window.openMediaNumTimer);
      takePhoto();
    }
  }, 1000);
}

// 拍照
function takePhoto() {
  //获得Canvas对象
  let video = document.getElementById("video");

  // 这里的img就是得到的图片
  imgSrc(video).then((src) => {
    document.getElementById("imgTag").src = src;
  });

  // 拍照倒計時會進入結束頁面
  window.nextPageNum = 2;
  window.nextPageNumNumTimer = setInterval(() => {
    window.nextPageNum -= 1;
    if (window.nextPageNum <= 0) {
      //  過兩秒進入下一頁
      clearInterval(window.nextPageNumNumTimer);
      $("#qr_code_page").css("display", "block");
      $("#qrcode").css("display", "none");
      clear(); // 清空內容
    }
  }, 1000);
}

// 关闭摄像头
function closeMedia() {
  mediaStreamTrack.stop();
}

/**
 * 返回新的图片
 * @param {Number} cwith 画布宽度 默认500
 * @param {Number} cheight 画布高度 默认500
 */
function imgSrc(video, cwith = 100, cheight = 100) {
  return new Promise((resolve, reject) => {
    // 创建 canvas 节点并初始化
    const canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.objectFit = "cover";

    // let canvas = document.getElementById('canvas');//獲得一個節點
    // 高分辨率屏幕上清晰显示canvas图形（獲取canvas時使用）
    // canvas.width = canvas.clientWidth * window.devicePixelRatio;
    // canvas.height = canvas.clientHeight * window.devicePixelRatio;

    const context = canvas.getContext("2d");

    let bgImg = new Image();
    // Reindeer Dog Eagle
    // if (hand_shadow_name === 'Reindeer') {
    //     bgImg.src = './assets/image/transparent/pikachu1.png'
    // } else if (hand_shadow_name === 'Dog') {
    //     bgImg.src = './assets/image/transparent/dragon1.png'
    // } else if (hand_shadow_name === 'Eagle') {
    //     bgImg.src = './assets/image/transparent/tiger1.png'
    // }

    // BigCrad Goat Kitten Owl RedBird Trukey
    if (hand_shadow_name === "BigCrad") {
      bgImg.src = "./assets/image/transparent/pikachu1.png";
    } else if (hand_shadow_name === "Goat") {
      bgImg.src = "./assets/image/transparent/dragon1.png";
    } else if (hand_shadow_name === "Kitten") {
      bgImg.src = "./assets/image/transparent/donaldDuck1.png";
    } else if (hand_shadow_name === "Owl") {
      bgImg.src = "./assets/image/transparent/garfield1.png";
    } else if (hand_shadow_name === "RedBird") {
      bgImg.src = "./assets/image/transparent/pluto1.png";
    } else if (hand_shadow_name === "Trukey") {
      bgImg.src = "./assets/image/transparent/winnie1.png";
    }

    // 跨域
    bgImg.crossOrigin = "Anonymous";

    bgImg.onload = () => {
      context.drawImage(video, 0, 0, 300, 300); // 頭像放入canvas
      context.drawImage(bgImg, 0, 0, cwith, cheight);
      const src = canvas.toDataURL("image/png");
      resolve(src);
    };
  });
}

let pinKeyboardIsOpen = false; // 鍵盤開關

const pinChange = (inputValue, isReset = false) => {
  if (isReset === true) {
    pinInput = "";
  } else pinInput + inputValue;
};

const setKeyboardOpen = (bool = false) => {
  // 控制鍵盤
  if (bool) {
    pinKeyboardIsOpen = true;
    $("#pinKeyboard").removeClass("hidden");
  } else {
    pinKeyboardIsOpen = false;
    $("#pinKeyboard").addClass("hidden");
  }
};

$("#pinInput").focus(() => {
  //pin嗎輸入事件
  if (!pinKeyboardIsOpen) {
    setKeyboardOpen(true);
  }
});

$("#pinStartBtn").click(() => {
  //pin開始
  userStart();
});

$("#startDirectlyBtn").click(() => {
  //pin新身份開始
  newStart();
});

for (let index = 1; index <= 12; index++) {
  // 給小鍵盤所有按鈕賦值
  if (index === 10) {
    $(`#pinKeyboard button:nth-child(${index})`).click(() => {
      //重置事件
      $("#pinInput").val((pinInput = ""));
    });
  }
  if (index === 11) {
    $(`#pinKeyboard button:nth-child(${index})`).click(() => {
      //零數字事件
      $("#pinInput").val((pinInput += "0"));
    });
  }
  if (index === 12) {
    $(`#pinKeyboard button:nth-child(${index})`).click(() => {
      //鍵盤關閉事件
      if (pinKeyboardIsOpen) {
        setKeyboardOpen();
      }
    });
  }
  if (index !== 10 && index !== 11 && index !== 12) {
    $(`#pinKeyboard button:nth-child(${index})`).click(() => {
      //1-9數字事件
      $("#pinInput").val((pinInput += index));
    });
  }
}

const userStart = async () => {
  //pin開始事件
  // 獲取用戶
  try {
    console.log("pinInput", pinInput);
    const data = await fetch(`${HOST}/api/user/get?pin=${pinInput}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    console.log("data", data);
    if (!data || !data?.id) {
      console.log("data error ");
      $.toast({
        heading: "Error",
        text: "找不到該用戶",
        showHideTransition: "fade",
        icon: "error",
      });
    } else {
      pin_code_start(); // 找到用戶 進入遊戲
    }
  } catch (error) {
    console.log("catch error ");
    $.toast({
      heading: "Error",
      text: error.message,
      showHideTransition: "fade",
      icon: "error",
    });
    console.error(error.message);
  }
};

const newStart = async () => {
  // pin新身份開始  建立用戶
  var startDirectlyBtn = document.getElementById("startDirectlyBtn");
  startDirectlyBtn.innerText = "正在創建新用戶...";
  try {
    const user = await fetch(`${HOST}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (user.error) {
      console.log("user error ");
      throw new Error(user.error);
    } else {
      local_user = user;
      if (local_user) {
        pinInput = local_user.pin;
        console.log("user pin", pinInput);
      }

      pin_code_start(); // 進入遊戲
    }
  } catch (error) {
    console.log("catch error ");
    // 顯示在 toast
    $.toast({
      heading: "Error",
      text: error.message,
      showHideTransition: "fade",
      icon: "error",
    });
  }
};

// 建立用戶分數
const createScore = async () => {
  try {
    const body = {
      score: 100, //默認成績，可進行適度的調整
      pin: pinInput,
      itemName: "機器都識學習",
    };

    const result = await fetch(`${HOST}/api/score/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    console.log("創建的成績結果", result);

    getAllScores(); //獲得所有分數
  } catch (error) {
    console.error("發生錯誤:", error);
  }
};

const getAllScores = async () => {
  try {
    const data = await fetch(`${HOST}/api/user/all_scores?pin=${pinInput}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    console.log("pinInput", pinInput);
    console.log("所有分數", data);
    if (data.error) {
      throw new Error(data.error);
    } else {
      data.forEach((item) => {
        scoresData.push({
          id: item.id,
          itemName: item.itemName,
          score: item.score,
        });
      });

      // 基于准备好的dom，初始化echarts实例
      $("#eChartsMain").ready(() => {
        const myChart = echarts.init(document.getElementById("eChartsMain"));

        // 指定图表的配置项和数据
        const option = {
          title: {
            text: "遊戲得分圖",
          },
          radar: {
            indicator: items.map((item) => {
              return {
                name: item,
                max: 100,
              };
            }),
          },
          series: [
            {
              // name: "得分",
              type: "radar",
              data: [
                {
                  value: items.map((item) => {
                    const scores = scoresData.filter((s) => {
                      return s.itemName === item;
                    });
                    const score = _.maxBy(scores, "score");

                    return score?.score || 0;
                  }),
                  name: "各項遊戲得分得分",
                },
              ],
            },
          ],
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      });
    }
  } catch (error) {
    console.error("發生錯誤:", error);
    // 顯示在 toast
    // toast.error(error.message);
  }
};

window.alert = function (msg, callback) {
  var div = document.createElement("div");
  div.innerHTML =
    '<style type="text/css">' +
    ".nbaMask { position: fixed; z-index: 1000; top: 0; right: 0; left: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); }                                                                                                                                                                       " +
    ".nbaMaskTransparent { position: fixed; z-index: 1000; top: 0; right: 0; left: 0; bottom: 0; }                                                                                                                                                                                            " +
    ".nbaDialog { position: fixed; z-index: 5000; width: 80%; max-width: 500px; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); background-color: #fff; text-align: center; border-radius: 8px; overflow: hidden; opacity: 1; color: white; }" +
    ".nbaDialog .nbaDialogHd { padding: .2rem .27rem .08rem .27rem; }                                                                                                                                                                                                                         " +
    ".nbaDialog .nbaDialogHd .nbaDialogTitle { font-size: 28px; font-weight: 400; }                                                                                                                                                                                                           " +
    ".nbaDialog .nbaDialogBd { padding: .8rem .8rem .8rem .8rem; font-size: 25px; line-height: 1.3; word-wrap: break-word; word-break: break-all; color: #000000; }                                                                                                                                          " +
    ".nbaDialog .nbaDialogFt { position: relative; line-height: 48px; font-size: 17px; display: -webkit-box; display: -webkit-flex; display: flex; }                                                                                                                                          " +
    '.nbaDialog .nbaDialogFt:after { content: " "; position: absolute; left: 0; top: 0; right: 0; height: 1px; border-top: 1px solid #e6e6e6; color: #e6e6e6; -webkit-transform-origin: 0 0; transform-origin: 0 0; -webkit-transform: scaleY(0.5); transform: scaleY(0.5); }               ' +
    ".nbaDialog .nbaDialogBtn { display: block; -webkit-box-flex: 1; -webkit-flex: 1; flex: 1; color: #1E90FF; text-decoration: none; -webkit-tap-highlight-color: transparent; position: relative; margin-bottom: 0;  font-size: 20px; background-color:#00c0a3;color:white }                                                                       " +
    '.nbaDialog .nbaDialogBtn:after { content: " "; position: absolute; left: 0; top: 0; width: 1px; bottom: 0; border-left: 1px solid #e6e6e6; color: #e6e6e6; -webkit-transform-origin: 0 0; transform-origin: 0 0; -webkit-transform: scaleX(0.5); transform: scaleX(0.5); }             ' +
    ".nbaDialog a { text-decoration: none; -webkit-tap-highlight-color: transparent; }" +
    "</style>" +
    '<div id="dialogs2" style="display: none">' +
    '<div class="nbaMask"></div>' +
    '<div class="nbaDialog">' +
    '    <div class="nbaDialogHd">' +
    '        <strong class="nbaDialogTitle"></strong>' +
    "    </div>" +
    '    <div class="nbaDialogBd" id="dialog_msg2">弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内</div>' +
    '    <div class="nbaDialogHd">' +
    '        <strong class="nbaDialogTitle"></strong>' +
    "    </div>" +
    '    <div class="nbaDialogFt">' +
    '        <a href="javascript:;" class="nbaDialogBtn nbaDialogBtnPrimary" id="dialog_ok2">确定</a>' +
    "    </div></div></div>";
  document.body.appendChild(div);

  var dialogs2 = document.getElementById("dialogs2");
  dialogs2.style.display = "block";

  var dialog_msg2 = document.getElementById("dialog_msg2");
  dialog_msg2.innerHTML = msg;

  var dialog_ok2 = document.getElementById("dialog_ok2");
  dialog_ok2.onclick = function () {
    // dialogs2.style.display = 'none';
    // callback();
    window.location.reload();
  };
};
