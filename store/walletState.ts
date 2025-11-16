import { atom } from 'jotai';

// null 또는 undefined는 지갑이 연결되지 않았음을 의미합니다.
export const walletAddressAtom = atom<string | undefined>(undefined);