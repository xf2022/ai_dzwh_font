<script lang="ts">
    import Navbar from "$lib/Navbar.svelte";
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { setSessions } from "$stores/sessionStore";

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
    const { sessions } = data;
    setSessions(sessions);
    // console.log(data);
    let title = "国能AI"
</script>

<svelte:head>
    <title>{ title }</title>
</svelte:head>

<div class="layout">
    <Navbar />
</div>

<main class="py-10 lg:py-14">
    {@render children()}
</main>