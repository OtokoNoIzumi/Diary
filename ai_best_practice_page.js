// ==========================================
// 全局状态与配置
// ==========================================
let currentUser = null;
const API_BASE = 'https://lesson.izumiai.site';
const SUBMIT_COMMENT_ENDPOINT = `${API_BASE}/api/sharing/comment/submit`;
const LIST_COMMENTS_ENDPOINT = `${API_BASE}/api/sharing/messages`;
const AUTH_LOGIN_ENDPOINT = `${API_BASE}/api/auth/login`;

// 本地缓存：以线程为单位保存“用户感想 -> AI回复”的串
const LOCAL_THREADS_KEY = 'ai_sharing_threads_v2';

// 用户名映射：用于管理员侧展示
// 来源：temp_namecard_generator.html 的 dataInput（同一份名单）
const USER_ID_TO_NAME = {
    'k3az': '小西校长',
    'v8nw': '屈源',
    'm5qy': '派赛克',
    'x2pf': '薛导',
    'c7dj': '婵姐',
    'y4tr': '耀天',
    'm1xz': '梦欣',
    'd9bh': '大头',
    'k6gw': '匡威',
    'z3ly': '张雷',
    't7xz': '塔爷',
    'w5rj': '微辣朱',
    'm8ky': 'May',
    'z2gn': '走心姑娘',
    'z9wg': '赵卫国',
    'x4xf': '小肥',
    'h1sb': '贺思博'
};

let currentThreadContext = null; // 当前划词上下文 { quote, paragraphIdx, occurrenceIdx, threadKey }
let adminOffset = 0; // 管理员同步偏移量
let adminAllThreads = {}; // 管理员心跳拉取的全员线程
let activeThreadKey = '';
let showComments = true;
let draftThread = null; // 划词后未提交前的临时评论串（不入库不入本地存储）
let streamingThreadKey = ''; // 当前正在流式生成的线程

// 统一 Markdown 渲染策略（AI 回复支持 GFM + 换行）
marked.setOptions({
    gfm: true,
    breaks: true
});
function renderMarkdown(text) {
    return marked.parse(String(text || ''));
}

function normalizeQuote(s) {
    try {
        return String(s || '').replace(/\s+/g, ' ').trim();
    } catch (e) {
        return '';
    }
}

function buildThreadKey(paragraphIdx, occurrenceIdx, quoteNorm) {
    return `${int(paragraphIdx)}|${int(occurrenceIdx)}|${quoteNorm}`;
}

function int(v) {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function safeString(s) {
    return String(s ?? '');
}

function formatTime(ts) {
    if (!ts) return '';
    try {
        // SQLite 默认：YYYY-MM-DD HH:MM:SS
        const normalized = String(ts).replace(' ', 'T');
        const d = new Date(normalized);
        if (Number.isNaN(d.getTime())) return safeString(ts);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${mm}-${dd} ${hh}:${mi}`;
    } catch (e) {
        return safeString(ts);
    }
}

function isMobileViewport() {
    return window.innerWidth <= 768;
}

function focusThreadInput(inputEl) {
    if (!inputEl) return;
    // 移动端自动聚焦会触发浏览器滚动到页面尾部，导致正文定位被篡改
    if (isMobileViewport()) return;
    try {
        inputEl.focus({ preventScroll: true });
    } catch (e) {
        inputEl.focus();
    }
}

function applyMobileFloatingBoard(board, enabled) {
    if (!board) return;
    if (enabled) {
        // 强制居中弹窗层：点击标记后卡片在视口正中央悬浮出现
        board.style.position = 'fixed';
        board.style.left = '0';
        board.style.right = '0';
        board.style.top = '0';
        board.style.bottom = '0';
        board.style.width = '100vw';
        board.style.height = '100vh';
        board.style.maxHeight = 'none';
        board.style.zIndex = '1200';
        board.style.margin = '0';
    } else {
        // 回到桌面端样式控制
        board.style.position = '';
        board.style.left = '';
        board.style.right = '';
        board.style.bottom = '';
        board.style.top = '';
        board.style.width = '';
        board.style.height = '';
        board.style.maxHeight = '';
        board.style.zIndex = '';
        board.style.margin = '';
    }
}

// ==========================================
// 划词管理与 UI 响应
// ==========================================
const selectionTooltip = document.getElementById('selection-tooltip');
const articleBody = document.getElementById('article-body');

// 为段落打上索引
function initParagraphIndices() {
    const ps = articleBody.querySelectorAll('h1, p, .section-block > div');
    ps.forEach((p, idx) => {
        p.setAttribute('data-p-idx', idx);
        const localHistory = getThreadHistory(idx);
        if (localHistory.length > 0) p.classList.add('comment-highlight');
    });
}

function getThreadHistory(idx) {
    const threads = loadLocalThreads();
    const out = [];
    Object.values(threads).forEach(t => {
        if (t && int(t.paragraphIdx) === int(idx)) {
            if (Array.isArray(t.turns)) out.push(...t.turns);
        }
    });
    return out;
}

function loadLocalThreads() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_THREADS_KEY) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function persistLocalThreads(threads) {
    localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads || {}));
}

function refreshParagraphHighlights() {
    // 先清除旧的精确标记span
    articleBody.querySelectorAll('.comment-quote-mark').forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
    });
    // 清除旧的段落级高亮
    articleBody.querySelectorAll('.comment-highlight').forEach(el => {
        el.classList.remove('comment-highlight');
    });

    const threads = getRenderableThreads();
    threads.forEach(t => {
        if (!t || !t.quote) return;
        markQuoteInArticle(t);
    });
}

// 在正文中找到引用文字并用span包裹标记
function markQuoteInArticle(thread) {
    const pEl = articleBody.querySelector(`[data-p-idx="${int(thread.paragraphIdx)}"]`);
    if (!pEl) return;
    const quoteText = thread.quote;
    if (!quoteText) return;

    const walker = document.createTreeWalker(pEl, NodeFilter.SHOW_TEXT, null);
    let node;
    let occCount = 0;
    const targetOcc = int(thread.occurrenceIdx);
    while ((node = walker.nextNode())) {
        const idx = node.textContent.indexOf(quoteText);
        if (idx === -1) continue;
        if (occCount === targetOcc) {
            // 找到目标：分割文本节点并包裹span
            const before = node.textContent.substring(0, idx);
            const after = node.textContent.substring(idx + quoteText.length);
            const mark = document.createElement('span');
            mark.className = 'comment-quote-mark';
            mark.setAttribute('data-thread-key', thread.threadKey);
            const bubbleCount = Array.isArray(thread.turns) ? thread.turns.length : 0;
            if (bubbleCount > 0) {
                mark.setAttribute('data-bubble-count', String(bubbleCount));
            } else {
                mark.removeAttribute('data-bubble-count');
            }
            mark.textContent = quoteText;
            const parent = node.parentNode;
            if (before) parent.insertBefore(document.createTextNode(before), node);
            parent.insertBefore(mark, node);
            if (after) parent.insertBefore(document.createTextNode(after), node);
            parent.removeChild(node);
            return;
        }
        occCount++;
    }
}

// 监听鼠标抬起，触发划词工具 (增加序号计算)
document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    const rawText = selection.toString().trim();
    const quoteNorm = normalizeQuote(rawText);

    if (quoteNorm && articleBody.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        let parent = selection.anchorNode.parentElement;
        while (parent && !parent.hasAttribute('data-p-idx')) parent = parent.parentElement;
        const pIdx = parent ? parseInt(parent.getAttribute('data-p-idx')) : 0;

        // 计算出现序号：查找当前选区在段落中的字符偏移，进而确定是第几个该词
        let occIdx = 0;
        if (parent) {
            // 使用临时范围计算相对于段落开始的偏移
            const preRange = document.createRange();
            preRange.setStart(parent, 0);
            preRange.setEnd(range.startContainer, range.startOffset);
            const beforeText = preRange.toString();
            // 统计在选区之前该词出现的次数
            occIdx = (beforeText.match(new RegExp(quoteNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        }

        selectionTooltip.style.display = 'flex';
        selectionTooltip.style.top = `${rect.top + window.scrollY - 40}px`;
        selectionTooltip.style.left = `${rect.left + window.scrollX + rect.width / 2 - 40}px`;

        const threadKey = buildThreadKey(pIdx, occIdx, quoteNorm);
        currentThreadContext = { quote: quoteNorm, paragraphIdx: pIdx, occurrenceIdx: occIdx, threadKey };
    } else if (!selectionTooltip.contains(e.target)) {
        selectionTooltip.style.display = 'none';
    }
});

selectionTooltip.addEventListener('click', () => {
    if (!currentThreadContext) return;
    if (!currentUser) {
        alert('请先启用访问权限');
        return;
    }
    activateThreadContext(currentThreadContext);
    selectionTooltip.style.display = 'none';
});

articleBody.addEventListener('click', (e) => {
    const mark = e.target.closest('.comment-quote-mark');
    if (!mark) return;
    if (!currentUser) {
        alert('请先启用访问权限');
        return;
    }
    const threadKey = mark.getAttribute('data-thread-key');
    if (!threadKey) return;
    e.preventDefault();
    e.stopPropagation();
    if (!showComments) showComments = true;
    activeThreadKey = threadKey;
    renderAllThreads();
    const card = document.getElementById(getThreadDomId(threadKey));
    const input = card ? card.querySelector('input.thread-input') : null;
    focusThreadInput(input);
});

// ==========================================
// 划词评论线程 UI + LocalStorage 缓存
// ==========================================
let _threadRenderBusy = false;

function simpleHash(str) {
    // 简单确定性 hash：用于生成 DOM id
    let h = 2166136261;
    const s = String(str ?? '');
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

function getThreadDomId(threadKey) {
    return `thread-${simpleHash(threadKey)}`;
}

function isCollapsed(threadKey) {
    // 隐藏：全部摘要态（仅数字等，见 renderThreadMessages）
    if (!showComments) return true;
    // 显示评论但未选中任何卡片：全部摘要态（缩略）
    if (!activeThreadKey) return true;
    // 仅当前选中的线程展开为完整卡片
    return threadKey !== activeThreadKey;
}

function findQuoteMarkEl(threadKey) {
    if (!threadKey || !articleBody) return null;
    const key = String(threadKey);
    const marks = articleBody.querySelectorAll('.comment-quote-mark');
    for (let i = 0; i < marks.length; i++) {
        if (marks[i].getAttribute('data-thread-key') === key) return marks[i];
    }
    return null;
}

function getOrCreateDraftThread(ctx) {
    if (draftThread && draftThread.threadKey === ctx.threadKey) return draftThread;
    draftThread = {
        threadKey: ctx.threadKey,
        quote: ctx.quote,
        paragraphIdx: int(ctx.paragraphIdx),
        occurrenceIdx: int(ctx.occurrenceIdx),
        turns: [],
        isDraft: true
    };
    return draftThread;
}

function renderThreadMessages(threadKey, thread, card) {
    const messagesEl = card.querySelector('.thread-messages');
    if (!messagesEl) return;
    messagesEl.innerHTML = '';
    const collapsed = isCollapsed(threadKey);
    card.classList.toggle('is-collapsed', collapsed);

    const turns = Array.isArray(thread.turns) ? thread.turns : [];
    turns.forEach(turn => {
        const userName = turn.userName || USER_ID_TO_NAME[turn.userId] || turn.userId || 'anonymous';

        // 用户评论条目
        const userItem = document.createElement('div');
        userItem.className = 'thread-comment-item';
        const userMeta = document.createElement('div');
        userMeta.className = 'thread-comment-meta';
        userMeta.innerHTML = `<span class="comment-author">${safeString(userName)}</span><span class="comment-time">${formatTime(turn.createdAt)}</span>`;
        userItem.appendChild(userMeta);
        const userBody = document.createElement('div');
        userBody.className = 'thread-comment-body';
        userBody.innerHTML = renderMarkdown(turn.commentText || '');
        userItem.appendChild(userBody);
        messagesEl.appendChild(userItem);

        // AI回复条目（包含 pending 状态）
        if (turn.aiReply || turn.aiPending) {
            const aiItem = document.createElement('div');
            aiItem.className = 'thread-comment-item is-ai';
            const aiMeta = document.createElement('div');
            aiMeta.className = 'thread-comment-meta';
            aiMeta.innerHTML = `<span class="comment-author">AI</span><span class="comment-time">${formatTime(turn.createdAt)}</span>`;
            aiItem.appendChild(aiMeta);
            const aiBody = document.createElement('div');
            aiBody.className = 'thread-comment-body';
            if (turn.aiReply) {
                const suffix = turn.aiPending ? '<div class="message-status-container"><div class="loading-spinner"></div><span>生成中...</span></div>' : '';
                aiBody.innerHTML = `${renderMarkdown(turn.aiReply)}${suffix}`;
            } else {
                aiBody.innerHTML = '<div class="message-status-container"><div class="loading-spinner"></div><span>思考中...</span></div>';
            }
            aiItem.appendChild(aiBody);
            messagesEl.appendChild(aiItem);
        }
    });

    // 摘要：显示评论时展示“评论发言”缩略；隐藏评论时普通用户仅数字
    const summaryEl = card.querySelector('.thread-summary');
    if (summaryEl) {
        const isAdmin = currentUser?.isAdmin;
        const count = turns.length;
        const firstTurn = turns[0] || {};
        const speakerName = firstTurn.userName || USER_ID_TO_NAME[firstTurn.userId] || firstTurn.userId || '匿名';
        const commentPreview = safeString(firstTurn.commentText || '').trim();
        const shortComment = commentPreview.slice(0, 44);
        if (isAdmin) {
            summaryEl.innerHTML = `
                <div class="top">
                    <span class="count">${count}</span>
                    <span class="preview">${safeString(speakerName)} : ${commentPreview ? `${shortComment}${commentPreview.length > 44 ? '…' : ''}` : '（暂无发言）'}</span>
                </div>
            `;
        } else if (!showComments) {
            summaryEl.innerHTML = `<div class="top"><span class="count">${count}</span></div>`;
        } else {
            summaryEl.innerHTML = `
                <div class="top"><span class="count">${count}</span></div>
                <div class="preview">${commentPreview ? `${shortComment}${commentPreview.length > 44 ? '…' : ''}` : '（暂无发言）'}</div>
            `;
        }
    }

    // 输入框：选中时展开，或有未提交内容时始终显示
    const inputBox = card.querySelector('.thread-input-box');
    if (inputBox) {
        const textInput = inputBox.querySelector('.thread-input');
        const hasDraft = textInput && textInput.value.trim().length > 0;
        const isActive = activeThreadKey === threadKey;
        inputBox.style.display = (isActive || hasDraft) && !collapsed ? 'flex' : 'none';
    }
    // 隐藏模式下不显示引用文字（由正文中的下划线标记代替）
    const quoteDiv = card.querySelector('.quote');
    if (quoteDiv) quoteDiv.style.display = collapsed ? 'none' : 'block';
    card.classList.toggle('is-active', activeThreadKey === threadKey);
}

function createThreadCard(thread) {
    const existing = document.getElementById(getThreadDomId(thread.threadKey));
    if (existing) return existing;

    const card = document.createElement('div');
    card.id = getThreadDomId(thread.threadKey);
    card.className = 'thread-card';
    card.setAttribute('data-thread-key', thread.threadKey);

    // 点击卡片：隐藏模式也可切换到显示并选中当前卡片
    card.addEventListener('click', (e) => {
        const t = e.target;
        if (t && (t.closest('.thread-send-btn') || t.closest('.thread-input'))) return;
        if (draftThread && draftThread.threadKey !== thread.threadKey && (!draftThread.turns || draftThread.turns.length === 0)) {
            draftThread = null;
        }
        if (!showComments) showComments = true;
        activeThreadKey = thread.threadKey;
        renderAllThreads();
    });

    // 悬停卡片时精确高亮引用的文字（threadKey 含特殊字符时 querySelector 会失效，故用遍历匹配）
    card.addEventListener('mouseenter', () => {
        const mark = findQuoteMarkEl(thread.threadKey);
        if (mark) mark.classList.add('hover-highlight');
    });
    card.addEventListener('mouseleave', () => {
        const mark = findQuoteMarkEl(thread.threadKey);
        if (mark) mark.classList.remove('hover-highlight');
    });
    card.addEventListener('touchstart', () => {
        const mark = findQuoteMarkEl(thread.threadKey);
        if (mark) mark.classList.add('hover-highlight');
    }, { passive: true });
    card.addEventListener('touchend', () => {
        const mark = findQuoteMarkEl(thread.threadKey);
        if (mark) {
            window.setTimeout(() => mark.classList.remove('hover-highlight'), 420);
        }
    }, { passive: true });

    const occInfo = thread.occurrenceIdx > 0 ? ` (第${thread.occurrenceIdx + 1}处)` : '';
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote';
    quoteDiv.textContent = `${thread.quote}${occInfo}`;

    const summary = document.createElement('div');
    summary.className = 'thread-summary';
    card.appendChild(summary);

    const messages = document.createElement('div');
    messages.className = 'thread-messages';

    const inputBox = document.createElement('div');
    inputBox.className = 'chat-input-box thread-input-box';

    const textInput = document.createElement('input');
    textInput.className = 'thread-input';
    textInput.type = 'text';
    textInput.placeholder = '回复...';

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'chat-send-btn thread-send-btn';
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane text-sm"></i>';
    sendBtn.disabled = true;

    inputBox.appendChild(textInput);
    inputBox.appendChild(sendBtn);

    textInput.addEventListener('input', () => {
        sendBtn.disabled = !textInput.value.trim();
    });

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!sendBtn.disabled) sendBtn.click();
        }
    });

    sendBtn.addEventListener('click', () => {
        const msg = textInput.value.trim();
        if (!msg) return;
        textInput.value = '';
        sendBtn.disabled = true;
        submitThreadTurn(thread.threadKey, msg, card);
    });

    card.appendChild(quoteDiv);
    card.appendChild(messages);
    card.appendChild(inputBox);
    return card;
}

function getRenderableThreads() {
    const local = loadLocalThreads();
    const merged = { ...local };
    const isAdmin = currentUser?.isAdmin;
    if (isAdmin) {
        Object.entries(adminAllThreads || {}).forEach(([k, v]) => {
            if (!merged[k]) merged[k] = v;
            else {
                const turnsA = Array.isArray(merged[k].turns) ? merged[k].turns : [];
                const turnsB = Array.isArray(v.turns) ? v.turns : [];
                const seen = new Set();
                const out = [];
                [...turnsA, ...turnsB].forEach(t => {
                    const key = t.id ? `id:${t.id}` : `${t.userId}|${t.commentText}|${t.createdAt}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        out.push(t);
                    }
                });
                merged[k].turns = out;
            }
        });
    } else {
        // 普通用户只看自己的线程
        Object.keys(merged).forEach(k => {
            const turns = Array.isArray(merged[k].turns) ? merged[k].turns : [];
            merged[k].turns = turns.filter(t => (t.userId || '') === (currentUser?.id || ''));
            if (!merged[k].turns.length) delete merged[k];
        });
    }

    // 临时线程：仅当前用户可见，且不持久化
    if (draftThread && draftThread.threadKey && !merged[draftThread.threadKey]) {
        merged[draftThread.threadKey] = draftThread;
    }
    return Object.values(merged);
}

function getThreadAnchorTop(thread) {
    const article = document.getElementById('article-body');
    const target = document.querySelector(`[data-p-idx="${int(thread.paragraphIdx)}"]`);
    if (!article || !target) return 0;
    const articleRect = article.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return Math.max(0, (targetRect.top - articleRect.top) - 12);
}

function getGuideTop() {
    const article = document.getElementById('article-body');
    if (!article) return 0;
    const title = article.querySelector('h1');
    if (!title) return 0;
    const articleRect = article.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    return Math.max(0, titleRect.top - articleRect.top);
}

function layoutThreadCards() {
    const board = document.getElementById('thread-board');
    if (!board) return;
    const scroll = board.querySelector('.thread-board-scroll') || board;
    const cards = Array.from(scroll.querySelectorAll('.thread-card'));
    board.style.minHeight = '';
    if (isMobileViewport()) {
        scroll.style.minHeight = '';
        return;
    }

    const guide = scroll.querySelector('.thread-sidebar-guide');
    let prevBottom = 0;
    if (guide) {
        const guideTop = getGuideTop();
        guide.style.position = 'absolute';
        guide.style.top = `${guideTop}px`;
        guide.style.left = '0';
        guide.style.width = '100%';
        prevBottom = Math.max(prevBottom, guideTop + guide.offsetHeight + 12);
    }
    if (!cards.length) {
        scroll.style.minHeight = `${Math.max(prevBottom + 12, 80)}px`;
        return;
    }
    cards.forEach(card => {
        const threadKey = card.getAttribute('data-thread-key');
        const list = getRenderableThreads();
        const thread = list.find(t => t.threadKey === threadKey);
        const anchorTop = thread ? getThreadAnchorTop(thread) : 0;
        const top = Math.max(anchorTop, prevBottom + 12);
        card.style.top = `${top}px`;
        prevBottom = top + card.offsetHeight;
    });
    const articleEl = document.getElementById('article-body');
    scroll.style.minHeight = `${Math.max(prevBottom + 12, articleEl ? articleEl.offsetHeight : 0, 80)}px`;
}

function renderAllThreads() {
    const board = document.getElementById('thread-board');
    if (!board || _threadRenderBusy) return;
    _threadRenderBusy = true;

    try {
        if (draftThread && (!draftThread.turns || draftThread.turns.length === 0) && activeThreadKey !== draftThread.threadKey) {
            draftThread = null;
        }
        const allList = getRenderableThreads();
        allList.sort((a, b) => {
            const pa = int(a.paragraphIdx);
            const pb = int(b.paragraphIdx);
            if (pa !== pb) return pa - pb;
            return int(a.occurrenceIdx) - int(b.occurrenceIdx);
        });
        const mobile = isMobileViewport();
        applyMobileFloatingBoard(board, mobile);
        board.classList.toggle('mobile-open', mobile && !!activeThreadKey);
        let list = allList;
        if (mobile) {
            list = allList.filter(t => t.threadKey === activeThreadKey);
        }

        board.innerHTML = '';
        const scroll = document.createElement('div');
        scroll.className = 'thread-board-scroll';
        board.appendChild(scroll);

        if (!mobile) {
            const guide = document.createElement('div');
            guide.className = 'thread-sidebar-guide';
            guide.innerHTML = `
                <div class="title">除了看，还可以聊！</div>
                <div style="opacity:.64">选中内容后点击<b>AI 讨论</b>即可写下笔记，AI 会基于文章回复。</div>
                <div style="opacity:.5">为了更了解大家的关注和困惑，后台会收集笔记用于答疑。</div>
            `;
            scroll.appendChild(guide);
        }
        updateGlobalToggleButton();

        if (list.length === 0) {
            layoutThreadCards();
            // 移动端在未激活线程时也要刷新正文标记，否则气泡计数与点击入口会丢失
            refreshParagraphHighlights();
            return;
        }

        list.forEach(thread => {
            const card = createThreadCard(thread);
            renderThreadMessages(thread.threadKey, thread, card);
            scroll.appendChild(card);
        });
        layoutThreadCards();
        refreshParagraphHighlights();
    } finally {
        _threadRenderBusy = false;
    }
}

function activateThreadContext(ctx) {
    // 新划词前清理旧的未提交临时线程，避免无限新增占位
    if (draftThread && (!draftThread.turns || draftThread.turns.length === 0)) {
        draftThread = null;
    }
    const thread = getOrCreateDraftThread(ctx);
    activeThreadKey = thread.threadKey;
    showComments = true;
    renderAllThreads();

    const card = document.getElementById(getThreadDomId(thread.threadKey));
    if (!card) return;
    card.classList.add('is-active');

    const ipt = card.querySelector('input.thread-input');
    focusThreadInput(ipt);
}

function updateGlobalToggleButton() {
    const btn = document.getElementById('header-global-toggle');
    if (!btn) return;
    btn.textContent = showComments ? '隐藏评论' : '显示评论';
}

async function submitThreadTurn(threadKey, userMessage, card) {
    const threads = loadLocalThreads();
    const thread = threads[threadKey] || (draftThread && draftThread.threadKey === threadKey ? draftThread : null);
    if (!thread) return;

    const messagesEl = card.querySelector('.thread-messages');
    const input = card.querySelector('input.thread-input');
    const sendBtn = card.querySelector('button.thread-send-btn');
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;
    streamingThreadKey = threadKey;

    const userName = USER_ID_TO_NAME[currentUser?.id || ''] || (currentUser?.id || 'anonymous');

    // 先把“用户消息 + AI 占位”插入 UI，支持流式逐字更新
    const userItem = document.createElement('div');
    userItem.className = 'thread-comment-item';
    const userMeta = document.createElement('div');
    userMeta.className = 'thread-comment-meta';
    userMeta.innerHTML = `<span class="comment-author">${safeString(userName)}</span><span class="comment-time">${formatTime(new Date().toISOString())}</span>`;
    userItem.appendChild(userMeta);
    const userBody = document.createElement('div');
    userBody.className = 'thread-comment-body';
    userBody.innerHTML = renderMarkdown(userMessage || '');
    userItem.appendChild(userBody);
    messagesEl.appendChild(userItem);

    const aiItem = document.createElement('div');
    aiItem.className = 'thread-comment-item is-ai';
    const aiMeta = document.createElement('div');
    aiMeta.className = 'thread-comment-meta';
    aiMeta.innerHTML = '<span class="comment-author">AI</span>';
    aiItem.appendChild(aiMeta);
    const aiBody = document.createElement('div');
    aiBody.className = 'thread-comment-body';
    aiBody.innerHTML = '<div class="message-status-container"><div class="loading-spinner"></div><span>思考中...</span></div>';
    aiItem.appendChild(aiBody);
    messagesEl.appendChild(aiItem);

    messagesEl.scrollTop = messagesEl.scrollHeight;

    // 发送前立即持久化用户消息到本地，防止请求失败后线程丢失
    const nowIso = new Date().toISOString();
    const pendingTurn = {
        userId: currentUser?.id || 'anonymous',
        userName,
        commentText: userMessage,
        aiReply: '',
        aiPending: true,
        createdAt: nowIso
    };
    const preThreads = loadLocalThreads();
    const preThread = preThreads[threadKey] || {
        threadKey,
        quote: thread.quote,
        paragraphIdx: thread.paragraphIdx,
        occurrenceIdx: thread.occurrenceIdx,
        turns: []
    };
    preThread.turns = Array.isArray(preThread.turns) ? preThread.turns : [];
    preThread.turns.push(pendingTurn);
    preThreads[threadKey] = preThread;
    persistLocalThreads(preThreads);
    if (draftThread && draftThread.threadKey === threadKey) {
        draftThread = null;
    }

    let fullReply = '';
    let streamFinished = false;
    let createdAt = '';
    let insertedId = '';
    try {
        await window.AiBestPracticeCommentComponent.submitCommentStream(
            SUBMIT_COMMENT_ENDPOINT,
            {
                message: userMessage,
                userId: currentUser?.id || 'anonymous',
                password: currentUser?.pd || '',
                fingerprint: window.AiBestPracticeAuthComponent.getFingerprint(),
                quote: thread.quote,
                paragraphIdx: thread.paragraphIdx,
                occurrenceIdx: thread.occurrenceIdx
            },
            {
                onText: (textChunk) => {
                    fullReply += textChunk;
                    aiBody.innerHTML = renderMarkdown(fullReply);
                    messagesEl.scrollTop = messagesEl.scrollHeight;
                    const saved = loadLocalThreads();
                    const t = saved[threadKey];
                    if (t && Array.isArray(t.turns)) {
                        const lastTurn = t.turns[t.turns.length - 1];
                        if (lastTurn && lastTurn.commentText === userMessage) {
                            lastTurn.aiReply = fullReply;
                            lastTurn.aiPending = true;
                        }
                        persistLocalThreads(saved);
                    }
                },
                onDone: (turn) => {
                    streamFinished = true;
                    createdAt = turn.created_at || '';
                    insertedId = turn.id || '';
                    const saved = loadLocalThreads();
                    const t = saved[threadKey];
                    if (t && Array.isArray(t.turns)) {
                        const lastTurn = t.turns[t.turns.length - 1];
                        if (lastTurn && lastTurn.commentText === userMessage) {
                            lastTurn.id = insertedId;
                            lastTurn.aiReply = fullReply;
                            lastTurn.aiPending = false;
                            lastTurn.createdAt = createdAt || lastTurn.createdAt;
                        }
                    }
                    persistLocalThreads(saved);
                    renderAllThreads();

                    const newCard = document.getElementById(getThreadDomId(threadKey));
                    if (newCard) {
                        newCard.classList.add('is-active');
                        const ta2 = newCard.querySelector('input.thread-input');
                        const sb2 = newCard.querySelector('button.thread-send-btn');
                        if (ta2) {
                            ta2.focus();
                            ta2.value = '';
                            if (sb2) sb2.disabled = true;
                        }
                    }
                }
            }
        );

        // 某些情况下服务端不会显式发送 done 事件，这里按已收到文本做收尾
        if (!streamFinished && fullReply) {
            const saved = loadLocalThreads();
            const t = saved[threadKey];
            if (t && Array.isArray(t.turns)) {
                const lastTurn = t.turns[t.turns.length - 1];
                if (lastTurn && lastTurn.commentText === userMessage) {
                    lastTurn.aiReply = fullReply;
                    lastTurn.aiPending = false;
                }
            }
            persistLocalThreads(saved);
            renderAllThreads();
        }
    } catch (e) {
        aiBody.innerHTML = `<span class="text-red-500">连接错误: ${safeString(e.message)}</span>`;
        const saved = loadLocalThreads();
        const t = saved[threadKey];
        if (t && Array.isArray(t.turns)) {
            const lastTurn = t.turns[t.turns.length - 1];
            if (lastTurn && lastTurn.commentText === userMessage) {
                lastTurn.aiPending = false;
            }
            persistLocalThreads(saved);
        }
    } finally {
        if (input) input.disabled = false;
        if (streamingThreadKey === threadKey) streamingThreadKey = '';
    }
}

// ==========================================
// 管理员心跳监控
// ==========================================
// 全局管理员密钥（手动在控制台设置：window.ADMIN_ACCESS_TOKEN = 'xxx'）
window.ADMIN_ACCESS_TOKEN = localStorage.getItem('ai_sharing_admin_token') || '';

async function startAdminHeartbeat() {
    const poll = async () => {
        try {
            const items = await window.AiBestPracticeCommentComponent.listComments(
                LIST_COMMENTS_ENDPOINT,
                adminOffset,
                currentUser?.isAdmin ? {
                    userId: currentUser?.id || '',
                    password: currentUser?.pd || ''
                } : null
            );
            items.forEach(item => {
                const quoteNorm = normalizeQuote(item.quote || '');
                const threadKey = item.thread_key || buildThreadKey(item.paragraph_idx, item.occurrence_idx || 0, quoteNorm);
                if (!adminAllThreads[threadKey]) {
                    adminAllThreads[threadKey] = {
                        threadKey,
                        quote: quoteNorm,
                        paragraphIdx: int(item.paragraph_idx),
                        occurrenceIdx: int(item.occurrence_idx),
                        turns: []
                    };
                }
                adminAllThreads[threadKey].turns.push({
                    id: item.id,
                    userId: item.user_id,
                    userName: USER_ID_TO_NAME[item.user_id] || item.user_id,
                    commentText: item.comment_text || '',
                    aiReply: item.ai_reply || '',
                    createdAt: item.created_at || ''
                });
                adminOffset = Math.max(adminOffset, item.id);
            });
            if (!streamingThreadKey) renderAllThreads();
        } catch (e) {}
    };
    poll();
    setInterval(poll, 30000);
}

function initAdminPanel() {
    if (currentUser?.isAdmin) {
        startAdminHeartbeat();
    }
}

// ==========================================
// 鉴权与初始化
// ==========================================
const OPEN_START = new Date('2026-03-28T14:00:00+08:00').getTime();
const OPEN_END = new Date('2026-04-01T00:00:00+08:00').getTime();

document.addEventListener('DOMContentLoaded', () => {
    initParagraphIndices();
    refreshParagraphHighlights();
    document.getElementById('current-year').textContent = new Date().getFullYear();
    updateGlobalToggleButton();

    const authForm = document.getElementById('auth-form');
    const CACHE_KEY = 'ai_sharing_auth_v1';
    const contentArea = document.querySelector('.content-area');
    const headerGlobalToggle = document.getElementById('header-global-toggle');

    if (headerGlobalToggle) {
        headerGlobalToggle.addEventListener('click', () => {
            showComments = !showComments;
            if (!showComments) activeThreadKey = '';
            renderAllThreads();
        });
    }

    function unlockPage(immediate, isAdmin = false) {
        document.body.classList.add('unlocked');
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            if (immediate) overlay.style.display = 'none';
            else setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
        const app = document.getElementById('main-app');
        if (app) app.style.filter = 'none';

        // 验证通过后由后端告知角色，决定是否开启管理
        if (isAdmin) initAdminPanel();

        // 展示本地缓存的划词评论线程
        renderAllThreads();
        refreshParagraphHighlights();
    }

    async function performAuth(u, p, immediate = false) {
        try {
            const authResult = await window.AiBestPracticeAuthComponent.login(AUTH_LOGIN_ENDPOINT, u, p);
            if (authResult.ok) {
                const data = authResult.data;
                if (data && data.success) {
                    currentUser = { id: data.userId, pd: p, role: data.role, isAdmin: data.isAdmin };
                    window.AiBestPracticeAuthComponent.saveSession(CACHE_KEY, {
                        user: data.userId,
                        pd: p,
                        isAdmin: data.isAdmin,
                        role: data.role
                    });
                    document.documentElement.classList.remove('auth-url-params');
                    unlockPage(immediate, data.isAdmin);
                    return true;
                }
            }
            if (!immediate) {
                if (authResult.aborted) alert('登录请求超时，请检查网络后重试');
                else alert('账号或密码错误');
            }
            return false;
        } catch (e) {
            if (!immediate) alert('服务器连接失败');
            return false;
        }
    }

    // 1. 检查 URL 参数 (优先)
    const urlParams = new URLSearchParams(window.location.search);
    const uParam = urlParams.get('user');
    const pParam = urlParams.get('pd');
    if (uParam && pParam) {
        performAuth(uParam, pParam, true).then((ok) => {
            if (!ok) {
                document.documentElement.classList.remove('auth-url-params');
                alert('账号或密码错误');
            }
        }).catch(() => {
            document.documentElement.classList.remove('auth-url-params');
            alert('服务器连接失败');
        });
    } else {
        // 2. 检查缓存
        const data = window.AiBestPracticeAuthComponent.readSession(CACHE_KEY, 12 * 3600 * 1000);
        if (data) {
            currentUser = { id: data.user, role: data.role, isAdmin: data.isAdmin, pd: data.pd };
            unlockPage(true, !!data.isAdmin);
        }
    }

    // 3. 表单提交
    if (authForm) authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('user-input').value.trim();
        const p = document.getElementById('password-input').value.trim();
        const authCard = document.getElementById('auth-card');
        const envLayer = document.getElementById('auth-envelope-layer');
        authCard?.classList.add('is-auth-busy');
        if (envLayer) envLayer.setAttribute('aria-busy', 'true');
        try {
            await performAuth(u, p, false);
        } finally {
            authCard?.classList.remove('is-auth-busy');
            if (envLayer) envLayer.setAttribute('aria-busy', 'false');
        }
    });



    // 点击卡片外部区域取消选中（无未提交内容时）
    document.addEventListener('click', (e) => {
        if (!activeThreadKey) return;
        if (streamingThreadKey && activeThreadKey === streamingThreadKey) return;
        const clickedCard = e.target.closest('.thread-card');
        if (clickedCard) return; // 点击在卡片内，不处理
        if (e.target.closest('#selection-tooltip')) return;
        // 检查活跃卡片是否有未提交内容
        const activeCard = document.getElementById(getThreadDomId(activeThreadKey));
        if (activeCard) {
            const input = activeCard.querySelector('.thread-input');
            if (input && input.value.trim()) return; // 有未提交内容，不取消
        }
        // 如果是临时线程且无回复，清除
        if (draftThread && draftThread.threadKey === activeThreadKey && (!draftThread.turns || draftThread.turns.length === 0)) {
            draftThread = null;
        }
        activeThreadKey = '';
        renderAllThreads();
    });

    window.addEventListener('resize', () => layoutThreadCards());
});
