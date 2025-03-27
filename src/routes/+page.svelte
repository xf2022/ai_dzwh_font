<script lang="ts">
    import Conversation from "$lib/components/conversation/Conversation.svelte";
    import InputBox from "$lib/components/conversation/InputBox.svelte";
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->
<div class="h-full flex flex-col justify-center">
    <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
        <h1
            class="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white"
        >
            欢迎使用国能AI
        </h1>
        <p class="mt-3 text-gray-600 dark:text-gray-400">一个数据库助手</p>
    </div>
    <InputBox />
</div>
