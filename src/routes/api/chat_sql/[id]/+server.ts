import type { GetRunSQLResponse } from "$lib/types"
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ fetch, params }: RequestEvent) => {
    const id = params.id ?? ''
    const response = await fetch(`/api/v0/run_sql?id=${encodeURIComponent(id)}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: GetRunSQLResponse = await response.json()
    console.log(data)
    return new Response(JSON.stringify({ id: data['id'] ?? '', df: JSON.parse(data['df']) ?? '' }))
}