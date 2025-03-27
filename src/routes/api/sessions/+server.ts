import type { GetSessionsResponse } from "$lib/types";
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch }: RequestEvent) => {
    const response = await fetch('/api/v0/get_sessions')

    if (!response.ok) error(response.status, response.statusText)
    const data: GetSessionsResponse = await response.json()

    return new Response(JSON.stringify(data['sessions']))
}