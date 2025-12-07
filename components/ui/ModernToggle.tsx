// components/ui/ModernToggle.tsx

"use client";

import React, { HTMLAttributes, useState } from 'react';

interface ModernToggleProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange' | 'onClick'> {
    checked?: boolean;
    /** 상태 변경 시 호출될 콜백 함수 */
    onChange?: (checked: boolean) => void;
    /** 토글의 색상 (예: 'blue', 'green', 'red') */
    color?: 'blue' | 'green' | 'red' | 'indigo' | 'gray';
    /** 토글이 비활성화되었는지 여부 */
    disabled?: boolean;
}

const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600',
    gray: 'bg-gray-600',
};

export const ModernToggle: React.FC<ModernToggleProps> = ({
    checked: externalChecked,
    onChange,
    color = 'blue',
    disabled = false,
    className = '',
    ...rest
}) => {
    // 내부 상태 (외부에서 checked와 onChange를 받지 않을 경우 사용)
    const [internalChecked, setInternalChecked] = useState(false);

    // 제어/비제어 컴포넌트 구분
    const isControlled = externalChecked !== undefined;
    const isChecked = isControlled ? externalChecked : internalChecked;

    const toggleColor = colorMap[color] || colorMap.blue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        // 이벤트 객체에서 체크 상태를 가져옵니다.
        const newState = event.target.checked;

        if (!isControlled) {
            setInternalChecked(newState);
        }

        if (onChange) {
            // 부모 컴포넌트로 새 상태(boolean)를 전달
            onChange(newState);
        }
    };

    return (
        <label
            htmlFor="modern-toggle"
            className={`
                relative inline-flex items-center cursor-pointer 
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                ${className}
            `}
            {...rest}
        >
            {/* 1. 실제 체크박스 (숨겨짐) */}
            <input
                id="modern-toggle"
                type="checkbox"
                checked={isChecked}
                onChange={handleChange} // 실제 상태는 상위 onClick에서 관리
                disabled={disabled}
                className="sr-only peer" // 화면에는 보이지 않도록 숨김 (Tailwind의 sr-only 클래스)
            />

            {/* 2. 스위치 트랙 (Track) */}
            <div
                className={`
                    w-11 h-6 
                    bg-gray-200 
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                    rounded-full peer dark:bg-gray-700 
                    peer-checked:after:translate-x-full 
                    peer-checked:after:border-white 
                    after:content-[''] 
                    after:absolute 
                    after:top-[2px] 
                    after:left-[2px] 
                    after:bg-white 
                    after:border-gray-300 
                    after:border 
                    after:rounded-full 
                    after:h-5 after:w-5 after:transition-all 
                    dark:border-gray-600 
                    ${isChecked ? toggleColor : 'peer-checked:bg-gray-600'}
                `}
            ></div>

            {/* 3. 체크 상태일 때 트랙 색상 변경 */}
            <div
                className={`
                    absolute top-0 left-0 w-11 h-6 rounded-full transition-colors duration-300
                    ${isChecked ? toggleColor : 'bg-gray-200 dark:bg-gray-700'}
                `}
            ></div>

            {/* 4. 핸들 (Handle) */}
            <div
                className={`
                    absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md
                    ${isChecked ? 'transform translate-x-5' : ''}
                `}
            ></div>

        </label>
    );
};