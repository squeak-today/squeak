import createClient from "openapi-fetch";
import type { paths } from "./types";
const apiBase = import.meta.env.VITE_API_BASE;


export const getAPIClient = (jwtToken: string) => {
    return createClient<paths>({
        baseUrl: apiBase,
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        }
    })
}
export type ClientType = ReturnType<typeof getAPIClient>;