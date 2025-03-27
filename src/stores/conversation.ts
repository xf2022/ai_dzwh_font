export interface Session {
    sid: string,
    name: string
};
export interface Conversation {
    id: number,
    question: string,
    response: string,
    show_response: boolean,
    selected: boolean,
    pd_data: [{ [key: string]: string }] | null,
    summary: string | null,
    show_pd: boolean,
    tableHeaders: string[],

    show_chart: boolean,
    chartData: string
}

