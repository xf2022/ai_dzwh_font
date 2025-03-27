<script lang='ts'>
    import axios from 'axios';
    import type { Conversation, Session } from '$stores/conversation';
    import { onMount } from 'svelte';

    // 创建语音识别对象（支持的浏览器需要提供 Web Speech API）
    let recognition: any;

    onMount(() => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

        // 设置语言为中文
        recognition.lang = 'zh-CN'; // 设置为中文
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
    };

    let talk: boolean = false
    let header: string = ''; // 存储标题
    let load_questions: string[] = []; // 存储获取的问题
    let conversationHistory: Conversation[] = [];
    let showCheckbox: boolean = false;
    let response_timeout: boolean = false;

    let isPlaying: boolean = false; // 控制语音播放状态
    let questionInput: string = '';
    let questionInput_tmp: string = '';
    let currSid: string = '';

    let mode = 'database';

    function playText(text: string) {//语言播放
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
        const selectedVoice = voices.find(voice => voice.lang === "zh-CN" && voice.name.includes("Microsoft Yaoyao"));

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
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            // 调用生成 SQL 的处理函数
            handleGenerateSQL();
        }
    };

    let today_sessions: Session[] = [];
    let errorMessage = '';

    const handleGenerateSQL = async () => {
        if (currSid === '') {
            const sid = crypto.randomUUID();
            const name = questionInput.slice(0, 30);
            const session_resp = await axios.get(`/api/v0/session/${sid}/${name}`);
            const session_data = session_resp.data;
            if (session_data.type === 'session') {
                currSid  = session_data.sid;
            }
            today_sessions = [{sid: currSid, name: name}, ...today_sessions]
        }

        // 发送请求到后端
        try {
            questionInput_tmp = questionInput
            questionInput = '';
            talk = true;
            response_timeout = false
            conversationHistory.push({
                id: 12,
                question: questionInput_tmp,
                response: "",
                show_response: false,
                show_pd: false,
                pd_data: null,
                tableHeaders: [],
                show_chart: false,
                chartData: "",
                summary: "",
                selected: false
            });
            conversationHistory = [...conversationHistory]//这里更新界面，展示思考中的动画

            const response_json = await fetch(`/api/v0/generate_sql?question=${encodeURIComponent(questionInput_tmp)}&&former_doc_list=false&&mode_web=${encodeURIComponent(mode)}`);
            if (response_json.ok) {
                const response = await response_json.json();
                if (response.type === 'sql') {

                    if (response.sql_que !== "") {

                        const pd_response = await fetch(`/api/v0/run_sql?id=${encodeURIComponent(response.id)}`)
                        const pd_data = await pd_response.json()
                        console.log(pd_data.ok)
                        let cycle = 0
                        console.log(cycle)

                        while (pd_response.ok && pd_data.type === "error" && cycle < 4) {//第一次sql执行错误，把错误继续提问，重新生成sql，直到能查询到数据为止
                            cycle += 1
                            if (cycle === 4) {
                                response_timeout = true;
                                break;
                            }
                            console.log(cycle);
                            const response_json = await fetch(`/api/v0/generate_sql?question=${encodeURIComponent(pd_data.error)}&&former_doc_list=true&&mode_web=${encodeURIComponent(mode)}`);
                            if (response_json.ok) {
                                console.log("进入1");
                                const response = await response_json.json();
                                if (response.type === 'sql') {
                                    // conversationHistory[conversationHistory.length - 1].show_response = true;
                                    // conversationHistory[conversationHistory.length - 1].response = response.text;
                                    // conversationHistory[conversationHistory.length - 1].id = response.id;
                                    console.log("进入2");
                                    if (response.sql_que !== "") {
                                        const pd_response = await fetch(`/api/v0/run_sql?id=${encodeURIComponent(response.id)}`)
                                        const pd_data = await pd_response.json()
                                        console.log("进入3");

                                    } else {

                                        pd_data.error += "重新生成一次，找不到sql";
                                    }
                                }

                            }
                        }
                        cycle = 0


                        if (pd_data.type !== "error") {

                            const pd = JSON.parse(pd_data.df);  // 将返回的数据赋值给 tableData
                            // console.log(pd_data[1]);  // 检查 pd_data 的内容和类型

                            // 动态生成表头
                            const tableHeaders = pd.length > 0 ? Object.keys(pd[0]): [];  // 获取字段名

                            conversationHistory[conversationHistory.length - 1].show_pd = true;
                            conversationHistory[conversationHistory.length - 1].pd_data = pd;
                            conversationHistory[conversationHistory.length - 1].tableHeaders = tableHeaders;

                            const response_chart = await fetch(`/api/v0/generate_plotly_figure?id=${encodeURIComponent(response.id)}&&question=${encodeURIComponent(questionInput_tmp)}`);
                            const chart_data = await response_chart.json();
                            if (chart_data.type === "plotly_figure") {
                                const figJson = JSON.parse(chart_data.fig);
                                console.log("获得图表代码")
                                console.log(figJson)
                                conversationHistory[conversationHistory.length - 1].show_chart = true;
                                conversationHistory[conversationHistory.length - 1].chartData = figJson;
                                conversationHistory[conversationHistory.length - 1].summary = chart_data.summary
                                console.log("总结：" + conversationHistory[conversationHistory.length - 1].summary)
                            }

                        }

                    }
                    if (response_timeout !== true) {
                        conversationHistory[conversationHistory.length - 1].show_response = true;
                        conversationHistory[conversationHistory.length - 1].response = response.text;
                        conversationHistory[conversationHistory.length - 1].id = response.id;
                    }

                }
                conversationHistory = [...conversationHistory]


            }
        } catch (error) {
            console.error('Fetch错误:', error);
            errorMessage = '请求失败，请稍后重试。'; // 设置错误信息
        }


    };

</script>

<div id="chat-container" class="relative w-full lg:pl-64">
    <div class="py-10 lg:py-14">
        {#if talk === false}
            <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"><img
                    src="/conversation/assistant.png"
                    class="flex-shrink-0 w-[2.375rem] h-[2.375rem] "
                    alt="agent logo">
                <div class="space-y-3 overflow-x-auto overflow-y-hidden">
                    <p class="text-gray-800 dark:text-gray-200"> {header}
                        {#each load_questions as question}
                            <button type="button"
                                    class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400">
                                {question}
                            </button>
                        {/each}
                    </p>
                </div>
            </li>
        {:else }
            <ul class="mt-16 space-y-5">
                {#each conversationHistory as entry (entry.id)}
                    <li class="py-2 sm:py-4">
                        <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                            <div class="max-w-2xl flex gap-x-2 sm:gap-x-4"><span
                                    class="flex-shrink-0 inline-flex items-center justify-center h-[2.375rem] w-[2.375rem] rounded-full bg-gray-600"><span
                                    class="text-sm font-medium text-white leading-none">你</span></span>
                                <div class="grow mt-2 space-y-3 overflow-x-auto overflow-y-hidden text-left"><p
                                        class="text-gray-800 dark:text-gray-200">
                                    {entry.question}</p></div>
                            </div>
                            <!-- 勾选框, 只有在showCheckbox为true时才显示 -->
                            {#if showCheckbox}
                                <input type="checkbox" bind:checked={entry.selected} class="ml-4" />
                            {/if}
                        </div>
                    </li>
                    {#if !entry.show_response }
                        <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"><img
                                src="/conversation/assistant.png" class="flex-shrink-0 w-[2.375rem] h-[2.375rem] animate-bounce "
                                alt="agent logo">
                            <div class="space-y-3">
                                {#if response_timeout}
                                    <p class="text-red-600 dark:text-red-400">回答失败，请稍后重试。</p>
                                {:else}
                                    <p class="text-gray-800 dark:text-gray-200">思考中...</p>
                                {/if}
                            </div>
                        </li>
                    {:else}
                        {#if !entry.show_pd}
                            <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4"><img
                                    src="/conversation/assistant.png" class="flex-shrink-0 w-[2.375rem] h-[2.375rem] "
                                    alt="agent logo">
                                <div class="space-y-3 overflow-x-auto overflow-y-hidden">
                                    <p class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                                        {entry.response}
                                    </p>
                                    <button type="button"
                                            class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                            on:click={() => playText(entry.response)}>
                                        播放
                                    </button>
                                </div>
                            </li>
                        {/if}
                        {#if entry.show_pd}
                            <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
                                <img src="/conversation/assistant.png" class="flex-shrink-0 w-[2.375rem] h-[2.375rem] "
                                     alt="agent logo">
                                <div class="space-y-3 overflow-x-auto overflow-y-hidden">
                                    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
                                        <div class="overflow-x-auto overflow-y-auto" style="max-height:300px">
                                            <div class="p-1.5 min-w-full inline-block align-middle ">
                                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead class="bg-gray-50 dark:bg-slate-800">
                                                    <tr>
                                                        {#each entry.tableHeaders as header}
                                                            <th scope="col" class="px-6 py-3 text-left">
                                                                <div class="flex items-center gap-x-2">
                                                                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                                                                                {header}
                                                                            </span>
                                                                </div>
                                                            </th>
                                                        {/each}
                                                    </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {#if entry.pd_data}
                                                        {#each entry.pd_data as row}
                                                            <tr>
                                                                {#each entry.tableHeaders as header}
                                                                    <td class="h-px w-px whitespace-nowrap">
                                                                        <div class="px-6 py-3">
                                                                                    <span class="text-gray-800 dark:text-gray-200">
                                                                                        {row[header]}
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
                                    <ul class="flex flex-col justify-end text-start -space-y-px">
                                        <li class="flex items-center gap-x-2 p-3 text-sm bg-white border text-gray-800 first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-200">
                                            <div class="w-full flex justify-between truncate"><span
                                                    class="mr-3 flex-1 w-0 truncate">CSV</span> <a
                                                    class="flex items-center gap-x-2 text-gray-500 hover:text-blue-500 whitespace-nowrap"
                                                    href="/api/v0/download_csv?id={entry.id}">
                                                <svg class="flex-shrink-0 w-3 h-3" width="16" height="16"
                                                     viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"></path>
                                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"></path>
                                                </svg>
                                                下载</a></div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            {#if entry.show_chart}
                                <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
                                    <img src="/conversation/assistant.png" class="flex-shrink-0 w-[2.375rem] h-[2.375rem] "
                                         alt="agent logo">
                                    <div id="chart-container-{entry.id}" class="chart-container"
                                         style="height:400px;"
                                    ></div>
                                </li>
                                <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
                                    <img
                                            src="/conversation/assistant.png" class="flex-shrink-0 w-[2.375rem] h-[2.375rem] "
                                            alt="agent logo">
                                    <div class="space-y-3 overflow-x-auto overflow-y-hidden">
                                        <p class="text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                                            {entry.summary || "此次查询没有得出结论"}
                                        </p>
                                        <button type="button"
                                                class="mb-2.5 mr-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-md border border-blue-600 bg-white text-blue-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                                                on:click={() => playText(entry.summary || "此次查询没有得出结论")}>
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

    <footer class="max-w-4xl mx-auto sticky bottom-0 z-10 p-3 sm:py-6">

        <div class="relative "><input type="text"
                                      bind:value={questionInput}
                                      on:keydown={handleKeyDown}
                                      class="p-4 pb-12 block w-full bg-gray-100 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400"
                                      placeholder="向我询问有关您的数据的问题，我可以将其转换为 SQL。">
            <div class="absolute bottom-px  inset-x-px p-2 rounded-b-md bg-gray-100 dark:bg-slate-800">
                <div class="flex justify-between items-center">
                    <div class="flex items-center"></div>
                    <div class="flex items-center gap-x-1">
                        <button
                                type="button"
                                class="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:text-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                                on:click={startSpeechRecognition}>
                            <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" x2="12" y1="19" y2="22"></line>
                            </svg>
                        </button>
                        <button type="button"
                                on:click={handleGenerateSQL}
                                class="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                            <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" width="16"
                                 height="16"
                                 fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</div>