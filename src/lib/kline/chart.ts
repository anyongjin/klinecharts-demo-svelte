import { getUTCStamp, getDateStr } from "../dateutil";
import type { Period, SymbolInfo, BanInd } from "./types";
import * as m from '$lib/paraglide/messages.js'


export type SaveInd = {
  name: string,
  pane_id: string
  params?: any[]
}


const local_mains = ['MA', 'EMA', 'SMA', 'BOLL', 'SAR', 'BBI']
const local_subs = ['VOL', 'MACD', 'KDJ', 'RSI', 'BIAS', 'BRAR',
  'CCI', 'DMI', 'CR', 'PSY', 'DMA', 'TRIX', 'OBV', 'VR', 'WR', 'MTM', 'EMV',
  'SAR', 'ROC', 'PVT', 'AO']

export class ChartCtx {
  editPaneId: string
  editIndName: string
  modalIndCfg: boolean

  fireOhlcv: number // 触发ohlcv加载
  klineLoaded: number // 新的k线加载完成时+1
  cloudIndLoaded: number // 云指标加载完成时+1
  initDone: number // 初始化完成时+1
  clickChart: number // 点击图表时+1

  loadingKLine: boolean // K线加载中
  loadingPairs: boolean // 品种加载中

  timeStart: number
  timeEnd: number

  allInds: BanInd[]

  constructor() {
    this.editPaneId = ''
    this.editIndName = ''
    this.modalIndCfg = false

    this.fireOhlcv = 0
    this.klineLoaded = 0
    this.cloudIndLoaded = 0
    this.initDone = 0
    this.clickChart = 0

    this.loadingKLine = false
    this.loadingPairs = false
    
    this.timeEnd = 0
    this.timeStart = 0

    this.allInds = []

    for(let name of local_mains){
      const title = `${name} (${m[name]()})`
      this.allInds.push({name, title, cloud: false, is_main: true})
    }
    for(let name of local_subs){
      const title = `${name} (${m[name]()})`
      this.allInds.push({name, title, cloud: false, is_main: false})
    }
  }
}

export class ChartSave {
  showDrawBar: boolean
  
  period: Period 
  symbol: SymbolInfo 

  dateStart: string
  dateEnd: string
  timezone: string

  curSymbols: SymbolInfo[]
  allSymbols: SymbolInfo[]
  allExgs: Set<string>

  colorLong: string
  colorShort: string

  saveInds: Record<string, SaveInd>
  
  key: string
  theme: string

  styles: Record<string, any>
  options: Record<string, any>

  constructor() {
    this.showDrawBar =  true

    this.symbol = {name: 'BTC/USDT.P', ticker: 'BTC/USDT:USDT', market: 'linear', exchange: 'binance'}
    this.period = {multiplier: 1, timespan: 'day', timeframe: '1d', secs: 86400}
    
    const timeEnd = getUTCStamp()
    this.dateEnd = getDateStr(timeEnd, 'YYYYMMDD')
    const timeStart = timeEnd - this.period.secs * 1000 * 500
    this.dateStart = getDateStr(timeStart, 'YYYYMMDD')
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    this.curSymbols = []
    this.allSymbols = []
    this.allExgs = new Set()

    this.colorLong = '#0000FF'
    this.colorShort = '#FF0000'

    this.saveInds = {}
    
    this.key = ''
    this.theme = 'default'

    this.styles = {}
    this.options = {}
  }
}