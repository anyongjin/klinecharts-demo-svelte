<script lang="ts">
  import { getContext } from 'svelte';
  import type { Chart, Nullable } from 'klinecharts';
  import KlineIcon from './icon.svelte';
  import { browser } from '$app/environment';
  import type {Writable} from 'svelte/store';
  import {ChartSave, ChartCtx} from './chart';
  import {GetNumberDotOffset, makePeriod} from './coms';
  import {secs_to_tf} from './dateutil';
  import { derived } from 'svelte/store';
  import * as m from '$lib/paraglide/messages.js';
  import Papa from 'papaparse';
  import ModalSymbol from './modalSymbol.svelte';
  import ModalPeriod from './modalPeriod.svelte';
  import ModalIndSearch from './modalIndSearch.svelte';
  import ModalIndCfg from './modalIndCfg.svelte';
  import ModalSetting from './modalSetting.svelte';
  import ModalScreenShot from './modalScreenShot.svelte';
  import ModalTimezone from './modalTimezone.svelte';
  // Props
  let {customLoad = false} = $props();

  // Context
  const chart = getContext('chart') as Writable<Nullable<Chart>>;
  const ctx = getContext('ctx') as Writable<ChartCtx>;
  const save = getContext('save') as Writable<ChartSave>;

  function isFullscreen() {
    if(!browser)return false;
    let doc = (document as any)
    let fullscreenElement =
        doc.fullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement;

    return fullscreenElement != undefined;
  }

  // State
  let fullScreen = $state(isFullscreen());
  let showSymbolModal = $state(false);
  let showPeriodModal = $state(false);
  let showIndSearchModal = $state(false);
  let showSettingModal = $state(false);
  let showScreenShotModal = $state(false);
  let showTimezoneModal = $state(false);
  let screenShotUrl = $state('');
  let showName = $state('');

  let fileRef = $state<HTMLInputElement>()
  let periodBarRef: HTMLElement

  const ticker = derived(save, ($save) => $save.symbol.ticker);
  ticker.subscribe(() => {
    showName = $save.symbol.ticker;
  })
  const name = derived(save, ($save) => $save.symbol.name);
  name.subscribe(() => {
    if($save.symbol.name){
      showName = $save.symbol.name;
    }
  })
  const shortName = derived(save, ($save) => $save.symbol.shortName);
  shortName.subscribe(() => {
    if($save.symbol.shortName){
      showName = $save.symbol.shortName;
    }
  })

  function toggleTheme() {
    $save.theme = $save.theme === 'dark' ? 'light' : 'dark';
  }

  function clickLoadData() {
    $ctx.timeStart = 0;
    $ctx.timeEnd = 0;
    $ctx.fireOhlcv += 1;
  }

  function loadDataFile(e: any) {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    const name = file.name.split('.').shift(0);
    
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (data: any) => {
        const karr = (data.data || []).map((data: any) => ({
          timestamp: parseInt(data[0]),
          open: parseFloat(data[1]),
          high: parseFloat(data[2]),
          low: parseFloat(data[3]),
          close: parseFloat(data[4]),
          volume: parseFloat(data[5])
        }));
        
        showName = name;
        if (karr.length > 1) {
          const lastIdx = karr.length - 1;
          const min_intv = Math.min(karr[1].timestamp - karr[0].timestamp, karr[lastIdx].timestamp - karr[lastIdx-1].timestamp);
          $save.period = makePeriod(secs_to_tf(min_intv / 1000));
        }
        if (karr.length > 0) {
          const pricePrec = GetNumberDotOffset(Math.min(karr[0].low, karr[karr.length - 1].low)) + 3
          $chart?.setPrecision({price: pricePrec, volume: 0})
        }
        $chart?.applyNewData(karr, false)
        $ctx.loadingKLine = false
        $ctx.klineLoaded += 1
      }
    });
  }
  
  function clickScreenShot(){
    let bgColor = $save.theme === 'dark' ? '#151517' : '#ffffff'
    screenShotUrl = $chart?.getConvertPictureUrl(true, 'jpeg', bgColor) ?? ''
    showScreenShotModal = true
  }
  
  function enterFullscreen() {
    if(!browser)return;
    let elem = (periodBarRef.parentElement?.parentElement as any);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if(!browser)return;
    let elem = (document as any);
    const doExit = elem.exitFullscreen ?? elem.mozCancelFullScreen ??
        elem.webkitExitFullscreen ?? elem.msExitFullscreen;
    doExit.call(elem);
  }

  function toggleFullscreen() {
    if (fullScreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
    fullScreen = !fullScreen
    setTimeout(() => {
      $chart?.resize()
    }, 100)
  }

  function toggleLeftBar(){
    $save.showDrawBar = !$save.showDrawBar
    setTimeout(() => {
      $chart?.resize()
    }, 0)
  }

</script>

{#snippet MenuButton(onClick: () => void, icon: string = "", text: string = "", size: number = 16)}
  <div class="flex items-center justify-center h-full px-3 border-r border-base-300 cursor-pointer hover:text-primary hover:fill-primary" 
    onclick={onClick}>
    {#if icon}
      <KlineIcon name={icon} size={size}/>
    {/if}
    {#if text}
      <span class="ml-1">{text}</span>
    {/if}
  </div>
{/snippet}

<ModalSymbol bind:show={showSymbolModal} />
<ModalPeriod bind:show={showPeriodModal} />
<ModalIndSearch bind:show={showIndSearchModal} />
<ModalIndCfg bind:show={$ctx.modalIndCfg} />
<ModalSetting bind:show={showSettingModal} />
<ModalScreenShot bind:show={showScreenShotModal} bind:url={screenShotUrl} />
<ModalTimezone bind:show={showTimezoneModal} />

<div bind:this={periodBarRef} class="flex flex-row items-center w-full h-12 border-b border-base-300">
  <div class="flex items-center justify-center w-12 border-r border-base-300">
    <svg class:rotate={!$save.showDrawBar} class="w-7 h-7 cursor-pointer fill-current transition-all duration-200" 
      onclick={toggleLeftBar} viewBox="0 0 1024 1024">
      <path d="M192.037 287.953h640.124c17.673 0 32-14.327 32-32s-14.327-32-32-32H192.037c-17.673 0-32 14.327-32 32s14.327 32 32 32zM832.161 479.169H438.553c-17.673 0-32 14.327-32 32s14.327 32 32 32h393.608c17.673 0 32-14.327 32-32s-14.327-32-32-32zM832.161 735.802H192.037c-17.673 0-32 14.327-32 32s14.327 32 32 32h640.124c17.673 0 32-14.327 32-32s-14.327-32-32-32zM319.028 351.594l-160 160 160 160z"/>
    </svg>
  </div>

  {#if customLoad}
  <span class="p-0 m-0">
    <input type="file" bind:this={fileRef} class="hidden" accept="text/csv" onchange={loadDataFile}/>
    <button class="btn btn-primary w-[60px]" onclick={() => fileRef?.click()}>打开</button>
  </span>
  {/if}

  <div class="flex items-center h-full px-3 text-lg font-bold border-r border-base-300 cursor-pointer" 
    onclick={() => showSymbolModal = true}>
    <span>{showName}</span>
  </div>

  <span class="flex items-center h-full px-3 hover:bg-base-200 border-r border-base-300 cursor-pointer" 
    onclick={() => showPeriodModal = true}>
    {$save.period.timeframe}
  </span>

  {#if customLoad}
    <div class="w-[150px] p-0">
      <input bind:value={$save.dateStart} placeholder="%Y%m%d" class="input input-bordered w-full"/>
    </div>
    <span class="w-[150px] ml-0 p-0">
      <input bind:value={$save.dateEnd} placeholder="%Y%m%d" class="input input-bordered w-full"/>
    </span>
    <span class="p-0 m-0">
      <button class="btn btn-primary w-[60px]" onclick={clickLoadData}>加载</button>
    </span>
  {/if}
  {@render MenuButton(() => showIndSearchModal = true, "indicator", m.indicator())}
  {@render MenuButton(() => showTimezoneModal = true, "timezone", m.timezone())}
  {@render MenuButton(() => showSettingModal = true, "setting", m.setting())}
  {@render MenuButton(clickScreenShot, "screenShot", "", 20)}
  {@render MenuButton(toggleFullscreen, fullScreen ? "exitFullScreen" : "fullScreen", "", 18)}
  {@render MenuButton(toggleTheme, "theme", "", 22)}
</div>

<style>
.rotate {
  @apply rotate-180 transform-gpu;
}
</style> 