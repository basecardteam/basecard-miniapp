'use client';

import { useAccount, useChainId, useConnect, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
// 주소 자르기 유틸리티 (Placeholder)
const truncate = (address: string | undefined) => {
    if (!address) return 'N/A';
    return address.slice(0, 6) + '...' + address.slice(-4);
};

function Account() {
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    return (
        <div>
            {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
            {address && <div>{ensName ? `${ensName} (${truncate(address)})` : address}</div>}
            <button
                onClick={() => disconnect()}
                className="mt-1 px-2 py-1 bg-red-700 hover:bg-red-800 rounded text-xs transition"
            >
                연결 해제
            </button>
        </div>
    )
}


const ConnectorList = ({
    connectors,
    connect,
    isPending,
    connectedConnectorId,
    connectedAddress, // 💡 새로 받은 prop
    connectedChainId, // 💡 새로 받은 prop
}: any) => {
    return (
        <div className="space-y-3">
            {connectors.map((conn: any) => {
                const isCurrent = conn.uid === connectedConnectorId;

                return (
                    <button
                        key={conn.uid}
                        className={`w-full py-2 px-4 border rounded text-left flex flex-col items-start transition 
                            ${!conn.ready ? 'bg-yellow-100 border-yellow-500 text-gray-800' : ''}
                            ${isCurrent ? 'bg-green-100 border-green-500 font-bold' : 'bg-gray-100 hover:bg-gray-200'}
                            ${conn.ready && isPending ? 'opacity-70 cursor-wait' : ''}`}
                        onClick={() => connect({ connector: conn })}
                        disabled={isPending}
                    >

                        <div className="flex justify-between w-full">
                            <span>🔗 {conn.name}</span>
                            <span className="text-sm font-medium">
                                {isCurrent
                                    ? '✅ 현재 연결됨'
                                    : !conn.ready
                                        ? '⚠️ 설치/활성화 확인'
                                        : (isPending ? '⏳ 연결 중...' : '연결 시도')}
                            </span>
                        </div>
                        <span className='text-sm'>uid: {conn.uid}</span>
                        <span className='text-sm'>id: {conn.id}</span>

                        {/* 💡 연결 정보 표시 영역 */}
                        {isCurrent && (
                            <div className="mt-1 text-xs font-normal text-gray-700">
                                <p>주소: {truncate(connectedAddress)}</p>
                                <p>Chain ID: {connectedChainId}</p>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};


// 메인 상태 관리 컴포넌트
export default function Web3Status() {
    const { address, isConnected, connector } = useAccount();
    const { connectors, connect, isPending, error } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    return (
        <div className="p-6 border border-gray-300 rounded-lg shadow-xl bg-white max-w-md mx-auto">

            {/* 1. 연결 상태 표시 영역 */}
            <div className={`p-3 rounded-lg mb-4 ${isConnected ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                <h3 className="text-lg font-bold">
                    {isConnected ? '✅ 연결됨' : '❌ 연결 필요'}
                </h3>
                {isConnected && (
                    <div className="text-sm mt-1">
                        <p>지갑: {connector?.name}</p>
                        <p>주소: {truncate(address)}</p>
                        <Account />

                    </div>
                )}
            </div>

            {/* 2. 에러 메시지 */}
            {error && <p className="mb-3 text-red-600 text-sm">오류: {error.message}</p>}

            {/* 3. 지갑 목록 (항상 표시) */}
            <ConnectorList
                connectors={connectors}
                connect={connect}
                isPending={isPending}
                connectedConnectorId={connector?.uid}
                connectedAddress={address}
                connectedChainId={chainId}
            />

            <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                <p>총 커넥터 수: {connectors.length} (Metamask, OKX, Backpack만 의도됨)</p>
            </div>
        </div>
    );
}