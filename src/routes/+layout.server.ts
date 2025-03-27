import type { RequestEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Session } from '$lib/types';
export const load: LayoutServerLoad = async ({ fetch }: RequestEvent) => {
    const response = await fetch('/api/sessions', {
        method: 'GET',
    })
    const ss: {[key: string]: [string, string][]} = await response.json()
    const sessions: {[key: string]: Session[]} = {}
    // 遍历ss
    Object.entries(ss).forEach(([key, value]) => {
        sessions[key] = value.map(session => Object({sid: session[0], name: session[1]}))
    })
    return { 
        sessions 
    }
}