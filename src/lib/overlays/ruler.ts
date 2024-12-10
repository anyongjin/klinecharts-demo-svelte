/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { OverlayTemplate } from 'klinecharts'
import {getArrowLine, getPrecision} from './utils'
import * as m from '$lib/paraglide/messages.js';


function getIntervalText(interval: number){
  const minSecs = 60
  const hourSecs = 3600
  const daySecs = 24 * 3600
  let result: string[] = []
  if(interval > daySecs){
    const days = Math.floor(interval / daySecs)
    result.push(days.toString(), m.days())
    interval = interval % daySecs
  }
  if(interval > hourSecs){
    const hours = Math.floor(interval / hourSecs)
    result.push(hours.toString(), m.hours())
    interval = interval % hourSecs
  }
  if(interval > minSecs){
    const mins = Math.floor(interval / minSecs)
    result.push(mins.toString(), m.mins())
    interval = interval % minSecs
  }
  if(interval > 0){
    result.push('1', m.mins())
  }
  return result.join('')
}

// @ts-ignore
const ruler: OverlayTemplate = {
  name: 'ruler',
  totalStep: 3,
  lock: true,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    polygon: {
      color: 'rgba(22, 119, 255, 0.15)'
    }
  },
  createPointFigures: ({ chart, coordinates, overlay, yAxis }) => {
    const precision = getPrecision(chart, overlay, yAxis)
    if (coordinates.length > 1) {
      const pt1 = coordinates[0]
      const pt2 = coordinates[1]
      const midX = (pt1.x + pt2.x) / 2
      const midY = (pt1.y + pt2.y) / 2
      const vertArrow = getArrowLine({x: midX, y: pt1.y}, {x: midX, y: pt2.y})
      const horzArrow = getArrowLine({x: pt1.x, y: midY}, {x: pt2.x, y: midY})

      const bgColor = pt1.y > pt2.y ? '#F7525F' : '#2962FF'
      const textStyles = {
        color: '#ffffff',
        backgroundColor: bgColor,
        borderColor: bgColor,
        paddingLeft: 6,
        paddingTop: 6,
        paddingRight: 6,
        paddingBottom: 6,
      }

      const points = overlay.points
      // @ts-ignore
      const valueDif = points[0].value - points[1].value
      const priceChg = valueDif.toFixed(precision)
      // @ts-ignore
      const pctChg = ((valueDif / points[0].value) * 100).toFixed(2)
      // @ts-ignore
      const barNum = points[1].dataIndex - points[0].dataIndex
      // @ts-ignore
      const dist_sec = (points[1].timestamp - points[0].timestamp) / 1000
      const text = `${priceChg} (${pctChg}%)\n${barNum}${m.num_bar()}, ${getIntervalText(dist_sec)}`
      let textY = pt2.y + 10
      let boxBaseLine = 'top'
      if(pt1.y > pt2.y){
        textY = pt2.y - 10
        boxBaseLine = 'bottom'
      }
      return [
        {
          type: 'polygon',
          attrs: {
            coordinates: [
              pt1, { x: pt2.x, y: pt1.y },
              pt2, { x: pt1.x, y: pt2.y }
            ]
          },
          styles: { style: 'stroke_fill' }
        },
        {
          type: 'textBox',
          attrs: { x: midX, y: textY, text, align: 'center', baseline: boxBaseLine },
          ignoreEvent: true,
          styles: textStyles
        },
        ...vertArrow,
        ...horzArrow
      ]
    }
    return []
  }
}

export default ruler
