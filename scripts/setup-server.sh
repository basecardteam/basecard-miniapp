#!/bin/bash
set -e

# ============================================================
# 홈서버 초기 셋업 스크립트
# 사용법: curl -sSL <raw url> | bash
# ============================================================

GREEN='\033[0;32m'
NC='\033[0m'
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

APP_DIR="/home/basecard/src/basecard-miniapp"
LOG_DIR="/home/basecard/logs"

# ============================================================
# 1. 필수 패키지 설치
# ============================================================
log_info "📦 NVM 및 Node.js v22 LTS 설치..."
if ! command -v node &> /dev/null; then
    # NVM 설치
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    
    # NVM 환경 로드
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Node.js v22 LTS 설치
    nvm install 22
    nvm use 22
    nvm alias default 22
    
    log_info "✅ Node.js $(node --version) 설치 완료"
fi

log_info "📦 Bun 설치..."
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

log_info "📦 PM2 설치..."
if ! command -v pm2 &> /dev/null; then
    # npm으로 설치 (node 있으므로)
    npm install -g pm2
fi

# ============================================================
# 2. 디렉토리 생성
# ============================================================
log_info "📁 디렉토리 생성..."
mkdir -p "$LOG_DIR"

# ============================================================
# 3. PM2 자동 시작 설정
# ============================================================
log_info "🔧 PM2 startup 설정..."
pm2 startup systemd -u $USER --hp $HOME | tail -1 | bash || true

# ============================================================
# 4. .env 파일 템플릿
# ============================================================
log_info "📝 .env 템플릿 생성..."
if [ ! -f "$APP_DIR/.env" ]; then
    cat > "$APP_DIR/.env.example" << 'EOF'
# === 공개 환경변수 (클라이언트에서 접근 가능) ===
NEXT_PUBLIC_BACKEND_API_URL=https://api.basecard.io
NEXT_PUBLIC_URL=https://miniapp.basecard.io
NEXT_PUBLIC_PROJECT_NAME=BaseCard
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_cdp_client_api_key

# === 서버 전용 환경변수 ===
# (필요시 추가)
EOF
    log_info "⚠️  $APP_DIR/.env.example 을 .env로 복사하고 값을 설정하세요!"
fi

log_info "✅ 셋업 완료!"
log_info ""
log_info "다음 단계:"
log_info "1. cd $APP_DIR"
log_info "2. cp .env.example .env && vim .env  # 환경변수 설정"
log_info "3. ./scripts/deploy.sh  # 배포 실행"
