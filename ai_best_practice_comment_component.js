(function (global) {
    'use strict';

    async function submitCommentStream(endpoint, payload, handlers) {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload || {})
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const line of parts) {
                if (!line.startsWith('data: ')) continue;
                let data = null;
                try {
                    data = JSON.parse(line.slice(6));
                } catch (e) {
                    continue;
                }
                if (data?.text && typeof handlers?.onText === 'function') {
                    handlers.onText(data.text);
                }
                if (data?.error) {
                    throw new Error(data.error);
                }
                if (data?.done && typeof handlers?.onDone === 'function') {
                    handlers.onDone(data.turn || {});
                    return;
                }
            }
        }

        if (typeof handlers?.onEnd === 'function') {
            handlers.onEnd();
        }
    }

    async function listComments(endpoint, offset, authPayload) {
        const headers = { 'Content-Type': 'application/json' };
        let url = `${endpoint}?offset=${offset}`;
        if (authPayload && authPayload.adminToken) {
            headers['Authorization'] = `Bearer ${authPayload.adminToken}`;
        }
        if (authPayload && authPayload.userId && authPayload.password) {
            url += `&userId=${encodeURIComponent(authPayload.userId)}&password=${encodeURIComponent(authPayload.password)}`;
        }
        const resp = await fetch(url, { headers });
        if (!resp.ok) return [];
        return await resp.json();
    }

    global.AiBestPracticeCommentComponent = {
        submitCommentStream,
        listComments
    };
})(window);
