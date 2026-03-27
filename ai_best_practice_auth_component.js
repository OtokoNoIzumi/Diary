(function (global) {
    'use strict';

    function getFingerprint() {
        try {
            return btoa(navigator.userAgent.slice(0, 50) + screen.width);
        } catch (e) {
            return 'unknown';
        }
    }

    async function login(endpoint, user, password) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 28000);
        try {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pd: password }),
                signal: controller.signal
            });
            if (!resp.ok) return { ok: false, data: null };
            const data = await resp.json();
            return { ok: !!data?.success, data };
        } catch (e) {
            return { ok: false, data: null, aborted: e && e.name === 'AbortError' };
        } finally {
            clearTimeout(timer);
        }
    }

    function saveSession(cacheKey, payload) {
        const record = {
            user: payload.user,
            pd: payload.pd,
            isAdmin: !!payload.isAdmin,
            role: payload.role || '',
            time: Date.now(),
            fp: getFingerprint()
        };
        localStorage.setItem(cacheKey, JSON.stringify(record));
    }

    function readSession(cacheKey, ttlMs) {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        try {
            const data = JSON.parse(raw);
            const validTime = Date.now() - Number(data?.time || 0) < ttlMs;
            if (!validTime) return null;
            // 12 小时内直接放行：不依赖指纹（DevTools 设备仿真会改 screen 尺寸，导致误判失效）
            return data;
        } catch (e) {
            return null;
        }
    }

    global.AiBestPracticeAuthComponent = {
        getFingerprint,
        login,
        saveSession,
        readSession
    };
})(window);
