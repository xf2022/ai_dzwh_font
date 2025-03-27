export interface Session {
    sid: string,
    name: string
}

export interface Chat {
    role: string,
    content: string
}

export interface GetSessionsResponse {
    sessions: {[key: string]: [string, string][]},
    type: string
}

export interface GetSessionResponse {
    history: Chat[],
    type: string
}