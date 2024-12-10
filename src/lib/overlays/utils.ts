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

import type { Coordinate, Bounding, LineAttrs, Chart, YAxis, Overlay } from 'klinecharts'
import * as kc from 'klinecharts'

export function getArrowLine(point1: Coordinate, point2: Coordinate){
  const flag = point2.x > point1.x ? 0 : 1
  const kb = kc.utils.getLinearSlopeIntercept(point1, point2)
  let offsetAngle
  if (kb) {
    offsetAngle = Math.atan(kb[0]) + Math.PI * flag
  } else {
    if (point2.y > point1.y) {
      offsetAngle = Math.PI / 2
    } else {
      offsetAngle = Math.PI / 2 * 3
    }
  }
  const rotateCoordinate1 = getRotateCoordinate({ x: point2.x - 8, y: point2.y + 4 }, point2, offsetAngle)
  const rotateCoordinate2 = getRotateCoordinate({ x: point2.x - 8, y: point2.y - 4 }, point2, offsetAngle)
  return [
    {
      type: 'line',
      attrs: { coordinates: [point1, point2] }
    },
    {
      type: 'line',
      ignoreEvent: true,
      attrs: { coordinates: [rotateCoordinate1, point2, rotateCoordinate2] }
    }
  ]
}


export function getRotateCoordinate (coordinate: Coordinate, targetCoordinate: Coordinate, angle: number): Coordinate {
  const x = (coordinate.x - targetCoordinate.x) * Math.cos(angle) - (coordinate.y - targetCoordinate.y) * Math.sin(angle) + targetCoordinate.x
  const y = (coordinate.x - targetCoordinate.x) * Math.sin(angle) + (coordinate.y - targetCoordinate.y) * Math.cos(angle) + targetCoordinate.y
  return { x, y }
}

export function getRayLine (coordinates: Coordinate[], bounding: Bounding): LineAttrs | LineAttrs[] {
  if (coordinates.length > 1) {
    let coordinate: Coordinate
    const point1 = coordinates[0]
    const point2 = coordinates[1]
    if (point1.x === point2.x && point1.y !== point2.y) {
      if (point1.y < point2.y) {
        coordinate = {
          x: point1.x,
          y: bounding.height
        }
      } else {
        coordinate = {
          x: point1.x,
          y: 0
        }
      }
    } else if (point1.x > point2.x) {
      coordinate = {
        x: 0,
        y: kc.utils.getLinearYFromCoordinates(point1, point2, { x: 0, y: point1.y })
      }
    } else {
      coordinate = {
        x: bounding.width,
        y: kc.utils.getLinearYFromCoordinates(point1, point2, { x: bounding.width, y: point1.y })
      }
    }
    return { coordinates: [point1, coordinate] }
  }
  return []
}

export function getDistance (coordinate1: Coordinate, coordinate2: Coordinate,): number {
  const xDis = Math.abs(coordinate1.x - coordinate2.x)
  const yDis = Math.abs(coordinate1.y - coordinate2.y)
  return Math.sqrt(xDis * xDis + yDis * yDis)
}

export function getPrecision(chart: Chart, overlay: Overlay, yAxis: kc.Nullable<YAxis>): number {
  let precision = 0
  if (yAxis?.isInCandle() ?? true) {
    precision = chart.getPrecision().price
  } else {
    const indicators = chart.getIndicators({ paneId: overlay.paneId }).get(overlay.paneId) ?? []
    indicators.forEach(indicator => {
      precision = Math.max(precision, indicator.precision)
    })
  }
  return precision
}
