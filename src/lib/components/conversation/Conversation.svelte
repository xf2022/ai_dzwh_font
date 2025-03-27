<script lang="ts">
    // const { history }: { history: Chat[] } = $props();
    import { getHistory } from "$stores/sessionStore";

    let Plotly: any;
    const history = getHistory();

    import { isLoadingChat, type Session } from "$stores/conversation";
    import { onMount, tick } from "svelte";
    import type { Conversation } from "$lib/types";
    import { get } from "svelte/store";

    const isLoading = isLoadingChat();

    onMount(async () => {
        Plotly = (await import("plotly.js-dist-min")).default;
    });

    function renderChart(id: string, chartData: any) {
        const container = document.getElementById(`chart-container-${id}`);
        console.log("开始渲染图表");
        if (container && chartData) {
            try {
                Plotly.newPlot(
                    container,
                    chartData.data,
                    chartData.layout || {},
                ).then(() => {
                    const logoButton =
                        container.querySelector(".modebar-btn--logo");
                    if (logoButton) {
                        logoButton.remove();
                    }
                });
            } catch (error) {
                console.error("图表渲染失败:", error);
            }
        }
    }

    $: {
        if (Plotly && $history && $history.length) {
            $history.forEach((item) => {
                const content = item.content;
                if ("string" !== typeof content) {
                    (async () => {
                        await tick();
                        const container = document.getElementById(
                            `chart-container-${content.id}`,
                        );
                        if (container) {
                            renderChart(content.id, content.chartData);
                        }
                    })();
                }
            });
        }
    }
    // 创建语音识别对象（支持的浏览器需要提供 Web Speech API）
    let recognition: any;

    onMount(() => {
        const recognition = new (window.SpeechRecognition ||
            window.webkitSpeechRecognition)();

        // 设置语言为中文
        recognition.lang = "zh-CN"; // 设置为中文
        recognition.interimResults = true; // 实时返回识别结果
        recognition.maxAlternatives = 1; // 只返回最有可能的识别结果

        // 识别到语音时的回调
        recognition.onresult = (event: any) => {
            // 获取识别到的文本
            questionInput = event.results[0][0].transcript;
        };

        // 错误回调
        recognition.onerror = (event: any) => {
            console.error("语音识别错误:", event.error);
        };
    });

    // 开始语音识别
    function startSpeechRecognition() {
        if (recognition) {
            recognition.start();
        }
    }

    let talk: boolean = false;
    let header: string = ""; // 存储标题
    let load_questions: string[] = []; // 存储获取的问题
    let conversationHistory: Conversation[] = [];
    let showCheckbox: boolean = false;
    let response_timeout: boolean = false;

    let isPlaying: boolean = false; // 控制语音播放状态
    let questionInput: string = "";
    let questionInput_tmp: string = "";
    let currSid: string = "";

    let mode = "database";

    function playText(text: string) {
        //语言播放
        const synth: SpeechSynthesis = window.speechSynthesis;
        // Microsoft Huihui、Microsoft Kangkang 或 Microsoft Yaoyao

        // 如果正在播放语音，则返回
        if (isPlaying || synth.speaking) {
            console.log("当前语音正在播放中，无法开始新的播放");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.pitch = 1.5;
        utterance.rate = 1.2;

        // 获取语音列表并选择指定语音
        const voices = synth.getVoices();
        const selectedVoice = voices.find(
            (voice) =>
                voice.lang === "zh-CN" &&
                voice.name.includes("Microsoft Yaoyao"),
        );

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // 播放语音前设置播放状态
        isPlaying = true;

        // 当语音播放结束时，重置播放状态
        utterance.onend = () => {
            console.log("语音播放完毕，准备下次播放");
            isPlaying = false; // 播放结束后允许新语音播放
        };

        // 开始播放语音
        synth.speak(utterance);
    }
</script>

<!--  lg:pl-64 -->
<div id="chat-container" class="relative max-w-full flex-1 overflow-y-auto">
    <div class="py-5 lg:py-7">
        <ul class="mt-16 space-y-5">
            {#each $history as chat}
                {#if "assistant" === chat.role}
                    {#if typeof chat.content === "string"}
                        <li
                            class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                        >
                            <img
                                src="/conversation/assistant.png"
                                class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                alt="agent logo"
                            />
                            <div
                                class="space-y-3 overflow-x-auto overflow-y-hidden"
                            >
                                <p
                                    class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap"
                                >
                                    {chat.content}
                                </p>
                                <button
                                    type="button"
                                    class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                    onclick={() => playText(chat.content)}
                                >
                                    播放
                                </button>
                            </div>
                        </li>
                    {:else if chat.content.showPd}
                        <li
                            class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                        >
                            <img
                                src="/conversation/assistant.png"
                                class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                alt="agent logo"
                            />
                            <div
                                class="space-y-3 overflow-x-auto overflow-y-hidden"
                            >
                                <div
                                    class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700"
                                >
                                    <div
                                        class="overflow-x-auto overflow-y-auto"
                                        style="max-height:300px"
                                    >
                                        <div
                                            class="p-1.5 min-w-full inline-block align-middle"
                                        >
                                            <table
                                                class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                            >
                                                <thead
                                                    class="bg-gray-50 dark:bg-slate-800"
                                                >
                                                    <tr>
                                                        {#each chat.content.tableHeaders as header}
                                                            <th
                                                                scope="col"
                                                                class="px-6 py-3 text-left"
                                                            >
                                                                <div
                                                                    class="flex items-center gap-x-2"
                                                                >
                                                                    <span
                                                                        class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                                    >
                                                                        {header}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        {/each}
                                                    </tr>
                                                </thead>
                                                <tbody
                                                    class="divide-y divide-gray-200 dark:divide-gray-700"
                                                >
                                                    {#if chat.content.pdData}
                                                        {#each chat.content.pdData as row}
                                                            <tr>
                                                                {#each chat.content.tableHeaders as header}
                                                                    <td
                                                                        class="h-px w-px whitespace-nowrap"
                                                                    >
                                                                        <div
                                                                            class="px-6 py-3"
                                                                        >
                                                                            <span
                                                                                class="text-gray-800 dark:text-gray-200"
                                                                            >
                                                                                {row[
                                                                                    header
                                                                                ]}
                                                                                <!-- 动态显示字段值 -->
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                {/each}
                                                            </tr>
                                                        {/each}
                                                    {/if}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <ul
                                    class="flex flex-col justify-end text-start -space-y-px"
                                >
                                    <li
                                        class="flex items-center gap-x-2 p-3 text-sm bg-white border text-gray-800 first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-200"
                                    >
                                        <div
                                            class="w-full flex justify-between truncate"
                                        >
                                            <span
                                                class="mr-3 flex-1 w-0 truncate"
                                                >CSV</span
                                            >
                                            <a
                                                class="flex items-center gap-x-2 text-gray-500 hover:text-blue-500 whitespace-nowrap"
                                                href="/api/v0/download_csv?id={chat
                                                    .content.id}"
                                            >
                                                <svg
                                                    class="flex-shrink-0 w-3 h-3"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                                                    ></path>
                                                    <path
                                                        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                                                    ></path>
                                                </svg>
                                                下载
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        {#if chat.content.showChart}
                            <li
                                class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                            >
                                <img
                                    src="/conversation/assistant.png"
                                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                    alt="agent logo"
                                />
                                <div
                                    id="chart-container-{chat.content.id}"
                                    class="chart-container"
                                    style="height:400px;"
                                ></div>
                            </li>
                            <li
                                class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                            >
                                <img
                                    src="/conversation/assistant.png"
                                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                    alt="agent logo"
                                />
                                <div
                                    class="space-y-3 overflow-x-auto overflow-y-hidden"
                                >
                                    <p
                                        class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap"
                                    >
                                        {chat.content.summary ||
                                            "此次查询没有得出结论"}
                                    </p>
                                    <button
                                        type="button"
                                        class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                        onclick={() =>
                                            playText(
                                                "string" !== typeof chat.content
                                                    ? (chat.content.summary ??
                                                          "")
                                                    : chat.content ||
                                                          "此次查询没有得出结论",
                                            )}
                                    >
                                        播放
                                    </button>
                                </div>
                            </li>
                        {/if}
                    {/if}
                {:else}
                    <li
                        class="py-2 sm:py-4 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                    >
                        <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                            <div class="max-w-2xl flex gap-x-2 sm:gap-x-4">
                                <span
                                    class="flex-shrink-0 inline-flex items-center justify-center h-[2.375rem] w-[2.375rem] rounded-full bg-gray-600"
                                >
                                    <span
                                        class="text-sm font-medium text-white leading-none"
                                        >你
                                    </span>
                                </span>
                                <div
                                    class="grow mt-2 space-y-3 overflow-x-auto overflow-y-hidden text-left"
                                >
                                    <p class="text-gray-800 dark:text-gray-200">
                                        {chat.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                {/if}
            {/each}
            {#if $isLoading}
                <li
                    class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
                >
                    <img
                        src="/conversation/assistant.png"
                        class="flex-shrink-0 w-[2.375rem] h-[2.375rem] animate-bounce"
                        alt="agent logo"
                    />
                    <div class="space-y-3">
                        <!-- <p class="text-red-600 dark:text-red-400">
                                回答失败，请稍后重试。
                            </p> -->
                        <p class="text-gray-800 dark:text-gray-200">
                            思考中...
                        </p>
                    </div>
                </li>
            {/if}
        </ul>
    </div>

    <div class="py-10 lg:py-14">
        {#if talk === false}
            <!-- <li
                class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
            >
                <img
                    src="/conversation/assistant.png"
                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                    alt="agent logo"
                />
                <div class="space-y-3 overflow-x-auto overflow-y-hidden">
                    <p class="text-gray-800 dark:text-gray-200">
                        {header}
                        {#each load_questions as question}
                            <button
                                type="button"
                                class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                            >
                                {question}
                            </button>
                        {/each}
                    </p>
                </div>
            </li> -->
        {:else}
            <ul class="mt-16 space-y-5">
                {#each conversationHistory as entry (entry.id)}
                    <li class="py-2 sm:py-4">
                        <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                            <div class="max-w-2xl flex gap-x-2 sm:gap-x-4">
                                <span
                                    class="flex-shrink-0 inline-flex items-center justify-center h-[2.375rem] w-[2.375rem] rounded-full bg-gray-600"
                                >
                                    <span
                                        class="text-sm font-medium text-white leading-none"
                                        >你
                                    </span>
                                </span>
                                <div
                                    class="grow mt-2 space-y-3 overflow-x-auto overflow-y-hidden text-left"
                                >
                                    <p class="text-gray-800 dark:text-gray-200">
                                        {entry.id}
                                    </p>
                                </div>
                            </div>
                            <!-- 勾选框, 只有在showCheckbox为true时才显示 -->
                            {#if showCheckbox}
                                <input
                                    type="checkbox"
                                    bind:checked={entry.isSelected}
                                    class="ml-4"
                                />
                            {/if}
                        </div>
                    </li>
                    {#if entry.showPd}
                        <li
                            class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
                        >
                            <img
                                src="/conversation/assistant.png"
                                class="flex-shrink-0 w-[2.375rem] h-[2.375rem] animate-bounce"
                                alt="agent logo"
                            />
                            <div class="space-y-3">
                                {#if response_timeout}
                                    <p class="text-red-600 dark:text-red-400">
                                        回答失败，请稍后重试。
                                    </p>
                                {:else}
                                    <p class="text-gray-800 dark:text-gray-200">
                                        思考中...
                                    </p>
                                {/if}
                            </div>
                        </li>
                    {:else}
                        {#if !entry.showPd}
                            <li
                                class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
                            >
                                <img
                                    src="/conversation/assistant.png"
                                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                    alt="agent logo"
                                />
                                <div
                                    class="space-y-3 overflow-x-auto overflow-y-hidden"
                                >
                                    <p
                                        class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap"
                                    >
                                        {entry.response}
                                    </p>
                                    <button
                                        type="button"
                                        class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                        onclick={() => playText(entry.response)}
                                    >
                                        播放
                                    </button>
                                </div>
                            </li>
                        {/if}
                        {#if entry.showPd}
                            <li
                                class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
                            >
                                <img
                                    src="/conversation/assistant.png"
                                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                    alt="agent logo"
                                />
                                <div
                                    class="space-y-3 overflow-x-auto overflow-y-hidden"
                                >
                                    <div
                                        class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700"
                                    >
                                        <div
                                            class="overflow-x-auto overflow-y-auto"
                                            style="max-height:300px"
                                        >
                                            <div
                                                class="p-1.5 min-w-full inline-block align-middle"
                                            >
                                                <table
                                                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                                >
                                                    <thead
                                                        class="bg-gray-50 dark:bg-slate-800"
                                                    >
                                                        <tr>
                                                            {#each entry.tableHeaders as header}
                                                                <th
                                                                    scope="col"
                                                                    class="px-6 py-3 text-left"
                                                                >
                                                                    <div
                                                                        class="flex items-center gap-x-2"
                                                                    >
                                                                        <span
                                                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                                        >
                                                                            {header}
                                                                        </span>
                                                                    </div>
                                                                </th>
                                                            {/each}
                                                        </tr>
                                                    </thead>
                                                    <tbody
                                                        class="divide-y divide-gray-200 dark:divide-gray-700"
                                                    >
                                                        {#if entry.pdData}
                                                            {#each entry.pdData as row}
                                                                <tr>
                                                                    {#each entry.tableHeaders as header}
                                                                        <td
                                                                            class="h-px w-px whitespace-nowrap"
                                                                        >
                                                                            <div
                                                                                class="px-6 py-3"
                                                                            >
                                                                                <span
                                                                                    class="text-gray-800 dark:text-gray-200"
                                                                                >
                                                                                    {row[
                                                                                        header
                                                                                    ]}
                                                                                    <!-- 动态显示字段值 -->
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    {/each}
                                                                </tr>
                                                            {/each}
                                                        {/if}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <ul
                                        class="flex flex-col justify-end text-start -space-y-px"
                                    >
                                        <li
                                            class="flex items-center gap-x-2 p-3 text-sm bg-white border text-gray-800 first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-200"
                                        >
                                            <div
                                                class="w-full flex justify-between truncate"
                                            >
                                                <span
                                                    class="mr-3 flex-1 w-0 truncate"
                                                    >CSV</span
                                                >
                                                <a
                                                    class="flex items-center gap-x-2 text-gray-500 hover:text-blue-500 whitespace-nowrap"
                                                    href="/api/v0/download_csv?id={entry.id}"
                                                >
                                                    <svg
                                                        class="flex-shrink-0 w-3 h-3"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 16 16"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                                                        ></path>
                                                        <path
                                                            d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                                                        ></path>
                                                    </svg>
                                                    下载</a
                                                >
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            {#if entry.showChart}
                                <li
                                    class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
                                >
                                    <img
                                        src="/conversation/assistant.png"
                                        class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                        alt="agent logo"
                                    />
                                    <div
                                        id="chart-container-{entry.id}"
                                        class="chart-container"
                                        style="height:400px;"
                                    ></div>
                                </li>
                                <li
                                    class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"
                                >
                                    <img
                                        src="/conversation/assistant.png"
                                        class="flex-shrink-0 w-[2.375rem] h-[2.375rem]"
                                        alt="agent logo"
                                    />
                                    <div
                                        class="space-y-3 overflow-x-auto overflow-y-hidden"
                                    >
                                        <p
                                            class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap"
                                        >
                                            {entry.summary ||
                                                "此次查询没有得出结论"}
                                        </p>
                                        <button
                                            type="button"
                                            class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                            onclick={() =>
                                                playText(
                                                    entry.summary ||
                                                        "此次查询没有得出结论",
                                                )}
                                        >
                                            播放
                                        </button>
                                    </div>
                                </li>
                            {/if}
                        {/if}
                    {/if}
                {/each}
            </ul>
        {/if}
    </div>
</div>
