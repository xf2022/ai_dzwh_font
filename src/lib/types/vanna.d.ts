export interface GetGenerateSQLResponse {
    id: string,
    type: string,
    sql_que: string,
    text: string
}

export interface GetRunSQLResponse {
    id: string,
    type: string,
    df: any,
}

export interface GetGenerateChartResponse {
    id: string,
    type: string,
    fig: string,
    summary: string
}