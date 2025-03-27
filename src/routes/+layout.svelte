<script lang="ts">
    import Navbar from "$lib/Navbar.svelte";
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { setSessions } from "$stores/sessionStore";
    import Header from "$lib/Header.svelte";

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
    const { sessions } = data;
    setSessions(sessions);
    // console.log(data);
    let title = "国能AI";
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<main class="flex h-screen w-full flex-col flex-1">
    <div class="relative flex h-full w-full flex-row overflow-hidden">
        <Navbar />
        <div class="flex flex-col flex-1">
            <Header />
            {@render children()}
        </div>
    </div>
</main>
