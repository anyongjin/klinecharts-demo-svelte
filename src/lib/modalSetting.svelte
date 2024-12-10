<script lang="ts">
  import Modal from "./modal.svelte"
  import { getContext } from "svelte";
  import * as m from '$lib/paraglide/messages.js'
  import type { Chart, Nullable } from 'klinecharts';
  import { ChartCtx, ChartSave } from "./chart";
  import type { Writable } from "svelte/store";
	import _ from "lodash";
  import { getThemeStyles } from "$lib/coms";
  import { derived, writable } from "svelte/store";
  import { SvelteMap } from "svelte/reactivity"
  let { show = $bindable() } = $props();
  
  const tmp = new SvelteMap<string, any>();
  const ctx = getContext('ctx') as Writable<ChartCtx>;
  const save = getContext('save') as Writable<ChartSave>;
  const chart = getContext('chart') as Writable<Nullable<Chart>>;
  
  // 样式配置选项
  const options: Record<string, any>[] = [
    {
      key: 'candle.type',
      text: 'candle_type',
      component: 'select',
      dataSource: [
        { key: 'candle_solid', text: 'candle_solid' },
        { key: 'candle_stroke', text: 'candle_stroke' },
        { key: 'candle_up_stroke', text: 'candle_up_stroke' },
        { key: 'candle_down_stroke', text: 'candle_down_stroke' },
        { key: 'ohlc', text: 'ohlc' },
        { key: 'area', text: 'area' }
      ]
    },
    {
      key: 'candle.priceMark.last.show',
      text: 'last_price_show',
      component: 'switch'
    },
    {
      key: 'candle.priceMark.high.show',
      text: 'high_price_show',
      component: 'switch'
    },
    {
      key: 'candle.priceMark.low.show',
      text: 'low_price_show',
      component: 'switch'
    },
    {
      key: 'indicator.lastValueMark.show',
      text: 'indicator_last_value_show',
      component: 'switch'
    },
    {
      key: 'yAxis.type',
      text: 'price_axis_type',
      component: 'select',
      dataSource: [
        { key: 'normal', text: 'normal' },
        { key: 'percentage', text: 'percentage' },
        { key: 'logarithm', text: 'log' }
      ],
    },
    {
      key: 'yAxis.reverse',
      text: 'reverse_coordinate',
      component: 'switch',
    },
    {
      key: 'grid.show',
      text: 'grid_show',
      component: 'switch',
    }
  ];

  const optKeys: Record<string, boolean> = {
    'yAxis.type': true,
    'yAxis.reverse': true
  }

  function update(key: string, value: any) {
    let oldVal: any = undefined;
    const isOpt = optKeys[key];
    if (isOpt){
      oldVal = $save.options[key]
    }else{
      const style = $chart?.getStyles();
      oldVal = _.get(style, key)
    }
    if (oldVal == value) return
    tmp.set(key, value)
    if(isOpt){
      save.update(s => {
        s.options[key] = value
        return s
      })
    }else{
      save.update(s => {
        _.set(s.styles, key, value)
        return s
      })
    }
    let paneOpts = undefined;
    if (key == 'yAxis.type'){
      paneOpts = {id: 'candle_pane', axis: {name: value}}
    }else if(key == 'yAxis.reverse'){
      paneOpts = {id: 'candle_pane', axis: {reverse: value}}
    }
    if(paneOpts){
      $chart?.setPaneOptions(paneOpts)
    }else{
      $chart?.setStyles($save.styles);
    }
  }

  function click(from: string) {
    if (from === 'reset') {
      $chart?.setStyles(getThemeStyles($save.theme));
      $chart?.setPaneOptions({id: 'candle_pane', axis: {name: 'normal', reverse: false}});
      resetFromChart();
      const styles = $save.styles;
      options.forEach((it) => {
        if(!optKeys[it.key]){
          _.unset(styles, it.key)
        }
      })
      save.update(s => {
        s.styles = styles
        s.options = {}
        return s
      })
    }else{
      show = false;
    }
  }
 
  function resetFromChart(){
    let chartObj = $chart;
    if(!chartObj) return;
    const styles = chartObj.getStyles() ?? {};
    let paneOpt = chartObj.getPaneOptions('candle_pane');
    if(Array.isArray(paneOpt)){
      paneOpt = paneOpt[0]
    }
    tmp.set('yAxisType', paneOpt?.axis?.name)
    tmp.set('yAxisReverse', paneOpt?.axis?.reverse)
    options.forEach((it) => {
      if(!optKeys[it.key]){
        tmp.set(it.key, _.get(styles, it.key))
      }
    })
  }

  let chartInit = derived(ctx, ($ctx) => $ctx.initDone)
  chartInit.subscribe(resetFromChart)
</script>

<Modal title={m.settings()} width={760} bind:show={show} click={click} buttons={['confirm', 'reset']}>
  <div class="grid grid-cols-[3fr_2fr_3fr_2fr] gap-5 mx-7 my-5 items-center">
    {#each options as item}
      <span class="text-base-content/70 text-right">{m[item.text]?.()}</span>
      {#if item.component === 'select'}
        <select 
          class="select select-bordered select-sm w-full"
          value={tmp.get(item.key)}
          onchange={(e) => update(item.key, e.currentTarget.value)}
        >
          {#each item.dataSource as option}
            <option value={option.key}>{m[option.text]?.()}</option>
          {/each}
        </select>
      {:else if item.component === 'switch'}
        <input type="checkbox" class="toggle toggle-sm"
          checked={!!tmp.get(item.key)}
          onchange={(e) => update(item.key, e.currentTarget.checked)}/>
      {/if}
    {/each}
  </div>
</Modal>
