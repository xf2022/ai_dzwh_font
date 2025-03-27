export interface Conversation {
    id: string,
    question: string,

    showResponse: boolean,
    response: string,

    tableHeaders: string[],
    showPd: boolean,
    pdData: [{ [key: string]: string }] | null,

    showChart: boolean,
    chartData: string,

    summary: string | null,
    isSelected: boolean,

}


export interface Session {
    sid: string,
    name: string
}

export interface Chat {
    role: string,
    content: string | Conversation
}

export interface GetSessionsResponse {
    sessions: { [key: string]: [string, string][] },
    type: string
}

export interface GetSessionResponse {
    history: Chat[],
    type: string
}

export interface PostSessionResponse {
    sid: string,
    type: string
}