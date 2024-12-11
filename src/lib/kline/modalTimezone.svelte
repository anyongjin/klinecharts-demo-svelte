<script lang="ts">
  import Modal from "./modal.svelte"
  import * as m from '$lib/paraglide/messages.js'
  import { getContext } from "svelte";
  import { ChartSave } from "./chart";
  import type { Writable } from "svelte/store";
  import { getTimezoneSelectOptions} from "../dateutil";

  let { show = $bindable() } = $props();
  
  const save = getContext('save') as Writable<ChartSave>;

  const timezoneOptions = getTimezoneSelectOptions();

  function handleTimezoneChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    $save.timezone = select.value;
  }

  function handleConfirm(from: string) {
    show = false;
  }
</script>

<Modal title={m.timezone()} width={400} bind:show={show} click={handleConfirm}>
  <div class="flex justify-center items-center min-h-[70px]">
    <select 
      class="select select-bordered w-[70%]"
      value={$save.timezone}
      onchange={handleTimezoneChange}
    >
      {#each timezoneOptions as option}
        <option value={option.key}>
          {m[option.text]()}
        </option>
      {/each}
    </select>
  </div>
</Modal> 