<script lang="ts">
  import Modal from "./modal.svelte"
  import { getContext } from "svelte";
  import * as m from '$lib/paraglide/messages.js'
  import { ChartSave } from "./chart";
  import type { Writable } from "svelte/store";
  import type { Period } from "./types";

  let { show = $bindable() } = $props();
  
  const title = m.timeframe();
  const save = getContext('save') as Writable<ChartSave>;
  
  const periods: Period[] = [
    { timeframe: '1m', multiplier: 1, timespan: 'minute', secs: 60 },
    { timeframe: '5m', multiplier: 5, timespan: 'minute', secs: 300 },
    { timeframe: '15m', multiplier: 15, timespan: 'minute', secs: 900 },
    { timeframe: '30m', multiplier: 30, timespan: 'minute', secs: 1800 },
    { timeframe: '1h', multiplier: 1, timespan: 'hour', secs: 3600 },
    { timeframe: '4h', multiplier: 4, timespan: 'hour', secs: 14400 },
    { timeframe: '1d', multiplier: 1, timespan: 'day', secs: 86400 },
    { timeframe: '1w', multiplier: 1, timespan: 'week', secs: 604800 },
    { timeframe: '1M', multiplier: 1, timespan: 'month', secs: 2592000 },
  ];

  function handlePeriodClick(period: Period) {
    $save.period = period;
    show = false;
  }
</script>

<Modal {title} width={500} bind:show={show} buttons={[]}>
  <div class="p-2">
    <ul class="flex flex-wrap justify-center gap-2">
      {#each periods as period}
        <li 
          class="w-[140px] h-[85px] flex items-center justify-center cursor-pointer rounded-lg"
          class:hover:bg-base-200={period.timeframe !== $save.period?.timeframe}
          class:bg-primary={period.timeframe === $save.period?.timeframe}
          class:text-primary-content={period.timeframe === $save.period?.timeframe}
          onclick={() => handlePeriodClick(period)}
        >
          <span>{period.multiplier} {m[period.timespan]()}</span>
        </li>
      {/each}
    </ul>
  </div>
</Modal>

<style>
  li {
    border: 1px solid hsl(var(--bc) / 0.1);
  }
</style>
