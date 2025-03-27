<script lang="ts">
    import type { PageData } from "../$types";
    import Conversation from "$lib/components/conversation/Conversation.svelte";
    import { onDestroy, onMount } from "svelte";
    import InputBox from "$lib/components/conversation/InputBox.svelte";
    import { setHistory, setSessionId } from "$stores/sessionStore";

    const { data }: { data: PageData } = $props();

    onMount(() => {});

    onDestroy(() => {
        setSessionId("");
    });

    $effect.pre(() => {
        setHistory(data.history);
    });
</script>

<Conversation />
