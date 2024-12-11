import type {KLineData, Styles, DeepPartial} from 'klinecharts'

export interface SymbolInfo {
  ticker: string
  name?: string
  shortName?: string
  exchange?: string
  market?: string
  pricePrecision?: number
  volumePrecision?: number
  priceCurrency?: string
  type?: string
  logo?: string
}

export type Timespan = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month'

export interface Period {
  timeframe: string;
  multiplier: number;
  timespan: Timespan;
  secs: number;
}

export type PaneInds = {
  name: string,
  inds: string[]
}

export type KData = {
  data: KLineData[],
  lays?: any[]
}

export type DatafeedWatchCallback = (data: any) => void

export type GetKlineArgs = {
  symbol: SymbolInfo,
  period: Period,
  from: number,
  to: number,
  strategy?: string | null
}

export interface Datafeed {
  getSymbols (): Promise<SymbolInfo[]>
  getHistoryKLineData (args: GetKlineArgs): Promise<KData>
  subscribe (symbol: SymbolInfo, callback: DatafeedWatchCallback): void
  unsubscribe (symbol: SymbolInfo): void
}

export interface ChartProOptions {
  container: string | HTMLElement
  styles?: DeepPartial<Styles>
  watermark?: string | Node
  theme?: string
  locale?: string
  drawingBarVisible?: boolean
  symbol: SymbolInfo
  period: Period
  periods?: Period[]
  timezone?: string
  mainIndicators?: string[]
  subIndicators?: string[]
  datafeed: Datafeed
  persistKey?: string
}

export type PairItem = {
  label: string,
  value: string
}

export interface BotTask{
  task_id: number,
  live: boolean,
  start_ms: number,
  stop_ms: number,
  pairs: string[],
  strategy: string[],
  tfs: string[],
  order_num: number,
  profit_rate: number
}

export interface TaskSymbol{
  symbol: string,
  timeframe: string,
  start_ms: number,
  stop_ms: number,
  order_num: number,
  tot_profit: number,
}

export const OrderStatus = [
  '等待执行',
  '部分完成',
  '已完成'
]

export const InoutStatus = [
  '待执行',
  '部分入场',
  '已入场',
  '部分出场',
  '已平仓'
]

export interface BanOrder extends Record<string, any>{
  id: number
  task_id: number
  symbol: string
  sid: number
  timeframe: string
  short: boolean
  status: number
  enter_tag: string
  init_price: number
  quote_cost: number
  exit_tag: string
  leverage: number
  enter_at: number
  exit_at: number
  strategy: string
  stg_ver: number
  profit_rate: number
  profit: number
  info: string
  enter_cost: number
  duration: number

  enter_id: number
  enter_task_id: number
  enter_inout_id: number
  enter_order_type: string
  enter_order_id: string
  enter_side: string
  enter_create_at: number
  enter_price: number
  enter_average: number
  enter_amount: number
  enter_filled: number
  enter_status: number
  enter_fee: number
  enter_fee_type: string
  enter_update_at: number

  exit_id?: number
  exit_task_id?: number
  exit_inout_id?: number
  exit_order_type?: string
  exit_order_id?: string
  exit_side?: string
  exit_create_at?: number
  exit_price?: number
  exit_average?: number
  exit_amount?: number
  exit_filled?: number
  exit_status?: number
  exit_fee?: number
  exit_fee_type?: string
  exit_update_at?: number
}

export interface OpenOrder{
  pair: string
  side?: string
  order_type?: string
  price?: number
  stoploss_price?: number
  enter_cost?: number
  enter_tag?: string
  leverage?: number
  strategy?: string
}


export type AddDelInd = {
  is_main: boolean,
  ind_name: string,
  is_add: boolean
}

export type TrendItemType = {
  time: number,
  start_dt: string,
  symbol: string,
  base_s: string,
  quote_s: string,
  rate: number,
  quote_vol: number,
  vol_text: string
}

export type BanInd = {
  name: string,
  title: string,
  cloud: boolean,
  is_main: boolean
}

/**
 * 用于K线图表上显示的交易信息
 * time/price通过Point传入
 */
export interface TradeInfo {
  line_color: string,
  in_color: string,
  in_text: string,
  out_color: string,
  out_text: string,
  active?: boolean,
  selected?: boolean,
  distance?: number
}

export type BarArr = [number, number, number, number, number, number]
