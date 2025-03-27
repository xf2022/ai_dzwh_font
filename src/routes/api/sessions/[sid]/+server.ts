import type { GetSessionResponse, GetSessionsResponse, PostSessionResponse } from "$lib/types";
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, params }: RequestEvent) => {
    const sid = params.sid
    const response = await fetch(`/api/v0/session/${sid}`)

    if (!response.ok) error(response.status, response.statusText)
    const data: GetSessionResponse = await response.json()

    return new Response(JSON.stringify(data['history'] ?? []))
}

export const POST: RequestHandler = async ({ fetch, params, request }: RequestEvent) => {
    const sid = params.sid
    const sname = '新会话'
    const response = await fetch(`/api/v0/session/${sid}/${sname}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: PostSessionResponse = await response.json()

    return new Response(JSON.stringify({ sid: data['sid'], name: sname }))
}