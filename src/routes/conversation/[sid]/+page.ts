import { error, type LoadEvent } from "@sveltejs/kit"
import type { PageLoad } from "../$types"
import type { Chat, GetSessionResponse } from "$lib/types"
import { setSessionId } from "$stores/sessionStore"

export const load: PageLoad = async ({ fetch, params }: LoadEvent) => {
    const sid: string = params.sid ?? ''
    setSessionId(sid)
    const response = await fetch(`/api/sessions/${sid}`, {
        method: 'GET',
    });

    if (!response.ok) error(response.status, 'Failed to fetch session');
    const history: Chat[] = await response.json();
    return {
        history,
    }
}