import type { GetGenerateSQLResponse } from "$lib/types"
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ fetch, url }: RequestEvent) => {
    console.log(url)
    debugger;
    const question = url.searchParams.get('question') ?? ''
    const formerDocList = url.searchParams.get('former_doc_list') ?? false
    const modeWeb = url.searchParams.get('mode_web') ?? 'sql'
    const response = await fetch(`/api/v0/generate_sql?question=${encodeURIComponent(question)}&&former_doc_list=${encodeURIComponent(formerDocList)}&&mode_web=${encodeURIComponent(modeWeb)}`)

    if (!response.ok) error(response.status, response.statusText)

    const data: GetGenerateSQLResponse = await response.json()

    return new Response(JSON.stringify({ id: data['id'] ?? '', sql: data['sql_que'] ?? '', text: data['text'] ?? '' }))
}