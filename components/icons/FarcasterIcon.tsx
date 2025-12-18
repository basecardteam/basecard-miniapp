import { SVGProps } from "react";

interface FarcasterIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

export default function FarcasterIcon({
    size = 20,
    className,
    ...props
}: FarcasterIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 23 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M3.58942 0.158203H17.9576V2.78504H21.8733L21.0664 5.79634H20.4405V16.9145L21.0664 17.5404V18.4481L21.6987 18.8132V19.8996H14.5571V18.8132L15.023 18.3473V17.5404L15.6489 16.9145V10.2677C15.6489 7.52935 12.6371 6.33658 10.8461 6.33658C9.05501 6.33658 6.02244 7.76019 6.02244 10.2677V16.9145L6.64835 17.5404L6.86457 18.3473L7.33042 18.8132V19.8996H0.206055V18.8132L1.01293 18.3473V17.5404L1.63884 16.9145V5.79634H1.01293L0.206055 2.78504H3.58942V0.158203Z"
                fill="currentColor"
            />
        </svg>
    );
}
