#!/usr/bin/env bash
# =========================================================
# launch_mvp.sh · 一键启动 智能订舱 Agent MVP 原型
# 行为：探测端口(默认 18081，不常用，避免与其他应用冲突)
#       ① 端口被本服务占用 → 直接打开首页，不重复启动
#       ② 端口被其他应用占用 → 自动顺延找下一个空闲端口再启动
#       ③ 端口空闲 → 若 dist/ 缺失先 npm run build，再启动并打开首页
# 用法：./launch_mvp.sh                # 默认端口 18081
#       PORT=xxxxx ./launch_mvp.sh     # 手动指定端口
# 说明：生产单端口(Express 托管 dist 前端)，比 Vite dev 更稳、更贴近交付验证。
# =========================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PORT="${PORT:-18081}"
URL="http://localhost:${PORT}"
LOGFILE="/tmp/mvp_prototype_launch.log"
PRODUCT="X 智能订舱 Agent"

is_up()   { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }
is_ours() { curl -sf --max-time 2 "http://localhost:$1/api/health" 2>/dev/null | grep -q "$PRODUCT"; }

# 前端构建产物 dist/ 缺失时先构建（dist/ 不入库）
if [ ! -d dist ]; then
  echo "[构建] dist/ 缺失，先执行 npm run build ..."
  npm run build
fi

# 端口探测：确认是本服务才复用；被其他应用占用则顺延找空闲端口
if is_up "$PORT"; then
  if is_ours "$PORT"; then
    echo "[已运行] ${URL} —— 已是本原型服务，直接打开应用首页"
    open "$URL" 2>/dev/null || true
    exit 0
  fi
  echo "[冲突] ${URL} 被其他应用占用（非本原型），自动顺延探测空闲端口 ..."
  while is_up "$PORT"; do
    PORT=$((PORT + 1))
    if [ "$PORT" -gt 65535 ]; then
      echo "[失败] 未找到空闲端口"
      exit 1
    fi
  done
  URL="http://localhost:${PORT}"
  echo "[顺延] 选用空闲端口 ${PORT}"
fi

echo "[启动] 端口 ${PORT} 空闲，启动 mvp-prototype（生产单端口）..."
nohup env NODE_ENV=production PORT="${PORT}" node server/index.js >"$LOGFILE" 2>&1 &
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
