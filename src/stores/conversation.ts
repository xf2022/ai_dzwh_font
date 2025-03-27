import { get, writable } from "svelte/store"

export interface Session {
    sid: string,
    name: string
};

const _isLoading = writable(true);

export const isLoadingChat = () => {
    return get(_isLoading)
}

export const toggleLoadingChat = () => {
    _isLoading.update(isLoading => !isLoading)
}

