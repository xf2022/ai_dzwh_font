<script>
    import Navbar from "$lib/Navbar.svelte";

    export let title = "国能AI"
</script>

<svelte:head>
    <title>{ title }</title>
</svelte:head>

<div class="layout">
    <Navbar/>
    <div class="py-10 lg:py-14">
        <slot/>
    </div>
</div>