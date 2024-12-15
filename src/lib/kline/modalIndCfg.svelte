<script lang="ts">
  import Modal from "./modal.svelte"
  import { getContext } from "svelte";
  import * as m from '$lib/paraglide/messages.js'
  import { ChartSave, ChartCtx } from "./chart";
  import type { Writable } from "svelte/store";
  import type { Chart, Nullable } from 'klinecharts';
  import * as kc from 'klinecharts';
  import { derived } from "svelte/store";
  import { IndFieldsMap } from './coms';
  let { show = $bindable() } = $props();
  
  const ctx = getContext('ctx') as Writable<ChartCtx>;
  const save = getContext('save') as Writable<ChartSave>;
  const chart = getContext('chart') as Writable<Nullable<Chart>>;
  let params = $state<unknown[]>([]);
  let fields = $state<Record<string, any>[]>([]);

  // 当编辑的指标改变时，更新参数
  const showEdit = derived(ctx, ($ctx) => $ctx.modalIndCfg)
  showEdit.subscribe(() => {
    if (!$ctx.editIndName)return
    fields.splice(0, fields.length);
    fields = IndFieldsMap[$ctx.editIndName] || [];
    if (fields.length === 0) return;
    let inds = $chart?.getIndicators({name: $ctx.editIndName}).get($ctx.editPaneId) ?? [];
    if (inds.length > 0) {
      params.splice(0, params.length, ...inds[0].calcParams);
    }
  });

  function handleConfirm(from: string) {
    show = false;
    if (from !== 'confirm' || !$ctx.editIndName || !$ctx.editPaneId || fields.length === 0) return;
    
    const result: unknown[] = [];
    params.forEach((param: any, i: number) => {
      if (!kc.utils.isValid(param) || param === '') {
        if (fields[i].default) {
          param = fields[i].default
        }
      }
      if(param){
        result.push(Number(param))
      }
    })

    $chart?.overrideIndicator({
      name: $ctx.editIndName,
      calcParams: result
    }, $ctx.editPaneId);

    save.update(s => {
      s.saveInds[`${$ctx.editPaneId}_${$ctx.editIndName}`] = {
        name: $ctx.editIndName,
        params: result,
        pane_id: $ctx.editPaneId
      };
      return s
    })
  }

</script>

<Modal title={$ctx.editIndName} width={360} bind:show={show} click={handleConfirm}>
  {#if !fields.length}
    <div class="flex justify-center items-center min-h-[120px]">
      <div class="text-base-content/70">{m.no_ind_params()}</div>
    </div>
  {:else}
    <div class="grid grid-cols-5 gap-5 mt-5">
      {#each fields as field, i}
        <span class="col-span-2 text-base-content/70 flex items-center justify-center">{field.title}</span>
        <input type="number" class="col-span-3 input input-bordered w-full" bind:value={params[i]}/>
      {/each}
    </div>
  {/if}
</Modal>
