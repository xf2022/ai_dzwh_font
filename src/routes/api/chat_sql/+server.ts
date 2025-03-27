import type { GetRunSQLResponse } from "$lib/types"
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ fetch, url }: RequestEvent) => {
    const id = url.searchParams.get('id') ?? ''
    const response = await fetch(`/api/v0/run_sql?id=${encodeURIComponent(id)}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: GetRunSQLResponse = await response.json()

    return new Response(JSON.stringify({ id: data['id'] ?? '', df: data['df'] ?? '' }))
}