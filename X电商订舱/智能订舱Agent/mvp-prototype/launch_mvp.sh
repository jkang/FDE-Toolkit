#!/usr/bin/env bash
# =========================================================
# launch_mvp.sh · 一键启动 智能订舱 Agent MVP 原型
# 行为：检查已有端口(8081) → 未占用则启动服务 → 打开应用首页(新 tab)
# 用法：./launch_mvp.sh
#   - 已在运行：直接打开首页，不重复启动
#   - 未运行  ：后台启动生产单端口服务(:8081)，健康检查通过后打开首页
# 说明：生产单端口(Express 托管 dist 前端)，比 Vite dev 更稳、更贴近交付验证。
# =========================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PORT="${PORT:-8081}"
URL="http://localhost:${PORT}"
LOGFILE="/tmp/mvp_prototype_launch.log"

is_up() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

if is_up "$PORT"; then
  echo "[已运行] ${URL} —— 端口 ${PORT} 已被占用，直接打开应用首页"
  open "$URL" 2>/dev/null || true
  exit 0
fi

echo "[启动] 端口 ${PORT} 空闲，启动 mvp-prototype（生产单端口）..."
nohup env NODE_ENV=production node server/index.js >"$LOGFILE" 2>&1 &
LAUNCH_PID=$!
echo "       进程 PID=${LAUNCH_PID}，日志=${LOGFILE}"

# 健康检查（最多 30s）
for i in $(seq 1 30); do
  if is_up "$PORT"; then
    break
  fi
  sleep 1
done

if is_up "$PORT"; then
  echo "[已启动] ${URL} —— 服务已就绪（日志：${LOGFILE}）"
  echo "   - 首页      ：${URL}"
  echo "   - 健康检查  ：${URL}/api/health"
  echo "   - 订单接口  ：GET ${URL}/api/orders"
  echo "   - 停止服务  ：kill ${LAUNCH_PID}（或 pkill -f 'node server/index.js'）"
  open "$URL" 2>/dev/null || true
  exit 0
fi

echo "[失败] 服务未能在 30s 内启动，请查看 ${LOGFILE}"
cat "$LOGFILE" 2>/dev/null || true
exit 1
