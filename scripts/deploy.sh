#!/bin/bash
set -e

# ============================================================
# BaseCard Miniapp 배포 스크립트 (PM2 + Bun)
# ============================================================

APP_NAME="basecard-miniapp"
APP_DIR="/home/basecard/src/basecard-miniapp"
LOG_DIR="/home/basecard/logs"
REPO_URL="git@github-miniapp:basecardteam/basecard-miniapp.git"
BRANCH="main"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# 1. 사전 준비
# ============================================================
prepare() {
    log_info "📁 로그 디렉토리 확인..."
    mkdir -p "$LOG_DIR"

    if [ ! -d "$APP_DIR" ]; then
        log_info "📥 앱 디렉토리 없음, 클론 중..."
        git clone "$REPO_URL" "$APP_DIR"
    fi
}

# ============================================================
# 2. 소스 업데이트
# ============================================================
update_source() {
    log_info "📥 소스 업데이트 중..."
    cd "$APP_DIR"
    
    # 현재 커밋 저장 (롤백용)
    PREV_COMMIT=$(git rev-parse HEAD)
    echo "$PREV_COMMIT" > "$APP_DIR/.prev_commit"
    
    git fetch origin
    git reset --hard origin/$BRANCH
    
    NEW_COMMIT=$(git rev-parse HEAD)
    log_info "📌 커밋: ${PREV_COMMIT:0:7} → ${NEW_COMMIT:0:7}"
}

# ============================================================
# 3. 의존성 설치 & 빌드
# ============================================================
build() {
    log_info "📦 의존성 설치 중..."
    cd "$APP_DIR"
    bun install --frozen-lockfile
    
    log_info "🔨 빌드 중... (환경변수는 .env에서 로드)"
    bun run build
}

# ============================================================
# 4. PM2 재시작
# ============================================================
restart_pm2() {
    log_info "🔄 PM2 재시작 중..."
    cd "$APP_DIR"
    
    # PM2 프로세스가 있으면 reload, 없으면 start
    if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
        pm2 reload ecosystem.config.cjs --update-env
    else
        pm2 start ecosystem.config.cjs
    fi
    
    # PM2 저장 (재부팅 시 자동 시작)
    pm2 save
}

# ============================================================
# 5. 헬스체크
# ============================================================
healthcheck() {
    log_info "🏥 헬스체크 중..."
    
    local max_attempts=30
    local attempt=1
    local port=${PORT:-3000}
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
            log_info "✅ 헬스체크 통과! (attempt $attempt)"
            return 0
        fi
        
        log_warn "⏳ 대기 중... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log_error "❌ 헬스체크 실패!"
    return 1
}

# ============================================================
# 6. 롤백
# ============================================================
rollback() {
    log_error "🔙 롤백 시작..."
    cd "$APP_DIR"
    
    if [ -f ".prev_commit" ]; then
        PREV_COMMIT=$(cat .prev_commit)
        git reset --hard "$PREV_COMMIT"
        bun install --frozen-lockfile
        bun run build
        pm2 reload ecosystem.config.cjs --update-env
        log_info "✅ 롤백 완료: $PREV_COMMIT"
    else
        log_error "이전 커밋 정보 없음!"
        exit 1
    fi
}

# ============================================================
# 메인 실행
# ============================================================
main() {
    log_info "🚀 배포 시작: $APP_NAME"
    
    prepare
    update_source
    build
    restart_pm2
    
    if healthcheck; then
        log_info "🎉 배포 완료!"
        pm2 status
    else
        rollback
        exit 1
    fi
}

# 명령어 분기
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    status)
        pm2 status
        pm2 logs "$APP_NAME" --lines 20
        ;;
    logs)
        pm2 logs "$APP_NAME" --lines 100
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|logs}"
        exit 1
        ;;
esac
