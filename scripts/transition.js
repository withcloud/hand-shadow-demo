
start_button = document.getElementById('mainButton')

// 重新開始遊戲
function again() {
    $("#main").css('display', 'block');
    $("#end_card").css('display', 'none');
    clearInterval(window.endCarTimer) //清除結束頁面倒計時
    $("#pin_code").css('display', 'none');
    $("#introduction_chinese").css('display', 'none');
    $("#introduction_english").css('display', 'none');
    $("#introduction_portuguese").css('display', 'none');
    clearInterval(window.languageCarTimer) //清除語言頁面倒計時
    $("#hand_shodow").css('display', 'none');
    $("#qrcode").css('display', 'none');
    $("#qr_code_page").css('display', 'none');

    // 清空手影名稱
    hand_shadow_name = ''
}

// 選擇語言
function language_game(number) {
    chinese = document.getElementById('introduction_chinese')
    english = document.getElementById('introduction_english')
    portuguese = document.getElementById('introduction_portuguese')
    switch (parseInt(number)) {
        case 1:
            chinese.style.display = 'block'
            english.style.display = 'none'
            portuguese.style.display = 'none'
            break;
        case 2:
            chinese.style.display = 'none'
            english.style.display = 'block'
            portuguese.style.display = 'none'
            break;
        case 3:
            chinese.style.display = 'none'
            english.style.display = 'none'
            portuguese.style.display = 'block'
            break;
    }

    // 語言頁面倒計時
    window.languageCarNum = 60
    $('.introduction_start').text(`開始（${window.languageCarNum}）`)
    window.languageCarTimer = setInterval(() => {
        window.languageCarNum -= 1
        $('.introduction_start').text(`開始（${window.languageCarNum}）`)
        if (window.languageCarNum <= 0) {
            again()
        }
    }, 1000)
}


function language_start() {
    pin_code = document.getElementById('pin_code')
    pin_code.style.display = 'block'
    clearInterval(window.languageCarTimer) //清除語言頁面倒計時
}

function pin_code_start() {
    hand_shodow = document.getElementById('hand_shodow')
    hand_shodow.style.display = 'block'

    // 結束頁面倒計時
    window.handShodowNextNum = 10
    $('.hand_shodow_next').text(`下一頁（${window.handShodowNextNum}）`)
    window.handShodowNextTimer = setInterval(() => {
        window.handShodowNextNum -= 1
        $('.hand_shodow_next').text(`下一頁（${window.handShodowNextNum}）`)
        if (window.handShodowNextNum <= 0) {
            hand_shodow_next()//進入拍照頁面
        }
    }, 1000)
}

let model, webcam, labelContainer, maxPredictions;
let state = false //用来关闭不管猜测的数据
let hand_shadow_name = '' //猜測的手影名稱

// 加載圖像模型並設置網絡攝像頭
async function sight() {

    const modelURL = "./model/model.json";
    const metadataURL = "./model/metadata.json";

    model = await tmImage.load(modelURL, metadataURL); // 加載模型
    maxPredictions = model.getTotalClasses(); // 所有模型類

    webcam = new tmImage.Webcam(300, 300, false); // canvas width , canvas height, canvas 是否翻轉網絡攝像頭
    await webcam.setup(); // 請求訪問網絡攝像頭
    webcam.play();  // 開啟網絡攝像頭

    // 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。
    state = true
    window.requestAnimationFrame(loop);

    $("#hand_shodow canvas").replaceWith(webcam.canvas)//手影視線窗口
}

async function loop() {
    if (state) {
        webcam.update(); // 實時更新網絡攝像頭框架
        await predict(); // 實時更新概率
        window.requestAnimationFrame(loop);//實時更新動畫
    }
}


async function predict() {
    if (state) {
        const prediction = await model.predict(webcam.canvas); //實時類的概率

        for (let i = 0; i < maxPredictions; i++) {
            // 猜測的結果
            const classPrediction = prediction[i].className + "（" + prediction[i].probability.toFixed(2) + "）";

            // 顯示 Reindeer Dog Eagle 實時猜測值
            // if (classPrediction.includes("Reindeer")) {
            //     $("#hand_shodow p")[i].innerHTML = classPrediction
            // } else if (classPrediction.includes("Dog")) {
            //     $("#hand_shodow p")[i].innerHTML = classPrediction
            // } else if (classPrediction.includes("Eagle")) {
            //     $("#hand_shodow p")[i].innerHTML = classPrediction
            // }

            // BigCrad Goat Kitten Owl RedBird Trukey
            if (classPrediction.includes("BigCrad")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            } else if (classPrediction.includes("Goat")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            } else if (classPrediction.includes("Kitten")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            } else if (classPrediction.includes("Owl")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            } else if (classPrediction.includes("RedBird")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            } else if (classPrediction.includes("Trukey")) {
                $("#hand_shodow p")[i].innerHTML = classPrediction
            }

            // 概率大於0.85的手影圖片，突出邊框
            if (prediction[i].probability.toFixed(2) > 0.7) {
                hand_shadow_name = prediction[i].className//記錄猜測的手影名稱
                $("#hand_shodow img")[i].setAttribute("class", "active")
            } else {
                $("#hand_shodow img")[i].setAttribute("class", "")
            }
        }
    }
}

async function hand_shodow_next() {
    clearInterval(window.handShodowNextTimer) // 清空定時器
    // 顯示拍照頁面
    qrcode = document.getElementById('qrcode')
    qrcode.style.display = 'block'
    // 清空內容
    clear()
    // 開啟拍照攝像頭
    openMedia()
}

let isStart = false
// 拍照
async function photograph_start() {
    webcam = new tmImage.Webcam(300, 300, false); // canvas width , canvas height, canvas 是否翻轉網絡攝像頭
    await webcam.setup();
    webcam.play();  // 開啟網絡攝像頭

    window.requestAnimationFrame(photograph_loop);//實時更新動畫
    $("#qrcode_avatar_1 canvas").replaceWith(webcam.canvas)//拍照視線窗口
}

function photograph_loop() {
    webcam.update(); // 實時更新網絡攝像頭框架
    window.requestAnimationFrame(photograph_loop);//實時更新動畫
}

// 頭像截取
function intercept() {
    qrcode_avatar = document.getElementById('qrcode_avatar')
    qrcode_avatar.appendChild(webcam.canvas);
    photograph_start()//重新截取會保留上一時刻的東西
}

// 進入到結束頁面
function qrcode_next() {
    end_card = document.getElementById('end_card')
    end_card.style.display = 'block'
    clear()
    // 結束頁面倒計時
    window.endCarNum = 10
    $('#endButton').text(`再來！（${window.endCarNum}）`)
    window.endCarTimer = setInterval(() => {
        window.endCarNum -= 1
        $('#endButton').text(`再來！（${window.endCarNum}）`)
        if (window.endCarNum <= 0) {
            again()
        }
    }, 1000)

    // 關掉拍照
    closeMedia()

}

// 摄影停止
async function clear() {
    if (state) state = false  // 停止手影猜測
    // 手影比對視線窗口還原
    $("#hand_shodow canvas").replaceWith('<canvas width="300" height="300"></canvas>')
    // 拍照還原
    $("#video").replaceWith('<video id="video" autoplay="autoplay"></video>')
    $("#imgTag").replaceWith('<img id="imgTag" src="assets/image/avatar.jpg" alt="imgTag"/>')
}

let mediaStreamTrack = null; // 视频对象(全局)

// 開始攝像頭
function openMedia() {
    let constraints = {
        video: { width: 300, height: 300 },
        audio: true
    };
    //获得video摄像头
    let video = document.getElementById('video');
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    promise.then((mediaStream) => {
        mediaStreamTrack = typeof mediaStream.stop === 'function' ? mediaStream : mediaStream.getTracks()[1];
        video.srcObject = mediaStream;
        video.play();
    });

    window.openMediaNum = 10
    $("#qrcode_p").text(`拍照（${window.openMediaNum}）`)
    window.openMediaNumTimer = setInterval(() => {
        window.openMediaNum -= 1
        $("#qrcode_p").text(`拍照（${window.openMediaNum}）`)
        if (window.openMediaNum <= 0) {
            //  過兩秒進入下一頁
            clearInterval(window.openMediaNumTimer)
            takePhoto()
        }
    }, 1000)
}

// 拍照
function takePhoto() {
    //获得Canvas对象
    let video = document.getElementById('video');

    // 这里的img就是得到的图片
    imgSrc(video).then(src => {
        document.getElementById('imgTag').src = src;
    })

    // 拍照倒計時會進入結束頁面
    window.nextPageNum = 5
    window.nextPageNumNumTimer = setInterval(() => {
        window.nextPageNum -= 1
        if (window.nextPageNum <= 0) {
            //  過兩秒進入下一頁
            clearInterval(window.nextPageNumNumTimer)
            $("#qr_code_page").css('display', 'block');
            $("#qrcode").css('display', 'none');
            clear()// 清空內容
        }
    }, 1000)

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
        const canvas = document.createElement('canvas')
        canvas.id = 'canvas';
        canvas.width = 300;
        canvas.height = 300;
        canvas.style.objectFit = 'cover';

        // let canvas = document.getElementById('canvas');//獲得一個節點
        // 高分辨率屏幕上清晰显示canvas图形（獲取canvas時使用）
        // canvas.width = canvas.clientWidth * window.devicePixelRatio;
        // canvas.height = canvas.clientHeight * window.devicePixelRatio;

        const context = canvas.getContext('2d')

        let bgImg = new Image()
        // Reindeer Dog Eagle
        // if (hand_shadow_name === 'Reindeer') {
        //     bgImg.src = './assets/image/transparent/pikachu1.png'
        // } else if (hand_shadow_name === 'Dog') {
        //     bgImg.src = './assets/image/transparent/dragon1.png'
        // } else if (hand_shadow_name === 'Eagle') {
        //     bgImg.src = './assets/image/transparent/tiger1.png'
        // }

        // BigCrad Goat Kitten Owl RedBird Trukey
        if (hand_shadow_name === 'BigCrad') {
            bgImg.src = './assets/image/transparent/pikachu1.png'
        } else if (hand_shadow_name === 'Goat') {
            bgImg.src = './assets/image/transparent/dragon1.png'
        } else if (hand_shadow_name === 'Kitten') {
            bgImg.src = './assets/image/transparent/donaldDuck1.png'
        } else if (hand_shadow_name === 'Owl') {
            bgImg.src = './assets/image/transparent/garfield1.png'
        } else if (hand_shadow_name === 'RedBird') {
            bgImg.src = './assets/image/transparent/pluto1.png'
        } else if (hand_shadow_name === 'Trukey') {
            bgImg.src = './assets/image/transparent/winnie1.png'
        }

        // 跨域
        bgImg.crossOrigin = 'Anonymous'

        bgImg.onload = () => {
            context.drawImage(video, 0, 0, 300, 300); // 頭像放入canvas
            context.drawImage(bgImg, 0, 0, cwith, cheight)
            const src = canvas.toDataURL('image/png')
            resolve(src)
        }
    })
}

