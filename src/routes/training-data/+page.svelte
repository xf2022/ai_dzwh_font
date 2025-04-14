<script lang="ts">
    interface TrainingData {
        id: string;
        question: string;
        content: string;
        training_data_type: string;
    }
    let trainingData: TrainingData[] = [];

    const deleteItem = (id: string) => {};
</script>

<div class="relative h-screen w-full lg:pl-64 min-w-full">
    <!-- 您的训练数据内容 -->
    <div class="py-10 lg:py-14">
        <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
            <div class="flex flex-col">
                <div class="-m-1.5 overflow-x-auto">
                    <div class="p-1.5 min-w-full inline-block align-middle">
                        <div
                            class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700"
                        >
                            <div
                                class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700"
                            >
                                <div>
                                    <h2
                                        class="text-xl font-semibold text-gray-800 dark:text-gray-200"
                                    >
                                        Training Data
                                    </h2>
                                    <p
                                        class="text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        添加或删除训练数据。良好的训练数据是准确性的关键。
                                    </p>
                                </div>
                                <div>
                                    <div class="inline-flex gap-x-2">
                                        <button
                                            class="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                        >
                                            View all
                                        </button>
                                        <button
                                            class="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                                        >
                                            <svg
                                                class="w-3 h-3"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2.63452 7.50001L13.6345 7.5M8.13452 13V2"
                                                    stroke="currentColor"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                ></path>
                                            </svg>
                                            添加训练数据
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <table
                                class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                            >
                                <thead class="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left"
                                        >
                                            <div
                                                class="flex items-center gap-x-2"
                                            >
                                                <span
                                                    class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                    >Action</span
                                                >
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left"
                                        >
                                            <div
                                                class="flex items-center gap-x-2"
                                            >
                                                <span
                                                    class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                    >Question</span
                                                >
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left"
                                        >
                                            <div
                                                class="flex items-center gap-x-2"
                                            >
                                                <span
                                                    class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                    >Content</span
                                                >
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left"
                                        >
                                            <div
                                                class="flex items-center gap-x-2"
                                            >
                                                <span
                                                    class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200"
                                                    >Training Data Type</span
                                                >
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                    class="divide-y divide-gray-200 dark:divide-gray-700"
                                >
                                    <!-- 这里添加数据行 -->

                                    {#each trainingData as item}
                                        <tr>
                                            <td class="h-px w-px">
                                                <div class="px-6 py-3">
                                                    <button
                                                        type="button"
                                                        class="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border-2 border-red-200 font-semibold text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                                                        on:click={() =>
                                                            deleteItem(item.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                            <td class="h-px w-px">
                                                <div class="px-6 py-3">
                                                    <span
                                                        class="text-gray-800 dark:text-gray-200"
                                                        >{item.question}</span
                                                    >
                                                </div>
                                            </td>
                                            <td class="h-px w-px">
                                                <div class="px-6 py-3">
                                                    <span
                                                        class="text-gray-800 dark:text-gray-200"
                                                        >{item.content}</span
                                                    >
                                                </div>
                                            </td>
                                            <td class="h-px w-px">
                                                <div class="px-6 py-3">
                                                    <span
                                                        class="text-gray-800 dark:text-gray-200"
                                                        >{item.training_data_type}</span
                                                    >
                                                </div>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                            <div
                                class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700"
                            >
                                <div class="inline-flex items-center gap-x-2">
                                    <p
                                        class="text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        Showing:
                                    </p>
                                    <div class="max-w-sm space-y-3">
                                        <span
                                            class="py-2 px-3 pr-9 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                                            >1 - 10</span
                                        >
                                    </div>
                                    <p
                                        class="text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        of 25
                                    </p>
                                </div>
                                <div>
                                    <!-- 分页按钮 -->
                                    <div class="inline-flex gap-x-2">
                                        <button
                                            type="button"
                                            class="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                        >
                                            <svg
                                                class="w-3 h-3"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                                                ></path>
                                            </svg>
                                            Prev
                                        </button>
                                        <button
                                            type="button"
                                            class="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                        >
                                            Next
                                            <svg
                                                class="w-3 h-3"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
