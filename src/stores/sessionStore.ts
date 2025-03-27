import type { Chat, Conversation, Session } from "$lib/types";
import { get, writable } from "svelte/store";

export const TODAY = 'today';
export const YESTERDAY = 'yesterday';
export const WEEK = 'week';
export const MONTH = 'month';
export const OTHER = 'other';

let _sessionId: ReturnType<typeof writable<string>>;

let _sessions: ReturnType<typeof writable<{ [key: string]: Session[] }>>;

let _history: ReturnType<typeof writable<Chat[]>>;

// sessionId
export const getSessionId = () => {
    if (!_sessionId) {
        _sessionId = writable<string>('');
    }
    return _sessionId
}
export const setSessionId = (sid: string) => {
    getSessionId().set(sid);
}

// sessions
export const getSessions = () => {
    if (!_sessions) _sessions = writable({});
    return _sessions
}
export const setSessions = (ss: { [key: string]: Session[] }) => {
    getSessions().set(ss)
}
export const add_session = (type: string, session: Session) => {
    getSessions().update((sessions) => {
        sessions[type] = [session, ...sessions[type]]
        return sessions;
    });
    getSessionId().set(session.sid);
}
export const remove_session = (sid: string) => {
    getSessions().update((sessions) => {
        delete sessions[sid];
        return sessions;
    });
}

// history
export const getHistory = () => {
    if (!_history) _history = writable([]);
    return _history
}

export const setHistory = (history: Chat[]) => {
    getHistory().set(history);
}

export const addHistory = (chat: Chat) => {
    getHistory().update((history) => {
        history.push(chat);
        return history;
    });
}

export const addUserChat = (chat: string) => {
    addHistory({ role: "user", content: chat });
}

export const addAssistantChat = (chat: Conversation) => {
    addHistory({ role: "assistant", content: chat });
}