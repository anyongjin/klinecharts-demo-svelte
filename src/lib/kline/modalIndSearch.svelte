<script lang="ts">
  import Modal from "./modal.svelte"
  import { getContext } from "svelte";
  import * as m from '$lib/paraglide/messages.js'
  import { ChartSave, ChartCtx } from "./chart";
  import type { Writable } from "svelte/store";
  import type { Chart, Nullable, PaneOptions } from 'klinecharts';
  import { derived } from "svelte/store";
  import {ActionType} from 'klinecharts';
  import { IndFieldsMap } from './coms';
  import KlineIcon from './icon.svelte';
  let { show = $bindable() } = $props();
  
  const ctx = getContext('ctx') as Writable<ChartCtx>;
  const save = getContext('save') as Writable<ChartSave>;
  const chart = getContext('chart') as Writable<Nullable<Chart>>;
  
  let keyword = $state('');
  let checked = $state<Record<string, boolean>>({})

  let showInds = $derived.by(() => {
    if (keyword) {
      const keywordLow = keyword.toLowerCase();
      return $ctx.allInds.filter(i => 
        i.name.toLowerCase().includes(keywordLow) || 
        i.title.toLowerCase().includes(keywordLow)
      )
    }
    return $ctx.allInds;
  })

  let saveInds = derived(save, ($save) => $save.saveInds)
  saveInds.subscribe((new_val) => {
    checked = {}
    Object.keys(new_val).forEach(k => {
      const parts = k.split('_');
      checked[parts[parts.length - 1]] = true
    })
  })

  function toggleInd(isMain: boolean, name: string, checked: boolean) {
    const paneId = isMain ? 'candle_pane' : 'pane_'+name;
    if (checked) {
      createIndicator(name, undefined, false, {id: paneId})
    } else {
      delInd(paneId, name)
    }
  }
  
  export function createIndicator(name: string, params?: any[], isStack?: boolean, paneOptions?: PaneOptions): Nullable<any> {
    const chartObj = $chart;
    if (!chartObj) return null;
    if (name === 'VOL') {
      paneOptions = { axis: {gap: { bottom: 2 }}, ...paneOptions }
    }
    let calcParams = params;
    if (!calcParams || calcParams.length === 0) {
      const fields = IndFieldsMap[name] || [];
      if (fields.length > 0) {
        calcParams = fields.map(f => f.default);
      }
    }
    const ind_id = chartObj.createIndicator({
      name, calcParams,
      // @ts-expect-error
      createTooltipDataSource: ({ indicator }) => {
        const icon_ids = [indicator.visible ? 1: 0, 2, 3];
        const styles = chartObj.getStyles().indicator.tooltip;
        const icons = icon_ids.map(i => styles.icons[i])
        return { icons }
      }
    }, isStack, paneOptions)
    if(!ind_id)return null
    const pane_id = paneOptions?.id ?? ''
    const ind = {name, pane_id, params: calcParams}
    if($save){
      $save.saveInds[`${pane_id}_${name}`] = ind;
    }
    return ind
  }
  
  export function delInd(paneId: string, name: string){
    $chart?.removeIndicator({paneId, name})
    delete $save.saveInds[`${paneId}_${name}`]
  }

  const cloudIndLoaded = derived(ctx, ($ctx) => $ctx.cloudIndLoaded);
  cloudIndLoaded.subscribe((new_val) => {
    Object.values($save.saveInds).forEach(o => {
      createIndicator(o.name, o.params, true, {id: o.pane_id})
    })
  })

  const initDone = derived(ctx, ($ctx) => $ctx.initDone);
  initDone.subscribe((new_val) => {
    $chart?.subscribeAction(ActionType.OnTooltipIconClick, data => {
      console.log('OnTooltipIconClick', data)
      const item = data as {indicatorName: string, paneId: string, iconId: string}
      if (item.indicatorName) {
        switch (item.iconId) {
          case 'visible': {
            $chart?.overrideIndicator({ name: item.indicatorName, visible: true }, item.paneId)
            break
          }
          case 'invisible': {
            $chart?.overrideIndicator({ name: item.indicatorName, visible: false }, item.paneId)
            break
          }
          case 'setting': {
            $ctx.editIndName = item.indicatorName
            $ctx.editPaneId = item.paneId
            $ctx.modalIndCfg = true
            break
          }
          case 'close': {
            delInd(item.paneId, item.indicatorName)
          }
        }
      }
    })
  })

</script>

<Modal title={m.indicator()} width={550} bind:show={show}>
  <div class="flex flex-col gap-4">
    <input
      type="text"
      class="input input-bordered w-full"
      placeholder={m.search()}
      bind:value={keyword}
    />
    
    <div class="flex h-[400px]">
      <div class="flex-1 overflow-y-auto">
        {#each showInds as ind}
          <div class="flex items-center h-10 px-5 hover:bg-base-200">
            <label class="label cursor-pointer flex justify-between flex-1">
              <div class="flex items-center flex-1">
                <span class="icon-overlay w-6 mr-3">
                  {#if ind.cloud}
                    <KlineIcon name="cloud" size={24} />
                  {/if}
                </span>
                <span class="label-text flex-1">{ind.title}</span>
              </div>
              <input type="checkbox" class="checkbox" checked={!!checked[ind.name]} 
              onchange={(e) => toggleInd(ind.is_main, ind.name, e.currentTarget.checked)} />
            </label>
          </div>
        {/each}
      </div>
    </div>
  </div>
</Modal> 