/* ==========================================
   OLYMPIA - Main Application Logic
   ========================================== */

// =========================================================================
// 👉 CẤU HÌNH API KEYS GEMINI (CỔNG CHÍNH VÀ 2 CỔNG DỰ PHÒNG)
// Bạn có thể thêm 2 API dự phòng trực tiếp vào 2 biến bên dưới (không cần qua web):
// =========================================================================
const GEMINI_API_KEY_PRIMARY = 'AQ.Ab8RN6LLOCnPT_Nyt_0MoxsMYZDGLXcrcKq8yz4HeVY4IwS7YQ'; // Cổng chính (Primary API Key)
const GEMINI_API_KEY_BACKUP_1 = ''; // 👉 THÊM API DỰ PHÒNG 1 TẠI ĐÂY (NẾU CÓ)
const GEMINI_API_KEY_BACKUP_2 = ''; // 👉 THÊM API DỰ PHÒNG 2 TẠI ĐÂY (NẾU CÓ)

// ===================== STATE =====================
const state = {
    // Multi-Port API Keys Management (Cấu hình trực tiếp trong code)
    apiKeys: {
        primary: GEMINI_API_KEY_PRIMARY,
        backup1: GEMINI_API_KEY_BACKUP_1,
        backup2: GEMINI_API_KEY_BACKUP_2
    },
    activeKeyIndex: 0, // 0 = primary, 1 = backup1, 2 = backup2

    // Non-repeating Question Bank Tracker (Requirement 5)
    askedQuestionIds: JSON.parse(localStorage.getItem('olympia_asked_question_ids') || '[]'),
    askedCnvIds: JSON.parse(localStorage.getItem('olympia_asked_cnv_ids') || '[]'),

    difficulty: localStorage.getItem('olympia_difficulty') || 'medium',
    soundEnabled: localStorage.getItem('olympia_sound') !== 'false',
    totalScore: parseInt(localStorage.getItem('olympia_total_score')) || 0,
    streak: 0,
    bestStreak: parseInt(localStorage.getItem('olympia_best_streak')) || 0,
    totalQuestions: parseInt(localStorage.getItem('olympia_total_questions')) || 0,
    totalCorrect: parseInt(localStorage.getItem('olympia_total_correct')) || 0,

    // Game state
    currentRound: null,
    roundScore: 0,
    currentQuestion: 0,
    totalRoundQuestions: 0,
    timerInterval: null,
    timeLeft: 0,
    maxTime: 0,
    questions: [],
    currentAnswer: '',
    isAnswering: false,
    roundCorrect: 0,
    roundTimes: [],
    questionStartTime: 0,

    // CNV state (VTV Olympia Format)
    cnvCurrentPuzzle: null,
    cnvKeyword: '',
    cnvLetterCount: 0,
    cnvRowStates: { 1: 'closed', 2: 'closed', 3: 'closed', 4: 'closed', center: 'closed' },
    cnvRowAttempted: { 1: false, 2: false, 3: false, 4: false, center: false },
    cnvPiecesRevealed: { 1: false, 2: false, 3: false, 4: false, center: false },
    cnvActiveRowIndex: null,
    cnvRowsCount: 0,
    cnvRowTimerInterval: null,
    cnvRowTimeLeft: 15,
    cnvBuzzerTimerInterval: null,
    cnvBuzzerTimeLeft: 15,
    cnvEliminated: false,
    cnvGuessedObstacle: false,

    // VeDich state (VTV Olympia Format: Cho phép trùng điểm + Ngôi sao hy vọng)
    vedichChoices: [],
    vedichCurrentPoints: 10,
    vedichQuestionIndex: 0,
    vedichStarUsed: false,
    vedichCurrentStar: false,

    // TuDo state
    tudoCategory: '',
};

// ===================== ELEMENTS =====================
const $ = (id) => document.getElementById(id);

const els = {
    // Modals
    settingsModal: $('settingsModal'),
    settingsBtn: $('settingsBtn'),
    closeSettings: $('closeSettings'),
    saveSettings: $('saveSettings'),
    soundToggle: $('soundToggle'),

    // App
    app: $('app'),

    // Screens
    homeScreen: $('homeScreen'),
    gameScreen: $('gameScreen'),
    resultsScreen: $('resultsScreen'),

    // Header
    totalScore: $('totalScore'),
    streakCount: $('streakCount'),
    logoBtn: $('logoBtn'),

    // Stats
    statTotalQuestions: $('statTotalQuestions'),
    statCorrect: $('statCorrect'),
    statAccuracy: $('statAccuracy'),
    statBestStreak: $('statBestStreak'),

    // Game
    gameRoundTitle: $('gameRoundTitle'),
    roundScore: $('roundScore'),
    timerContainer: $('timerContainer'),
    timerProgress: $('timerProgress'),
    timerText: $('timerText'),
    questionCounter: $('questionCounter'),
    currentQ: $('currentQ'),
    totalQ: $('totalQ'),
    questionArea: $('questionArea'),
    questionCategory: $('questionCategory'),
    questionText: $('questionText'),
    hintsContainer: $('hintsContainer'),
    packageSelector: $('packageSelector'),
    categorySelector: $('categorySelector'),
    answerArea: $('answerArea'),
    answerInput: $('answerInput'),
    submitAnswer: $('submitAnswer'),
    resultFeedback: $('resultFeedback'),
    resultIcon: $('resultIcon'),
    resultMessage: $('resultMessage'),
    resultAnswer: $('resultAnswer'),
    resultExplanation: $('resultExplanation'),
    nextQuestion: $('nextQuestion'),
    loadingOverlay: $('loadingOverlay'),
    backBtn: $('backBtn'),

    // Results
    resultsIcon: $('resultsIcon'),
    resultsTitle: $('resultsTitle'),
    resultsProgress: $('resultsProgress'),
    resultsScoreValue: $('resultsScoreValue'),
    resultsCorrect: $('resultsCorrect'),
    resultsAccuracy: $('resultsAccuracy'),
    resultsAvgTime: $('resultsAvgTime'),
    playAgainBtn: $('playAgainBtn'),
    goHomeBtn: $('goHomeBtn'),

    // Difficulty buttons
    diffEasy: $('diffEasy'),
    diffMedium: $('diffMedium'),
    diffHard: $('diffHard'),

    // Package buttons
    pkg10: $('pkg10'),
    pkg20: $('pkg20'),
    pkg30: $('pkg30'),

    // CNV Elements (VTV Format)
    cnvScreenArea: $('cnvScreenArea'),
    cnvLetterCount: $('cnvLetterCount'),
    cnvKeywordBoxes: $('cnvKeywordBoxes'),
    cnvCurrentBuzzerPoints: $('cnvCurrentBuzzerPoints'),
    cnvBuzzerBtn: $('cnvBuzzerBtn'),
    cnvImageFrame: $('cnvImageFrame'),
    cnvImage: $('cnvImage'),
    cnvCaptionBox: $('cnvCaptionBox'),
    cnvCaptionText: $('cnvCaptionText'),
    cnvRowsCard: $('cnvRowsCard'),
    cnvRowsList: $('cnvRowsList'),
    cnvActiveCard: $('cnvActiveCard'),
    cnvActiveBadge: $('cnvActiveBadge'),
    cnvActiveLength: $('cnvActiveLength'),
    cnvRowTimerProgress: $('cnvRowTimerProgress'),
    cnvRowTimerNum: $('cnvRowTimerNum'),
    cnvActiveQuestion: $('cnvActiveQuestion'),
    cnvActiveForm: $('cnvActiveForm'),
    cnvRowInput: $('cnvRowInput'),
    cnvRowSubmitBtn: $('cnvRowSubmitBtn'),
    cnvRowFeedback: $('cnvRowFeedback'),
    cnvRowFbIcon: $('cnvRowFbIcon'),
    cnvRowFbText: $('cnvRowFbText'),
    cnvRowFbAns: $('cnvRowFbAns'),
    cnvRowContinueBtn: $('cnvRowContinueBtn'),
    cnvPiece1: $('cnvPiece1'),
    cnvPiece2: $('cnvPiece2'),
    cnvPiece3: $('cnvPiece3'),
    cnvPiece4: $('cnvPiece4'),
    cnvPieceCenter: $('cnvPieceCenter'),

    // Buzzer Modal
    cnvBuzzerModal: $('cnvBuzzerModal'),
    buzzerTimerText: $('buzzerTimerText'),
    buzzerPotentialPointsText: $('buzzerPotentialPointsText'),
    cnvBuzzerInput: $('cnvBuzzerInput'),
    cnvConfirmBuzzerBtn: $('cnvConfirmBuzzerBtn'),
    cnvCancelBuzzerBtn: $('cnvCancelBuzzerBtn'),

    // Outcome Modal
    cnvOutcomeModal: $('cnvOutcomeModal'),
    cnvOutcomeIcon: $('cnvOutcomeIcon'),
    cnvOutcomeTitle: $('cnvOutcomeTitle'),
    cnvOutcomePoints: $('cnvOutcomePoints'),
    cnvOutcomeKeyword: $('cnvOutcomeKeyword'),
    cnvOutcomeExplanation: $('cnvOutcomeExplanation'),
    cnvOutcomeNextBtn: $('cnvOutcomeNextBtn'),

    // Reset Score Modal
    resetModal: $('resetModal'),
    headerResetBtn: $('headerResetBtn'),
    settingsResetBtn: $('settingsResetBtn'),
    closeResetModal: $('closeResetModal'),
    cancelResetModalBtn: $('cancelResetModalBtn'),
    resetScoreOnlyBtn: $('resetScoreOnlyBtn'),
    resetAllStatsBtn: $('resetAllStatsBtn'),

    // Gatekeeper Verification Elements
    gatekeeperScreen: $('gatekeeperScreen'),
    gatekeeperYes: $('gatekeeperYes'),
    gatekeeperNo: $('gatekeeperNo'),
    gatekeeperFeedback: $('gatekeeperFeedback'),
    gatekeeperFbIcon: $('gatekeeperFbIcon'),
    gatekeeperFbText: $('gatekeeperFbText'),

    // VeDich & Hope Star Elements
    packageSelectorTitle: $('packageSelectorTitle'),
    hopeStarContainer: $('hopeStarContainer'),
    hopeStarBtn: $('hopeStarBtn'),
    hopeStarBadge: $('hopeStarBadge'),

    // Settings Bank Elements
    settingsAskedQCount: $('settingsAskedQCount'),
    settingsAskedCnvCount: $('settingsAskedCnvCount'),
    resetBankHistoryBtn: $('resetBankHistoryBtn'),

    // Home Badges
    homeBankCount: $('homeBankCount'),
    homeCnvCount: $('homeCnvCount'),
    homeApiStatusText: $('homeApiStatusText'),
    apiStatusPill: $('apiStatusPill'),
};

// ===================== PARTICLES =====================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() * 60 + 220; // blue-purple range
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }

    animate();
}

// ===================== SOUND EFFECTS =====================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
    if (!state.soundEnabled) return;
    if (!audioCtx) audioCtx = new AudioContext();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'correct':
            osc.frequency.setValueAtTime(523, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.4);
            break;
        case 'incorrect':
            osc.frequency.setValueAtTime(330, audioCtx.currentTime);
            osc.frequency.setValueAtTime(262, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
            break;
        case 'tick':
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.05);
            break;
        case 'start':
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.2);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.5);
            break;
        case 'timeup':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.6);
            break;
        case 'bell':
            // Olympia Buzzer Double Chime
            const t0 = audioCtx.currentTime;
            [880, 1174, 1760].forEach((freq, idx) => {
                const bOsc = audioCtx.createOscillator();
                const bGain = audioCtx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(freq, t0);
                bGain.gain.setValueAtTime(0.2 / (idx + 1), t0);
                bGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);
                bOsc.connect(bGain);
                bGain.connect(audioCtx.destination);
                bOsc.start(t0);
                bOsc.stop(t0 + 1.2);
            });
            // Secondary rapid ping
            [1046, 1567].forEach((freq) => {
                const bOsc2 = audioCtx.createOscillator();
                const bGain2 = audioCtx.createGain();
                bOsc2.type = 'sine';
                bOsc2.frequency.setValueAtTime(freq, t0 + 0.12);
                bGain2.gain.setValueAtTime(0.2, t0 + 0.12);
                bGain2.gain.exponentialRampToValueAtTime(0.001, t0 + 1.0);
                bOsc2.connect(bGain2);
                bGain2.connect(audioCtx.destination);
                bOsc2.start(t0 + 0.12);
                bOsc2.stop(t0 + 1.0);
            });
            break;
        case 'victory':
            // Grand Victory Fanfare
            const vt = audioCtx.currentTime;
            const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            chords.forEach((freq, i) => {
                const vOsc = audioCtx.createOscillator();
                const vGain = audioCtx.createGain();
                vOsc.type = 'triangle';
                vOsc.frequency.setValueAtTime(freq, vt + i * 0.1);
                vGain.gain.setValueAtTime(0.18, vt + i * 0.1);
                vGain.gain.exponentialRampToValueAtTime(0.001, vt + i * 0.1 + 0.8);
                vOsc.connect(vGain);
                vGain.connect(audioCtx.destination);
                vOsc.start(vt + i * 0.1);
                vOsc.stop(vt + i * 0.1 + 0.8);
            });
            break;
        case 'flip':
            // Flip piece or letter
            const ft = audioCtx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ft);
            osc.frequency.exponentialRampToValueAtTime(1200, ft + 0.12);
            gain.gain.setValueAtTime(0.1, ft);
            gain.gain.exponentialRampToValueAtTime(0.001, ft + 0.15);
            osc.start(ft);
            osc.stop(ft + 0.15);
            break;
    }
}

// ===================== TOAST NOTIFICATION =====================
function showToast(message, duration = 4000) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===================== OLYMPIA BACKUP QUESTIONS =====================
const OLYMPIA_BACKUP_QUESTIONS = {
    khoidong: [
        { category: 'Vật lý', question: 'Đơn vị đo cường độ dòng điện trong hệ đo lường quốc tế SI là gì?', answer: 'Ampe', explanation: 'Ampe (ký hiệu A) là đơn vị đo cường độ dòng điện trong hệ SI.' },
        { category: 'Toán học', question: 'Số nguyên tố chẵn duy nhất là số nào?', answer: '2', explanation: 'Số 2 là số nguyên tố chẵn duy nhất.' },
        { category: 'Hóa học', question: 'Kim loại nào có nhiệt độ nóng chảy cao nhất, thường dùng làm dây tóc bóng đèn?', answer: 'Vonfram', explanation: 'Vonfram (Tungsten - W) có nhiệt độ nóng chảy lên tới khoảng 3422°C.' },
        { category: 'Sinh học', question: 'Bào quan nào được ví như "nhà máy năng lượng" của tế bào?', answer: 'Ti thể', explanation: 'Ti thể là nơi diễn ra hô hấp tế bào và tổng hợp ATP.' },
        { category: 'Lịch sử', question: 'Chiến thắng Bạch Đằng năm 938 do vị anh hùng dân tộc nào lãnh đạo?', answer: 'Ngô Quyền', explanation: 'Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng năm 938, mở ra kỷ nguyên độc lập.' },
        { category: 'Địa lý', question: 'Đỉnh núi nào được mệnh danh là "nóc nhà của Đông Dương"?', answer: 'Fansipan', explanation: 'Fansipan cao 3.143m, thuộc dãy Hoàng Liên Sơn, là đỉnh núi cao nhất Đông Dương.' },
        { category: 'Văn học', question: 'Nhà thơ nào được mệnh danh là "Thi tiên" trong nền thơ ca cổ điển Trung Quốc?', answer: 'Lý Bạch', explanation: 'Lý Bạch là nhà thơ thời Đường, được tôn là Thi tiên.' },
        { category: 'Tiếng Anh', question: 'Từ nào trong tiếng Anh có nghĩa là "môi trường"?', answer: 'Environment', explanation: 'Environment là môi trường trong tiếng Anh.' },
        { category: 'Thiên văn', question: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?', answer: 'Sao Thủy', explanation: 'Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất.' },
        { category: 'Tin học', question: '1 Byte bằng bao nhiêu Bit?', answer: '8', explanation: '1 Byte tương đương với 8 Bit.' },
        { category: 'Âm nhạc', question: 'Ai là tác giả của bài hát "Tiến quân ca" - Quốc ca nước CHXHCN Việt Nam?', answer: 'Văn Cao', explanation: 'Nhạc sĩ Văn Cao sáng tác ca khúc Tiến quân ca năm 1944.' },
        { category: 'Thể thao', question: 'Giải vô địch bóng đá thế giới World Cup lần đầu tiên năm 1930 được tổ chức ở quốc gia nào?', answer: 'Uruguay', explanation: 'Uruguay là nước chủ nhà và cũng là nhà vô địch World Cup đầu tiên.' },
        { category: 'Hóa học', question: 'Khí nào chiếm tỉ lệ thể tích lớn nhất trong không khí quyển của Trái Đất?', answer: 'Nito', explanation: 'Khí Nitơ chiếm khoảng 78% thể tích không khí quyển.' },
        { category: 'Địa lý', question: 'Tỉnh nào có diện tích lớn nhất Việt Nam hiện nay?', answer: 'Nghệ An', explanation: 'Nghệ An có diện tích lớn nhất nước ta với hơn 16.490 km².' },
        { category: 'Toán học', question: 'Định lý nổi tiếng nào phát biểu về bình phương cạnh huyền trong tam giác vuông?', answer: 'Pytago', explanation: 'Định lý Pytago: Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông.' },
        { category: 'Lịch sử', question: 'Bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa được đọc vào năm nào?', answer: '1945', explanation: 'Bác Hồ đọc Tuyên ngôn Độc lập vào ngày 2/9/1945 tại Quảng trường Ba Đình.' }
    ],
    cnv: [
        {
            keyword: 'HOÀNG SA',
            hints: [
                'Đây là một quần đảo thuộc chủ quyền thiêng liêng của Việt Nam trên Biển Đông.',
                'Thuộc sự quản lý hành chính của thành phố Đà Nẵng.',
                'Đội dân binh do triều Nguyễn lập ra để đo đạc và cắm mốc chủ quyền mang tên này.',
                'Từ ghép gồm màu sắc của cát và chữ chỉ bờ cát trải dài.'
            ],
            explanation: 'Quần đảo Hoàng Sa là huyện đảo thuộc thành phố Đà Nẵng, một phần máu thịt không thể tách rời của Tổ quốc Việt Nam.'
        },
        {
            keyword: 'SÔNG BẠCH ĐẰNG',
            hints: [
                'Dòng sông lịch sử gắn liền với 3 chiến thắng oanh liệt chống giặc ngoại xâm phương Bắc.',
                'Chiến thuật cọc ngầm bịt sắt cắm dưới lòng sông độc đáo.',
                'Gắn liền với tên tuổi của Ngô Quyền, Lê Hoàn và Trần Hưng Đạo.',
                'Con sông chảy qua địa phận Quảng Ninh và Hải Phòng.'
            ],
            explanation: 'Sông Bạch Đằng là chứng nhân hào hùng của dân tộc với các chiến thắng năm 938, 981 và 1288.'
        },
        {
            keyword: 'TRUYỆN KIỀU',
            hints: [
                'Tác phẩm kiệt tác văn học được viết bằng chữ Nôm theo thể thơ lục bát.',
                'Tác giả là Đại thi hào dân tộc được UNESCO vinh danh là Danh nhân văn hóa thế giới.',
                'Gồm 3254 câu thơ tái hiện số phận chìm nổi 15 năm của nàng Thúy Kiều.',
                'Tên chữ Hán nguyên gốc là "Đoạn trường tân thanh".'
            ],
            explanation: 'Truyện Kiều của Đại thi hào Nguyễn Du là đỉnh cao của nền thi ca và văn học cổ điển Việt Nam.'
        }
    ],
    tangtoc: [
        {
            category: 'Tư duy logic',
            question: 'Sắp xếp các đơn vị thời gian sau theo thứ tự từ nhỏ đến lớn: Thế kỷ, Thiên niên kỷ, Thập kỷ, Năm.',
            description: 'Hãy điền thứ tự cách nhau bằng dấu phẩy',
            answer: 'Năm, Thập kỷ, Thế kỷ, Thiên niên kỷ',
            explanation: 'Năm (1) < Thập kỷ (10) < Thế kỷ (100) < Thiên niên kỷ (1000).'
        },
        {
            category: 'Khoa học',
            question: 'Hiện tượng nào giải thích việc que đũa dường như bị gãy khúc khi cắm vào cốc nước trong suốt?',
            description: 'Hiện tượng quang học phổ biến',
            answer: 'Khúc xạ ánh sáng',
            explanation: 'Ánh sáng truyền từ nước sang không khí bị đổi hướng tại mặt phân cách gọi là khúc xạ ánh sáng.'
        },
        {
            category: 'Địa lý',
            question: 'Dãy núi nào là ranh giới tự nhiên giữa hai châu lục Á và Âu?',
            description: 'Dãy núi dài nổi tiếng tại Nga',
            answer: 'Ural',
            explanation: 'Dãy núi Ural là ranh giới phân định châu Á và châu Âu.'
        },
        {
            category: 'Lịch sử',
            question: 'Chiến dịch nào đã kết thúc thắng lợi cuộc kháng chiến chống Mỹ cứu nước vào năm 1975?',
            description: 'Chiến dịch mang tên vị cha già kính yêu của dân tộc',
            answer: 'Hồ Chí Minh',
            explanation: 'Chiến dịch Hồ Chí Minh lịch sử mùa xuân năm 1975 giải phóng hoàn toàn miền Nam, thống nhất đất nước.'
        }
    ],
    vedich: {
        10: [
            { category: 'Hóa học', question: 'Khí CO2 thường được nén ở thể rắn được gọi phổ biến là gì?', answer: 'Băng khô', explanation: 'Băng khô (đá khô) là CO2 ở thể rắn, thăng hoa ở -78.5°C.' },
            { category: 'Toán học', question: 'Hình đa diện đều có 6 mặt đều là hình vuông là hình gì?', answer: 'Hình lập phương', explanation: 'Hình lập phương là khối đa diện đều loại {4,3}.' }
        ],
        20: [
            { category: 'Vật lý', question: 'Tốc độ của ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?', answer: '300000', explanation: 'Vận tốc ánh sáng trong chân không xấp xỉ 300.000 km/s (chính xác là 299.792.458 m/s).' },
            { category: 'Lịch sử', question: 'Thành Cổ Loa thời Âu Lạc được xây dựng dưới triều đại của vị vua nào?', answer: 'An Dương Vương', explanation: 'An Dương Vương (Thục Phán) cho xây dựng thành Cổ Loa làm kinh đô nước Âu Lạc.' }
        ],
        30: [
            { category: 'Sinh học', question: 'Ai là người đặt nền móng cho di truyền học hiện đại với các thí nghiệm trên cây đậu Hà Lan?', answer: 'Mendel', explanation: 'Gregor Mendel phát hiện ra các quy luật di truyền cơ bản thông qua lai đậu Hà Lan.' },
            { category: 'Địa lý', question: 'Hồ nước ngọt sâu nhất và có thể tích nước ngọt lớn nhất thế giới là hồ nào?', answer: 'Baikal', explanation: 'Hồ Baikal ở Nga là hồ nước ngọt sâu nhất thế giới với độ sâu cực đại 1.642m.' }
        ]
    },
    tudo: {
        toan: { category: 'Toán học', question: 'Đạo hàm của hàm số y = sin(x) là gì?', answer: 'cos(x)', explanation: '(sin x)\' = cos x.' },
        ly: { category: 'Vật lý', question: 'Hiện tượng nào làm cho các vật có khối lượng hút nhau trong vũ trụ?', answer: 'Vạn vật hấp dẫn', explanation: 'Định luật vạn vật hấp dẫn do Isaac Newton tìm ra.' },
        hoa: { category: 'Hóa học', question: 'Công thức hóa học của nước vôi trong là gì?', answer: 'Ca(OH)2', explanation: 'Nước vôi trong là dung dịch canxi hidroxit Ca(OH)2.' },
        sinh: { category: 'Sinh học', question: 'Sắc tố nào giúp lá cây có màu xanh lục và thực hiện quang hợp?', answer: 'Diệp lục', explanation: 'Chất diệp lục (chlorophyll) hấp thụ năng lượng ánh sáng mặt trời.' },
        su: { category: 'Lịch sử', question: 'Ai là nữ tướng đầu tiên của Quân đội Nhân dân Việt Nam?', answer: 'Nguyễn Thị Định', explanation: 'Bà Nguyễn Thị Định được phong quân hàm Thiếu tướng năm 1974.' },
        dia: { category: 'Địa lý', question: 'Eo biển nào nối liền biển Baltic và biển Bắc, hoặc eo biển Malacca nối Ấn Độ Dương và Thái Bình Dương?', answer: 'Malacca', explanation: 'Eo biển Malacca là một trong những tuyến hàng hải nhộn nhịp nhất thế giới.' },
        van: { category: 'Văn học', question: 'Ai là tác giả của tác phẩm "Tắt đèn" tố cáo xã hội thực dân nửa phong kiến?', answer: 'Ngô Tất Tố', explanation: 'Ngô Tất Tố xuất bản tiểu thuyết Tắt đèn năm 1939 với nhân vật chị Dậu.' },
        anh: { category: 'Tiếng Anh', question: 'Từ đồng nghĩa với "fast" bắt đầu bằng chữ Q là gì?', answer: 'Quick', explanation: 'Quick có nghĩa là nhanh nhẹn.' },
        tin: { category: 'Tin học', question: 'Giao thức bảo mật truyền tải siêu văn bản bắt đầu bằng chữ https viết tắt của từ gì cho chữ S?', answer: 'Secure', explanation: 'Hypertext Transfer Protocol Secure.' },
        tongquat: { category: 'Tổng hợp', question: 'Huy hiệu Đội Thiếu niên Tiền phong Hồ Chí Minh có hình ảnh gì ở chính giữa?', answer: 'Búp măng', explanation: 'Hình ảnh búp măng non tượng trưng cho thế hệ thiếu niên, mầm non tương lai.' }
    }
};

function getBackupKhoiDong() {
    const list = [...OLYMPIA_BACKUP_QUESTIONS.khoidong].sort(() => Math.random() - 0.5);
    return list.slice(0, 12);
}

// ===================== QUESTION BANK ROTATION & UI HELPERS =====================
function saveAskedQuestions() {
    localStorage.setItem('olympia_asked_question_ids', JSON.stringify(state.askedQuestionIds));
}

function saveAskedCnv() {
    localStorage.setItem('olympia_asked_cnv_ids', JSON.stringify(state.askedCnvIds));
}

function updateBankProgressUI() {
    const totalQ = (typeof BOCAUHOI_DATA !== 'undefined' && BOCAUHOI_DATA.questions) ? BOCAUHOI_DATA.questions.length : 120;
    const askedQ = state.askedQuestionIds.length;
    const totalCnv = (typeof OLYMPIA_CNV_BANK !== 'undefined') ? OLYMPIA_CNV_BANK.length : 10;
    const askedCnv = state.askedCnvIds.length;

    if (els.homeBankCount) els.homeBankCount.textContent = `${askedQ}/${totalQ}`;
    if (els.homeCnvCount) els.homeCnvCount.textContent = `${askedCnv}/${totalCnv}`;
    if (els.settingsAskedQCount) els.settingsAskedQCount.textContent = `${askedQ} / ${totalQ} câu`;
    if (els.settingsAskedCnvCount) els.settingsAskedCnvCount.textContent = `${askedCnv} / ${totalCnv} bộ`;
}

function resetBankHistory() {
    state.askedQuestionIds = [];
    state.askedCnvIds = [];
    saveAskedQuestions();
    saveAskedCnv();
    updateBankProgressUI();
    showToast('🔄 Đã đặt lại lịch sử câu hỏi! Ngân hàng câu hỏi sẽ bắt đầu lại từ đầu ✨', 4000);
}

function updateApiStatusUI() {
    const keyConfigs = [
        { name: 'Cổng chính', key: state.apiKeys.primary, el: els.portStatus1 },
        { name: 'Cổng dự phòng 1', key: state.apiKeys.backup1, el: els.portStatus2 },
        { name: 'Cổng dự phòng 2', key: state.apiKeys.backup2, el: els.portStatus3 }
    ];

    keyConfigs.forEach((cfg, idx) => {
        if (!cfg.el) return;
        if (!cfg.key || !cfg.key.trim()) {
            cfg.el.textContent = '⚪ Chưa cấu hình';
            cfg.el.className = 'port-status standby';
        } else if (idx === state.activeKeyIndex) {
            cfg.el.textContent = '🟢 Đang dùng';
            cfg.el.className = 'port-status active';
        } else {
            cfg.el.textContent = '🟡 Sẵn sàng';
            cfg.el.className = 'port-status standby';
        }
    });

    if (els.homeApiStatusText) {
        const activeName = keyConfigs[state.activeKeyIndex]?.name || 'Cổng chính';
        const hasBackup = (state.apiKeys.backup1 && state.apiKeys.backup1.trim()) || (state.apiKeys.backup2 && state.apiKeys.backup2.trim());
        els.homeApiStatusText.textContent = `Cổng API: ${activeName} (${hasBackup ? 'Có dự phòng tự động' : 'Chưa có dự phòng'})`;
    }
}

// ===================== 10-IMAGE CNV PUZZLE SELECTION & ROTATION =====================
function getCNVPuzzleFromBank() {
    if (typeof OLYMPIA_CNV_BANK === 'undefined' || !Array.isArray(OLYMPIA_CNV_BANK) || OLYMPIA_CNV_BANK.length === 0) {
        return getBackupCNV();
    }

    // Filter out already played CNV puzzles among the 10 Vietnamese heritage images
    let available = OLYMPIA_CNV_BANK.filter(p => !state.askedCnvIds.includes(p.id));

    // If all 10 have been played, cycle around from the beginning!
    if (available.length === 0) {
        showToast('🔄 Đã chinh phục đủ 10/10 bộ Chướng Ngại Vật! Tự động xoay vòng lại từ đầu ✨', 3500);
        state.askedCnvIds = [];
        saveAskedCnv();
        available = [...OLYMPIA_CNV_BANK];
    }

    // Pick an unasked puzzle
    const chosen = available[Math.floor(Math.random() * available.length)];
    if (!state.askedCnvIds.includes(chosen.id)) {
        state.askedCnvIds.push(chosen.id);
    }
    saveAskedCnv();
    updateBankProgressUI();

    return JSON.parse(JSON.stringify(chosen));
}

function getBackupCNV() {
    if (typeof OLYMPIA_CNV_BANK !== 'undefined' && Array.isArray(OLYMPIA_CNV_BANK) && OLYMPIA_CNV_BANK.length > 0) {
        return getCNVPuzzleFromBank();
    }
    const list = OLYMPIA_BACKUP_QUESTIONS.cnv;
    return list[Math.floor(Math.random() * list.length)];
}

function getBackupTangToc() {
    const list = [...OLYMPIA_BACKUP_QUESTIONS.tangtoc].sort(() => Math.random() - 0.5);
    return list.slice(0, 4);
}

function getBackupVeDich(points) {
    const list = OLYMPIA_BACKUP_QUESTIONS.vedich[points] || OLYMPIA_BACKUP_QUESTIONS.vedich[10];
    return list[Math.floor(Math.random() * list.length)];
}

function getBackupTuDo(category) {
    return OLYMPIA_BACKUP_QUESTIONS.tudo[category] || OLYMPIA_BACKUP_QUESTIONS.tudo.tongquat;
}

// ===================== GEMINI API (MULTI-PORT FAILOVER) =====================
const CANDIDATE_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash-8b'
];

async function callGeminiAPI(prompt, isJson = true) {
    const keyConfigs = [
        { name: 'Cổng chính', key: state.apiKeys.primary, idx: 0 },
        { name: 'Cổng dự phòng 1', key: state.apiKeys.backup1, idx: 1 },
        { name: 'Cổng dự phòng 2', key: state.apiKeys.backup2, idx: 2 }
    ].filter(cfg => cfg.key && cfg.key.trim().length > 0);

    if (keyConfigs.length === 0) {
        throw new Error('Chưa cấu hình API Key.');
    }

    let lastError = null;
    const startIdx = state.activeKeyIndex % keyConfigs.length;

    for (let k = 0; k < keyConfigs.length; k++) {
        const keyCfg = keyConfigs[(startIdx + k) % keyConfigs.length];
        const activeKey = keyCfg.key.trim();

        for (const model of CANDIDATE_MODELS) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

                const generationConfig = {
                    temperature: 0.7,
                    maxOutputTokens: 8192
                };

                if (model.includes('2.5')) {
                    generationConfig.thinkingConfig = {
                        thinkingBudget: 0
                    };
                }

                if (isJson) {
                    generationConfig.responseMimeType = "application/json";
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                        state.activeKeyIndex = keyCfg.idx;
                        updateApiStatusUI();
                        return text;
                    }
                }

                const errData = await response.json().catch(() => ({}));
                const status = response.status;
                const msg = errData?.error?.message || `API Error ${status}`;
                console.warn(`[${keyCfg.name}] Model ${model} returned error: ${msg}`);

                // Token exhausted / Quota / Rate limit (429 or 403)
                const isTokenExhausted = status === 429 || status === 403 ||
                    msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('limit') || msg.includes('API_KEY_INVALID');

                if (isTokenExhausted && keyConfigs.length > 1 && k < keyConfigs.length - 1) {
                    const nextCfg = keyConfigs[(startIdx + k + 1) % keyConfigs.length];
                    showToast(`⚡ ${keyCfg.name} hết token! Đã tự động kích hoạt ${nextCfg.name} 🚀`, 4000);
                    state.activeKeyIndex = nextCfg.idx;
                    updateApiStatusUI();
                    break; // Switch immediately to the next API key!
                }
                lastError = new Error(msg);
            } catch (err) {
                console.warn(`[${keyCfg.name}] Network/fetch error on ${model}:`, err.message);
                lastError = err;
            }
        }
    }

    throw lastError || new Error('Không thể kết nối đến AI qua bất kỳ cổng API nào.');
}

function getDifficultyText() {
    const map = {
        easy: 'dễ (dành cho học sinh lớp 10)',
        medium: 'trung bình (dành cho học sinh lớp 11-12)',
        hard: 'khó (dành cho thí sinh giỏi, đã đạt giải)'
    };
    return map[state.difficulty] || map.medium;
}

function getRandomTopics() {
    const topics = [
        'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử Việt Nam',
        'Lịch sử thế giới', 'Địa lý Việt Nam', 'Địa lý thế giới',
        'Văn học Việt Nam', 'Văn học thế giới', 'Tiếng Anh', 'Tin học',
        'Âm nhạc', 'Thể thao', 'Khoa học tự nhiên', 'Kiến thức xã hội',
        'Thiên văn học', 'Nghệ thuật', 'Công nghệ', 'Kinh tế',
        'Triết học', 'Luật pháp', 'Danh nhân', 'Phát minh sáng chế'
    ];
    const shuffled = topics.sort(() => Math.random() - 0.5);
    return shuffled;
}

function getCategoryName(cat) {
    const map = {
        toan: 'Toán học', ly: 'Vật lý', hoa: 'Hóa học', sinh: 'Sinh học',
        su: 'Lịch sử', dia: 'Địa lý', van: 'Văn học', anh: 'Tiếng Anh',
        tin: 'Tin học', tongquat: 'Kiến thức tổng quát'
    };
    return map[cat] || 'Tổng hợp';
}

// ===================== BỘ CÂU HỎI MẪU (BOCAUHOI) - KHÔNG LẶP LẠI (REQUIREMENT 5) =====================
function getBocauhoiQuestions(count, filterFn = null) {
    if (typeof BOCAUHOI_DATA === 'undefined' || !BOCAUHOI_DATA.questions || !BOCAUHOI_DATA.questions.length) {
        return [];
    }
    let pool = BOCAUHOI_DATA.questions;
    if (filterFn) {
        const filtered = pool.filter(filterFn);
        if (filtered.length > 0) pool = filtered;
    }

    // Filter out questions that have already been asked
    let available = pool.filter(q => !state.askedQuestionIds.includes(q.id));

    // When available questions are exhausted, cycle around from the beginning!
    if (available.length < count) {
        showToast('🔄 Đã làm hết ngân hàng câu hỏi! Đang tự động xoay vòng lại từ đầu ✨', 3500);
        const poolIds = new Set(pool.map(q => q.id));
        state.askedQuestionIds = state.askedQuestionIds.filter(id => !poolIds.has(id));
        saveAskedQuestions();
        available = [...pool];
    }

    // Shuffle and pick requested count
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Record selected questions as asked
    selected.forEach(q => {
        if (!state.askedQuestionIds.includes(q.id)) {
            state.askedQuestionIds.push(q.id);
        }
    });
    saveAskedQuestions();
    updateBankProgressUI();

    return selected.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        answer: q.answer,
        explanation: `Đáp án: ${q.answer} (${q.points} điểm - Mức độ: ${q.difficulty})`,
        source: 'bocauhoi'
    }));
}

// ===================== GENERATE QUESTIONS (>= 70% API + <= 30% BOCAUHOI) =====================
async function generateKhoiDongQuestions() {
    // Tỷ lệ: 9 câu từ API (75%) + 3 câu từ bộ mẫu (25%) -> Đảm bảo API >= 70%
    const aiCount = 9;
    const bocauhoiCount = 3;

    const topics = getRandomTopics();
    const topicList = topics.slice(0, aiCount).join(', ');
    const prompt = `Bạn là quản trò cuộc thi "Đường lên đỉnh Olympia" trên VTV. Hãy tạo ${aiCount} câu hỏi cho vòng KHỞI ĐỘNG.

YÊU CẦU:
- Mức độ: ${getDifficultyText()}
- Đa dạng chủ đề: ${topicList}
- Mỗi câu hỏi ngắn gọn, rõ ràng, có 1 đáp án chính xác duy nhất
- Câu trả lời phải ngắn (1-5 từ)
- Giống phong cách câu hỏi Olympia thực tế trên VTV
- KHÔNG sử dụng câu hỏi trắc nghiệm, chỉ dùng câu hỏi tự luận ngắn

Trả về đúng định dạng JSON sau:
[
  {
    "category": "Tên lĩnh vực",
    "question": "Nội dung câu hỏi",
    "answer": "Đáp án chính xác",
    "explanation": "Giải thích ngắn gọn (1-2 câu)"
  }
]`;

    let aiQuestions = [];
    try {
        const text = await callGeminiAPI(prompt);
        aiQuestions = parseJSONResponse(text);
        if (!Array.isArray(aiQuestions)) aiQuestions = [];
    } catch (err) {
        console.warn('AI generateKhoiDongQuestions failed, using backup:', err);
    }

    const sampleQuestions = getBocauhoiQuestions(bocauhoiCount);

    if (aiQuestions.length > 0) {
        // Trộn 9 câu AI + 3 câu mẫu ngẫu nhiên
        const combined = [...aiQuestions, ...sampleQuestions];
        return combined.sort(() => Math.random() - 0.5);
    }

    // Nếu AI không phản hồi, fallback sang 12 câu từ bộ mẫu
    showToast('💡 Đang dùng bộ 120 câu hỏi Olympia chuẩn (do AI tạm bận)');
    return getBocauhoiQuestions(12);
}

async function generateCNVPuzzle() {
    const prompt = `Bạn là quản trò cuộc thi "Đường lên đỉnh Olympia" trên VTV. Hãy tạo 1 bộ câu hỏi hoàn chỉnh cho vòng VƯỢT CHƯỚNG NGẠI VẬT theo đúng thể lệ VTV:
YÊU CẦU:
- Có 1 TỪ KHÓA BÍ MẬT (tên danh lam, di sản, nhân vật lịch sử hoặc văn hóa Việt Nam).
- Có đúng 4 HÀNG NGANG (1, 2, 3, 4) và 1 Ô TRUNG TÂM.
- Mỗi hàng ngang và ô trung tâm có câu hỏi và đáp án ngắn gọn (từ ngữ liên quan trực tiếp đến từ khóa).
- Trả về đúng định dạng JSON sau:
{
  "keyword": "TỪ KHÓA (in hoa)",
  "caption": "Mô tả ngắn bức ảnh chướng ngại vật",
  "explanation": "Giải thích chi tiết mối liên hệ logic giữa các hàng ngang và Chướng ngại vật",
  "rows": [
    { "number": 1, "question": "Câu hỏi hàng ngang 1", "answer": "ĐÁP ÁN 1" },
    { "number": 2, "question": "Câu hỏi hàng ngang 2", "answer": "ĐÁP ÁN 2" },
    { "number": 3, "question": "Câu hỏi hàng ngang 3", "answer": "ĐÁP ÁN 3" },
    { "number": 4, "question": "Câu hỏi hàng ngang 4", "answer": "ĐÁP ÁN 4" }
  ],
  "center": {
    "question": "Câu hỏi gợi ý ô trung tâm",
    "answer": "ĐÁP ÁN TRUNG TÂM"
  }
}`;

    const text = await callGeminiAPI(prompt);
    const parsed = parseJSONResponse(text);
    if (!parsed || !parsed.keyword || !parsed.rows || parsed.rows.length < 4) {
        throw new Error('AI output structure invalid for CNV');
    }
    const backup = getBackupCNV();
    parsed.image = backup.image || 'images/hoangsa.jpg';
    parsed.fallbackImage = backup.fallbackImage;
    return parsed;
}

async function generateTangTocQuestions() {
    // Tỷ lệ: 3 câu từ API (75%) + 1 câu từ bộ mẫu (25%) -> Đảm bảo API >= 70%
    const aiCount = 3;
    const bocauhoiCount = 1;

    const prompt = `Bạn là quản trò cuộc thi "Đường lên đỉnh Olympia" trên VTV. Hãy tạo ${aiCount} câu hỏi cho vòng TĂNG TỐC.

YÊU CẦU:
- Mức độ: ${getDifficultyText()}
- Câu hỏi liên quan đến kiến thức thú vị, bất ngờ
- Mỗi câu hỏi kèm 1 mô tả gợi ý tình huống ngắn
- Đáp án ngắn gọn (1-5 từ)
- Chủ đề đa dạng: khoa học, lịch sử, địa lý, văn học, toán học...

Trả về đúng định dạng JSON sau:
[
  {
    "category": "Tên lĩnh vực",
    "question": "Nội dung câu hỏi",
    "description": "Mô tả ngắn gợi ý hình ảnh hoặc tình huống",
    "answer": "Đáp án chính xác",
    "explanation": "Giải thích ngắn gọn (1-2 câu)"
  }
]`;

    let aiQuestions = [];
    try {
        const text = await callGeminiAPI(prompt);
        aiQuestions = parseJSONResponse(text);
        if (!Array.isArray(aiQuestions)) aiQuestions = [];
    } catch (err) {
        console.warn('AI generateTangTocQuestions failed:', err);
    }

    const sampleQuestions = getBocauhoiQuestions(bocauhoiCount, q => q.points === 20 || q.difficulty === 'Trung bình');

    if (aiQuestions.length > 0) {
        const combined = [...aiQuestions, ...sampleQuestions];
        return combined.sort(() => Math.random() - 0.5);
    }

    showToast('💡 Đang dùng câu hỏi Tăng Tốc chuẩn (do AI tạm bận)');
    return getBackupTangToc();
}

async function generateVeDichQuestion(points) {
    // 75% xác suất từ AI, 25% từ bộ câu hỏi mẫu theo đúng số điểm (10, 20, 30)
    const useAI = Math.random() < 0.75;
    const diffText = points === 10 ? 'dễ' : points === 20 ? 'trung bình' : 'khó';

    if (useAI) {
        try {
            const prompt = `Bạn là quản trò cuộc thi "Đường lên đỉnh Olympia" trên VTV. Hãy tạo 1 câu hỏi cho vòng VỀ ĐÍCH, gói ${points} điểm.

YÊU CẦU:
- Mức độ: ${diffText}
- Gói ${points} điểm: câu hỏi ${diffText}, trả lời đúng được ${points * 2} điểm, sai bị trừ ${points} điểm
- Câu hỏi sâu, đòi hỏi kiến thức chắc chắn
- Đáp án rõ ràng, chính xác

Trả về đúng định dạng JSON sau:
{
  "category": "Tên lĩnh vực",
  "question": "Nội dung câu hỏi",
  "answer": "Đáp án chính xác",
  "explanation": "Giải thích chi tiết (2-3 câu)"
}`;
            const text = await callGeminiAPI(prompt);
            return parseJSONResponse(text);
        } catch (err) {
            console.warn('AI generateVeDichQuestion failed, falling back to bocauhoi:', err);
        }
    }

    // Chọn câu hỏi từ bộ mẫu theo đúng mức điểm
    const fromBank = getBocauhoiQuestions(1, q => q.points === points);
    if (fromBank.length > 0) return fromBank[0];
    return getBackupVeDich(points);
}

async function generateTuDoQuestion(category) {
    const catName = getCategoryName(category);
    // 75% xác suất từ AI, 25% từ bộ câu hỏi mẫu
    const useAI = Math.random() < 0.75;

    if (useAI) {
        try {
            const prompt = `Bạn là quản trò cuộc thi "Đường lên đỉnh Olympia" trên VTV. Hãy tạo 1 câu hỏi lĩnh vực ${catName}.

YÊU CẦU:
- Mức độ: ${getDifficultyText()}
- Chủ đề: ${catName}
- Câu hỏi thú vị, sáng tạo, kiến thức chuẩn
- Đáp án chính xác, ngắn gọn (1-5 từ)

Trả về đúng định dạng JSON sau:
{
  "category": "${catName}",
  "question": "Nội dung câu hỏi",
  "answer": "Đáp án chính xác",
  "explanation": "Giải thích chi tiết (2-3 câu)"
}`;
            const text = await callGeminiAPI(prompt);
            return parseJSONResponse(text);
        } catch (err) {
            console.warn('AI generateTuDoQuestion failed, falling back to bocauhoi:', err);
        }
    }

    const catMap = {
        toan: 'Toán học', ly: 'Vật lý', hoa: 'Hóa học', sinh: 'Sinh học',
        su: 'Lịch sử', dia: 'Địa lý', van: 'Văn học', anh: 'Tiếng Anh',
        tin: 'Khoa học - Công nghệ', tongquat: 'Hiểu biết chung'
    };
    const targetCat = catMap[category] || catName;
    const fromBank = getBocauhoiQuestions(1, q => q.category === targetCat);
    if (fromBank.length > 0) return fromBank[0];
    return getBackupTuDo(category);
}

async function checkAnswer(userAnswer, correctAnswer, question) {
    const prompt = `Bạn là giám khảo cuộc thi "Đường lên đỉnh Olympia". Hãy chấm điểm câu trả lời.

Câu hỏi: ${question}
Đáp án chuẩn: ${correctAnswer}
Câu trả lời của thí sinh: ${userAnswer}

Hãy đánh giá xem câu trả lời có đúng không. Chấp nhận các biến thể hợp lý (viết tắt, viết hoa/thường khác nhau, cách diễn đạt tương đương, bỏ dấu...).

Trả về đúng định dạng JSON (KHÔNG thêm markdown):
{
  "correct": true/false,
  "feedback": "Nhận xét ngắn gọn về câu trả lời"
}`;

    const text = await callGeminiAPI(prompt);
    return parseJSONResponse(text);
}

function parseJSONResponse(text) {
    if (!text) {
        throw new Error('Không nhận được phản hồi từ AI. Vui lòng thử lại.');
    }
    let cleaned = text.trim();
    // Remove markdown code fences if present
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // Try to find JSON in the text
        const startIdx = cleaned.search(/[\[{]/);
        if (startIdx !== -1) {
            const isArray = cleaned[startIdx] === '[';
            const endChar = isArray ? ']' : '}';
            const lastIdx = cleaned.lastIndexOf(endChar);
            if (lastIdx > startIdx) {
                const sub = cleaned.substring(startIdx, lastIdx + 1);
                try {
                    return JSON.parse(sub);
                } catch (e2) {
                    console.error('Failed to parse JSON substring:', sub);
                }
            }
        }
        console.error('Failed to parse AI response:', cleaned);
        throw new Error('Không thể phân tích phản hồi từ AI. Vui lòng thử lại.');
    }
}

// ===================== TIMER =====================
function startTimer(seconds, onTick, onEnd) {
    stopTimer();
    state.timeLeft = seconds;
    state.maxTime = seconds;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();

        if (state.timeLeft <= 10 && state.timeLeft > 5) {
            playSound('tick');
        } else if (state.timeLeft <= 5 && state.timeLeft > 0) {
            playSound('tick');
        }

        if (onTick) onTick(state.timeLeft);

        if (state.timeLeft <= 0) {
            stopTimer();
            playSound('timeup');
            if (onEnd) onEnd();
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const circumference = 2 * Math.PI * 54;
    const progress = (state.maxTime - state.timeLeft) / state.maxTime;
    const offset = circumference * progress;

    els.timerProgress.style.strokeDasharray = circumference;
    els.timerProgress.style.strokeDashoffset = offset;
    els.timerText.textContent = state.timeLeft;

    // Color changes
    els.timerProgress.classList.remove('warning', 'danger');
    if (state.timeLeft <= 5) {
        els.timerProgress.classList.add('danger');
    } else if (state.timeLeft <= 10) {
        els.timerProgress.classList.add('warning');
    }
}

// ===================== SCREEN NAVIGATION =====================
function showScreen(screenId) {
    if (screenId !== 'gameScreen') {
        stopCnvTimers();
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prepareStandardRoundUI() {
    stopCnvTimers();
    if (els.cnvScreenArea) els.cnvScreenArea.classList.add('hidden');
    if (els.timerContainer) els.timerContainer.classList.remove('hidden');
    if (els.questionCounter) els.questionCounter.classList.remove('hidden');
    if (els.questionArea) els.questionArea.classList.remove('hidden');
    if (els.answerArea) els.answerArea.classList.remove('hidden');
    if (els.resultFeedback) els.resultFeedback.classList.add('hidden');
}

function prepareCnvRoundUI() {
    stopTimer();
    if (els.timerContainer) els.timerContainer.classList.add('hidden');
    if (els.questionCounter) els.questionCounter.classList.add('hidden');
    if (els.questionArea) els.questionArea.classList.add('hidden');
    if (els.answerArea) els.answerArea.classList.add('hidden');
    if (els.resultFeedback) els.resultFeedback.classList.add('hidden');
    if (els.cnvScreenArea) els.cnvScreenArea.classList.remove('hidden');
}

// ===================== UPDATE UI =====================
function updateStats() {
    els.totalScore.textContent = state.totalScore;
    els.streakCount.textContent = state.streak;
    els.statTotalQuestions.textContent = state.totalQuestions;
    els.statCorrect.textContent = state.totalCorrect;
    const accuracy = state.totalQuestions > 0
        ? Math.round((state.totalCorrect / state.totalQuestions) * 100)
        : 0;
    els.statAccuracy.textContent = accuracy + '%';
    els.statBestStreak.textContent = state.bestStreak;
}

function saveStats() {
    localStorage.setItem('olympia_total_score', state.totalScore);
    localStorage.setItem('olympia_best_streak', state.bestStreak);
    localStorage.setItem('olympia_total_questions', state.totalQuestions);
    localStorage.setItem('olympia_total_correct', state.totalCorrect);
}

// ===================== ROUND: KHỞI ĐỘNG =====================
async function startKhoiDong() {
    state.currentRound = 'khoidong';
    state.roundScore = 0;
    state.currentQuestion = 0;
    state.totalRoundQuestions = 12;
    state.roundCorrect = 0;
    state.roundTimes = [];

    els.gameRoundTitle.textContent = '⚡ Khởi Động';
    els.roundScore.textContent = '0';
    els.totalQ.textContent = '12';
    els.hintsContainer.classList.add('hidden');
    els.packageSelector.classList.add('hidden');
    els.categorySelector.classList.add('hidden');

    prepareStandardRoundUI();
    showScreen('gameScreen');
    showLoading(true);

    try {
        state.questions = await generateKhoiDongQuestions();
    } catch (err) {
        console.warn('AI generation failed, using Olympia backup questions:', err);
        showToast('💡 Đang dùng bộ câu hỏi Olympia chuẩn (do AI tạm hết lượt hôm nay)');
        state.questions = getBackupKhoiDong();
    }
    showLoading(false);
    playSound('start');
    showKhoiDongQuestion();
}

function showKhoiDongQuestion() {
    if (state.currentQuestion >= state.questions.length) {
        endRound();
        return;
    }

    const q = state.questions[state.currentQuestion];
    state.currentAnswer = q.answer;
    state.isAnswering = true;
    state.questionStartTime = Date.now();

    els.currentQ.textContent = state.currentQuestion + 1;
    els.questionCategory.innerHTML = `<span class="category-badge">📘 ${q.category}</span>`;
    els.questionText.textContent = q.question;

    resetAnswerArea();
    startTimer(60, null, () => handleTimeUp());
}

// ===================== ROUND: CHƯỚNG NGẠI VẬT (VTV FORMAT) =====================

function getCnvBuzzerPoints() {
    let attemptedCount = 0;
    for (let i = 1; i <= 4; i++) {
        if (state.cnvRowAttempted[i]) attemptedCount++;
    }
    if (state.cnvRowAttempted.center) {
        return 20;
    }
    switch (attemptedCount) {
        case 0:
        case 1:
            return 60;
        case 2:
            return 50;
        case 3:
            return 40;
        case 4:
            return 30;
        default:
            return 20;
    }
}

function updateCnvBuzzerPoints() {
    const pts = getCnvBuzzerPoints();
    if (els.cnvCurrentBuzzerPoints) {
        els.cnvCurrentBuzzerPoints.textContent = `${pts} điểm`;
    }
    if (els.buzzerPotentialPointsText) {
        els.buzzerPotentialPointsText.textContent = `+${pts} ĐIỂM`;
    }
}

async function startCNV() {
    state.currentRound = 'chuongnvaivat';
    state.roundScore = 0;
    state.currentQuestion = 0;
    state.totalRoundQuestions = 5;
    state.roundCorrect = 0;
    state.roundTimes = [];
    state.cnvEliminated = false;
    state.cnvGuessedObstacle = false;
    state.cnvActiveRowIndex = null;
    state.cnvRowsCount = 0;

    // Reset row states
    state.cnvRowStates = { 1: 'closed', 2: 'closed', 3: 'closed', 4: 'closed', center: 'closed' };
    state.cnvRowAttempted = { 1: false, 2: false, 3: false, 4: false, center: false };
    state.cnvPiecesRevealed = { 1: false, 2: false, 3: false, 4: false, center: false };

    els.gameRoundTitle.textContent = '🧩 Vượt Chướng Ngại Vật';
    els.roundScore.textContent = '0';

    prepareCnvRoundUI();
    showScreen('gameScreen');
    showLoading(true);

    try {
        const puzzle = getCNVPuzzleFromBank();
        state.cnvCurrentPuzzle = puzzle;
        state.cnvKeyword = (puzzle.keyword || '').toUpperCase().trim();
    } catch (err) {
        console.warn('CNV puzzle selection error:', err);
        const puzzle = getBackupCNV();
        state.cnvCurrentPuzzle = puzzle;
        state.cnvKeyword = (puzzle.keyword || '').toUpperCase().trim();
    }

    showLoading(false);
    playSound('start');
    showCNVPuzzle();
}

function showCNVPuzzle() {
    const puzzle = state.cnvCurrentPuzzle;
    if (!puzzle) return;

    // Set Image from authentic images folder
    if (els.cnvImage) {
        els.cnvImage.src = puzzle.image || 'images/vanmieu.png';
        els.cnvImage.onerror = function() {
            if (puzzle.fallbackImage && this.src !== puzzle.fallbackImage) {
                this.src = puzzle.fallbackImage;
            }
        };
    }

    // Reset pieces visuals
    [1, 2, 3, 4, 'center'].forEach(p => {
        const pieceEl = document.getElementById(p === 'center' ? 'cnvPieceCenter' : `cnvPiece${p}`);
        if (pieceEl) {
            pieceEl.classList.remove('revealed', 'revealing');
            pieceEl.style.display = '';
        }
    });

    // Reset caption box
    if (els.cnvCaptionBox) els.cnvCaptionBox.classList.add('hidden');
    if (els.cnvCaptionText) els.cnvCaptionText.textContent = puzzle.caption || '';

    // Render keyword boxes (hidden placeholders)
    renderCnvKeywordBoxes(false);

    // Update Buzzer points display
    updateCnvBuzzerPoints();

    // Enable Buzzer button
    if (els.cnvBuzzerBtn) {
        els.cnvBuzzerBtn.disabled = false;
        els.cnvBuzzerBtn.classList.add('pulse');
    }

    // Show row list card, hide active row card
    if (els.cnvRowsCard) els.cnvRowsCard.classList.remove('hidden');
    if (els.cnvActiveCard) els.cnvActiveCard.classList.add('hidden');

    // Render the 4 horizontal rows + center row
    renderCnvRowsList();
}

function renderCnvKeywordBoxes(revealedAll) {
    if (!els.cnvKeywordBoxes) return;
    els.cnvKeywordBoxes.innerHTML = '';
    const kw = state.cnvKeyword || '';
    const cleanLetters = kw.replace(/\s+/g, '');
    if (els.cnvLetterCount) {
        els.cnvLetterCount.textContent = `GỒM ${cleanLetters.length} CHỮ CÁI`;
    }

    for (let i = 0; i < kw.length; i++) {
        const char = kw[i];
        if (char === ' ') {
            const spaceBox = document.createElement('div');
            spaceBox.className = 'cnv-letter-space';
            els.cnvKeywordBoxes.appendChild(spaceBox);
        } else {
            const box = document.createElement('div');
            box.className = 'cnv-letter-box' + (revealedAll ? ' revealed animate-pop' : '');
            box.textContent = revealedAll ? char : '';
            els.cnvKeywordBoxes.appendChild(box);
        }
    }
}

function renderLettersStripHTML(answer, isRevealed) {
    if (!answer) return '';
    const upper = answer.toUpperCase().trim();
    let html = '';
    for (let i = 0; i < upper.length; i++) {
        const c = upper[i];
        if (c === ' ') {
            html += '<span class="letter-cell-space"></span>';
        } else {
            html += `<span class="letter-cell ${isRevealed ? 'revealed flip-in' : ''}">${isRevealed ? c : ''}</span>`;
        }
    }
    return html;
}

function renderCnvRowsList() {
    if (!els.cnvRowsList) return;
    els.cnvRowsList.innerHTML = '';
    const puzzle = state.cnvCurrentPuzzle;
    if (!puzzle) return;

    const allFourAttempted = [1, 2, 3, 4].every(i => state.cnvRowAttempted[i]);

    (puzzle.rows || []).slice(0, 4).forEach((row, idx) => {
        const rowNum = idx + 1;
        const rowState = state.cnvRowStates[rowNum] || 'closed';
        const cleanAnswer = (row.answer || '').toUpperCase().replace(/\s+/g, '');
        const letterCount = cleanAnswer.length;

        const rowItem = document.createElement('div');
        rowItem.className = `cnv-row-item ${rowState}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'row-item-left';
        leftDiv.innerHTML = `
            <div class="row-num-badge">HÀNG ${rowNum}</div>
            <div class="row-letters-strip">
                ${renderLettersStripHTML(row.answer, rowState === 'correct')}
            </div>
            <div class="row-letters-count">${letterCount} chữ cái</div>
        `;

        const rightDiv = document.createElement('div');
        rightDiv.className = 'row-item-right';
        if (rowState === 'correct') {
            rightDiv.innerHTML = `<span class="row-status-badge correct">✅ ĐÚNG (+10đ)</span>`;
        } else if (rowState === 'wrong') {
            rightDiv.innerHTML = `<span class="row-status-badge wrong">❌ CHƯA ĐÚNG</span>`;
        } else {
            if (state.cnvEliminated) {
                rightDiv.innerHTML = `<button class="btn btn-select-row disabled" disabled>Đã bị loại</button>`;
            } else {
                const btn = document.createElement('button');
                btn.className = 'btn btn-select-row btn-glow';
                btn.textContent = 'Chọn hàng này →';
                btn.addEventListener('click', () => selectCnvRow(rowNum));
                rightDiv.appendChild(btn);
            }
        }

        rowItem.appendChild(leftDiv);
        rowItem.appendChild(rightDiv);
        els.cnvRowsList.appendChild(rowItem);
    });

    // Center Row
    if (puzzle.center) {
        const centerRowState = state.cnvRowStates.center || 'closed';
        const cleanCenter = (puzzle.center.answer || '').toUpperCase().replace(/\s+/g, '');
        const centerLen = cleanCenter.length;

        const centerItem = document.createElement('div');
        centerItem.className = `cnv-row-item center-row ${centerRowState}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'row-item-left';
        leftDiv.innerHTML = `
            <div class="row-num-badge center-badge">★ TRUNG TÂM</div>
            <div class="row-letters-strip">
                ${renderLettersStripHTML(puzzle.center.answer, centerRowState === 'correct')}
            </div>
            <div class="row-letters-count">${centerLen} chữ cái</div>
        `;

        const rightDiv = document.createElement('div');
        rightDiv.className = 'row-item-right';
        if (centerRowState === 'correct') {
            rightDiv.innerHTML = `<span class="row-status-badge correct">✅ ĐÚNG (+10đ)</span>`;
        } else if (centerRowState === 'wrong') {
            rightDiv.innerHTML = `<span class="row-status-badge wrong">❌ CHƯA ĐÚNG</span>`;
        } else if (!allFourAttempted) {
            rightDiv.innerHTML = `<span class="row-status-badge locked">🔒 Mở sau khi chọn đủ 4 hàng</span>`;
        } else {
            if (state.cnvEliminated) {
                rightDiv.innerHTML = `<button class="btn btn-select-row disabled" disabled>Đã bị loại</button>`;
            } else {
                const btn = document.createElement('button');
                btn.className = 'btn btn-select-row btn-gold btn-glow';
                btn.textContent = 'Mở ô trung tâm ★';
                btn.addEventListener('click', () => selectCnvRow('center'));
                rightDiv.appendChild(btn);
            }
        }

        centerItem.appendChild(leftDiv);
        centerItem.appendChild(rightDiv);
        els.cnvRowsList.appendChild(centerItem);
    }
}

function selectCnvRow(rowIdentifier) {
    if (state.cnvEliminated) return;
    state.cnvActiveRowIndex = rowIdentifier;
    const puzzle = state.cnvCurrentPuzzle;
    if (!puzzle) return;

    const rowObj = rowIdentifier === 'center' ? puzzle.center : puzzle.rows[rowIdentifier - 1];
    if (!rowObj) return;

    const cleanAnswer = (rowObj.answer || '').toUpperCase().replace(/\s+/g, '');
    const letterCount = cleanAnswer.length;

    // Set badge text
    if (els.cnvActiveBadge) {
        els.cnvActiveBadge.textContent = rowIdentifier === 'center' ? '★ Ô TRUNG TÂM' : `HÀNG NGANG ${rowIdentifier}`;
    }
    if (els.cnvActiveLength) {
        els.cnvActiveLength.textContent = `${letterCount} CHỮ CÁI`;
    }

    // Set question text
    if (els.cnvActiveQuestion) {
        els.cnvActiveQuestion.textContent = rowObj.question;
    }

    // Clear input and reset form
    if (els.cnvRowInput) {
        els.cnvRowInput.value = '';
    }
    if (els.cnvActiveForm) {
        els.cnvActiveForm.classList.remove('hidden');
    }
    if (els.cnvRowFeedback) {
        els.cnvRowFeedback.classList.add('hidden');
    }

    // Switch panels
    if (els.cnvRowsCard) els.cnvRowsCard.classList.add('hidden');
    if (els.cnvActiveCard) els.cnvActiveCard.classList.remove('hidden');

    startCnvRowTimer();

    setTimeout(() => {
        if (els.cnvRowInput) els.cnvRowInput.focus();
    }, 100);
}

function startCnvRowTimer() {
    stopCnvRowTimer();
    state.cnvRowTimeLeft = 15;
    updateCnvRowTimerDisplay();
    state.cnvRowTimerInterval = setInterval(() => {
        state.cnvRowTimeLeft--;
        updateCnvRowTimerDisplay();
        if (state.cnvRowTimeLeft <= 0) {
            stopCnvRowTimer();
            handleCnvRowTimeUp();
        }
    }, 1000);
}

function stopCnvRowTimer() {
    if (state.cnvRowTimerInterval) {
        clearInterval(state.cnvRowTimerInterval);
        state.cnvRowTimerInterval = null;
    }
}

function updateCnvRowTimerDisplay() {
    if (els.cnvRowTimerNum) {
        els.cnvRowTimerNum.textContent = state.cnvRowTimeLeft;
        if (state.cnvRowTimeLeft <= 5) {
            els.cnvRowTimerNum.classList.add('urgent');
            if (state.cnvRowTimeLeft > 0) playSound('tick');
        } else {
            els.cnvRowTimerNum.classList.remove('urgent');
        }
    }
    if (els.cnvRowTimerProgress) {
        const circumference = 2 * Math.PI * 21;
        const offset = circumference * (1 - state.cnvRowTimeLeft / 15);
        els.cnvRowTimerProgress.style.strokeDasharray = circumference;
        els.cnvRowTimerProgress.style.strokeDashoffset = offset;
    }
}

function handleCnvRowTimeUp() {
    submitCnvRowAnswer(true);
}

function submitCnvRowAnswer(isTimeUp) {
    stopCnvRowTimer();
    const rowKey = state.cnvActiveRowIndex;
    if (!rowKey) return;

    const puzzle = state.cnvCurrentPuzzle;
    const rowObj = rowKey === 'center' ? puzzle.center : puzzle.rows[rowKey - 1];
    if (!rowObj) return;

    state.cnvRowAttempted[rowKey] = true;
    state.cnvRowsCount++;

    const userAns = isTimeUp ? '' : (els.cnvRowInput.value || '').trim();
    const isCorrect = !isTimeUp && checkAnswerLocal(userAns, rowObj.answer);

    if (els.cnvActiveForm) els.cnvActiveForm.classList.add('hidden');
    if (els.cnvRowFeedback) els.cnvRowFeedback.classList.remove('hidden');

    if (isCorrect) {
        playSound('correct');
        state.cnvRowStates[rowKey] = 'correct';
        state.roundScore += 10;
        state.totalScore += 10;
        state.totalQuestions++;
        state.totalCorrect++;
        state.streak++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        saveStats();
        updateStats();

        els.roundScore.textContent = state.roundScore;
        if (els.cnvRowFbIcon) els.cnvRowFbIcon.textContent = '✅';
        if (els.cnvRowFbText) {
            els.cnvRowFbText.textContent = 'CHÍNH XÁC! (+10 ĐIỂM)';
            els.cnvRowFbText.className = 'feedback-text correct';
        }
        if (els.cnvRowFbAns) {
            els.cnvRowFbAns.textContent = `Đáp án: ${rowObj.answer.toUpperCase()}`;
        }

        revealCnvPiece(rowKey);
    } else {
        playSound('wrong');
        state.cnvRowStates[rowKey] = 'wrong';
        state.totalQuestions++;
        state.streak = 0;
        saveStats();
        updateStats();

        if (els.cnvRowFbIcon) els.cnvRowFbIcon.textContent = '❌';
        if (els.cnvRowFbText) {
            els.cnvRowFbText.textContent = isTimeUp ? 'HẾT THỜI GIAN (15 GIÂY)!' : 'CHƯA CHÍNH XÁC!';
            els.cnvRowFbText.className = 'feedback-text wrong';
        }
        if (els.cnvRowFbAns) {
            els.cnvRowFbAns.textContent = `Đáp án đúng: ${rowObj.answer.toUpperCase()}`;
        }
    }

    updateCnvBuzzerPoints();
}

function revealCnvPiece(pieceKey) {
    state.cnvPiecesRevealed[pieceKey] = true;
    const pieceEl = document.getElementById(pieceKey === 'center' ? 'cnvPieceCenter' : `cnvPiece${pieceKey}`);
    if (pieceEl) {
        playSound('flip');
        pieceEl.classList.add('revealing');
        setTimeout(() => {
            pieceEl.classList.add('revealed');
        }, 200);
    }
}

function continueAfterCnvRow() {
    if (els.cnvActiveCard) els.cnvActiveCard.classList.add('hidden');
    if (els.cnvRowsCard) els.cnvRowsCard.classList.remove('hidden');
    renderCnvRowsList();

    // Check if all rows are attempted
    const allAttempted = [1, 2, 3, 4, 'center'].every(k => state.cnvRowAttempted[k]);
    if (allAttempted && !state.cnvGuessedObstacle && !state.cnvEliminated) {
        showToast('🔔 Đã hết các hàng ngang! Hãy bấm chuông để đoán từ khóa Chướng ngại vật cuối cùng (20 điểm)!');
    }
}

function openCnvBuzzerModal() {
    if (state.cnvEliminated || state.cnvGuessedObstacle) return;
    playSound('bell');
    stopCnvRowTimer();

    updateCnvBuzzerPoints();
    if (els.cnvBuzzerModal) els.cnvBuzzerModal.classList.add('active');
    if (els.cnvBuzzerInput) {
        els.cnvBuzzerInput.value = '';
        setTimeout(() => els.cnvBuzzerInput.focus(), 150);
    }

    startCnvBuzzerTimer();
}

function closeCnvBuzzerModal() {
    stopCnvBuzzerTimer();
    if (els.cnvBuzzerModal) els.cnvBuzzerModal.classList.remove('active');
    if (state.cnvActiveRowIndex && !state.cnvRowAttempted[state.cnvActiveRowIndex]) {
        startCnvRowTimer();
    }
}

function startCnvBuzzerTimer() {
    stopCnvBuzzerTimer();
    state.cnvBuzzerTimeLeft = 15;
    if (els.buzzerTimerText) els.buzzerTimerText.textContent = '15';

    state.cnvBuzzerTimerInterval = setInterval(() => {
        state.cnvBuzzerTimeLeft--;
        if (els.buzzerTimerText) els.buzzerTimerText.textContent = state.cnvBuzzerTimeLeft;
        if (state.cnvBuzzerTimeLeft <= 5) {
            playSound('tick');
        }
        if (state.cnvBuzzerTimeLeft <= 0) {
            stopCnvBuzzerTimer();
            confirmCnvBuzzerAnswer(true);
        }
    }, 1000);
}

function stopCnvBuzzerTimer() {
    if (state.cnvBuzzerTimerInterval) {
        clearInterval(state.cnvBuzzerTimerInterval);
        state.cnvBuzzerTimerInterval = null;
    }
}

function confirmCnvBuzzerAnswer(isTimeUp) {
    stopCnvBuzzerTimer();
    if (els.cnvBuzzerModal) els.cnvBuzzerModal.classList.remove('active');

    state.cnvGuessedObstacle = true;
    const puzzle = state.cnvCurrentPuzzle;
    if (!puzzle) return;

    const userAns = isTimeUp ? '' : (els.cnvBuzzerInput.value || '').trim();
    const isCorrect = !isTimeUp && checkAnswerLocal(userAns, puzzle.keyword);

    // Reveal all pieces
    [1, 2, 3, 4, 'center'].forEach(p => revealCnvPiece(p));
    // Reveal keyword
    renderCnvKeywordBoxes(true);
    // Show image caption
    if (els.cnvCaptionBox) els.cnvCaptionBox.classList.remove('hidden');

    if (isCorrect) {
        playSound('victory');
        const buzzerPoints = getCnvBuzzerPoints();
        state.roundScore += buzzerPoints;
        state.totalScore += buzzerPoints;
        state.totalQuestions++;
        state.totalCorrect++;
        state.streak += 2;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        saveStats();
        updateStats();

        els.roundScore.textContent = state.roundScore;

        if (els.cnvOutcomeIcon) els.cnvOutcomeIcon.textContent = '🏆';
        if (els.cnvOutcomeTitle) els.cnvOutcomeTitle.textContent = 'CHÍNH XÁC! BẠN ĐÃ VƯỢT CHƯỚNG NGẠI VẬT!';
        if (els.cnvOutcomePoints) {
            els.cnvOutcomePoints.textContent = `+${buzzerPoints} ĐIỂM`;
            els.cnvOutcomePoints.className = 'outcome-points victory';
        }
        if (els.cnvOutcomeKeyword) els.cnvOutcomeKeyword.textContent = puzzle.keyword.toUpperCase();
        if (els.cnvOutcomeExplanation) {
            els.cnvOutcomeExplanation.innerHTML = `
                <p class="outcome-exp-text"><strong>${puzzle.caption || ''}</strong></p>
                <div class="outcome-exp-details">${formatCnvExplanationHTML(puzzle)}</div>
            `;
        }
        if (els.cnvOutcomeModal) els.cnvOutcomeModal.classList.add('active');
    } else {
        playSound('wrong');
        state.cnvEliminated = true;
        state.totalQuestions++;
        state.streak = 0;
        saveStats();
        updateStats();

        if (els.cnvOutcomeIcon) els.cnvOutcomeIcon.textContent = '⚠️';
        if (els.cnvOutcomeTitle) els.cnvOutcomeTitle.textContent = 'BẠN ĐÃ BỊ LOẠI KHỎI PHẦN THI VCNV!';
        if (els.cnvOutcomePoints) {
            els.cnvOutcomePoints.textContent = '0 ĐIỂM CHƯỚNG NGẠI VẬT';
            els.cnvOutcomePoints.className = 'outcome-points eliminated';
        }
        if (els.cnvOutcomeKeyword) els.cnvOutcomeKeyword.textContent = puzzle.keyword.toUpperCase();
        if (els.cnvOutcomeExplanation) {
            els.cnvOutcomeExplanation.innerHTML = `
                <div class="elimination-alert">
                    <strong>Theo thể lệ Đường Lên Đỉnh Olympia của VTV:</strong> 
                    ${isTimeUp ? 'Bạn đã hết 15 giây suy nghĩ sau khi bấm chuông.' : 'Câu trả lời chướng ngại vật chưa chính xác.'} 
                    Bạn bị tước quyền thi đấu tiếp ở vòng Vượt chướng ngại vật này.
                </div>
                <div class="outcome-exp-details">${formatCnvExplanationHTML(puzzle)}</div>
            `;
        }
        if (els.cnvOutcomeModal) els.cnvOutcomeModal.classList.add('active');
    }
}

function formatCnvExplanationHTML(puzzle) {
    if (!puzzle) return '';
    let html = `<div class="cnv-exp-box">`;
    if (puzzle.explanation) {
        html += `<p class="cnv-exp-summary">💡 <em>${puzzle.explanation}</em></p>`;
    }
    html += `<ul class="cnv-exp-rows">`;
    (puzzle.rows || []).forEach((r, i) => {
        html += `<li><strong>Hàng ${i + 1} (${r.answer}):</strong> ${r.question}</li>`;
    });
    if (puzzle.center) {
        html += `<li><strong>Trung tâm (${puzzle.center.answer}):</strong> ${puzzle.center.question}</li>`;
    }
    html += `</ul></div>`;
    return html;
}

function handleCnvOutcomeNext() {
    if (els.cnvOutcomeModal) els.cnvOutcomeModal.classList.remove('active');
    endRound();
}

function stopCnvTimers() {
    stopCnvRowTimer();
    stopCnvBuzzerTimer();
    if (els.cnvBuzzerModal) els.cnvBuzzerModal.classList.remove('active');
    if (els.cnvOutcomeModal) els.cnvOutcomeModal.classList.remove('active');
}

// ===================== RESET SCORE FUNCTIONS =====================
function openResetModal() {
    if (els.resetModal) els.resetModal.classList.add('active');
}

function closeResetModal() {
    if (els.resetModal) els.resetModal.classList.remove('active');
}

function resetScoreOnly() {
    state.totalScore = 0;
    localStorage.setItem('olympia_total_score', '0');

    // Quá trình thi kết thúc khi thí sinh bấm nút reset điểm số: làm mới lại ngân hàng câu hỏi
    state.askedQuestionIds = [];
    state.askedCnvIds = [];
    saveAskedQuestions();
    saveAskedCnv();
    updateBankProgressUI();

    updateStats();
    closeResetModal();
    if (els.settingsModal) els.settingsModal.classList.remove('active');
    showToast('🎯 Đã đặt lại tổng điểm về 0 & làm mới ngân hàng câu hỏi thi!');
    playSound('correct');
}

function resetAllStats() {
    state.totalScore = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.totalQuestions = 0;
    state.totalCorrect = 0;

    localStorage.setItem('olympia_total_score', '0');
    localStorage.setItem('olympia_best_streak', '0');
    localStorage.setItem('olympia_total_questions', '0');
    localStorage.setItem('olympia_total_correct', '0');

    // Quá trình thi kết thúc khi thí sinh bấm nút reset điểm số: làm mới lại ngân hàng câu hỏi
    state.askedQuestionIds = [];
    state.askedCnvIds = [];
    saveAskedQuestions();
    saveAskedCnv();
    updateBankProgressUI();

    updateStats();
    closeResetModal();
    if (els.settingsModal) els.settingsModal.classList.remove('active');
    showToast('💥 Đã đặt lại toàn bộ điểm số & làm mới toàn bộ câu hỏi thi!');
    playSound('start');
}

// ===================== ROUND: TĂNG TỐC =====================
async function startTangToc() {
    state.currentRound = 'tangtoc';
    state.roundScore = 0;
    state.currentQuestion = 0;
    state.totalRoundQuestions = 4;
    state.roundCorrect = 0;
    state.roundTimes = [];

    els.gameRoundTitle.textContent = '🚀 Tăng Tốc';
    els.roundScore.textContent = '0';
    els.totalQ.textContent = '4';
    els.hintsContainer.classList.add('hidden');
    els.packageSelector.classList.add('hidden');
    els.categorySelector.classList.add('hidden');

    prepareStandardRoundUI();
    showScreen('gameScreen');
    showLoading(true);

    try {
        state.questions = await generateTangTocQuestions();
    } catch (err) {
        console.warn('AI generation failed for TangToc, using backup:', err);
        showToast('💡 Đang dùng câu hỏi Tăng Tốc chuẩn (do AI tạm hết lượt hôm nay)');
        state.questions = getBackupTangToc();
    }
    showLoading(false);
    playSound('start');
    showTangTocQuestion();
}

function showTangTocQuestion() {
    if (state.currentQuestion >= state.questions.length) {
        endRound();
        return;
    }

    const q = state.questions[state.currentQuestion];
    state.currentAnswer = q.answer;
    state.isAnswering = true;
    state.questionStartTime = Date.now();

    els.currentQ.textContent = state.currentQuestion + 1;
    els.questionCategory.innerHTML = `<span class="category-badge">📘 ${q.category}</span>`;

    let questionHtml = q.question;
    if (q.description) {
        questionHtml += `<br><small style="color: var(--text-muted); font-weight: 400; font-size: 0.85em;">📝 ${q.description}</small>`;
    }
    els.questionText.innerHTML = questionHtml;

    resetAnswerArea();
    startTimer(30, null, () => handleTimeUp());
}

// ===================== ROUND: VỀ ĐÍCH (CHUẨN THỂ LỆ OLYMPIA) =====================
async function startVeDich() {
    state.currentRound = 'vedich';
    state.roundScore = 0;
    state.currentQuestion = 0;
    state.totalRoundQuestions = 3;
    state.roundCorrect = 0;
    state.roundTimes = [];
    state.questions = [];
    state.vedichChoices = [];
    state.vedichQuestionIndex = 0;
    state.vedichStarUsed = false;
    state.vedichCurrentStar = false;

    els.gameRoundTitle.textContent = '🏆 Về Đích';
    els.roundScore.textContent = '0';
    els.totalQ.textContent = '3';
    els.currentQ.textContent = '1';
    els.hintsContainer.classList.add('hidden');
    els.categorySelector.classList.add('hidden');
    if (els.hopeStarContainer) els.hopeStarContainer.classList.add('hidden');

    prepareStandardRoundUI();
    showScreen('gameScreen');
    showVeDichPackageSelector();
}

function showVeDichPackageSelector() {
    els.questionText.textContent = '';
    els.questionCategory.innerHTML = '';
    els.packageSelector.classList.remove('hidden');
    els.answerArea.classList.add('hidden');
    els.resultFeedback.classList.add('hidden');
    els.timerContainer.style.visibility = 'hidden';
    if (els.hopeStarContainer) els.hopeStarContainer.classList.add('hidden');

    const nextQ = state.vedichQuestionIndex + 1;
    if (els.packageSelectorTitle) {
        els.packageSelectorTitle.textContent = `🎯 Chọn mức điểm cho Câu ${nextQ}/3:`;
    }
    els.currentQ.textContent = nextQ;

    // Chuẩn Olympia: Thí sinh tự do chọn mức điểm từng câu (có thể chọn trùng như 3 câu 30đ)
    [10, 20, 30].forEach(p => {
        const btn = document.getElementById(`pkg${p}`);
        if (btn) {
            btn.classList.remove('used');
            btn.disabled = false;
        }
    });
}

function toggleHopeStar() {
    if (state.vedichStarUsed) {
        showToast('⚠️ Bạn đã sử dụng Ngôi sao hy vọng trong gói thi này rồi!', 2500);
        return;
    }

    state.vedichCurrentStar = true;
    state.vedichStarUsed = true;

    if (els.hopeStarBtn) els.hopeStarBtn.classList.add('hidden');
    if (els.hopeStarBadge) els.hopeStarBadge.classList.remove('hidden');

    playSound('victory');
    showToast('🌟 Bạn đã ĐẶT NGÔI SAO HY VỌNG! Đúng x2 điểm, Sai bị trừ điểm câu này! 🚀', 3800);
}

async function selectVeDichPackage(points) {
    if (state.vedichQuestionIndex >= 3) return;

    state.vedichCurrentPoints = points;
    state.vedichQuestionIndex++;
    state.vedichChoices.push(points);
    state.currentQuestion = state.vedichQuestionIndex - 1;
    state.vedichCurrentStar = false; // Reset trạng thái ngôi sao cho câu này

    els.packageSelector.classList.add('hidden');
    els.answerArea.classList.remove('hidden');
    els.timerContainer.style.visibility = 'visible';
    els.currentQ.textContent = state.vedichQuestionIndex;

    // Quản lý hiển thị Ngôi sao hy vọng
    if (els.hopeStarContainer) {
        if (!state.vedichStarUsed) {
            // Còn quyền đặt Ngôi sao hy vọng
            els.hopeStarContainer.classList.remove('hidden');
            if (els.hopeStarBtn) els.hopeStarBtn.classList.remove('hidden');
            if (els.hopeStarBadge) els.hopeStarBadge.classList.add('hidden');
        } else {
            // Đã dùng ngôi sao hy vọng ở câu trước đó trong gói 3 câu
            els.hopeStarContainer.classList.add('hidden');
            if (els.hopeStarBtn) els.hopeStarBtn.classList.add('hidden');
            if (els.hopeStarBadge) els.hopeStarBadge.classList.add('hidden');
        }
    }

    showLoading(true);

    let q;
    try {
        q = await generateVeDichQuestion(points);
    } catch (err) {
        console.warn('AI generation failed for VeDich, using backup:', err);
        showToast('💡 Đang dùng câu hỏi Về Đích chuẩn từ ngân hàng');
        q = getBackupVeDich(points);
    }

    state.currentAnswer = q.answer;
    state.questions.push(q);
    state.isAnswering = true;
    state.questionStartTime = Date.now();

    showLoading(false);

    els.questionCategory.innerHTML = `<span class="category-badge">📘 ${q.category} — Câu hỏi ${points} điểm (Câu ${state.vedichQuestionIndex}/3)</span>`;
    els.questionText.textContent = q.question;

    resetAnswerArea();
    startTimer(30, null, () => handleTimeUp());
}

// ===================== ROUND: TỰ DO =====================
async function startTuDo() {
    state.currentRound = 'tudo';
    state.roundScore = 0;
    state.currentQuestion = 0;
    state.totalRoundQuestions = 999;
    state.roundCorrect = 0;
    state.roundTimes = [];

    els.gameRoundTitle.textContent = '📚 Luyện Tập Tự Do';
    els.roundScore.textContent = '0';
    els.totalQ.textContent = '∞';
    els.currentQ.textContent = '0';
    els.hintsContainer.classList.add('hidden');
    els.packageSelector.classList.add('hidden');

    prepareStandardRoundUI();
    showScreen('gameScreen');
    showTuDoCategorySelector();
}

function showTuDoCategorySelector() {
    els.questionText.textContent = '';
    els.questionCategory.innerHTML = '';
    els.categorySelector.classList.remove('hidden');
    els.answerArea.classList.add('hidden');
    els.resultFeedback.classList.add('hidden');
    els.timerContainer.style.visibility = 'hidden';
    els.questionCounter.classList.add('hidden');
}

async function selectTuDoCategory(category) {
    state.tudoCategory = category;
    state.currentQuestion++;

    els.categorySelector.classList.add('hidden');
    els.answerArea.classList.remove('hidden');
    els.timerContainer.style.visibility = 'visible';
    els.questionCounter.classList.remove('hidden');
    els.currentQ.textContent = state.currentQuestion;

    showLoading(true);

    let q;
    try {
        q = await generateTuDoQuestion(category);
    } catch (err) {
        console.warn('AI generation failed for TuDo, using backup:', err);
        showToast('💡 Đang dùng câu hỏi tự do chuẩn (do AI tạm hết lượt hôm nay)');
        q = getBackupTuDo(category);
    }

    state.currentAnswer = q.answer;
    state.questions.push(q);
    state.isAnswering = true;
    state.questionStartTime = Date.now();

    showLoading(false);

    els.questionCategory.innerHTML = `<span class="category-badge">📘 ${q.category}</span>`;
    els.questionText.textContent = q.question;

    resetAnswerArea();
    startTimer(60, null, () => handleTimeUp());
}

// ===================== ANSWER HANDLING =====================
function resetAnswerArea() {
    els.answerArea.classList.remove('hidden');
    els.answerInput.value = '';
    els.answerInput.disabled = false;
    els.submitAnswer.disabled = false;
    els.resultFeedback.classList.add('hidden');
    els.resultFeedback.classList.remove('correct', 'incorrect');
    els.answerInput.focus();
}

function checkAnswerLocal(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    const normUser = normalizeText(userAnswer);
    if (!normUser) return false;

    // Tách các phương án trả lời tương đương từ dấu ngoặc đơn, gạch chéo, hoặc dấu phẩy
    const parts = correctAnswer
        .replace(/[\(\)]/g, '/')
        .split(/[\/,]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const candidates = [correctAnswer, ...parts];

    // Bổ sung các phiên bản đã loại bỏ từ xưng hô, tiền tố phổ biến
    function stripPrefix(norm) {
        return norm.replace(/^(so|chu|ngay|thang|nam|huyen|tinh|thanhpho|vua|daituong|nhatho|nhavan)/, '');
    }

    const numWords = { 'khong': '0', 'mot': '1', 'hai': '2', 'ba': '3', 'bon': '4', 'tu': '4', 'nam': '5', 'sau': '6', 'bay': '7', 'tam': '8', 'chin': '9', 'muoi': '10' };

    for (const cand of candidates) {
        const normCand = normalizeText(cand);
        if (!normCand) continue;

        if (normUser === normCand) return true;

        // So khớp số và chữ số (ví dụ: 'hai' <-> '2', 'Số 2' <-> '2')
        const uStripped = stripPrefix(normUser);
        const cStripped = stripPrefix(normCand);
        const uNum = numWords[uStripped] || uStripped;
        const cNum = numWords[cStripped] || cStripped;
        if (uNum && cNum && uNum === cNum) return true;

        // So khớp bao hàm hợp lý (chênh lệch độ dài không quá lớn)
        if (normUser.includes(normCand) || normCand.includes(normUser)) {
            if (Math.abs(normUser.length - normCand.length) <= 10) return true;
        }
    }

    return false;
}

async function submitAnswerHandler() {
    if (!state.isAnswering) return;

    const userAnswer = els.answerInput.value.trim();
    if (!userAnswer) {
        els.answerInput.classList.add('shake');
        setTimeout(() => els.answerInput.classList.remove('shake'), 400);
        return;
    }

    state.isAnswering = false;
    stopTimer();

    const timeTaken = (Date.now() - state.questionStartTime) / 1000;
    state.roundTimes.push(timeTaken);

    els.answerInput.disabled = true;
    els.submitAnswer.disabled = true;

    const currentQ = state.questions[state.currentQuestion] || state.questions[state.questions.length - 1];

    // Smart local match: Instant answer check, zero lag, saves 95% of API quota!
    if (checkAnswerLocal(userAnswer, state.currentAnswer)) {
        showResult(true, 'Chính xác! 🎉', currentQ);
        return;
    }

    // If local match is not exact, ask AI quietly if available
    try {
        const result = await checkAnswer(userAnswer, state.currentAnswer, currentQ.question);
        showResult(result.correct, result.feedback || (result.correct ? 'Chính xác!' : `Đáp án đúng: ${state.currentAnswer}`), currentQ);
    } catch (err) {
        // In case AI quota is exhausted or offline:
        showResult(false, `Đáp án đúng: ${state.currentAnswer}`, currentQ);
    }
}

function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function showResult(isCorrect, feedback, question) {
    const fb = els.resultFeedback;
    fb.classList.remove('hidden', 'correct', 'incorrect');

    if (isCorrect) {
        playSound('correct');
        fb.classList.add('correct');
        els.resultIcon.textContent = '✅';

        // Score calculation
        let points = 0;
        switch (state.currentRound) {
            case 'khoidong': points = 10; break;
            case 'chuongnvaivat':
                points = Math.max(20, 80 - (state.cnvHintsRevealed - 1) * 20);
                break;
            case 'tangtoc': points = 30; break;
            case 'vedich':
                // Đúng thể lệ Olympia: Ngôi sao hy vọng nhân đôi giá trị câu hỏi (+2x), không có thì +1x
                points = state.vedichCurrentStar ? (state.vedichCurrentPoints * 2) : state.vedichCurrentPoints;
                break;
            case 'tudo': points = 10; break;
        }

        if (state.currentRound === 'vedich' && state.vedichCurrentStar) {
            els.resultMessage.textContent = `Chính xác! 🌟 Ngôi Sao Hy Vọng nhân đôi (+${points} điểm)! 🎉`;
        } else {
            els.resultMessage.textContent = 'Chính xác! 🎉';
        }

        state.roundScore += points;
        state.totalScore += points;
        state.roundCorrect++;
        state.totalCorrect++;
        state.streak++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;

        els.roundScore.textContent = state.roundScore;
        els.roundScore.classList.add('score-pop');
        setTimeout(() => els.roundScore.classList.remove('score-pop'), 300);

    } else {
        playSound('incorrect');
        fb.classList.add('incorrect');
        els.resultIcon.textContent = '❌';
        els.resultMessage.textContent = 'Chưa chính xác!';
        state.streak = 0;

        // Đúng thể lệ Olympia: Chỉ trừ điểm khi có Ngôi sao hy vọng (-1x giá trị câu), không có thì không trừ
        if (state.currentRound === 'vedich') {
            if (state.vedichCurrentStar) {
                state.roundScore -= state.vedichCurrentPoints;
                state.totalScore -= state.vedichCurrentPoints;
                els.roundScore.textContent = state.roundScore;
                els.resultMessage.textContent = `Chưa chính xác! 💔 Ngôi sao hy vọng: Trừ ${state.vedichCurrentPoints} điểm!`;
            } else {
                els.resultMessage.textContent = 'Chưa chính xác! (Không bị trừ điểm)';
            }
        }
    }

    state.totalQuestions++;
    updateStats();
    saveStats();

    els.resultAnswer.innerHTML = `Đáp án: <strong>${state.currentAnswer}</strong>`;

    const explanation = question?.explanation || '';
    els.resultExplanation.textContent = feedback ? `${feedback}\n\n${explanation}` : explanation;

    // Determine next button text
    if (state.currentRound === 'vedich') {
        if (state.vedichQuestionIndex >= 3) {
            els.nextQuestion.textContent = 'Xem kết quả →';
        } else {
            els.nextQuestion.textContent = 'Chọn câu tiếp theo →';
        }
    } else if (state.currentRound === 'tudo') {
        els.nextQuestion.textContent = 'Câu tiếp theo →';
    } else if (state.currentRound === 'chuongnvaivat') {
        els.nextQuestion.textContent = 'Xem kết quả →';
    } else {
        const remaining = state.questions.length - state.currentQuestion - 1;
        els.nextQuestion.textContent = remaining > 0 ? 'Câu tiếp theo →' : 'Xem kết quả →';
    }
}

function handleTimeUp() {
    if (!state.isAnswering) return;
    state.isAnswering = false;

    const currentQ = state.questions[state.currentQuestion] || state.questions[state.questions.length - 1];

    els.answerInput.disabled = true;
    els.submitAnswer.disabled = true;

    state.totalQuestions++;
    state.streak = 0;

    // Đúng thể lệ Olympia: Hết giờ chỉ trừ điểm khi có Ngôi sao hy vọng
    if (state.currentRound === 'vedich') {
        if (state.vedichCurrentStar) {
            state.roundScore -= state.vedichCurrentPoints;
            state.totalScore -= state.vedichCurrentPoints;
            els.roundScore.textContent = state.roundScore;
        }
    }

    updateStats();
    saveStats();

    const fb = els.resultFeedback;
    fb.classList.remove('hidden', 'correct', 'incorrect');
    fb.classList.add('incorrect');
    els.resultIcon.textContent = '⏰';

    if (state.currentRound === 'vedich') {
        if (state.vedichCurrentStar) {
            els.resultMessage.textContent = `Hết giờ! 💔 Ngôi sao hy vọng: Trừ ${state.vedichCurrentPoints} điểm!`;
        } else {
            els.resultMessage.textContent = 'Hết giờ! (Không bị trừ điểm)';
        }
    } else {
        els.resultMessage.textContent = 'Hết giờ!';
    }

    els.resultAnswer.innerHTML = `Đáp án: <strong>${state.currentAnswer}</strong>`;
    els.resultExplanation.textContent = currentQ?.explanation || '';

    // Next button
    if (state.currentRound === 'vedich') {
        els.nextQuestion.textContent = state.vedichQuestionIndex >= 3 ? 'Xem kết quả →' : 'Chọn câu tiếp theo →';
    } else if (state.currentRound === 'tudo') {
        els.nextQuestion.textContent = 'Câu tiếp theo →';
    } else if (state.currentRound === 'chuongnvaivat') {
        els.nextQuestion.textContent = 'Xem kết quả →';
    } else {
        const remaining = state.questions.length - state.currentQuestion - 1;
        els.nextQuestion.textContent = remaining > 0 ? 'Câu tiếp theo →' : 'Xem kết quả →';
    }
}

function nextQuestionHandler() {
    els.resultFeedback.classList.add('hidden');

    switch (state.currentRound) {
        case 'khoidong':
            state.currentQuestion++;
            if (state.currentQuestion >= state.questions.length) {
                endRound();
            } else {
                showKhoiDongQuestion();
            }
            break;

        case 'chuongnvaivat':
            endRound();
            break;

        case 'tangtoc':
            state.currentQuestion++;
            if (state.currentQuestion >= state.questions.length) {
                endRound();
            } else {
                showTangTocQuestion();
            }
            break;

        case 'vedich':
            if (state.vedichQuestionIndex >= 3) {
                endRound();
            } else {
                showVeDichPackageSelector();
            }
            break;

        case 'tudo':
            showTuDoCategorySelector();
            break;
    }
}

// ===================== END ROUND =====================
function endRound() {
    stopTimer();
    stopCnvTimers();

    let totalQ = state.currentRound === 'chuongnvaivat' ? (state.cnvRowsCount > 0 ? state.cnvRowsCount : 1) :
        state.currentRound === 'vedich' ? 3 :
            state.currentQuestion + (state.currentRound === 'tudo' ? 0 : 1);

    let accuracy = 0;
    if (state.currentRound === 'chuongnvaivat') {
        accuracy = (state.cnvGuessedObstacle && !state.cnvEliminated) ? 100 : Math.round((state.roundScore / 70) * 100);
    } else {
        accuracy = totalQ > 0 ? Math.round((state.roundCorrect / totalQ) * 100) : 0;
    }

    const avgTime = state.roundTimes.length > 0
        ? (state.roundTimes.reduce((a, b) => a + b, 0) / state.roundTimes.length).toFixed(1)
        : 0;

    // Results screen
    if (accuracy >= 80) {
        els.resultsIcon.textContent = '🏆';
        els.resultsTitle.textContent = 'Xuất sắc!';
    } else if (accuracy >= 50) {
        els.resultsIcon.textContent = '👏';
        els.resultsTitle.textContent = 'Khá tốt!';
    } else {
        els.resultsIcon.textContent = '💪';
        els.resultsTitle.textContent = 'Cố gắng thêm!';
    }

    els.resultsScoreValue.textContent = state.roundScore;

    if (state.currentRound === 'chuongnvaivat') {
        const correctRows = Object.values(state.cnvRowStates).filter(s => s === 'correct').length;
        const guessedCnv = (state.cnvGuessedObstacle && !state.cnvEliminated) ? ' + CNV' : '';
        els.resultsCorrect.textContent = `${correctRows} hàng${guessedCnv}`;
    } else {
        els.resultsCorrect.textContent = `${state.roundCorrect}/${totalQ}`;
    }

    els.resultsAccuracy.textContent = accuracy + '%';
    els.resultsAvgTime.textContent = avgTime + 's';

    // Animate progress circle
    const circumference = 2 * Math.PI * 85;
    els.resultsProgress.style.strokeDasharray = circumference;
    els.resultsProgress.style.strokeDashoffset = circumference;

    showScreen('resultsScreen');

    setTimeout(() => {
        const offset = circumference - (circumference * accuracy / 100);
        els.resultsProgress.style.strokeDashoffset = offset;
    }, 300);

    // Confetti for good results
    if (accuracy >= 50) {
        createConfetti();
    }
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f5af19', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 8 + 4) + 'px';
            confetti.style.height = (Math.random() * 8 + 4) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ===================== LOADING =====================
function showLoading(show) {
    if (show) {
        els.loadingOverlay.classList.remove('hidden');
    } else {
        els.loadingOverlay.classList.add('hidden');
    }
}

// ===================== GATEKEEPER VERIFICATION LOGIC (REQUIREMENT 2) =====================
function initGatekeeper() {
    const screen = els.gatekeeperScreen || document.getElementById('gatekeeperScreen');
    const appEl = els.app || document.getElementById('app');
    const yesBtn = els.gatekeeperYes || document.getElementById('gatekeeperYes');
    const noBtn = els.gatekeeperNo || document.getElementById('gatekeeperNo');
    const feedback = els.gatekeeperFeedback || document.getElementById('gatekeeperFeedback');
    const fbIcon = els.gatekeeperFbIcon || document.getElementById('gatekeeperFbIcon');
    const fbText = els.gatekeeperFbText || document.getElementById('gatekeeperFbText');
    const card = screen ? screen.querySelector('.gatekeeper-card') : null;

    if (!screen || !appEl || !yesBtn || !noBtn) return;

    // Yêu cầu: Vừa vào web đầu tiên luôn hiện câu hỏi "Vĩnh An có đẹp trai không?"
    // Trắc nghiệm 2 đáp án CÓ và KHÔNG, chỉ khi chọn CÓ mới được cấp quyền vào web!
    screen.style.display = 'flex';
    screen.classList.remove('fade-out');
    appEl.classList.add('app-hidden');
    appEl.classList.remove('app-visible');

    let wrongClickCount = 0;
    const funnyWrongResponses = [
        { text: 'Ơ kìa! Nhìn kỹ lại đi mà, đẹp trai ngời ngời thế cơ mà! 🥺😜', emoji: '🤨' },
        { text: 'Máy phát hiện bạn đang nói dối cấp độ 999! Bấm CÓ để cứu vãn nha! 🚨🤣', emoji: '🙈' },
        { text: 'Đáp án KHÔNG không tồn tại trong từ điển này đâu bạn ơi! 🙅‍♂️💖', emoji: '❌' },
        { text: 'Vĩnh An chuẩn soái ca học đường! Mau bấm CÓ để vào web thi Olympia nhé! 😍👉👈', emoji: '🧐' },
        { text: 'Cố tình bấm KHÔNG à? Cổng web bị khóa chặt rồi nhe, chọn CÓ ngay! 😜🔒', emoji: '🚫' }
    ];

    noBtn.addEventListener('mouseenter', () => {
        if (wrongClickCount >= 1) {
            noBtn.classList.add('dodge');
            setTimeout(() => noBtn.classList.remove('dodge'), 600);
        }
    });

    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        wrongClickCount++;
        playSound('wrong');

        if (card) {
            card.classList.remove('shake-card');
            void card.offsetWidth; // Trigger DOM reflow
            card.classList.add('shake-card');
        }

        const resp = funnyWrongResponses[(wrongClickCount - 1) % funnyWrongResponses.length];
        if (feedback && fbIcon && fbText) {
            feedback.classList.remove('hidden', 'success');
            feedback.classList.add('error');
            fbIcon.textContent = resp.emoji;
            fbText.textContent = resp.text;
        }

        showToast('⚠️ Bạn chưa được cấp quyền truy cập! Phải trả lời CÓ mới được vào web! 😜', 3200);
    });

    yesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playSound('victory');
        createConfetti();

        if (feedback && fbIcon && fbText) {
            feedback.classList.remove('hidden', 'error');
            feedback.classList.add('success');
            fbIcon.textContent = '🎉';
            fbText.textContent = 'Chính xác 100%! Bạn có con mắt tinh tường và gu thẩm mỹ đỉnh cao! Chào mừng vào Olympia! 😍👑';
        }

        yesBtn.style.transform = 'scale(1.08)';
        sessionStorage.setItem('olympia_gatekeeper_passed', 'true');

        setTimeout(() => {
            screen.classList.add('fade-out');
            appEl.classList.remove('app-hidden');
            appEl.classList.add('app-visible');

            setTimeout(() => {
                screen.style.display = 'none';
                showToast('🚀 Chào mừng bạn đến với Đấu trường Đường Lên Đỉnh Olympia! ✨', 4000);
            }, 500);
        }, 1100);
    });
}

// ===================== EVENT LISTENERS =====================
function initEventListeners() {

    // Settings Modal Open
    els.settingsBtn.addEventListener('click', () => {
        els.soundToggle.checked = state.soundEnabled;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.diff-btn[data-diff="${state.difficulty}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        updateApiStatusUI();
        updateBankProgressUI();
        els.settingsModal.classList.add('active');
    });

    els.closeSettings.addEventListener('click', () => {
        els.settingsModal.classList.remove('active');
    });

    // API Status Pill on Home click opens settings
    if (els.apiStatusPill) {
        els.apiStatusPill.addEventListener('click', () => {
            els.settingsBtn.click();
        });
    }

    // Reset Bank History button
    if (els.resetBankHistoryBtn) {
        els.resetBankHistoryBtn.addEventListener('click', () => {
            resetBankHistory();
        });
    }

    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.difficulty = btn.dataset.diff;
        });
    });

    // Save Settings
    els.saveSettings.addEventListener('click', () => {
        state.soundEnabled = els.soundToggle.checked;
        localStorage.setItem('olympia_sound', state.soundEnabled);
        localStorage.setItem('olympia_difficulty', state.difficulty);

        els.settingsModal.classList.remove('active');
        showToast('💾 Đã lưu cấu hình Cài đặt thành công! ✨', 3000);
    });

    // Reset score listeners
    if (els.headerResetBtn) {
        els.headerResetBtn.addEventListener('click', openResetModal);
    }
    if (els.settingsResetBtn) {
        els.settingsResetBtn.addEventListener('click', openResetModal);
    }
    if (els.closeResetModal) {
        els.closeResetModal.addEventListener('click', closeResetModal);
    }
    if (els.cancelResetModalBtn) {
        els.cancelResetModalBtn.addEventListener('click', closeResetModal);
    }
    if (els.resetScoreOnlyBtn) {
        els.resetScoreOnlyBtn.addEventListener('click', resetScoreOnly);
    }
    if (els.resetAllStatsBtn) {
        els.resetAllStatsBtn.addEventListener('click', resetAllStats);
    }
    if (els.resetModal) {
        els.resetModal.addEventListener('click', (e) => {
            if (e.target === els.resetModal) closeResetModal();
        });
    }

    // Logo - go home
    els.logoBtn.addEventListener('click', () => {
        stopTimer();
        stopCnvTimers();
        showScreen('homeScreen');
        updateStats();
        updateBankProgressUI();
    });

    // Round cards
    document.querySelectorAll('.round-card').forEach(card => {
        card.addEventListener('click', () => {
            const round = card.dataset.round;
            switch (round) {
                case 'khoidong': startKhoiDong(); break;
                case 'chuongnvaivat': startCNV(); break;
                case 'tangtoc': startTangToc(); break;
                case 'vedich': startVeDich(); break;
                case 'tudo': startTuDo(); break;
            }
        });
    });

    // Answer submission
    els.submitAnswer.addEventListener('click', submitAnswerHandler);
    els.answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitAnswerHandler();
    });

    // Next question
    els.nextQuestion.addEventListener('click', nextQuestionHandler);

    // Back button
    els.backBtn.addEventListener('click', () => {
        stopTimer();
        stopCnvTimers();
        state.isAnswering = false;
        showScreen('homeScreen');
        updateStats();
        updateBankProgressUI();
    });

    // VeDich package buttons
    [10, 20, 30].forEach(p => {
        const pkgEl = document.getElementById(`pkg${p}`);
        if (pkgEl) {
            pkgEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectVeDichPackage(p);
            });
        }
    });

    // VeDich Hope Star button
    if (els.hopeStarBtn) {
        els.hopeStarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHopeStar();
        });
    }

    // TuDo category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTuDoCategory(btn.dataset.category);
        });
    });

    // Results screen buttons
    els.playAgainBtn.addEventListener('click', () => {
        if (state.currentRound) {
            switch (state.currentRound) {
                case 'khoidong': startKhoiDong(); break;
                case 'chuongnvaivat': startCNV(); break;
                case 'tangtoc': startTangToc(); break;
                case 'vedich': startVeDich(); break;
                case 'tudo': startTuDo(); break;
            }
        }
    });

    els.goHomeBtn.addEventListener('click', () => {
        stopCnvTimers();
        showScreen('homeScreen');
        updateStats();
        updateBankProgressUI();
    });

    // CNV Round Listeners
    if (els.cnvBuzzerBtn) {
        els.cnvBuzzerBtn.addEventListener('click', openCnvBuzzerModal);
    }
    if (els.cnvCancelBuzzerBtn) {
        els.cnvCancelBuzzerBtn.addEventListener('click', closeCnvBuzzerModal);
    }
    if (els.cnvConfirmBuzzerBtn) {
        els.cnvConfirmBuzzerBtn.addEventListener('click', () => confirmCnvBuzzerAnswer(false));
    }
    if (els.cnvBuzzerInput) {
        els.cnvBuzzerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmCnvBuzzerAnswer(false);
        });
    }
    if (els.cnvRowSubmitBtn) {
        els.cnvRowSubmitBtn.addEventListener('click', () => submitCnvRowAnswer(false));
    }
    if (els.cnvRowInput) {
        els.cnvRowInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitCnvRowAnswer(false);
        });
    }
    if (els.cnvRowContinueBtn) {
        els.cnvRowContinueBtn.addEventListener('click', continueAfterCnvRow);
    }
    if (els.cnvOutcomeNextBtn) {
        els.cnvOutcomeNextBtn.addEventListener('click', handleCnvOutcomeNext);
    }
    if (els.cnvBuzzerModal) {
        els.cnvBuzzerModal.addEventListener('click', (e) => {
            if (e.target === els.cnvBuzzerModal) closeCnvBuzzerModal();
        });
    }

    // Click outside modal to close
    els.settingsModal.addEventListener('click', (e) => {
        if (e.target === els.settingsModal) {
            els.settingsModal.classList.remove('active');
        }
    });
}

// ===================== INIT =====================
function init() {
    initGatekeeper();
    initParticles();
    initEventListeners();
    updateStats();
    updateBankProgressUI();
    updateApiStatusUI();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
