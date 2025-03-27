import type { Chat, Conversation, GetSessionResponse, GetSessionsResponse, PostSessionResponse } from "$lib/types";
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, params }: RequestEvent) => {
    const sid = params.sid
    const response = await fetch(`/api/v0/session/${sid}`)

    if (!response.ok) error(response.status, response.statusText)
    const data: GetSessionResponse = await response.json()

    const history = data['history'] ?? []

    if (history.length > 0) {
        history.forEach((chat: Chat) => {
            if (chat.role === 'assistant') {
                if ('string' !== typeof chat.content) {
                    const conversation: Conversation = {
                        id: chat.content.id,
                        response: chat.content.response,
                        tableHeaders: chat.content.pdData ? Object.keys(chat.content.pdData[0]) : [],
                        showPd: (chat.content.pdData?.length ?? 0) > 0,
                        pdData: chat.content.pdData,
                        showChart: chat.content.chartData !== '',
                        chartData: 'string' === typeof chat.content.chartData ? JSON.parse(chat.content.chartData) : chat.content.chartData,
                        summary: chat.content.summary,
                        isSelected: false
                    }
                    chat.content = conversation
                }
            }
        })
    }
    console.log(history)

    return new Response(JSON.stringify(history))
}

export const POST: RequestHandler = async ({ fetch, params, request }: RequestEvent) => {
    const sid = params.sid
    const sname = '新会话'
    const response = await fetch(`/api/v0/session/${sid}/${sname}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: PostSessionResponse = await response.json()

    return new Response(JSON.stringify({ sid: data['sid'], name: sname }))
}