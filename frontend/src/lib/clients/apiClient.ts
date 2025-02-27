import createClient from "openapi-fetch";
import type { paths } from "./types";
const apiBase = process.env.REACT_APP_API_BASE_URL;


export const getAPIClient = (jwtToken: string) => {
    return createClient<paths>({
        baseUrl: apiBase,
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        }
    })
}
export type ClientType = ReturnType<typeof getAPIClient>;