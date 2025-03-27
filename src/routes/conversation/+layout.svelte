<script lang="ts">
    import InputBox from "$lib/components/conversation/InputBox.svelte";

    const { children } = $props();
</script>

{@render children()}

<InputBox />
