import type { GetGenerateChartResponse } from "$lib/types"
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ fetch, params, url }: RequestEvent) => {
    const id = params.id ?? ''
    const question = url.searchParams.get('question') ?? ''
    const response = await fetch(`/api/v0/generate_plotly_figure?id=${encodeURIComponent(id)}&&question=${encodeURIComponent(question)}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: GetGenerateChartResponse = await response.json()

    return new Response(JSON.stringify({ id: data['id'], fig: JSON.parse(data['fig']) ?? '', summary: data['summary'] ?? '' }))
}