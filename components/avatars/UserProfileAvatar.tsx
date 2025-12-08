import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";
import DefaultProfile from "@/public/assets/default-profile.png";
import { cn } from "@/lib/utils";
import { MiniAppContext, useFrameContext } from "../providers/FrameProvider";

interface UserProfileAvatarProps {
    className?: string;
}

export default function UserProfileAvatar({
    className,
}: UserProfileAvatarProps) {
    const { actions } = sdk;
    const frameContext = useFrameContext();
    const user = (frameContext?.context as MiniAppContext)?.user;

    const userProfile = {
        pfpUrl: user?.pfpUrl,
        fid: user?.fid,
    };

    const handleProfileClick = () => {
        if (userProfile?.fid) {
            actions.viewProfile({ fid: userProfile.fid });
        }
    };

    return (
        <div
            onClick={handleProfileClick}
            className={cn(
                "relative cursor-pointer overflow-hidden rounded-full",
                className
            )}
        >
            {userProfile?.pfpUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={userProfile.pfpUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            ) : (
                <Image
                    src={DefaultProfile}
                    alt="Default Profile"
                    fill
                    className="object-cover"
                />
            )}
        </div>
    );
}
