<script lang="ts">
    import {
        add_session,
        getSessions,
        setSessionId,
        getSessionId,
        TODAY,
    } from "$stores/sessionStore";
    import type { Session } from "$lib/types";
    import { goto } from "$app/navigation";
    import { get } from "svelte/store";

    const sessionId = getSessionId();
    const sessions = getSessions();

    function navigateToConversation(sid: string) {
        // 判断sid 是否为 sessionId
        console.log(sid);
        if (sid === get(sessionId)) return;
        setSessionId(sid);
        goto(`/conversation/${sid}`);
    }

    async function createSession() {
        if ("" !== get(sessionId)) {
            setSessionId("");
            conversationHistory = [];
        }
        const sid = crypto.randomUUID();
        const session_resp = await fetch(`/api/sessions/${sid}`, {
            method: "POST",
        });
        const s: Session = await session_resp.json();
        console.log(s);
        add_session(TODAY, s);
    }

    interface Conversation {
        id: number;
        question: string;
        response: string;
        show_response: boolean;
        selected: boolean;
        pd_data: object | null;
        summary: string | null;
    }

    let currentView = "default"; // 默认视图
    let trainingData = [];

    let uid = "1"; // 假设这是你的用户 ID

    let conversationHistory: Conversation[] = []; // 存储对话记录
    let talk = false; //是否进入谈话界面
    let errorMessage = ""; // 用于存储错误信息

    let showConfirm = false;
    let showCheckbox = false; // 控制勾选框显示
    let showConfirm_ppt = false;

    // 显示确认框
    function showReportConfirm() {
        showCheckbox = true; // 显示勾选框
        showConfirm = true; // 显示确认框
    }

    async function switchView(view: string) {
        currentView = view;

        if (view === "trainingData") {
            const response = await fetch("/api/v0/get_training_data");
            const data = await response.json();

            if (data.type === "df") {
                trainingData = JSON.parse(data.df); // 解析数据并赋值给 trainingData
            }
        }
    }

    // 取消生成报告
    function cancelReport() {
        showConfirm = false;
        showCheckbox = false; // 隐藏勾选框
    }

    // 生成报告
    async function generateReport() {
        const selectedEntries = conversationHistory.filter(
            (entry) => entry.selected,
        );

        // 创建一个新的列表，用于保持顺序
        const reportList: string[] = [];

        selectedEntries.forEach((entry) => {
            // 先加入 question
            reportList.push(entry.question);

            const pdDataStr = JSON.stringify(entry.pd_data); // 将 pd_data 转换为字符串
            const summaryStr = entry.summary; // summary 已经是字符串

            // 合并 pd_data 和 summary，形成一个字符串
            const pdSummaryStr = `查到的数据表: ${pdDataStr}\n数据表的总结: ${summaryStr}`;

            // 将合并后的字符串添加到 reportList
            reportList.push(pdSummaryStr);
        });

        // 后端接口调用，传递报告列表生成文档
        const response = await fetch("/api/v0/generate_word", {
            method: "POST",
            body: JSON.stringify({ reportList }),
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "财务分析报告.docx";
            link.click();
        }

        // 隐藏确认框和勾选框
        showConfirm = false;
        showCheckbox = false;
    }

    async function generatePPT() {
        const selectedEntries = conversationHistory.filter(
            (entry) => entry.selected,
        );

        // 创建一个新的列表，用于保持顺序
        const reportList: string[] = [];

        selectedEntries.forEach((entry) => {
            // 先加入 question
            reportList.push(entry.question);

            const pdDataStr = JSON.stringify(entry.pd_data); // 将 pd_data 转换为字符串
            const summaryStr = entry.summary; // summary 已经是字符串

            // 合并 pd_data 和 summary，形成一个字符串
            const pdSummaryStr = `查到的数据表: ${pdDataStr}\n数据表的总结: ${summaryStr}`;

            // 将合并后的字符串添加到 reportList
            reportList.push(pdSummaryStr);
        });

        // 后端接口调用，传递报告列表生成文档
        const response = await fetch("/api/v0/generate_PPT", {
            method: "POST",
            body: JSON.stringify({ reportList }),
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "财务分析报告.pptx";
            link.click();
        }

        // 隐藏确认框和勾选框
        showConfirm_ppt = false;
        showCheckbox = false;
    }

    function showReportConfirm_ppt() {
        showCheckbox = true; // 显示勾选框
        showConfirm_ppt = true; // 显示确认框
    }

    // 取消生成报告
    function cancelReport_ppt() {
        showConfirm_ppt = false;
        showCheckbox = false; // 隐藏勾选框
    }

    let mode = "database"; // 默认状态为数据库模式
    // 切换模式函数
    function toggleMode() {
        mode = mode === "database" ? "file" : "database";
        console.log(`切换到: ${mode === "database" ? "数据库" : "文件"}`);
    }
</script>

<div
    id="application-sidebar"
    class="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden z-[60] w-64
    bg-white border-r border-gray-200 overflow-hidden lg:block lg:translate-x-0 lg:right-auto lg:bottom-0
    dark:scrollbar-y dark:bg-slate-900 dark:border-gray-700"
>
    <nav
        class="hs-accordion-group w-full h-full flex flex-col"
        data-hs-accordion-always-open=""
    >
        <div class="flex items-center justify-between p-4">
            <img
                class="w-35 h-auto"
                src="/images/navbar/logo_large.png"
                alt="GN LOGE"
            />
            <div class="lg:hidden">
                <button
                    type="button"
                    class="w-8 h-8 inline-flex justify-center items-center gap-2 rounded-md text-gray-700 align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all dark:text-gray-400 dark:focus:ring-offset-gray-800"
                    data-hs-overlay="#application-sidebar"
                    aria-controls="application-sidebar"
                    aria-label="Toggle navigation"
                >
                    <svg
                        class="w-4 h-4"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
                        ></path>
                    </svg>+
                    <span class="sr-only">Sidebar</span></button
                >
            </div>
        </div>

        <div class="overflow-y-auto pb-64">
            <ul class="p-4">
                <li>
                    <button
                        class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 border-t border-b border-gray-200 dark:border-gray-700 w-full"
                        onclick={() => switchView("trainingData")}
                    >
                        <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            width="16"
                            height="16"
                            stroke-width="1.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                            >
                            </path>
                        </svg>
                        训练数据
                    </button>
                </li>
                <li>
                    <button
                        class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 w-full"
                        onclick={() => createSession()}
                    >
                        <svg
                            class="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M8 2C8.47339 2 8.85714 2.38376 8.85714 2.85714V7.14286L13.1429 7.14286C13.6162 7.14286 14 7.52661 14 8C14 8.47339 13.6162 8.85714 13.1429 8.85714L8.85714 8.85715V13.1429C8.85714 13.6162 8.47339 14 8 14C7.52661 14 7.14286 13.6162 7.14286 13.1429V8.85715L2.85714 8.85715C2.38376 8.85715 2 8.4734 2 8.00001C2 7.52662 2.38376 7.14287 2.85714 7.14287L7.14286 7.14286V2.85714C7.14286 2.38376 7.52661 2 8 2Z"
                                fill="currentColor"
                            ></path>
                        </svg>
                        新的提问
                    </button>
                </li>

                {#if $sessions.today && $sessions.today.length > 0}
                    <li class="text-xs text-left px-3 mt-5 font-bold">
                        <span>今天</span>
                    </li>
                    {#each $sessions.today as session}
                        <li
                            class="flex items-center gap-x-3 py-2 px-3 text-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                            class:chosen-session={$sessionId === session?.sid}
                        >
                            <button
                                class="relative flex w-full"
                                onclick={() =>
                                    navigateToConversation(session?.sid)}
                            >
                                {session?.name}
                            </button>
                        </li>
                    {/each}
                {/if}

                {#if $sessions.yesterday && $sessions.yesterday.length > 0}
                    <li class="text-xs text-left px-3 mt-5 font-bold">
                        <span>昨天</span>
                    </li>
                    {#each $sessions.yesterday as session}
                        <li
                            class="flex items-center gap-x-3 py-2 px-3 text-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                            class:chosen-session={$sessionId === session?.sid}
                        >
                            <button
                                class="relative flex w-full"
                                onclick={() =>
                                    navigateToConversation(session?.sid)}
                            >
                                {session?.name}
                            </button>
                        </li>
                    {/each}
                {/if}

                {#if $sessions.week && $sessions.week.length > 0}
                    <li class="text-xs text-left px-3 mt-5 font-bold">
                        <span>前7天</span>
                    </li>
                    {#each $sessions.week as session}
                        <li
                            class="flex items-center gap-x-3 py-2 px-3 text-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                            class:chosen-session={$sessionId === session?.sid}
                        >
                            <button
                                class="relative flex w-full"
                                onclick={() =>
                                    navigateToConversation(session?.sid)}
                            >
                                {session?.name}
                            </button>
                        </li>
                    {/each}
                {/if}

                {#if $sessions.month && $sessions.month.length > 0}
                    <li class="text-xs text-left px-3 mt-5 font-bold">
                        <span>前30天</span>
                    </li>
                    {#each $sessions.month as session}
                        <li
                            class="flex items-center gap-x-3 py-2 px-3 text-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                            class:chosen-session={$sessionId === session?.sid}
                        >
                            <button
                                class="relative flex w-full"
                                onclick={() =>
                                    navigateToConversation(session?.sid)}
                            >
                                {session?.name}
                            </button>
                        </li>
                    {/each}
                {/if}

                {#if $sessions.other && $sessions.other.length > 0}
                    <li class="text-xs text-left px-3 mt-5 font-bold">
                        <span>其他</span>
                    </li>
                    {#each $sessions.other as session}
                        <li
                            class="flex items-center gap-x-3 py-2 px-3 text-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                            class:chosen-session={$sessionId === session?.sid}
                        >
                            <button
                                class="relative flex w-full"
                                onclick={() =>
                                    navigateToConversation(session?.sid)}
                            >
                                {session?.name}
                            </button>
                        </li>
                    {/each}
                {/if}
            </ul>
        </div>

        <div class="sticky bottom-0 z-10 bg-white dark:bg-gray-800">
            <ul>
                <!-- 生成报告按钮 -->
                <li class="relative">
                    <!-- 相对定位，确保模态框基于按钮定位 -->
                    <button
                        class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 w-full"
                        onclick={showReportConfirm}
                    >
                        <!-- 文档图标 -->
                        <svg
                            class="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M12.5 0h-9A1.5 1.5 0 0 0 2 1.5v13A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5V1.5A1.5 1.5 0 0 0 12.5 0zM8 13.5a.5.5 0 0 1-.5-.5V9H5a.5.5 0 0 1 0-1h2.5V5a.5.5 0 0 1 1 0v2h2.5a.5.5 0 0 1 0 1H8V13a.5.5 0 0 1-.5.5z"
                            ></path>
                        </svg>
                        生成报告
                    </button>
                    {#if showConfirm}
                        <!-- 模态框：确认生成报告 -->
                        <p class="text-center text-lg mb-4">确认生成报告？</p>

                        <!-- 按钮容器，居中并增加按钮间距 -->
                        <div class="flex justify-center gap-x-1 w-full">
                            <button
                                class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition duration-200"
                                onclick={generateReport}
                            >
                                确定
                            </button>

                            <!-- 取消按钮 -->
                            <button
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition duration-200"
                                onclick={cancelReport}
                            >
                                取消
                            </button>
                        </div>
                    {/if}
                </li>
                <!-- 生成PPT按钮 -->
                <li class="relative">
                    <!-- 相对定位，确保模态框基于按钮定位 -->
                    <button
                        class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 w-full"
                        onclick={showReportConfirm_ppt}
                    >
                        <!-- 文档图标 -->
                        <svg
                            class="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M12.5 0h-9A1.5 1.5 0 0 0 2 1.5v13A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5V1.5A1.5 1.5 0 0 0 12.5 0zM8 13.5a.5.5 0 0 1-.5-.5V9H5a.5.5 0 0 1 0-1h2.5V5a.5.5 0 0 1 1 0v2h2.5a.5.5 0 0 1 0 1H8V13a.5.5 0 0 1-.5.5z"
                            ></path>
                        </svg>
                        生成PPT
                    </button>
                    {#if showConfirm_ppt}
                        <p class="text-center text-lg mb-4">确认生成PPT?</p>

                        <div class="flex justify-center gap-x-1 w-full">
                            <button
                                class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition duration-200"
                                onclick={generatePPT}
                            >
                                确定
                            </button>

                            <!-- 取消按钮 -->
                            <button
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition duration-200"
                                onclick={cancelReport_ppt}
                            >
                                取消
                            </button>
                        </div>
                    {/if}
                </li>
                <li>
                    <button
                        class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 border-t border-b border-gray-200 dark:border-gray-700 w-full"
                        onclick={toggleMode}
                    >
                        <div
                            class="mode-text {mode === 'database'
                                ? 'active'
                                : ''}"
                        >
                            数据库
                        </div>
                        <div class="toggle-switch">
                            <div
                                class="toggle-ball {mode === 'database'
                                    ? 'left'
                                    : 'right'}"
                            ></div>
                        </div>
                        <div
                            class="mode-text {mode === 'file' ? 'active' : ''}"
                        >
                            文件
                        </div>
                    </button>
                </li>
            </ul>

            <div class="py-2.5 px-7">
                <p
                    class="inline-flex items-center gap-x-2 text-xs text-green-600"
                >
                    <span class="block w-1.5 h-1.5 rounded-full bg-green-600"
                    ></span>
                    已登录
                </p>
            </div>
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <a
                    class="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300"
                    href="#replace"
                    >注销
                    <svg
                        class="w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0v-2z"
                        ></path>
                        <path
                            fill-rule="evenodd"
                            d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"
                        ></path>
                    </svg>
                </a>
            </div>
        </div>
    </nav>
</div>
