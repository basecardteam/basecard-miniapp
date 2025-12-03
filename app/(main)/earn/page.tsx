"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Card } from "@/lib/types";
import { safeImageURI } from "@/lib/legacy/imageUtils";
import bountiesData from "@/lib/mock/mock-bounties.json";
import hackathonsData from "@/lib/mock/mock-hackathons.json";

interface Bounty {
    id: string;
    title: string;
    organization: string;
    rewardAmount: number;
    rewardCurrency: string;
    deadline: string;
    participants: number;
    category: string;
    thumbnailUrl: string;
}

interface Hackathon {
    id: string;
    title: string;
    organization: string;
    prizePool: number;
    prizeCurrency: string;
    theme: string;
    startDate: string;
    endDate: string;
    participantCount: number;
    thumbnailUrl: string;
}

export default function Earn() {
    const [userRole, setUserRole] = useState<"Builder" | "ProjectOwner">(
        "Builder"
    );
    const [typeFilter, setTypeFilter] = useState<
        "All" | "Bounties" | "Hackathons"
    >("All");
    const [builders, setBuilders] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bounties: Bounty[] = bountiesData.bounties;
    const hackathons: Hackathon[] = hackathonsData.hackathons;

    // Fetch data based on user role
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (userRole === "Builder") {
                    // Builder는 bounties와 hackathons을 봅니다 (이미 import됨)
                    // Mock 데이터는 이미 로드되어 있으므로 추가 fetch 불필요
                    setError(null);
                } else {
                    // ProjectOwner는 builder 리스트를 봅니다
                    const response = await fetch("/api/cards");

                    if (!response.ok) {
                        throw new Error("Failed to fetch builders");
                    }

                    const data = await response.json();
                    setBuilders(data);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to fetch data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userRole]);

    // Filter bounties and hackathons based on selected filters
    const filteredBounties = bounties.filter(() => {
        const matchesType = typeFilter === "All" || typeFilter === "Bounties";
        return matchesType;
    });

    const filteredHackathons = hackathons.filter(() => {
        return typeFilter === "All" || typeFilter === "Hackathons";
    });

    const filteredBuilders = builders;

    // Calculate deadline in days
    const calculateDaysRemaining = (deadline: string) => {
        const now = new Date();
        const end = new Date(deadline);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays}d` : "Ended";
    };

    return (
        <div className="relative min-h-screen bg-[#F8F9FA]">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
                {/* I am a section */}
                <div className="mb-6">
                    <h1 className="text-center text-4xl font-k2d-bold text-black mb-4">
                        I am a{" "}
                        <span className="text-[#0050FF]">{userRole}</span>
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUserRole("Builder")}
                            className={`flex-1 py-3 rounded-full font-k2d-semibold transition-all ${
                                userRole === "Builder"
                                    ? "bg-white text-[#0050FF] shadow-md"
                                    : "bg-transparent text-gray-500 border border-gray-300"
                            }`}
                        >
                            Builder
                        </button>
                        <button
                            onClick={() => setUserRole("ProjectOwner")}
                            className={`flex-1 py-3 rounded-full font-k2d-semibold transition-all ${
                                userRole === "ProjectOwner"
                                    ? "bg-white text-[#0050FF] shadow-md"
                                    : "bg-transparent text-gray-500 border border-gray-300"
                            }`}
                        >
                            ProjectOwner
                        </button>
                    </div>
                </div>

                {/* Browse Section */}
                <div className="mb-6">
                    <h2 className="text-l font-k2d-regular text-gray-700 mb-4">
                        {userRole === "Builder" ? (
                            <>
                                Browse Opportunities to{" "}
                                <span className="text-[#0050FF] font-k2d-semibold">
                                    work, prove and earn
                                </span>
                            </>
                        ) : (
                            <>
                                Find{" "}
                                <span className="text-[#0050FF] font-k2d-semibold">
                                    Builders
                                </span>{" "}
                                for your project
                            </>
                        )}
                    </h2>

                    {/* Type Filter - Only for Builder */}
                    {userRole === "Builder" && (
                        <div className="flex gap-2 mb-4">
                            {(["All", "Bounties", "Hackathons"] as const).map(
                                (filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setTypeFilter(filter)}
                                        className={`px-4 py-2 rounded-full font-k2d-medium transition-colors text-sm ${
                                            typeFilter === filter
                                                ? "bg-black text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                )
                            )}
                            <button className="ml-auto p-2 rounded-full bg-white hover:bg-gray-100 transition-colors">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M3 4h18M3 12h18M3 20h18" />
                                    <path d="M6 8L10 12 6 16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Content List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#0050FF]"></div>
                            <p className="mt-4 text-gray-500 font-k2d-regular">
                                Loading...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 font-k2d-regular mb-4">
                                Error: {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-[#0050FF] text-white rounded-full font-k2d-medium hover:bg-[#0040CC] transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : userRole === "Builder" ? (
                        <>
                            {/* Bounties List */}
                            {filteredBounties.map((bounty) => (
                                <div
                                    key={bounty.id}
                                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        console.log(
                                            "Navigate to bounty",
                                            bounty.id
                                        );
                                    }}
                                >
                                    <div className="flex gap-4">
                                        {/* Bounty Image/Thumbnail */}
                                        <div className="w-24 h-24 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                            {bounty.thumbnailUrl ? (
                                                <Image
                                                    src={bounty.thumbnailUrl}
                                                    alt={bounty.organization}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-white text-2xl font-k2d-bold">
                                                    {bounty.organization
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Bounty Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-k2d-semibold text-base text-black mb-1 truncate">
                                                {bounty.title}
                                            </h3>
                                            <div className="flex items-center gap-1 mb-2">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="#0050FF"
                                                >
                                                    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                                </svg>
                                                <span className="text-sm text-[#0050FF] font-k2d-medium">
                                                    {bounty.organization}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#0050FF"
                                                        strokeWidth="2"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <path d="M12 6v6l4 2" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600 font-k2d-regular">
                                                        {(
                                                            bounty.rewardAmount /
                                                            1000
                                                        ).toFixed(0)}
                                                        k{" "}
                                                        {bounty.rewardCurrency}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm text-gray-400 font-k2d-regular">
                                                        Due in{" "}
                                                        {calculateDaysRemaining(
                                                            bounty.deadline
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center bg-gray-100 gap-1 px-2 py-1 rounded-full">
                                                    {/* <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="gray"
                                                    > */}

                                                    <svg
                                                        width="42"
                                                        height="21"
                                                        viewBox="0 0 42 21"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <rect
                                                            width="41.2545"
                                                            height="20.7994"
                                                            rx="10.3997"
                                                            fill="#62748D"
                                                        />
                                                        <path
                                                            d="M6.81757 14.4025L6.96217 9.207C7.02534 8.9144 7.2459 8.68116 7.53451 8.60173L14.1709 5.45228C14.7183 5.30163 15.2451 5.75068 15.183 6.31504V11.3219C15.1477 11.6425 14.9242 11.911 14.6153 12.0037L7.83431 15.3419C7.24832 15.5179 6.68843 15.0006 6.81757 14.4025Z"
                                                            fill="white"
                                                        />
                                                    </svg>

                                                    <span className="text-xs text-gray-600 font-k2d-medium">
                                                        +{bounty.participants}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Hackathons List */}
                            {filteredHackathons.map((hackathon) => (
                                <div
                                    key={hackathon.id}
                                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        console.log(
                                            "Navigate to hackathon",
                                            hackathon.id
                                        );
                                    }}
                                >
                                    <div className="flex gap-4">
                                        {/* Hackathon Image/Thumbnail */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                            <span className="text-white text-2xl font-k2d-bold">
                                                {hackathon.organization
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Hackathon Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-k2d-semibold text-base text-black mb-1 truncate">
                                                {hackathon.title}
                                            </h3>
                                            <div className="flex items-center gap-1 mb-2">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="#0050FF"
                                                >
                                                    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                                </svg>
                                                <span className="text-sm text-[#0050FF] font-k2d-medium">
                                                    {hackathon.organization}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#0050FF"
                                                        strokeWidth="2"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <path d="M12 6v6l4 2" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600 font-k2d-regular">
                                                        {(
                                                            hackathon.prizePool /
                                                            1000
                                                        ).toFixed(0)}
                                                        k{" "}
                                                        {
                                                            hackathon.prizeCurrency
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm text-gray-400 font-k2d-regular">
                                                        Due in{" "}
                                                        {calculateDaysRemaining(
                                                            hackathon.endDate
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    <svg
                                                        width="42"
                                                        height="21"
                                                        viewBox="0 0 42 21"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <rect
                                                            width="41.2545"
                                                            height="20.7994"
                                                            rx="10.3997"
                                                            fill="#62748D"
                                                        />
                                                        <path
                                                            d="M6.81757 14.4025L6.96217 9.207C7.02534 8.9144 7.2459 8.68116 7.53451 8.60173L14.1709 5.45228C14.7183 5.30163 15.2451 5.75068 15.183 6.31504V11.3219C15.1477 11.6425 14.9242 11.911 14.6153 12.0037L7.83431 15.3419C7.24832 15.5179 6.68843 15.0006 6.81757 14.4025Z"
                                                            fill="white"
                                                        />
                                                    </svg>
                                                    <span className="text-xs text-gray-600 font-k2d-medium">
                                                        +
                                                        {
                                                            hackathon.participantCount
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredBounties.length === 0 &&
                                filteredHackathons.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 font-k2d-regular">
                                            No opportunities available
                                        </p>
                                    </div>
                                )}
                        </>
                    ) : (
                        <>
                            {/* Recommendation Header for ProjectOwner */}
                            {filteredBuilders.length > 0 && (
                                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-k2d-bold text-black mb-2">
                                                ✨ Recommend you!
                                            </h3>
                                            <p className="text-base font-k2d-medium text-gray-700">
                                                Find talented builders and{" "}
                                                <span className="text-[#0050FF] font-k2d-bold">
                                                    Keep in touch!
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Builders List for ProjectOwner */}
                            {filteredBuilders.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 font-k2d-regular">
                                        No builders available
                                    </p>
                                </div>
                            ) : (
                                filteredBuilders.map((builder, index) => (
                                    <div
                                        key={builder.id}
                                        className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                            index === 0
                                                ? "border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 relative"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            window.open(
                                                `https://base.app/profile/${builder.address}`,
                                                "_blank"
                                            );
                                        }}
                                    >
                                        {/* Top Recommended Badge */}
                                        {index === 0 && (
                                            <div className="absolute -top-3 -right-3 text-white px-3 py-1 rounded-full text-xs font-k2d-bold shadow-lg flex items-center gap-1 animate-pulse">
                                                <span>⭐</span>
                                                <span>TOP PICK</span>
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            {/* Builder Card Image */}
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                {(() => {
                                                    const imageUrl =
                                                        safeImageURI(
                                                            builder.imageURI,
                                                            "/assets/default-profile.png"
                                                        );

                                                    return imageUrl ? (
                                                        <Image
                                                            src={imageUrl}
                                                            alt={
                                                                builder.nickname ||
                                                                "Builder profile"
                                                            }
                                                            fill
                                                            className="object-contain"
                                                            unoptimized={imageUrl.startsWith(
                                                                "data:"
                                                            )}
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    "/assets/default-profile.png";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <svg
                                                                width="40"
                                                                height="40"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                                            </svg>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Builder Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-k2d-semibold text-base text-black mb-1 truncate">
                                                    {builder.nickname}
                                                </h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className="text-sm text-[#0050FF] font-k2d-medium">
                                                        {builder.basename}
                                                    </span>
                                                </div>
                                                {builder.role && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <span className="text-sm text-gray-600 font-k2d-regular">
                                                            {builder.role}
                                                        </span>
                                                    </div>
                                                )}
                                                {builder.skills &&
                                                    builder.skills.length >
                                                        0 && (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {builder.skills
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        skill,
                                                                        idx
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="text-xs bg-blue-100 text-[#0050FF] px-2 py-1 rounded-full font-k2d-medium"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            {builder.skills
                                                                .length > 3 && (
                                                                <span className="text-xs text-gray-500 font-k2d-regular">
                                                                    +
                                                                    {builder
                                                                        .skills
                                                                        .length -
                                                                        3}{" "}
                                                                    more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            {index === 0 && (
                                                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        className="sm:w-8 sm:h-8"
                                                        viewBox="0 0 24 24"
                                                        fill="white"
                                                    >
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
