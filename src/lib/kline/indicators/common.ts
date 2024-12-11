import * as kc from 'klinecharts';
import type {IndicatorDrawParams, KLineData, OverlayStyle} from 'klinecharts';
import {getTagFigures} from "./ktools";
const LineType = kc.LineType;
const PolygonType = kc.PolygonType;

const my_figure_types = ['tag']  // 支持的figure类型

export interface MainTag {
  price: number,
  /**
   * 1表示上面绘制  -1表示下面绘制
   */
  direction: number,
  /**
   * 绘制的颜色
   */
  color: string,
  /**
   * 显示的文本
   */
  text: string,
}


export interface TagData {
  dataIndex: number
  x: number
  data: KLineData,
  tags: MainTag[]
}


export function drawTagFigure(viewKlines: TagData[], ctx: CanvasRenderingContext2D, yAxis: kc.YAxis) {
  const layStyles = getDefaultOverlayStyle()
  viewKlines.forEach(it => {
    it.tags.forEach(tag => {
      const valueY = yAxis.convertToPixel(tag.price)
      const position = tag.direction <= 0 ? 'bottom' : 'top';
      const color = tag.color;
      const text = tag.text;
      getTagFigures({x: it.x, y: valueY}, position, text, color).forEach(fg => {
        const {type, styles, attrs} = fg
        const Figure = kc.getFigureClass(type)
        if (Figure == null) return
        const ss = {...(layStyles[type] as any), ...(styles as any)}
        new Figure({name: type, attrs, styles: ss}).draw(ctx)
      })
    })
  })
}

/**
 * 绘制云端指标
 * @param drawArgs
 */
export function drawCloudInd (drawArgs: IndicatorDrawParams<unknown>) {
  const ind_name = drawArgs.indicator.name
  if (ind_name == 'ChanLun') {
    return drawChanlun(drawArgs)
  } else {
    return drawFigures(drawArgs)
  }
}

/**
 * 绘制缠论的线条
 */
export function drawChanlun({ctx, indicator, chart, xAxis, yAxis}: IndicatorDrawParams<unknown>): boolean {
  // 指标计算结果
  const result = indicator.result;
  if (!result || !result.length) return true
  // 获取默认样式
  const layStyles = getDefaultOverlayStyle()
  const visibleRange = chart.getVisibleRange();
  // 循环遍历每个线段
  result.forEach((val) => {
    const [start_id, start_price, stop_id, stop_price] = val as any
    if (start_id > visibleRange.to || stop_id < visibleRange.from) return
    const startX = xAxis.convertToPixel(start_id)
    const stopX = xAxis.convertToPixel(stop_id)
    const startY = yAxis.convertToPixel(start_price)
    const stopY = yAxis.convertToPixel(stop_price)
    const Figure = kc.getFigureClass('line')
    if (Figure == null) return
    new Figure({
      name: 'line',
      attrs: {coordinates: [{x: startX, y: startY}, {x: stopX, y: stopY}]},
      styles: {...layStyles.line}
    }).draw(ctx)
  })
  return true
}

/**
 * 云端指标的自定义绘制。对复杂的figure则进行绘制，如果有简单的figure则返回false继续执行默认绘制逻辑，否则返回true中断后续默认绘制
 * @param ctx
 * @param kLineDataList
 * @param indicator
 * @param visibleRange
 * @param defaultStyles
 * @param xAxis
 * @param yAxis
 */
export function drawFigures({ctx, chart, indicator, xAxis, yAxis}: IndicatorDrawParams<unknown>){
  const defaultStyles = (chart as any).getChartStore().getStyles().indicator
  const upColor = kc.utils.formatValue(indicator.styles, 'bars[0].upColor', (defaultStyles.bars)[0].upColor) as string
  const downColor = kc.utils.formatValue(indicator.styles, 'bars[0].downColor', (defaultStyles.bars)[0].downColor) as string
  const figures = indicator.figures
  const my_figures = figures.filter(fg => fg.type && my_figure_types.includes(fg.type))
  // 不包含自定义figure，退出执行默认绘制
  if (!my_figures.length) return false
  // 指标计算结果
  const result = indicator.result;
  // 显示范围内的K线
  const tags: TagData[] = []
  const kLineDataList = chart.getDataList();
  const visibleRange = chart.getVisibleRange();
  for (let i = visibleRange.from; i < visibleRange.to; i++) {
    const ind = result[i];
    if (!ind || !Object.keys(ind).length) continue
    const kLineData = kLineDataList[i]
    const x = xAxis.convertToPixel(i)
    const item: TagData = {dataIndex: i, x, data: kLineData, tags: []}
    const key_map: Record<string, string> = {}
    Object.keys(ind).forEach(k => {
      const arr = k.split(':')
      key_map[arr[0]] = k
    })
    my_figures.forEach(fig => {
      if (fig.type == 'tag') {
        const baseVal = fig.baseValue ?? 0
        const color = baseVal >= 0 ? upColor : downColor
        const ind_key = key_map[fig.key]
        const price = (ind as any)[ind_key]
        const text = ind_key;
        item.tags.push({price, direction: -baseVal, color, text})
      }
    })
    if (!item.tags.length) continue
    tags.push(item)
  }
  drawTagFigure(tags, ctx, yAxis)
  return my_figures.length === figures.length
}

/**
 * 复制自KlineCharts的同名函数
 */
function getDefaultOverlayStyle (): OverlayStyle {
  return {
    point: {
      color: '#1677FF',
      borderColor: 'rgba(22, 119, 255, 0.35)',
      borderSize: 1,
      radius: 5,
      activeColor: '#1677FF',
      activeBorderColor: 'rgba(22, 119, 255, 0.35)',
      activeBorderSize: 3,
      activeRadius: 5
    },
    line: {
      style: LineType.Solid,
      smooth: false,
      color: '#1677FF',
      size: 1,
      dashedValue: [2, 2]
    },
    rect: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderRadius: 0,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    polygon: {
      style: PolygonType.Fill,
      color: '#1677FF',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    circle: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    arc: {
      style: LineType.Solid,
      color: '#1677FF',
      size: 1,
      dashedValue: [2, 2]
    },
    text: {
      style: PolygonType.Fill,
      color: '#FFFFFF',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2],
      borderSize: 0,
      borderRadius: 2,
      borderColor: '#1677FF',
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: 'transparent'
    },
    rectText: {
      style: PolygonType.Fill,
      color: '#FFFFFF',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2],
      borderSize: 1,
      borderRadius: 2,
      borderColor: '#1677FF',
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      backgroundColor: '#1677FF'
    }
  }
}
