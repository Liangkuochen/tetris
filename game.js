const WORDS = {
  A: [
    ["apple","蘋果","n."],["animal","動物","n."],["answer","答案","n."],["angry","生氣的","adj."],["afraid","害怕的","adj."],
    ["airport","機場","n."],["autumn","秋天","n."],["always","總是","adv."],["arrive","到達","v."],["around","在附近；大約","prep./adv."]
  ],
  B: [
    ["book","書","n."],["beautiful","美麗的","adj."],["begin","開始","v."],["brother","兄弟","n."],["busy","忙碌的","adj."],
    ["birthday","生日","n."],["because","因為","conj."],["bring","帶來","v."],["breakfast","早餐","n."],["bridge","橋","n."]
  ],
  C: [
    ["cat","貓","n."],["class","課堂；班級","n."],["clever","聰明的","adj."],["clean","乾淨的","adj./v."],["close","關閉；靠近","v./adj."],
    ["country","國家；鄉村","n."],["careful","小心的","adj."],["choose","選擇","v."],["Christmas","聖誕節","n."],["carry","攜帶","v."]
  ],
  D: [
    ["dog","狗","n."],["dance","跳舞","v./n."],["dangerous","危險的","adj."],["different","不同的","adj."],["difficult","困難的","adj."],
    ["doctor","醫生","n."],["dream","夢；夢想","n./v."],["drink","喝；飲料","v./n."],["during","在……期間","prep."],["dirty","髒的","adj."]
  ],
  E: [
    ["egg","蛋","n."],["easy","容易的","adj."],["early","早的；早地","adj./adv."],["enjoy","享受；喜歡","v."],["elephant","大象","n."],
    ["evening","傍晚；晚上","n."],["excited","興奮的","adj."],["exercise","運動；練習","n./v."],["expensive","昂貴的","adj."],["example","例子","n."]
  ],
  F: [
    ["family","家庭","n."],["friend","朋友","n."],["favorite","最喜愛的","adj./n."],["famous","著名的","adj."],["finish","完成","v."],
    ["flower","花","n."],["forest","森林","n."],["football","足球","n."],["forget","忘記","v."],["future","未來","n."]
  ]
};

const LEVELS = [
  { name:"第一關｜中文 → 英文", type:"zh-en", theme:"level1", label:"看中文，選英文" },
  { name:"第二關｜英文 → 中文", type:"en-zh", theme:"level2", label:"看英文，選中文" },
  { name:"第三關｜英文 → 詞性", type:"pos", theme:"level3", label:"看英文，選詞性" },
  { name:"第四關｜聽發音 → 英文", type:"sound", theme:"level4", label:"聽聲音，選英文" },
  { name:"第五關｜中文 → 拼字", type:"spell", theme:"level5", label:"看中文，依字母數拼英文" }
];

let state = {
  letter: null, level: 0, questions: [], index: 0, score: 0, levelScore: 0, answered: false
};

const $ = id => document.getElementById(id);
const screens = { start:$("start-screen"), game:$("game-screen"), level:$("level-screen") };

function showScreen(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function initLetters() {
  $("letter-buttons").innerHTML = Object.keys(WORDS).map(letter =>
    `<button class="letter-btn" onclick="startGame('${letter}')">${letter}<small style="display:block;font-size:12px;opacity:.8">10 words</small></button>`
  ).join("");
}

function startGame(letter, level = 0) {
  state.letter = letter;
  state.level = level;
  state.questions = shuffle(WORDS[letter]);
  state.index = 0;
  state.score = 0;
  state.levelScore = 0;
  state.answered = false;
  applyTheme();
  showScreen(screens.game);
  renderQuestion();
}

function applyTheme() {
  const backgrounds = {
    level1:"linear-gradient(135deg,#ff9966,#ff5e62)",
    level2:"linear-gradient(135deg,#56ccf2,#2f80ed)",
    level3:"linear-gradient(135deg,#11998e,#38ef7d)",
    level4:"linear-gradient(135deg,#654ea3,#eaafc8)",
    level5:"linear-gradient(135deg,#f7971e,#ffd200)"
  };
  $("game-screen").style.setProperty("--level-bg", backgrounds[LEVELS[state.level].theme]);
}

function renderQuestion() {
  state.answered = false;
  const word = state.questions[state.index];
  const [en, zh, pos] = word;
  const level = LEVELS[state.level];

  $("level-name").textContent = level.name;
  $("progress-text").textContent = `${state.index + 1} / 10`;
  $("score-badge").textContent = `${state.score} 分`;
  $("progress-bar").style.width = `${((state.index + 1) / 10) * 100}%`;
  $("question-type").textContent = level.label;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("next-btn").classList.add("hidden");
  $("speak-btn").classList.add("hidden");

  if (level.type === "zh-en") renderChoiceQuestion(zh, en, "en");
  if (level.type === "en-zh") renderChoiceQuestion(en, zh, "zh");
  if (level.type === "pos") renderPosQuestion(en, pos);
  if (level.type === "sound") renderSoundQuestion(en);
  if (level.type === "spell") renderSpellQuestion(zh, en);
}

function getDistractors(correct, field) {
  const all = WORDS[state.letter].map(w => w[field]);
  return shuffle([...new Set(all.filter(x => x !== correct))]).slice(0, 3);
}

function renderChoiceQuestion(question, correct, lang) {
  $("question").textContent = question;
  const opts = shuffle([correct, ...getDistractors(correct, lang === "en" ? 0 : 1)]);
  $("answer-area").innerHTML = `<div class="options">${opts.map(x =>
    `<button class="option-btn" data-answer="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join("")}</div>`;
  bindChoiceButtons(correct);
}

function renderPosQuestion(en, correct) {
  $("question").textContent = en;
  const opts = shuffle(["n.","v.","adj.","adv."]);
  $("answer-area").innerHTML = `<div class="options">${opts.map(x =>
    `<button class="option-btn" data-answer="${x}">${x}</button>`).join("")}</div>`;
  bindChoiceButtons(correct);
}

function renderSoundQuestion(en) {
  $("question").textContent = "🔊";
  $("speak-btn").classList.remove("hidden");
  $("answer-area").innerHTML = `<div class="options">${shuffle([en, ...getDistractors(en,0)]).map(x =>
    `<button class="option-btn" data-answer="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join("")}</div>`;
  $("speak-btn").onclick = () => speakWord(en);
  bindChoiceButtons(en);
  setTimeout(() => speakWord(en), 350);
}

function renderSpellQuestion(zh, en) {
  $("question").innerHTML = `${escapeHtml(zh)}<div style="font-size:18px;margin-top:12px;font-weight:700">請輸入 ${en.length} 個英文字母</div>`;
  $("answer-area").innerHTML = `
    <input id="spell-input" autocomplete="off" autocapitalize="none" spellcheck="false"
      maxlength="${en.length}" placeholder="輸入 ${en.length} 個字母"
      style="width:100%;font-size:28px;text-align:center;padding:15px;border:2px solid #dfe3ed;border-radius:16px;outline:none">
    <button id="spell-submit" class="next-btn" style="margin-top:14px">送出答案</button>`;
  $("spell-submit").onclick = () => checkAnswer(en, $("spell-input").value.trim().toLowerCase());
  $("spell-input").addEventListener("keydown", e => {
    if (e.key === "Enter") $("spell-submit").click();
  });
  setTimeout(() => $("spell-input").focus(), 100);
}

function bindChoiceButtons(correct) {
  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => checkAnswer(correct, btn.dataset.answer, btn));
  });
}

function checkAnswer(correct, answer, clickedButton = null) {
  if (state.answered) return;
  state.answered = true;
  const isCorrect = answer === correct;
  if (isCorrect) {
    state.score += 10;
    state.levelScore += 10;
    $("feedback").textContent = "✅ 答對了！+10 分";
    $("feedback").className = "feedback good";
    playSound("correct");
  } else {
    $("feedback").textContent = `❌ 答錯了！正確答案是：${correct}`;
    $("feedback").className = "feedback bad";
    playSound("wrong");
  }
  $("score-badge").textContent = `${state.score} 分`;

  if (clickedButton) {
    clickedButton.classList.add(isCorrect ? "correct" : "wrong");
    document.querySelectorAll(".option-btn").forEach(btn => {
      if (btn.dataset.answer === correct) btn.classList.add("correct");
      btn.disabled = true;
    });
  } else {
    const input = $("spell-input");
    if (input) input.disabled = true;
    const submit = $("spell-submit");
    if (submit) submit.disabled = true;
  }
  $("next-btn").textContent = state.index === 9 ? "看成績 →" : "下一題 →";
  $("next-btn").classList.remove("hidden");
  $("next-btn").onclick = nextQuestion;
}

function nextQuestion() {
  if (state.index < 9) {
    state.index++;
    renderQuestion();
  } else {
    finishLevel();
  }
}

function finishLevel() {
  playSound("level");
  $("result-title").textContent = `${LEVELS[state.level].name.split("｜")[0]}完成！`;
  $("result-score").textContent = `${state.levelScore} / 100 分`;
  $("result-message").textContent =
    state.levelScore >= 90 ? "太厲害了！你是單字高手！🌟" :
    state.levelScore >= 70 ? "表現很好，再挑戰一次可以更高分！💪" :
    "沒關係，多練習幾次就會越來越熟！📖";
  $("next-level-btn").style.display = state.level < 4 ? "inline-block" : "none";
  $("next-level-btn").onclick = () => startGame(state.letter, state.level + 1);
  $("retry-btn").onclick = () => startGame(state.letter, state.level);
  showScreen(screens.level);
}

function speakWord(word) {
  if (!("speechSynthesis" in window)) {
    alert("你的瀏覽器不支援英文語音播放。");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = 0.8;
  u.pitch = 1;
  speechSynthesis.speak(u);
}

function playSound(type) {
  // 不需要額外音檔，使用 Web Audio API 產生遊戲音效。
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = type === "correct" ? [660, 880] : type === "wrong" ? [220, 160] : [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type === "wrong" ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * .11);
      gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + i * .11 + .02);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + i * .11 + .16);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * .11); osc.stop(ctx.currentTime + i * .11 + .17);
    });
  } catch(e) {}
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

$("home-btn").onclick = () => showScreen(screens.start);
$("back-home-btn").onclick = () => showScreen(screens.start);

initLetters();
