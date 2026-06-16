// =========================
// 配列シャッフル
// =========================
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// =========================
// 画面切り替え
// =========================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// =========================
// ボタンイベント
// =========================
document.getElementById("start-btn").onclick = () => {
  showScreen("select-count-screen");
};

document.querySelectorAll(".count-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const count = btn.dataset.count;
    startQuiz(count);
  });
});

document.querySelectorAll(".home-icon-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showScreen("home-screen");
  });
});

// =========================
// クイズ用変数
// =========================
let questions = [];
let quizPool = [];
let currentIndex = 0;
let totalQuestions = 0;
let answered = false;

// =========================
// ランクデータ
// =========================
const rankData = [
  { name: "アイアン",     min: 0,   max: 99,  icon: "icons/iron.webp" },
  { name: "ブロンズ",     min: 100, max: 199, icon: "icons/bronze.webp" },
  { name: "シルバー",     min: 200, max: 299, icon: "icons/silver.webp" },
  { name: "ゴールド",     min: 300, max: 399, icon: "icons/gold.webp" },
  { name: "プラチナ",     min: 400, max: 499, icon: "icons/platinum.webp" },
  { name: "ダイヤ",       min: 500, max: 599, icon: "icons/diamond.webp" },
  { name: "アセンダント", min: 600, max: 699, icon: "icons/ascendant.webp" },
  { name: "イモータル",   min: 700, max: 899, icon: "icons/immortal.webp" },
  { name: "レディアント", min: 900, max: 1000, icon: "icons/radiant.webp" }
];

function getRankInfo(rr) {
  return rankData.find(r => rr >= r.min && rr <= r.max);
}

// =========================
// タイトル辞書
// =========================
const noteTitles = {
  "skill_usage": "スキルの考え方",
  "skill_usage_note": "スキルの考え方",
  "lurk_note": "ラークをする時、私には３つの人格が宿るのだ"
};

// =========================
// 質問ロード（GitHub Pages対応）
// =========================
async function loadQuestions() {
  const res = await fetch("./questions.json");  // ← ここが最重要
  questions = await res.json();
  shuffle(questions);
}

// =========================
// クイズ開始
// =========================
function startQuiz(count) {
  if (questions.length === 0) {
    alert("問題データを読み込み中です。少し待ってください。");
    return;
  }

  const shuffled = shuffle([...questions]);

  quizPool = (count === "all")
    ? shuffled
    : shuffled.slice(0, Number(count));

  totalQuestions = quizPool.length;
  currentIndex = 0;

  showScreen("quiz-screen");
  showQuestion();
}

// =========================
// 問題表示
// =========================
function showQuestion() {
  answered = false;

  const q = quizPool[currentIndex];

  document.getElementById("quiz-title").textContent =
    noteTitles[q.source] || "VALORANT 戦術クイズ";

  document.getElementById("progress").textContent =
    `問題 ${currentIndex + 1} / ${totalQuestions}`;

  document.getElementById("questionText").textContent = q.situation;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement("div");
    btn.className = "choice";
    btn.textContent = `${idx + 1}. ${choice}`;
    btn.onclick = () => checkAnswer(idx + 1);
    choicesEl.appendChild(btn);
  });

  document.getElementById("judge").textContent = "";
  const exp = document.getElementById("explanation");
  exp.style.display = "none";
  exp.innerHTML = "";
}

// =========================
// RR計算
// =========================
let rr = 0;
let streak = 0;

function applyRR(isCorrect) {
  rr += isCorrect ? 20 : -20;
  rr = Math.max(0, Math.min(rr, 1000));

  saveRR(); // ← これが超重要
}

// =========================
// RRバー更新
// =========================
function updateRRBar() {
  const rank = getRankInfo(rr);
  if (!rank) return;

  const current = rr - rank.min;
  const max = rank.max - rank.min;
  const percent = (current / max) * 100;

  document.getElementById("rr-fill").style.width = percent + "%";
  document.getElementById("rank-icon").src = rank.icon;
  document.getElementById("rank-name").textContent = rank.name;
}

// =========================
// ランク変動演出
// =========================
function playRankUpAnimation(newRank) {
  const anim = document.createElement("div");
  anim.className = "rank-up-anim";
  anim.innerHTML = `RANK UP!<br>${newRank}`;
  document.body.appendChild(anim);
  setTimeout(() => anim.remove(), 5000);
}

function playRankDownAnimation(newRank) {
  const anim = document.createElement("div");
  anim.className = "rank-down-anim";
  anim.innerHTML = `RANK DOWN...<br>${newRank}`;
  document.body.appendChild(anim);
  setTimeout(() => anim.remove(), 5000);
}

let previousRank = getRankInfo(rr).name;

function checkRankChange() {
  const currentRankInfo = getRankInfo(rr);
  if (!currentRankInfo) return;

  const currentRank = currentRankInfo.name;

  const prevIndex = rankData.findIndex(r => r.name === previousRank);
  const currIndex = rankData.findIndex(r => r.name === currentRank);

  if (currIndex > prevIndex) playRankUpAnimation(currentRank);
  else if (currIndex < prevIndex) playRankDownAnimation(currentRank);

  previousRank = currentRank;
}

// =========================
// 回答処理
// =========================
function checkAnswer(selected) {
  if (answered) return;
  answered = true;

  const q = quizPool[currentIndex];
  const isCorrect = selected === q.answer;

  document.querySelectorAll(".choice").forEach(c => c.classList.remove("active"));
  document.querySelectorAll(".choice")[selected - 1].classList.add("active");

  applyRR(isCorrect);

  document.getElementById("judge").innerHTML =
    isCorrect ? `✅ 正解！ (+20RR)` : `❌ 不正解… (-20RR)`;

  const exp = document.getElementById("explanation");
  exp.style.display = "block";
  exp.innerHTML = q.explanation;

  updateRRBar();
  checkRankChange();
}

// =========================
// 次へ
// =========================
document.getElementById("next-btn").onclick = () => {
  if (!answered) {
    document.getElementById("judge").textContent = "※ 回答してください";
    return;
  }

  currentIndex++;

  if (currentIndex >= totalQuestions) {
    const rank = getRankInfo(rr);

    document.getElementById("result-rr").textContent = `最終RR：${rr}`;
    document.getElementById("result-rank").textContent =
      `ランク：${rank ? rank.name : "不明"}`;

    showScreen("result-screen");
  } else {
    showQuestion();
  }
};

// =========================
// ホームへ戻る
// =========================
document.getElementById("back-home-btn").onclick = () => {
  showScreen("home-screen");
};

// =========================
// RR保存
// =========================
function saveRR() {
  localStorage.setItem("valorant_rr", rr);
}

function loadRR() {
  const saved = localStorage.getItem("valorant_rr");
  if (saved !== null) rr = Number(saved);
}

// =========================
// 初期ロード（GitHub Pages対応）
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  await loadQuestions();
  loadRR();
  updateRRBar();

  document.getElementById("start-btn").disabled = false;

  saveRR();

  // ★ note 一覧を表示
  renderNoteList();
});


function renderNoteList() {
  const listEl = document.getElementById("note-list");
  listEl.innerHTML = "<h3>参照した note 一覧</h3>";

  const ul = document.createElement("ul");

  // 重複タイトルをまとめる（同じ note が複数 source にあるため）
  const uniqueTitles = [...new Set(Object.values(noteTitles))];

  uniqueTitles.forEach(title => {
    const li = document.createElement("li");
    li.textContent = title;
    ul.appendChild(li);
  });

  listEl.appendChild(ul);
}