import { config } from "@/lib/common/config";

export interface AppConfigResult {
    contractAddress: string;
    chainId: number;
    ipfsGatewayUrl: string;
}

interface ConfigResponse {
    success: boolean;
    result: AppConfigResult;
    error: any;
}

export const fetchAppConfig = async (): Promise<AppConfigResult> => {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/config`);
    if (!response.ok) {
        throw new Error("Failed to fetch app config");
    }
    const data: ConfigResponse = await response.json();
    return data.result;
};
