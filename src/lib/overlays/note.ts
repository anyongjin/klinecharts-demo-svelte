import type {OverlayTemplate} from 'klinecharts';
import type {TradeInfo} from "../types";

/**
 * 在某个点显示一个标签。
 * 标签中可以是多行文本。
 * 此overlay从trade缩减一半得到。
 * 如需修改代码，请一并修改trade
 */

const textStyles = {
  color: '#ffffff',
  paddingLeft: 6,
  paddingTop: 6,
  paddingRight: 6,
  paddingBottom: 6,
}


const note: OverlayTemplate = {
  name: 'note',
  lock: true,
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({coordinates, overlay}) => {
    if (coordinates.length == 0) return []
    const data = overlay.extendData as TradeInfo;
    const pt1 = coordinates[0]
    const line_styles: Record<string, any> = {size: 2}
    if(data && data.line_color){
      line_styles['color'] = data.line_color
    }
    const distance = data.distance ?? 15
    let startBase = 'bottom'
    let startY = pt1.y - distance
    // 被选中，显示提示框
    const in_fig = {
      type: 'textBox',
      attrs: { x: pt1.x, y: startY, text: data.in_text, align: 'center', baseline: startBase},
      ignoreEvent: true,
      styles: {...textStyles, backgroundColor: data.in_color, borderColor: data.in_color,}
    }
    // 入场点出场点到文本框的线
    const vert_start = {
      type: 'line',
      attrs: {coordinates: [pt1, {x: pt1.x, y: startY}]},
      ignoreEvent: true,
      styles: line_styles
    }
    return [in_fig, vert_start]
  },
}

export default note;
