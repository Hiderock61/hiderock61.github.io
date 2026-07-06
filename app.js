function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
  const target = document.getElementById(id);
  if (target) target.style.display = "block";
}
showScreen("screen-top");

/* -------------------------
   自分のタグ肩書き
------------------------- */

let selectedMyTags = [];

const myTags = [
  "ギター",
  "Guns N’ Roses",
  "銭湯",
  "フィリピン",
  "英語やり直し",
  "昭和サブカル",
  "料理",
  "FX観察",
  "再出発中",
  "生活立て直し中",
  "近所で話せる人",
  "友達から希望"
];

function renderMyTags() {
  const list = document.getElementById("myTagList");
  if (!list) return;

  list.innerHTML = myTags.map(tag => `
    <span class="tag ${selectedMyTags.includes(tag) ? "selected" : ""}"
          onclick="toggleMyTag('${tag}')">${tag}</span>
  `).join("");

  renderMyTagSummary();
}

function toggleMyTag(tag) {
  if (selectedMyTags.includes(tag)) {
    selectedMyTags = selectedMyTags.filter(t => t !== tag);
  } else {
    selectedMyTags.push(tag);
  }
  renderMyTags();
}

function renderMyTagSummary() {
  const summary = document.getElementById("myTagSummary");
  if (!summary) return;

  if (selectedMyTags.length === 0) {
    summary.innerText = "まだ肩書きは選ばれていません。";
  } else {
    summary.innerText = `あなたのタグ肩書き：${selectedMyTags.join(" / ")}`;
  }
}

renderMyTags();

/* -------------------------
   ダミーデータ
------------------------- */

const communities = [
  {
    id: 1,
    name: "♨️ 銭湯帰りの会",
    description: "銭湯の話、サウナの話、近所の湯の情報をゆるく共有する部屋。",
    threads: [101, 102],
    residents: [1, 3],
    memberCount: 128,
    topicCount: 24,
    owner: "おばちゃん見守り中",
    mood: "初心者歓迎",
    visibility: "招待制想定",
    lastActive: "今日 20:14",
    shortTags: ["銭湯", "サウナ", "近所"]
  },
  {
    id: 2,
    name: "🍳 料理ゆる部",
    description: "レシピ交換、料理の失敗談、好きな調味料などを語る部屋。",
    threads: [201],
    residents: [2],
    memberCount: 87,
    topicCount: 12,
    owner: "ゆる料理長",
    mood: "まったり",
    visibility: "公開予定",
    lastActive: "今日 18:55",
    shortTags: ["料理", "調味料", "自炊"]
  },
  {
    id: 3,
    name: "🗣️ 英語やり直し部",
    description: "英語の再挑戦を応援する部屋。",
    threads: [301],
    residents: [1],
    memberCount: 203,
    topicCount: 31,
    owner: "英語おばちゃん",
    mood: "ゆる勉強",
    visibility: "招待制想定",
    lastActive: "今日 19:40",
    shortTags: ["英語やり直し", "勉強", "海外"]
  },
  {
    id: 4,
    name: "📼 昭和サブカル研究室",
    description: "昭和の雑誌、音楽、映画、サブカル文化を語る部屋。",
    threads: [401],
    residents: [2, 3],
    memberCount: 54,
    topicCount: 9,
    owner: "昭和案内人",
    mood: "濃いめ",
    visibility: "半公開",
    lastActive: "今日 17:22",
    shortTags: ["昭和サブカル", "雑誌", "音楽"]
  }
];

const profiles = [
  {
    id: 1,
    name: "あおば",
    area: "都内西部",
    communities: [1, 3],
    tags: ["銭湯", "英語やり直し"],
    bio: "近所の銭湯めぐりが好き。英語はゆっくり再挑戦中。",
    hope: "まずはゆるく話せる人",
    safetyGate: "治安ゲート：v0.3C-miniでは説明のみ",
    auntieComment: "銭湯と英語が重なってるで。急がんと、最近行った銭湯の話からでええんちゃう？"
  },
  {
    id: 2,
    name: "ひより",
    area: "神奈川東部",
    communities: [2, 4],
    tags: ["料理", "昭和サブカル"],
    bio: "料理は作るのも食べるのも好き。昭和の雑誌を読むのが密かな楽しみ。",
    hope: "友達から希望",
    safetyGate: "治安ゲート：v0.3C-miniでは説明のみ",
    auntieComment: "料理と昭和が重なってるわ。まずは好きな雑誌の話とか、軽めでいこか。"
  },
  {
    id: 3,
    name: "まこと",
    area: "東京北部",
    communities: [1, 4],
    tags: ["ギター", "Guns N’ Roses", "銭湯"],
    bio: "ギターとGuns N’ Rosesが好き。銭湯は週2で行くタイプ。",
    hope: "近所で話せる人",
    safetyGate: "治安ゲート：v0.3C-miniでは説明のみ",
    auntieComment: "ギターと銭湯が重なってるで。音楽の話から入るとええ感じやと思うわ。"
  }
];

const threads = [
  { id: 101, communityId: 1, title: "最近行った銭湯の話しません？", posts: [9001, 9002] },
  { id: 102, communityId: 1, title: "サウナの入り方って人によって違うよね", posts: [9003] },
  { id: 201, communityId: 2, title: "好きな調味料ベスト3", posts: [9004] },
  { id: 301, communityId: 3, title: "Duolingoの連続記録どうしてる？", posts: [9005] },
  { id: 401, communityId: 4, title: "昭和の雑誌で好きな特集あった？", posts: [9006] }
];

const posts = [
  { id: 9001, profileId: 1, text: "昨日は『ゆの森』に行ってきました。露天が気持ちよかったです。", time: "20:14" },
  { id: 9002, profileId: 3, text: "ギター練習のあとに銭湯へ行くと、指先までほどける感じがあります。", time: "20:20" },
  { id: 9003, profileId: 1, text: "水風呂の温度、みんなこだわりあります？", time: "21:03" },
  { id: 9004, profileId: 2, text: "最近は『昆布ポン酢』が万能すぎて手放せません。", time: "18:55" },
  { id: 9005, profileId: 1, text: "連続記録は気にしすぎると疲れるので、ゆるく続けてます。", time: "19:40" },
  { id: 9006, profileId: 2, text: "昔の『宝島』の特集が好きでした。あの雰囲気がたまらない。", time: "17:22" }
];

let currentCommunity = null;
let currentThread = null;
let currentProfile = null;

/* -------------------------
   共通タグ処理
------------------------- */

function getCommonTags(myTags, otherTags) {
  return otherTags.filter(t => myTags.includes(t));
}

function countCommonTags(myTags, otherTags) {
  return getCommonTags(myTags, otherTags).length;
}

function renderTagBadges(tags) {
  return tags.map(tag => {
    const isMatch = selectedMyTags.includes(tag);
    const className = isMatch ? "tag-match" : "resident-tag";
    return `<span class="${className}">${tag}</span>`;
  }).join("");
}

function renderThreadTagBadges(tags) {
  return tags.map(tag => `<span class="thread-tag">${tag}</span>`).join("");
}

function truncateText(text, maxLen = 30) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function getEntranceText(count) {
  if (count >= 2) return `話の入口：${count}つあり`;
  if (count === 1) return "話の入口：1つあり";
  return "話の入口：まだ探し中";
}

/* -------------------------
   コミュニティ一覧
------------------------- */

function getCommunityVoice(community) {
  const lastThreadId = community.threads[community.threads.length - 1];
  const thread = threads.find(t => t.id === lastThreadId);
  if (!thread) return "まだ立ち話は聞こえてきません。";

  const lastPostId = thread.posts[thread.posts.length - 1];
  const lastPost = posts.find(p => p.id === lastPostId);
  if (!lastPost) return "まだ立ち話は聞こえてきません。";

  return truncateText(lastPost.text, 36);
}

function getCommunityPresenceText(id) {
  const labels = {
    1: "にぎやか",
    2: "ほどよく行き交う",
    3: "よく行き交う",
    4: "静かに佇む"
  };
  return labels[id] || "だれかの気配";
}

function getCommunityTalkText(id) {
  const labels = {
    1: "あちこちで聞こえる",
    2: "ぽつぽつ聞こえる",
    3: "あちこちで続いている",
    4: "じわじわ続いている"
  };
  return labels[id] || "ぽつぽつ聞こえる";
}

function renderCommunities() {
  const list = document.getElementById("communityList");
  if (!list) return;

  list.innerHTML = communities.map(c => `
    <div class="community-card community-signboard" onclick="openCommunity(${c.id})">
      <h3>${c.name}</h3>
      <div class="comm-tags">${c.shortTags.slice(0, 3).map(t => `<span class="comm-tag">${t}</span>`).join("")}</div>
      <div class="community-voice">
        <p class="community-voice-label">中から聞こえる声</p>
        <p class="community-voice-text">${getCommunityVoice(c)}</p>
      </div>
      <div class="community-sign-meta">
        <span>見え方：${c.visibility}</span>
        <span>人の気配：${getCommunityPresenceText(c.id)}</span>
        <span>立ち話：${getCommunityTalkText(c.id)}</span>
      </div>
      <div class="comm-enter">この部屋をのぞく</div>
    </div>
  `).join("");
}
renderCommunities();

/* -------------------------
   コミュニティ詳細
------------------------- */

function openCommunity(id) {
  currentCommunity = communities.find(c => c.id === id);
  if (!currentCommunity) return;

  document.getElementById("communityName").innerText = currentCommunity.name;
  document.getElementById("communityDesc").innerText = currentCommunity.description;

  document.getElementById("communityMeta").innerHTML = `
    <div class="room-profile">
      <p class="profile-section-label">この部屋について</p>
      <p>空気感：${currentCommunity.mood}</p>
      <p>外からの見え方：${currentCommunity.visibility}</p>
      <p>最近の気配：${currentCommunity.lastActive}</p>
      <p>見守り：${currentCommunity.owner}</p>
      <div class="comm-tags">${currentCommunity.shortTags.map(t => `<span class="comm-tag">${t}</span>`).join("")}</div>
    </div>

    <div class="room-actions">
      <p class="profile-section-label">この部屋でできること</p>
      <ul class="room-actions-list">
        <li>最近の立ち話を読む</li>
        <li>気になる発言から肩書きカードを見る</li>
        <li>この部屋の住人の名札を見る</li>
      </ul>
    </div>
  `;

  document.getElementById("communityThreads").innerHTML = currentCommunity.threads.map(tid => {
    const t = threads.find(th => th.id === tid);
    if (!t) return "";

    const lastPostId = t.posts[t.posts.length - 1];
    const lastPost = posts.find(po => po.id === lastPostId);
    const snippet = lastPost ? truncateText(lastPost.text, 36) : "";
    const lastTime = lastPost ? lastPost.time : "";

    return `
      <div class="thread-preview" onclick="openThread(${t.id})">
        <p class="thread-preview-title">${t.title}</p>
        <p class="thread-preview-snippet">${snippet}</p>
        <div class="thread-preview-meta">
          <span>これまでの立ち話：${t.posts.length}</span>
          <span>最終発言：${lastTime}</span>
        </div>
      </div>
    `;
  }).join("");

  showScreen("screen-community-detail");
}

/* -------------------------
   この部屋の住人
------------------------- */

function openResidentList() {
  if (!currentCommunity) return;

  document.getElementById("residentListTitle").innerText =
    `${currentCommunity.name} の住人`;

  document.getElementById("residentNotice").innerHTML =
    selectedMyTags.length === 0
      ? `<div class="notice">タグ肩書き未選択です。肩書きを選ぶと、話の入口が近い住人が上に来ます。</div>`
      : "";

  const residents = currentCommunity.residents
    .map(pid => profiles.find(p => p.id === pid))
    .filter(Boolean)
    .map(profile => {
      const commonTags = getCommonTags(selectedMyTags, profile.tags);
      return {
        ...profile,
        commonTags,
        commonTagCount: commonTags.length
      };
    })
    .sort((a, b) => b.commonTagCount - a.commonTagCount);

  document.getElementById("residentList").innerHTML = residents.map(p => {
    return `
      <div class="resident-card resident-card-mini" onclick="openProfile(${p.id})">
        <h3>${p.name}</h3>
        <p>${p.area}</p>
        <p>${renderTagBadges(p.tags)}</p>
        <p class="auntie-mini-short">👵 ${truncateText(p.auntieComment, 30)}</p>
        <div class="resident-card-more">カードを見る ＞</div>
      </div>
    `;
  }).join("");

  showScreen("screen-residents");
}

/* -------------------------
   スレッド一覧
------------------------- */

function openThreadList(cid) {
  const comm = communities.find(c => c.id === cid);
  if (!comm) {
    showScreen("screen-communities");
    return;
  }

  document.getElementById("threadListTitle").innerText = comm.name;
  document.getElementById("threadList").innerHTML = comm.threads.map(tid => {
    const t = threads.find(th => th.id === tid);
    return t ? `<div class="card" onclick="openThread(${t.id})">${t.title}</div>` : "";
  }).join("");

  showScreen("screen-thread-list");
}

/* -------------------------
   スレッド本文
------------------------- */

function openThread(tid) {
  currentThread = threads.find(t => t.id === tid);
  if (!currentThread) return;

  const comm = communities.find(c => c.id === currentThread.communityId);
  document.getElementById("threadBreadcrumb").innerText =
    comm ? `${comm.name} ＞ ${currentThread.title}` : currentThread.title;

  document.getElementById("threadTitle").innerText = currentThread.title;

  document.getElementById("postList").innerHTML = currentThread.posts.map(pid => {
    const p = posts.find(po => po.id === pid);
    if (!p) return "";
    const prof = profiles.find(pr => pr.id === p.profileId);
    if (!prof) return "";

    return `
      <div class="post" onclick="openProfile(${prof.id})">
        <div class="thread-post-head">
          <span class="thread-post-name">${prof.name} ＞</span>
          <span class="thread-post-time">${p.time}</span>
        </div>
        <p>${p.text}</p>
        <div class="thread-tags">${renderThreadTagBadges(prof.tags.slice(0, 3))}</div>
      </div>
    `;
  }).join("");

  showScreen("screen-thread-posts");
}

function backToThreadList() {
  if (!currentThread) {
    showScreen("screen-community-detail");
    return;
  }
  openThreadList(currentThread.communityId);
}

/* -------------------------
   肩書きカード
------------------------- */

function openProfile(pid) {
  currentProfile = profiles.find(p => p.id === pid);
  if (!currentProfile) return;

  // よく行く部屋：communities.residents から currentProfile.id を逆引き
  const frequentRooms = communities.filter(c => c.residents.includes(currentProfile.id));
  const frequentRoomsHTML = frequentRooms.length
    ? frequentRooms.map(c => `<span class="comm-tag">${c.name}</span>`).join("")
    : `<span class="comm-tag">まだ部屋の記録なし</span>`;

  // 最近の発言：posts から profileId 一致、id大きい順、最大2件
  const recentPosts = posts
    .filter(p => p.profileId === currentProfile.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 2);

  const recentPostsHTML = recentPosts.length
    ? recentPosts.map(p => `
        <div class="profile-recent-post">
          <span class="profile-recent-time">${p.time}</span>
          <p>${p.text}</p>
        </div>
      `).join("")
    : `<p class="profile-recent-empty">最近の発言はまだありません。</p>`;

  document.getElementById("profileCard").innerHTML = `
    <div class="card">
      <h3>${currentProfile.name}</h3>
      <p>${currentProfile.area}</p>

      <span class="badge gate-badge">治安ゲート：説明のみ</span>

      <p class="profile-section-label">タグ肩書き</p>
      <p>${renderTagBadges(currentProfile.tags)}</p>

      <p class="profile-section-label">距離感</p>
      <p>${currentProfile.hope}</p>

      <p class="profile-section-label">よく行く部屋</p>
      <div class="comm-tags">${frequentRoomsHTML}</div>

      <p class="profile-section-label">最近の発言</p>
      <div class="profile-recent-list">${recentPostsHTML}</div>

      <p class="profile-section-label">おばちゃん一言</p>
      <p class="auntie-mini">👵 ${currentProfile.auntieComment}</p>
    </div>
  `;

  showScreen("screen-profile");
}

/* -------------------------
   足あと
------------------------- */

function showFootprint() {
  if (!currentProfile) return;

  document.getElementById("footName").innerText =
    `${currentProfile.name}さんの肩書きカードに、そっと足あとを残しました`;

  document.getElementById("footTags").innerText =
    `タグ肩書き：${currentProfile.tags.join(" / ")}`;

  document.getElementById("footHope").innerText =
    `距離感：${currentProfile.hope}`;

  document.getElementById("knockName").innerText =
    `${currentProfile.name}さんに、どんな合図を置きますか？`;

  showScreen("screen-footprint");
}

/* -------------------------
   ノック・おばちゃん紹介文
------------------------- */

function showAuntieComment() {
  if (!currentProfile) return;

  document.getElementById("auntieText").innerText =
    `${currentProfile.auntieComment} 急がんでええから、まずは軽い一言くらいの小さな合図でええと思うで。`;

  showScreen("screen-auntie-comment");
}

function chooseKnock(type) {
  if (!currentProfile) return;

  if (type === "auntie") {
    showAuntieComment();
    return;
  }

  document.getElementById("auntieText").innerText =
    `${currentProfile.name}さんに、そっと気配だけ置いておきました。いきなり話しかけず、今日はここまででも大丈夫です。`;

  showScreen("screen-auntie-comment");
}
