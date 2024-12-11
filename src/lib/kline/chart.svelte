<script lang="ts">
  import {page} from '$app/stores';
  import { setContext } from 'svelte';
  import * as kc from 'klinecharts';
  import type {Chart, Nullable} from 'klinecharts'
  import {persisted} from 'svelte-persisted-store';
  import { ChartCtx, ChartSave } from './chart';
  import overlays from './overlays';
  import figures from './figures';
  import indicators from './indicators';
  import MyDatafeed from './mydatafeed';
  import {onMount} from 'svelte';
  import {adjustFromTo, makeFormatDate, setTimezone, getUTCStamp} from '../dateutil';
  import type {SymbolInfo, Period, BarArr} from './types';
  import DrawBar from './drawBar.svelte';
  import {getApi} from '../netio';
  import {makeCloudInds} from './indicators/cloudInds';
  import {browser} from '$app/environment';
  import {getThemeStyles,GetNumberDotOffset, build_ohlcvs} from './coms';
  import {tf_to_secs, toUTCStamp, getDateStr} from '../dateutil';
  import { createAlertStore } from '$lib/stores/alerts';
	import Alert from '../alert.svelte';
  import { derived, writable } from 'svelte/store';
  import MenuBar from './menuBar.svelte';
  import type {Writable} from 'svelte/store';
	import _ from 'lodash';
  setTimezone('UTC')

  const datafeed = new MyDatafeed()
  overlays.forEach(o => kc.registerOverlay(o))
  figures.forEach(f => kc.registerFigure(f))
  indicators.forEach(o => {
    if(o.extendData == 'datafeed'){
      o.extendData = datafeed
    }
    kc.registerIndicator(o)
  })

  let {key='chart',customLoad=false} = $props()

  const maxBarNum = 5000;
  const ctx = writable<ChartCtx>(new ChartCtx())
  let saveRaw = new ChartSave();
  saveRaw.key = key;
  const save = persisted(key, saveRaw)

  let chartRef: HTMLElement
  let drawBarRef = $state<DrawBar>()
  let chart: Writable<Nullable<kc.Chart>> = writable(null)
  const batchNum = 500;
  const alerts = createAlertStore();
  
  setContext('ctx', ctx)
  setContext('save', save)
  setContext('chart', chart)
  setContext('alerts', alerts)
  setContext('datafeed', datafeed)
  
  async function loadCloudInds() {
    const rsp = await getApi('/kline/all_inds')
    if (rsp.code != 200) {
      console.error('load cloud inds net error', rsp)
    } else {
      const oldIndMap = $ctx.allInds.reduce((data, v) => {
        data[v.name] = true;
        return data;
      }, {} as Record<string, boolean>);
      const ind_arr = rsp.data as any[]
      ind_arr.map((v: any) => {
        return {cloud: true, ...v}
      }).forEach((v: any) => {
        if (!oldIndMap[v.name]) {
          $ctx.allInds.push(v)
        }
      })
      makeCloudInds(ind_arr).forEach((o: any) => {
        kc.registerIndicator(o)
      })
      $ctx.cloudIndLoaded += 1
    }
  }
  if (browser) {
    //loadCloudInds()
  }

  onMount(async () => {
    chart.set(kc.init(chartRef, {
      customApi: {
        formatDate: makeFormatDate($save.period.timespan)
      }
    }))
    // 因暂时禁用云指标，所以直接触发完成
    $ctx.cloudIndLoaded += 1
    window.addEventListener('resize', () => {
      $chart?.resize()
    })
    let chartObj = $chart!;
    chartObj.setLoadMoreDataCallback(({type, data, callback}) => {
      if($ctx.loadingKLine)return
      $ctx.loadingKLine = true
      let from = 0, to = 0;
      if (!!data){
        if (type === 'forward'){
          to = data.timestamp
          from = adjustFromTo($save.period, to, batchNum)[0]
        }
        else{
          from = data.timestamp + $save.period.secs * 1000
          to = getUTCStamp()
        }
      }
      const strategy = $page.url.searchParams.get('strategy');
      datafeed.getHistoryKLineData({
        symbol: $save.symbol, 
        period: $save.period, 
        from, 
        to, 
        strategy
      }).then((res) => {
        callback(res.data, res.data.length >= batchNum)
        $ctx.klineLoaded += 1;
        if (res.lays && res.lays.length > 0){
          res.lays.forEach(o => {
            drawBarRef?.addOverlay(o);
          });
        }
      }).finally(() => {
        $ctx.loadingKLine = false;
      });
    })
    const styles = getThemeStyles($save.theme)
    _.merge(styles, $state.snapshot($save.styles))
    chartObj.setStyles(styles)
    $ctx.initDone += 1
    if (!customLoad){
      loadSymbolPeriod()
    }
    loadSymbols();
  })

  async function loadSymbols(){
    if($ctx.loadingPairs || $save.allSymbols.length > 0)return;
    $ctx.loadingPairs = true;
    const symbols = await datafeed.getSymbols();
    $save.allSymbols = symbols;
    console.log('allExgs', $save.allExgs)
    symbols.forEach(s => {
      if (s.exchange){
        $save.allExgs.add(s.exchange)
      }
    })
    $ctx.loadingPairs = false;
  }
  
  async function loadKlineRange(symbol: SymbolInfo, period: Period, start_ms: number, stop_ms: number,
                              loadMore: boolean = true) {
    const chartObj = $chart;
    if (!chartObj) return
    $ctx.loadingKLine = true
    const strategy = $page.url.searchParams.get('strategy');
    console.log('loadKlineRange', {symbol, period, start_ms, stop_ms, strategy})
    const kdata = await datafeed.getHistoryKLineData({
      symbol, period, from: start_ms, to: stop_ms, strategy
    })
    const klines = kdata.data
    if (klines.length > 0) {
      const pricePrec = GetNumberDotOffset(Math.min(klines[0].low, klines[klines.length - 1].low)) + 3
      chartObj.setPrecision({price: pricePrec, volume: 0})
    }
    const hasMore = loadMore && klines.length > 0;
    chartObj.applyNewData(klines, hasMore)
    if(kdata.lays && kdata.lays.length > 0 && !!drawBarRef){
      kdata.lays.forEach(o => {
        drawBarRef!.addOverlay(o)
      })
    }
    $ctx.loadingKLine = false
    // 触发K线加载完毕事件
    $ctx.klineLoaded += 1
    if (klines.length) {
      const tf_msecs = tf_to_secs(period.timeframe) * 1000
      const curTime = new Date().getTime()
      const stop_ms = klines[klines.length - 1].timestamp + tf_msecs
      if (stop_ms + tf_msecs > curTime) {
        // 加载的是最新的bar，则自动开启websocket监听
        datafeed.subscribe(symbol, result => {
          const kline = chartObj.getDataList()
          const last = kline[kline.length - 1]
          const lastBar: BarArr | null = last && last.timestamp ? [
            last.timestamp, last.open, last.high, last.low, last.close, last.volume ?? 0
          ] : null
          const ohlcvArr = build_ohlcvs(result.bars, result.secs * 1000, tf_msecs, lastBar)
          const store = (chartObj as any).getChartStore()
          store.addData(ohlcvArr, 'backward', {forward: true, backward:false})
        })
      }
    }
  }

  async function customLoadKline(){
    const start_ms = toUTCStamp($save.dateStart)
    let stop_ms = toUTCStamp($save.dateEnd)
    if(!start_ms || !stop_ms){
      alerts.addAlert('error', 'invalid time, please use: 202301011200')
      return;
    }
    const tf_msecs = tf_to_secs($save.period.timeframe) * 1000
    const totalNum = (stop_ms - start_ms) / tf_msecs;
    if(totalNum > maxBarNum){
      stop_ms = start_ms + tf_msecs * maxBarNum;
      const stop_str = getDateStr(stop_ms)
      alerts.addAlert('warning', `too long:${totalNum}, cut ${maxBarNum} to ${stop_str}`)
    }
    await loadKlineRange($save.symbol, $save.period, start_ms, stop_ms, false)
  }

  function loadSymbolPeriod(){
    const s = $save.symbol
    const p = $save.period
    const curTime = new Date().getTime()
    const [from, to] = adjustFromTo(p, curTime, batchNum)
    loadKlineRange(s, p, from, curTime, !customLoad)
  }

  // 监听周期变化
  const period = derived(save, ($save) => $save.period.timeframe);
  period.subscribe((new_tf) => {
    $chart?.setCustomApi({
      formatDate: makeFormatDate($save.period.timespan)
    })
    if ($ctx.loadingKLine || customLoad) return
    // 手动加载模式下，不监听币种和周期变化自动加载。
    loadSymbolPeriod()
  })
  
  // 监听币种变化
  const symbol = derived(save, ($save) => $save.symbol.ticker);
  symbol.subscribe((val) => {
    if ($ctx.loadingKLine || customLoad) return
    datafeed.unsubscribe()
    loadSymbolPeriod()
  })

  // 监听主题变化
  const theme = derived(save, ($save) => $save.theme);
  theme.subscribe((new_val) => {
    console.log('theme change', new_val)
    // 加载新指标时，修改默认颜色
    if(new_val == 'light'){
      $save.colorLong = 'green'
      $save.colorShort = 'red'
    }
    else{
      $save.colorLong = 'green'
      $save.colorShort = 'rgb(255,135,8)'
    }
    const styles = getThemeStyles($save.theme)
    _.merge(styles, $state.snapshot($save.styles))
    $chart?.setStyles(styles)
  })
  
  // 监听时区变化
  const timezone = derived(save, ($save) => $save.timezone);
  timezone.subscribe((new_val) => {
    $chart?.setTimezone(new_val)
    setTimezone(new_val)
  })

  // 监听数据加载动作
  const fireOhlcv = derived(ctx, ($ctx) => $ctx.fireOhlcv);
  fireOhlcv.subscribe(async (val) => {
    if($ctx.timeStart && $ctx.timeEnd){
      await loadKlineRange($save.symbol, $save.period, $ctx.timeStart, $ctx.timeEnd)
      $ctx.timeStart = 0
      $ctx.timeEnd = 0
    }
    else{
      await customLoadKline()
    }
  })

</script>

<div class="kline-main" data-theme="{$save.theme}" onclick={() => $ctx.clickChart += 1}>
  <div class="alerts-container">
    {#each $alerts as alert (alert.id)}
      <Alert type={alert.type} text={alert.text} id={alert.id} />
    {/each}
  </div>
  <MenuBar customLoad={customLoad}/>
  <div class="kline-content">
    {#if $save.showDrawBar}
      <DrawBar bind:this={drawBarRef}/>
    {/if}
    <div bind:this={chartRef} class="kline-widget" role="application"
         onkeydown={(e) => e.key === 'Delete' && drawBarRef?.clickRemove()}></div>
  </div>
</div>

<style>
  .kline-main{
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    color: var(--text-color);
    background-color: var(--background-color);
  }

  .kline-content{
    flex: 1;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: var(--widget-height);
  }

  .kline-widget{
    flex: 1;
    width: var(--widget-width);
    height: 100%;
    margin-left: 0;
    overflow: hidden;
  }

  :host {
    --period-bar-height: 38px;
    --drawing-bar-width: 52px;
    --widget-width: calc(100% - var(--drawing-bar-width));
    --widget-height: calc(100% - var(--period-bar-height));
  }

  [data-theme="light"] {
    --primary-color: #1677ff;
    --selected-color: fade(#1677ff, 15%);
    --hover-background-color: rgba(22, 119, 255, 0.15);
    --background-color: #ffffff;
    --popover-background-color: #ffffff;
    --text-color: #051441;
    --text-second-color: #76808F;
    --border-color: #ebedf1;
  }
  [data-theme="dark"] {
    --primary-color: #1677ff;
    --selected-color: fade(#1677ff, 15%);
    --hover-background-color: rgba(22, 119, 255, 0.15);
    --background-color: #151517;
    --popover-background-color: #1c1c1f;
    --text-color: #cccccc;
    --text-second-color: #929AA5;
    --border-color: #292929;
  }


  @font-face {
    font-family: 'icomoon';
    src:  url('/fonts/icomoon.eot?f4efml');
    src:  url('/fonts/icomoon.eot?f4efml#iefix') format('embedded-opentype'),
      url('/fonts/icomoon.ttf?f4efml') format('truetype'),
      url('/fonts/icomoon.woff?f4efml') format('woff'),
      url('/fonts/icomoon.svg?f4efml#icomoon') format('svg');
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }

  [class^="icon-"], [class*=" icon-"] {
    /* use !important to prevent issues with browser extensions that change fonts */
    font-family: 'icomoon' !important;
    speak: never;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .icon-icon-close:before {
    content: "\e900";
    color: #fff;
  }
  .icon-icon-invisible:before {
    content: "\e901";
    color: #fff;
  }
  .icon-icon-setting:before {
    content: "\e902";
    color: #fff;
  }
  .icon-icon-visible:before {
    content: "\e903";
    color: #fff;
  }

</style>