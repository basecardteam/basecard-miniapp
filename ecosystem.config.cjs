module.exports = {
    apps: [
        {
            name: "basecard-miniapp",
            script: "bun",
            args: "start",
            cwd: "/home/basecard/src/basecard-miniapp",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                PORT: 3000, // backend가 3000 사용 중이면 3001
            },
            // 로그 설정
            error_file: "/home/basecard/logs/miniapp-error.log",
            out_file: "/home/basecard/logs/miniapp-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            // graceful restart
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
};
