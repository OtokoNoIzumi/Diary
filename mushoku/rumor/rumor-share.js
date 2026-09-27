/* 分享图：先画一张固定宽度的离屏卡片，再画成图片。
   配图先画成 JPEG 再交给画布。读到的类型是 application/octet-stream，直接塞进海报只会留下底色。
   电脑：下载，并复制到剪贴板。不调用系统分享。
   手机：交给系统分享。
   微信：弹出图片，提示长按保存。
   二维码只画在这张图上。 */
(function (global) {
  "use strict";

  function isWeChat() {
    return /MicroMessenger/i.test(navigator.userAgent || "");
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  }

  function loadHtml2Canvas() {
    if (global.html2canvas) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://fastly.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      script.onload = function () { resolve(true); };
      script.onerror = function () { resolve(false); };
      document.head.appendChild(script);
    });
  }

  function qrDataUrl(text) {
    var qr = global.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    var count = qr.getModuleCount();
    var cell = 6;
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = count * cell;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1c2430";
    for (var row = 0; row < count; row++) {
      for (var col = 0; col < count; col++) {
        if (qr.isDark(row, col)) ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
    return canvas.toDataURL("image/png");
  }

  function traceText(record) {
    if (location.protocol === "http:" || location.protocol === "https:") {
      return location.origin + location.pathname + "#" + record.id;
    }
    return record.id + "\n" + (record.cite || "");
  }

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function drawImageData(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch (err) {
          resolve("");
        }
      };
      img.onerror = function () { resolve(""); };
      img.src = src;
    });
  }

  function loadInline(src) {
    if (!src) return Promise.resolve("");
    if (String(src).indexOf("data:") === 0) return Promise.resolve(src);
    var table = global.RUMOR_INLINE || {};
    if (table[src]) return Promise.resolve(table[src]);
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", src, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        var blob = xhr.response;
        if (!blob || !blob.size) {
          drawImageData(src).then(resolve);
          return;
        }
        var url = URL.createObjectURL(blob);
        drawImageData(url).then(function (data) {
          URL.revokeObjectURL(url);
          resolve(data || "");
        });
      };
      xhr.onerror = function () { drawImageData(src).then(resolve); };
      xhr.send();
    });
  }

  async function posterHtml(record, meta) {
    var sealBg = meta.tone === "true" ? "#e7f4ec" : meta.tone === "false" ? "#fbeceb" : "#f8f1e2";
    var pills = '<span style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.4px;border:1px solid #e6dccb;background:#fff;border-radius:4px;padding:2px 10px;margin:0 8px 8px 0;">' + esc(record.id) + "</span>";
    (meta.tags || []).forEach(function (tag, index) {
      var style = index === 0
        ? "background:#eae3d4;color:#4a3e2c;font-weight:600;"
        : "background:#f4efe6;color:#5c6b7a;";
      pills += '<span style="display:inline-block;font-size:12px;border-radius:4px;padding:2px 10px;margin:0 8px 8px 0;' + style + '">' + esc(tag) + "</span>";
    });
    var pictures = "";
    var images = record.images || [];
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      var src = typeof image === "string" ? image : image.src;
      var caption = typeof image === "string" ? "" : (image.caption || "");
      var data = await loadInline(src);
      if (!data || String(data).indexOf("data:") !== 0) continue;
      pictures += '<img alt="" src="' + data + '" style="width:100%;height:auto;display:block;border-radius:8px;margin:0 0 6px;background:#f4efe6;">';
      if (caption) pictures += '<div style="font-size:13px;color:#5c6b7a;margin:0 0 14px;">' + esc(caption) + "</div>";
    }
    var comparisons = (meta.comparisons || []).map(function (item) {
      return '<div style="flex:1 1 170px;background:#faf7f2;border:1px solid #e8dfd0;border-radius:6px;padding:12px 14px;box-sizing:border-box;">' +
        '<div style="font-size:12px;font-weight:600;color:#6c5b42;margin-bottom:6px;">' + esc(item.source) + "</div>" +
        '<div style="font-size:14px;line-height:1.65;">' + esc(item.text) + "</div></div>";
    }).join("");
    var extra = "";
    if (meta.details || comparisons) {
      extra = '<div style="margin-top:14px;padding-top:14px;border-top:1px dashed #e4d8c4;">' +
        (meta.details ? '<div style="font-size:14px;line-height:1.75;color:#5c6b7a;">' + esc(meta.details) + "</div>" : "") +
        (comparisons ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;">' + comparisons + "</div>" : "") +
        "</div>";
    }
    var related = (meta.see || []).filter(Boolean);
    var relatedHtml = related.length
      ? '<div style="margin-top:4px;">相关 ' + esc(related.join("、")) + "</div>"
      : "";
    var cite = meta.cite
      ? '<div style="font-size:13px;color:#5c6b7a;margin:-8px 0 14px;">' + esc(meta.cite) + "</div>"
      : "";
    return '' +
      '<div style="width:640px;box-sizing:border-box;padding:28px;background:#f6f1e8;font-family:\'PingFang SC\',\'Microsoft YaHei\',sans-serif;color:#1c2430;">' +
        '<div style="background:#fffdf8;border:1px solid #e6dccb;border-left:6px solid ' + meta.color + ';border-radius:8px;padding:28px 28px 20px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px;">' +
            '<div>' + pills + "</div>" +
            '<div style="border:1.5px solid ' + meta.color + ';color:' + meta.color + ';background:' + sealBg + ';border-radius:4px;padding:4px 12px;font-size:13px;font-weight:700;letter-spacing:1.5px;white-space:nowrap;transform:rotate(-1.5deg);">' + esc(meta.verdict) + "</div>" +
          "</div>" +
          '<div style="background:#f4efe6;border-left:3px solid #d1c5b0;border-radius:6px;padding:14px 18px;margin-bottom:16px;">' +
            '<div style="font-size:12px;font-weight:600;color:#5c6b7a;margin-bottom:4px;">关注点</div>' +
            '<div style="font-size:16px;line-height:1.65;">' + esc(meta.claim) + "</div>" +
          "</div>" +
          '<p style="margin:0 0 8px;font-size:16px;line-height:1.8;"><b style="margin-right:6px;">查证结论</b>' + esc(meta.summary) + "</p>" +
          cite +
          pictures +
          extra +
          '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-top:1px solid #e4d8c4;padding-top:14px;margin-top:18px;">' +
            '<div style="font-size:14px;line-height:1.7;color:#5c6b7a;">第 ' + esc(meta.index) + " 条 / 共 " + esc(meta.total) + " 条" + relatedHtml + "</div>" +
            '<img alt="" src="' + qrDataUrl(traceText(record)) + '" style="width:96px;height:96px;display:block;background:#fff;">' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function showSheet(blob, hintText) {
    var sheet = document.getElementById("share-sheet");
    var img = document.getElementById("share-sheet-img");
    var hint = document.getElementById("share-sheet-hint");
    img.src = URL.createObjectURL(blob);
    hint.textContent = hintText;
    document.getElementById("share-copy").hidden = true;
    document.getElementById("share-save").hidden = true;
    sheet.hidden = false;
  }

  function showNote(text) {
    var note = document.getElementById("share-note");
    note.textContent = text;
    note.hidden = false;
    clearTimeout(showNote._timer);
    showNote._timer = setTimeout(function () { note.hidden = true; }, 3200);
  }

  async function handOff(blob, name, desktopCopy) {
    if (isWeChat()) {
      showSheet(blob, "长按图片，保存到相册。");
      return;
    }

    if (isMobile()) {
      var file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: name });
        } catch (err) {
          if (!(err && err.name === "AbortError")) downloadBlob(blob, name);
        }
        return;
      }
      downloadBlob(blob, name);
      return;
    }

    downloadBlob(blob, name);
    var copied = desktopCopy ? await desktopCopy.copyPromise : false;
    showNote(copied ? "已下载，并已复制到剪贴板。" : "已下载。这个浏览器没能把图片放进剪贴板。");
  }

  function beginDesktopCopy() {
    try {
      if (isWeChat() || isMobile() || !navigator.clipboard || !global.ClipboardItem) return null;
      var settle;
      var fail;
      var blobPromise = new Promise(function (resolve, reject) {
        settle = resolve;
        fail = reject;
      });
      var copyPromise = navigator.clipboard.write([
        new ClipboardItem({ "image/png": blobPromise })
      ]).then(function () { return true; }, function () { return false; });
      return { settle: settle, fail: fail, copyPromise: copyPromise };
    } catch (err) {
      return null;
    }
  }

  async function capture(record, meta) {
    var desktopCopy = beginDesktopCopy();
    var ready = await loadHtml2Canvas();
    if (!ready) {
      if (desktopCopy) desktopCopy.fail(new Error("engine"));
      document.getElementById("share-sheet").hidden = false;
      document.getElementById("share-sheet-img").removeAttribute("src");
      document.getElementById("share-sheet-hint").textContent = "图片引擎没有加载成功。请联网后再试。";
      return;
    }
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-10000px;top:0;";
    holder.innerHTML = await posterHtml(record, meta);
    document.body.appendChild(holder);
    try {
      var canvas = await global.html2canvas(holder.firstElementChild, {
        backgroundColor: "#f6f1e8",
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: false
      });
      var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, "image/png"); });
      if (!blob) throw new Error("empty");
      if (desktopCopy) desktopCopy.settle(blob);
      await handOff(blob, record.id + ".png", desktopCopy);
    } catch (err) {
      if (desktopCopy) desktopCopy.fail(err);
      showNote("这张图没有生成。");
    } finally {
      holder.remove();
    }
  }

  global.RumorShare = { capture: capture };
})(window);
