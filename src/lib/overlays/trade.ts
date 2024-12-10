import type {OverlayEvent, OverlayTemplate} from 'klinecharts';
import type {TradeInfo} from "../types";

const textStyles = {
  color: '#ffffff',
  paddingLeft: 6,
  paddingTop: 6,
  paddingRight: 6,
  paddingBottom: 6,
}

const trade: OverlayTemplate = {
  name: 'trade',
  lock: true,
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({coordinates, overlay}) => {
    if (coordinates.length <= 1) return []
    const data = overlay.extendData as TradeInfo;
    const pt1 = coordinates[0]
    const pt2 = coordinates[1]
    const line_styles: Record<string, any> = {size: 2}
    if(data && data.line_color){
      line_styles['color'] = data.line_color
    }
    const line_fig = {
      type: 'line',
      attrs: {coordinates: [pt1, pt2]},
      styles: line_styles
    }
    if(!data.active && !data.selected)return [line_fig]
    const distance = data.distance ?? 15
    let startBase = 'bottom'
    let startY = pt1.y - distance
    let stopBase = 'top'
    let stopY = pt2.y + distance
    if(pt1.y > pt2.y){
      startBase = 'top'
      startY = pt1.y + distance
      stopBase = 'bottom'
      stopY = pt2.y - distance
    }
    // 被选中，显示提示框
    const in_fig = {
      type: 'textBox',
      attrs: { x: pt1.x, y: startY, text: data.in_text, align: 'center', baseline: startBase},
      ignoreEvent: true,
      styles: {...textStyles, backgroundColor: data.in_color, borderColor: data.in_color,}
    }
    const out_fig = {
      type: 'textBox',
      attrs: { x: pt2.x, y: stopY, text: data.out_text, align: 'center', baseline: stopBase},
      ignoreEvent: true,
      styles: {...textStyles, backgroundColor: data.out_color, borderColor: data.out_color,}
    }
    // 入场点出场点到文本框的线
    const vert_start = {
      type: 'line',
      attrs: {coordinates: [pt1, {x: pt1.x, y: startY}]},
      ignoreEvent: true,
      styles: line_styles
    }
    const vert_stop = {
      type: 'line',
      attrs: {coordinates: [pt2, {x: pt2.x, y: stopY}]},
      ignoreEvent: true,
      styles: line_styles
    }
    return [line_fig, in_fig, out_fig, vert_start, vert_stop]
  },
  onSelected: (e: OverlayEvent) => {
    const data = e.overlay.extendData as TradeInfo;
    data.selected = true
    return false
  },
  onDeselected: (e: OverlayEvent) => {
    const data = e.overlay.extendData as TradeInfo;
    data.selected = false
    return false
  },
  onMouseEnter: (e: OverlayEvent) => {
    const data = e.overlay.extendData as TradeInfo;
    data.active = true
    return false
  },
  onMouseLeave: (e: OverlayEvent) => {
    const data = e.overlay.extendData as TradeInfo;
    data.active = false
    return false
  }
}

export default trade;