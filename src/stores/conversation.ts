import { get, writable } from "svelte/store"

export interface Session {
    sid: string,
    name: string
};

const _isLoading = writable(false);

export const isLoadingChat = () => {
    return _isLoading
}

export const toggleLoadingChat = () => {
    _isLoading.update(isLoading => !isLoading)
}

