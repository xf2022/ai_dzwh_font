import type { LoadEvent } from "@sveltejs/kit"
import type { PageLoad } from "../$types"

export const load: PageLoad = ({ fetch, params }: LoadEvent) => {
    const sid = params.sid
    return {
        sid: sid,
    }
}