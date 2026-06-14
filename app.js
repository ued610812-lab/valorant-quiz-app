let currentCategory = "";
let difficulty = "";
let questionCount = 0;

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function startCategory(cat) {
    currentCategory = cat;
    document.getElementById("categoryTitle").innerText = 
        cat === "tactics" ? "戦術判断クイズ" :
        cat === "agent" ? "エージェント知識クイズ" :
        "マップ別クイズ";

    showScreen("select");
}

function setDifficulty(level) {
    difficulty = level;
}

function setCount(count) {
    questionCount = count;
}

function startQuiz() {
    // ここで問題をロードする（後でAI生成と連携）
    showScreen("quiz");
    loadQuestion();
}

function loadQuestion() {
    document.getElementById("questionBox").innerText = "問題文がここに入る";
    document.getElementById("choices").innerHTML = `
        <div class="choice" onclick="answer(1)">選択肢1</div>
        <div class="choice" onclick="answer(2)">選択肢2</div>
        <div class="choice" onclick="answer(3)">選択肢3</div>
        <div class="choice" onclick="answer(4)">選択肢4</div>
    `;
}

function answer(num) {
    document.getElementById("judge").innerText = "正解！";
    document.getElementById("explanation").innerText = "ここに解説が入る";
    showScreen("result");
}

function nextQuestion() {
    loadQuestion();
    showScreen("quiz");
}

function restart() {
    showScreen("home");
}

function goHome() {
    showScreen("home");
}
