<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
	import type { Snippet } from 'svelte';

  interface PropsType {
    width?: number | string
    title: string
    buttons?: string[]
    show: boolean
    center?: boolean
    children?: Snippet<[]>
    click?: (type: string) => void
  }

  let {
    width = 400, 
    title = "", 
    buttons = ['confirm'], 
    show = $bindable(false), 
    center = false,
    children,
    click
  }: PropsType = $props();

  function handleButtonClick(type: string) {
    if (type === 'close') {
      show = false;
    }
    click && click(type)
  }

  function getButtonClass(type: string): string {
    switch (type) {
      case 'confirm':
        return 'btn-primary';
      case 'cancel':
        return 'btn-ghost';
      default:
        return 'btn-secondary';
    }
  }

  function close(e: MouseEvent){
    show = false
    e.stopPropagation()
    click && click('close')
  }

</script>

{#if show}
  <div class="modal modal-open" onclick={close}>
    <div class="modal-box" style="width: {width}px; max-width: 90vw;" onclick={(e) => e.stopPropagation()}>
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">{title}</h3>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={close}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="min-h-[60px] {center ? 'flex justify-center items-center' : ''}">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if buttons.length > 0}
        <div class="modal-action">
          {#each buttons as btn}
            <button class="btn {getButtonClass(btn)}"
              onclick={() => handleButtonClick(btn)}>{m[btn]()}</button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
