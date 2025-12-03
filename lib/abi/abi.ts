export const baseCardAbi = [
    // 1. Functions
    {
        type: "function",
        name: "mintBaseCard",
        inputs: [
            {
                name: "_initialCardData",
                type: "tuple",
                components: [
                    { name: "imageURI", type: "string" },
                    { name: "nickname", type: "string" },
                    { name: "role", type: "string" },
                    { name: "bio", type: "string" },
                ],
            },
            { name: "_socialKeys", type: "string[]" },
            { name: "_socialValues", type: "string[]" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "hasMinted",
        inputs: [{ name: "", type: "address" }],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "tokenURI",
        inputs: [{ name: "_tokenId", type: "uint256" }],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
    },

    // 2. Events (emitted by mintBaseCard)
    {
        type: "event",
        name: "MintBaseCard",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "tokenId", type: "uint256", indexed: true },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "SocialLinked",
        inputs: [
            { name: "tokenId", type: "uint256", indexed: true },
            { name: "key", type: "string", indexed: false },
            { name: "value", type: "string", indexed: false },
        ],
        anonymous: false,
    },

    // 3. Errors (thrown by these functions)
    {
        type: "error",
        name: "AlreadyMinted",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidTokenId",
        inputs: [{ name: "tokenId", type: "uint256" }],
    },
    {
        type: "error",
        name: "NotAllowedSocialKey",
        inputs: [],
    },
];
