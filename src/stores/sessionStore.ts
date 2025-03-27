import type { Session } from "$lib/types";
import { writable } from "svelte/store";

export const TODAY = 'today';
export const YESTERDAY = 'yesterday';
export const WEEK = 'week';
export const MONTH = 'month';
export const OTHER = 'other';

let _sessionId: ReturnType<typeof writable<string>>;

let _sessions: ReturnType<typeof writable<{ [key: string]: Session[] }>>;

export const getSessionId = () => {
    if (!_sessionId) {
        _sessionId = writable<string>('');
    }
    return _sessionId
}

export const setSessionId = (sid: string) => {
    getSessionId().set(sid);
}
export const getSessions = () => {
    if (!_sessions) _sessions = writable({});
    return _sessions
}

export const setSessions = (ss: {[key: string]: Session[]}) => {
    getSessions().set(ss)
}

export const add_session = (type: string, session: Session) => {
    _sessions.update((sessions) => {
        sessions[type].push(session);
        return sessions;
    });
}

export const remove_session = (sid: string) => {
    _sessions.update((sessions) => {
        delete sessions[sid];
        return sessions;
    });
}