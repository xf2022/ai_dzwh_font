import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ fetch, params, request }: RequestEvent) => {
    const data = await request.json();

    const response = await fetch('/api/v0/sessions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    if (!response.ok) error(response.status, response.statusText)

    return new Response(JSON.stringify({}))
}