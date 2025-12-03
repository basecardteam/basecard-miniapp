// 명시적으로 Base Sepolia (84532) 또는 Base Mainnet (8453) 체인 ID 지정
export const REQUIRED_CHAIN_ID =
    process.env.NEXT_PUBLIC_USE_TESTNET === "true"
        ? 84532 // Base Sepolia
        : 8453; // Base Mainnet
