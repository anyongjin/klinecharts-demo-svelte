<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit'
	import { i18n } from '$lib/i18n.js'
	import { alerts } from '$lib/stores/alerts';
	import Alert from '$lib/alert.svelte';

	let { children } = $props();
  import "tailwindcss/tailwind.css";
</script>

<ParaglideJS {i18n}>
	<!-- 添加alerts显示区域 -->
	<div class="alerts-container">
		{#each $alerts as alert (alert.id)}
			<Alert type={alert.type} text={alert.text} id={alert.id} />
		{/each}
	</div>
	{@render children()}
</ParaglideJS>

<style global>
  .alerts-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    pointer-events: none; /* 允许点击alerts下面的元素 */
  }
  /*滚动条*/
  * {
    scrollbar-width: thin;
    scrollbar-color: #777 #ddd;
  }
	/*Chrome  Safari*/
	*::-webkit-scrollbar {
			width: 8px;
			height: 8px;
	}
	*::-webkit-scrollbar-track {
			background: #f5f5f5;
			border-radius: 10px;
	}
	*::-webkit-scrollbar-thumb {
			background: #c0c0c0;
			border-radius: 10px;
	}
	*::-webkit-scrollbar-thumb:hover {
			background: #a0a0a0;
	}

</style>