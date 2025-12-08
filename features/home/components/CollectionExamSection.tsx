"use client";

import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function CollectionExamSection() {
    const [searchTerm, setSearchTerm] = useState('');

    const tags = ['designer', 'dev', 'marketer'];
    const tagsString = tags.join(', ');

    const handleSearch = () => {
        console.log(`Searching for: ${searchTerm}`);
    };


    return (
        <div className="bg-white p-5 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold">Collect Cards</h2>
            <h3 className="text-lg font-medium text-gray-400">Find your collaborators</h3>

            <div className="w-full mt-5 px-5">
                <div className="flex items-center w-full h-10 bg-white rounded-full border border-gray-400">

                    {/* 1. 입력 필드 (Input) */}
                    <input
                        type="text"
                        placeholder={`${tagsString}, ...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 text-black text-sm bg-transparent focus:border-none focus:outline-none"
                    />

                    {/* 2. 검색 아이콘 (클릭 가능) */}
                    <button
                        onClick={handleSearch}
                        aria-label="Search"
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <CiSearch size={20} />
                    </button>
                </div>
            </div>

            {/** Card 영역 */}

            <div className="my-5 w-full">
                <div className="w-full bg-gray-300 h-80 rounded-4xl">

                </div>
            </div>
        </div>
    );
}