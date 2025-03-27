<script lang="ts">
    import type { Conversation } from "$lib/types";
    import { toggleLoadingChat } from "$stores/conversation";

    import {
        getSessionId,
        add_session,
        TODAY,
        addUserChat,
        addAssistantChat,
    } from "$stores/sessionStore";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    const sessionId = getSessionId();

    let questionInput = $state("");

    let conversationHistory: Conversation[] = [];

    const sendQuestioin = async () => {
        toggleLoadingChat();
        if ("" === get(sessionId)) {
            const sid = crypto.randomUUID();
            const name = questionInput.slice(0, 30);
            const session_resp = await fetch(`/api/sessions/${sid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const s = await session_resp.json();
            add_session(TODAY, s);
        }
        // 发送请求到后端
        try {
            let questionStr = questionInput.toString();

            const conversation: Conversation = {
                id: "",
                response: "",
                tableHeaders: [],
                showPd: false,
                pdData: null,
                showChart: false,
                chartData: "",
                summary: "",
                isSelected: false,
            };
            debugger;
            const response = await fetch(
                `/api/generate_sql?question=${encodeURIComponent(questionStr)}&&former_doc_list=false&&mode_web=${encodeURIComponent("sql")}`,
            );

            const data: { id: string; sql: string; text: string } =
                await response.json();
            conversation.id = data.id;
            conversation.response = data.text;

            if (data.sql !== "") {
                const pd_resp = await fetch(
                    `/api/chat_sql/${encodeURIComponent(data.id)}`,
                );
                const pd_data: { id: string; df: any } = await pd_resp.json();
                if (pd_data.df.length > 0) {
                    conversation.tableHeaders =
                        Object.keys(pd_data.df[0]) ?? [];
                    conversation.pdData = pd_data.df;
                    conversation.showPd = true;
                }

                if (pd_data.df) {
                    const chart_resp = await fetch(
                        `/api/plotly/${encodeURIComponent(data.id)}?question=${encodeURIComponent(questionInput)}`,
                    );
                    const chart_data: {
                        id: string;
                        fig: string;
                        summary: string;
                    } = await chart_resp.json();

                    conversation.chartData = chart_data.fig;
                    conversation.showChart = true;

                    conversation.summary = chart_data.summary;
                }
                addUserChat(questionStr);
                addAssistantChat(conversation);
            } else {
                addUserChat(questionStr);
                addAssistantChat(data.text);
            }

            fetch("/api/sessions/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user: questionStr,
                    assistant: data.sql !== "" ? conversation : data.text,
                }),
            });
        } catch (error) {
            console.error("Fetch错误:", error);
        }
        toggleLoadingChat();

        return null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            sendQuestioin();
        }
    };

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
</script>

<footer class="py-4 lg:py-8 max-w-4xl mx-auto p-3 sm:py-2 w-full">
    <div
        class="relative gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
    >
        <input
            type="text"
            bind:value={questionInput}
            onkeydown={handleKeyDown}
            class="p-4 pb-12 block w-full bg-gray-100 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400"
            placeholder="向我询问有关您的数据的问题，我可以将其转换为 SQL。"
        />
        <div
            class="absolute bottom-px inset-x-px p-2 rounded-b-md bg-gray-100 dark:bg-slate-800"
        >
            <div class="flex justify-between items-center">
                <div class="flex items-center"></div>
                <div class="flex items-center gap-x-1">
                    <button
                        type="button"
                        class="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:text-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                        onclick={startSpeechRecognition}
                        aria-label="Speech Recognition"
                    >
                        <svg
                            class="flex-shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                            ></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onclick={sendQuestioin}
                        class="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        aria-label="Generate SQL"
                    >
                        <svg
                            class="h-3.5 w-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</footer>
