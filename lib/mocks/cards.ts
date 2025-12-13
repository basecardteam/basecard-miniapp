import { Card } from '../types/api';

/**
 * Card 인터페이스 기반 목 데이터
 */
export const mockCards: Card[] = [
    {
        id: '1',
        userId: 'user-001',
        tokenId: 1001,
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        nickname: 'Alice',
        role: 'Developer',
        bio: 'Passionate about building beautiful user experiences with React and TypeScript.',
        imageUri: 'ipfs://bafybeigawnpuomc5pxfaikcx2nf4qlgqc3bjt7wltojck7gajc7ybq4oli/basecard-jihwang.png',
        socials: {
            twitter: 'https://twitter.com/alice',
            github: 'https://github.com/alice',
            linkedin: 'https://linkedin.com/in/alice'
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z'
    },
    {
        id: '2',
        userId: 'user-002',
        tokenId: 1002,
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        nickname: 'Bob',
        role: 'Marketer',
        bio: 'Building the future of decentralized applications.',
        imageUri: 'ipfs://bafybeigawnpuomc5pxfaikcx2nf4qlgqc3bjt7wltojck7gajc7ybq4oli/basecard-mozzigom.png',
        socials: {
            twitter: 'https://twitter.com/bob',
            github: 'https://github.com/bob'
        },
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-18T11:45:00Z'
    },
    {
        id: '3',
        userId: 'user-003',
        tokenId: null,
        txHash: null,
        nickname: 'Charlie',
        role: 'Designer',
        bio: 'Creating intuitive and delightful designs.',
        imageUri: 'ipfs://bafybeigawnpuomc5pxfaikcx2nf4qlgqc3bjt7wltojck7gajc7ybq4oli/basecard-soyverse.png',
        socials: {
            behance: 'https://behance.net/charlie',
            dribbble: 'https://dribbble.com/charlie'
        },
        createdAt: '2024-01-17T13:20:00Z',
        updatedAt: '2024-01-17T13:20:00Z'
    },
    {
        id: '4',
        userId: 'user-004',
        tokenId: 1004,
        txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        nickname: 'Diana',
        role: 'Full Stack Developer',
        bio: null,
        imageUri: 'ipfs://bafybeigawnpuomc5pxfaikcx2nf4qlgqc3bjt7wltojck7gajc7ybq4oli/basecard-tomatocat.png',
        socials: null,
        createdAt: '2024-01-18T16:00:00Z',
        updatedAt: '2024-01-19T10:30:00Z'
    },
    {
        id: '5',
        userId: 'user-005',
        tokenId: 1005,
        txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        nickname: 'Eve',
        role: 'Marketer',
        bio: 'Exploring the intersection of art and technology.',
        imageUri: 'ipfs://bafybeiabnfvbqgkotoyh4afeqh7zwh3qjecz4tm3zqfwgdv54fgayc2ikm',
        socials: {
            instagram: 'https://instagram.com/eve',
            twitter: 'https://twitter.com/eve'
        },
        createdAt: '2024-01-19T08:45:00Z',
        updatedAt: '2024-01-21T15:10:00Z'
    },
    {
        id: '6',
        userId: 'user-006',
        tokenId: 1006,
        txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        nickname: 'Eve',
        role: 'Marketer',
        bio: 'Exploring the intersection of art and technology.',
        imageUri: 'ipfs://bafybeiabnfvbqgkotoyh4afeqh7zwh3qjecz4tm3zqfwgdv54fgayc2ikm',
        socials: {
            instagram: 'https://instagram.com/eve',
            twitter: 'https://twitter.com/eve'
        },
        createdAt: '2024-01-19T08:45:00Z',
        updatedAt: '2024-01-21T15:10:00Z'
    },
    {
        id: '7',
        userId: 'user-007',
        tokenId: 1007,
        txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        nickname: 'Eve',
        role: 'Marketer',
        bio: 'Exploring the intersection of art and technology.',
        imageUri: 'ipfs://bafybeiabnfvbqgkotoyh4afeqh7zwh3qjecz4tm3zqfwgdv54fgayc2ikm',
        socials: {
            instagram: 'https://instagram.com/eve',
            twitter: 'https://twitter.com/eve'
        },
        createdAt: '2024-01-19T08:45:00Z',
        updatedAt: '2024-01-21T15:10:00Z'
    },
    {
        id: '8',
        userId: 'user-008',
        tokenId: 1008,
        txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        nickname: 'Eve',
        role: 'Marketer',
        bio: 'Exploring the intersection of art and technology.',
        imageUri: 'ipfs://bafybeiabnfvbqgkotoyh4afeqh7zwh3qjecz4tm3zqfwgdv54fgayc2ikm',
        socials: {
            instagram: 'https://instagram.com/eve',
            twitter: 'https://twitter.com/eve'
        },
        createdAt: '2024-01-19T08:45:00Z',
        updatedAt: '2024-01-21T15:10:00Z'
    },
];

/**
 * 단일 카드 목 데이터 (완전히 채워진 예시)
 */
export const mockCardComplete: Card = {
    id: 'complete-001',
    userId: 'user-complete',
    tokenId: 2001,
    txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    nickname: 'Complete User',
    role: 'Developer',
    bio: 'A complete profile with all fields filled. This is an example of a fully minted and configured card.',
    imageUri: 'https://ipfs.io/ipfs/QmCompleteExample',
    socials: {
        twitter: 'https://twitter.com/complete',
        github: 'https://github.com/complete',
        linkedin: 'https://linkedin.com/in/complete',
        website: 'https://complete.dev'
    },
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
};

/**
 * 단일 카드 목 데이터 (민팅 전 상태)
 */
export const mockCardUnminted: Card = {
    id: 'unminted-001',
    userId: 'user-unminted',
    tokenId: null,
    txHash: null,
    nickname: 'Unminted User',
    role: 'Developer',
    bio: 'This card has not been minted yet.',
    imageUri: 'https://ipfs.io/ipfs/QmUnmintedExample',
    socials: {
        github: 'https://github.com/unminted'
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
};
