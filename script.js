const video = document.getElementById('webcam');
const emojiDisplay = document.getElementById('emoji-display');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// 1️⃣ 오디오 파일 매칭 (상단 선언부 변수명 통일)
/*const soundKick = new Audio('sounds/kick.wav');
const soundClap = new Audio('sounds/clap.wav');
const soundCowbell = new Audio('sounds/cowbell.wav');*/
// script.js 맨 위 오디오 선언부 (7~9번째 줄 주변)
const soundKick = new Audio('kick.wav');
const soundClap = new Audio('clap.wav');
const soundCowbell = new Audio('cowbell.wav');

// 2️⃣ 팀원분이 전달해준 정확한 Roboflow API 정보 입력
const ROBOFLOW_API_KEY = "cVWcy3claSBXfTZxF3W0";
const ROBOFLOW_MODEL = "hand-fist-computer-3b0t3"; 

let previousGesture = "";
let roboflowModel;

// 3️⃣ 웹캠 켜기 권한 요청
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        video.srcObject = stream;
    })
    .catch(function(err) {
        console.error("카메라를 켤 수 없습니다:", err);
    });

// 4️⃣ Roboflow 공식 SDK 방식으로 AI 모델 로드 (CORS/401 에러 해결)
roboflow.auth({
    clientToken: ROBOFLOW_API_KEY
}).load({
    model: ROBOFLOW_MODEL,
    version: 1
}).then(function(model) {
    console.log("Roboflow AI 모델 로드 완료!");
    roboflowModel = model;
    
    // 모델 로드가 끝나면 1초(1000ms)마다 손 모양 인식 시작
    setInterval(startDetection, 1000);
});

// 5️⃣ 손 모양 인식 및 이모지/소리 출력 함수
function startDetection() {
    if (!roboflowModel) return;

    // 캠 화면 데이터를 AI 모델로 전송
    roboflowModel.detect(video).then(function(predictions) {
        if (predictions && predictions.length > 0) {
            // 가장 확률이 높은 첫 번째 인식 클래스명 가져오기
            const currentGesture = predictions[0].class;
            console.log("인식된 손 모양:", currentGesture);

            // 손 모양이 새로 바뀌었을 때만 소리와 이모지 실행
            // 손 모양이 새로 바뀌었을 때만 소리와 이모지 실행
            if (currentGesture !== previousGesture) {

                // ⭐️ 팀원분이 보내주신 이름(대소문자)과 완벽하게 일치시켰습니다!
                if (currentGesture === "fist") {
                    soundKick.play();
                    emojiDisplay.innerText = "🥁"; 
                } else if (currentGesture === "Paper") {
                    soundClap.play();
                    emojiDisplay.innerText = "👏"; 
                } else if (currentGesture === "scissors") {
                    soundCowbell.play();
                    emojiDisplay.innerText = "🔔"; 
                }
                previousGesture = currentGesture;
            }
        }
    }).catch(function(err) {
        console.error("AI 분석 중 에러 발생:", err);
    });
}