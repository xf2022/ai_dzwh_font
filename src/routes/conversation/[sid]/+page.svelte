<script lang="ts">
    import type { PageData } from "../$types";
    import Conversation from "$lib/components/conversation/Conversation.svelte";
    import { onMount } from "svelte";
    import InputBox from "$lib/components/conversation/InputBox.svelte";
    import { setHistory } from "$stores/sessionStore";

    const { data }: { data: PageData } = $props();

    onMount(() => {});

    $effect.pre(() => {
        setHistory(data.history);
    });
</script>

<Conversation />

<div class="fixed bottom-0 w-full">
    <InputBox />
</div>
