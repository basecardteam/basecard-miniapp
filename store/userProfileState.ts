import { atom } from "jotai";

interface UserProfile {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
}

const initialUserProfile: UserProfile = {
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null,
};

export const userProfileAtom = atom<UserProfile>(initialUserProfile);

export const updateProfileAtom = atom(
    null,
    (get, set, update: Partial<UserProfile>) => {
        const current = get(userProfileAtom);
        set(userProfileAtom, { ...current, ...update });
    }
);
