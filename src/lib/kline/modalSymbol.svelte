<script lang="ts">
  import Modal from "./modal.svelte"
  import { getContext } from "svelte";
  import * as m from '$lib/paraglide/messages.js'
	import { ChartSave, ChartCtx } from "./chart";
  import { writable, type Writable } from "svelte/store";
	import type { SymbolInfo } from "./types";

  let { show = $bindable() } = $props();

  const title = m.symbol_search();
  let keyword = writable("");
  let showList = $state<SymbolInfo[]>([]);

  const ctx = getContext('ctx') as Writable<ChartCtx>;
  const save = getContext('save') as Writable<ChartSave>;
  
  keyword.subscribe(value => {
    if (!value) {
      showList = $save.allSymbols;
      return;
    }
    
    const searchTerm = $keyword.toLowerCase();
    showList = $save.allSymbols.filter(symbol => 
      symbol.ticker.toLowerCase().includes(searchTerm)
    );
  });
</script>

<Modal {title} width=460 bind:show={show}>
  <label class="input input-bordered flex items-center gap-2 my-5 h-10">
    <input 
      type="text" 
      class="grow text-base" 
      bind:value={$keyword} 
    />
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      fill="currentColor" 
      class="h-4 w-4 opacity-70"
    >
      <path 
        fill-rule="evenodd"
        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
        clip-rule="evenodd" 
      />
    </svg>
  </label>
  
  <ul class="h-[400px] overflow-y-auto -mx-5">
    {#if $ctx.loadingPairs}
      <div class="flex justify-center items-center h-full">
        <span class="loading loading-spinner loading-md"></span>
      </div>
    {:else}
      {#each showList as symbol, i}
        <li 
          class="px-5 py-3 flex justify-between items-center hover:bg-base-200 cursor-pointer"
          onclick={() => {$save.symbol = symbol}}
        >
          <div class="flex items-center">
            {#if symbol.logo}
              <img 
                src={symbol.logo} 
                alt={symbol.ticker}
                class="w-4 h-4 mr-2" 
              />
            {/if}
            <span class="max-w-[300px] truncate">
              {symbol.shortName ?? symbol.ticker}
            </span>
          </div>
          <span class="text-base-content/70">{symbol.exchange}</span>
        </li>
      {:else}
        <li class="px-5 py-3 text-center text-base-content/70">
          {m.no_data()}
        </li>
      {/each}
    {/if}
  </ul>
</Modal>