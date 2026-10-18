// 第一個 Worker：hello-worker.js
// 部署方式：Cloudflare Dashboard → Workers & Pages → Create → 貼上 → Deploy
// 這個 Worker 做兩件事：
//   1. 回一個中文頁面，顯示這次請求實際落在全球哪個邊緣節點（證明：程式真的跑在離使用者最近的機房）
//   2. /api/hello 回 JSON——之後接前端、當 API 用就是這個模式

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // request.cf 是 Cloudflare 邊緣節點附帶的請求資訊：城市、國家、時區等
    const city = request.cf?.city || "未知";
    const country = request.cf?.country || "未知";
    const colo = request.cf?.colo || "未知"; // 實際處理這次請求的機房代號

    if (url.pathname === "/api/hello") {
      return Response.json({
        hello: "world",
        via: "Cloudflare Workers（全球邊緣節點）",
        城市: city,
        國家: country,
        機房: colo,
        時間: new Date().toISOString(),
      });
    }

    const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>我的第一個 Worker</title>
<style>
  body{font-family:-apple-system,"Noto Sans TC",sans-serif;max-width:640px;margin:48px auto;padding:0 20px;line-height:1.8;color:#1f2937}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;background:#f9fafb}
  code{background:#eef2ff;padding:2px 8px;border-radius:6px;font-size:14px}
  a{color:#4f46e5}
</style></head>
<body>
  <h1>👋 這是跑在 Cloudflare 全球節點上的程式</h1>
  <div class="card">
    <p>你剛剛這次請求，實際是由這座機房處理的：</p>
    <p>📍 城市：<strong>${city}</strong>（${country}）<br>
       🖥️ 機房代號：<code>${colo}</code></p>
    <p>沒有租伺服器、沒有設定 Nginx——這段 JS 部署上去，全球 300+ 城市自動都有了。</p>
  </div>
  <p>試試 JSON 端點：<a href="/api/hello"><code>/api/hello</code></a></p>
  <p style="color:#6b7280;font-size:13px">部署者：mymuseconnet 的 bot 身份 · ${new Date().toISOString().slice(0, 10)}</p>
</body></html>`;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
