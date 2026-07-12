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

// 2️⃣ Roboflow API 정보 입력
const ROBOFLOW_API_KEY = "rf_XizjrI5GyRWSKUt9fl7llZEz4S2";
const ROBOFLOW_MODEL = "hand-fist-computer-3b0t3";       // 👈 대시보드에 적힌 실제 프로젝트 ID

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

// 4 Roboflow REST API 방식 주소 매칭 (버전은 v2이므로 '2'가 맞습니다!)
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}/2?api_key=${ROBOFLOW_API_KEY}`;

// 모델 로드 과정이 없으니 바로 감지 시작
setInterval(startDetection, 1000);

// 5️⃣ 손 모양 인식 및 이모지/소리 출력 함수
function startDetection() {
    // 캔버스에 현재 웹캠 화면을 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스 이미지를 base64 문자열로 변환 (data:image/jpeg;base64, 부분 제거)
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    // Roboflow API로 이미지 전송
    fetch(ROBOFLOW_URL, {
        method: "POST",
        body: base64Image,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(response => response.json())
    .then(predictions => {
        if (predictions && predictions.predictions && predictions.predictions.length > 0) {
            // 가장 확률이 높은 첫 번째 인식 클래스명 가져오기
            const currentGesture = predictions.predictions[0].class;
            console.log("인식된 손 모양:", currentGesture);

            // 손 모양이 새로 바뀌었을 때만 소리와 이모지 실행
            if (currentGesture !== previousGesture) {
                if (currentGesture === "fist") {
                    soundKick.play();
                    emojiDisplay.innerText = "🤜";
                } else if (currentGesture === "Paper") {
                    soundClap.play();
                    emojiDisplay.innerText = "🖐️";
                } else if (currentGesture === "scissors") {
                    soundCowbell.play();
                    emojiDisplay.innerText = "✌️";
                }
                previousGesture = currentGesture;
            }
        }
    })
    .catch(err => {
        console.error("AI 분석 중 에러 발생:", err);
    });
}