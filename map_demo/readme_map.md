# 地图模块说明（readme_map）

> 文档位置：`map_demo/readme_map.md`
> 对应页面：`鲸伴同行-demo-发布包/map.html` → 重定向到 `map-design.html?mode=app`
> 状态：静态演示已基本完成；真实定位 / 真实路线规划尚未接入，本文第 5、6 节为预留接口说明。

---

## 1. 文档目的

本文说明「园区地图」页面当前已经实现的静态功能、数据与坐标约定，并给出后续把**真实定位**和**真实路线规划**接入到这张手绘地图时需要对接的接口、数据格式和代码位置，方便后续接手开发。

---

## 2. 文件与目录

```text
鲸伴同行-demo-发布包/
  map.html                     # 地图入口（客户端重定向到 map-design.html?mode=app）
  map-design.html              # 地图页 HTML 结构（搜索、筛选、地图画布、详情卡片、行程弹窗）
  assets/
    map-design-page.mjs        # 地图页主逻辑（渲染、搜索、筛选、缩放、行程、路线）
    map-design.css             # 地图页样式（地点卡片、详情卡片、路线、箭头等）
    map-data.json              # 地点坐标 + 轻量路网数据（当前演示数据）
    map-routing.mjs            # 路网规划算法（建图、最短路、访问顺序优化、路径转 SVG）
    park-map.png               # 底图（1800×2400，当前为灰底/低饱和版本）
    animals/                   # 地点卡片/详情卡片的图片素材（800方形透明 PNG）
  mockup.html                  # iPhone 手机样机容器（可加载地图页）
map_demo/
  readme_map.md                # 本文档
  ocean-park-map-restyled-hd-overlay.svg   # 地图矢量化参考（道路、节点、地点、规划路线）
  *.png / *.json / *.html      # 地图设计源文件与编辑器
```

运行方式（静态 Demo）：

```powershell
python -m http.server 5173 --bind 127.0.0.1 --directory "鲸伴同行-demo-发布包"
# 地图页：http://127.0.0.1:5173/map.html
```

---

## 3. 当前已实现的功能

### 3.1 底图与坐标

- 底图使用 `park-map.png`，逻辑尺寸固定为 **1800 × 2400**（3:4），通过 `object-fit: cover` 铺满地图区域。
- 所有地点、圆点、路线、箭头都绘制在 `<svg class="map-markers" viewBox="0 0 1800 2400">` 中，与底图共用同一套坐标，因此缩放、拖动时天然对齐。
- 底图可替换为任意同比例（1800×2400）图片，无需改代码。

### 3.2 地点标记与卡片

- 24 个地点来自 `map-data.json`，每个地点在精确坐标处显示一个**圆点**（`place-dot`）。
- 地点卡片随缩放切换两种形态（阈值 `CARD_ZOOM_THRESHOLD = 1.6`）：
  - **缩小态**（`mapScale < 1.6`）：只显示圆点 + 地名文字（白描边，无底板）。
  - **放大态**（`mapScale ≥ 1.6`）：圆点上方显示**圆形白色底卡片**，内含地点图片（动物/场景），下方显示场馆名称（文字不包含在白底内）。
- 卡片图片映射在 `map-design-page.mjs` 的 `ANIMAL_IMAGES`（地点名 → `assets/animals/*.png`）；没有对应图片的地点回退为 SVG 线性图标。
- 选中 / 在行程中的地点：白色圆形加蓝色描边；圆点也会变色。
- 卡片整体缩放由 `PLACE_MARKER_SCALE = 1.3` 控制，并与地图缩放做补偿，保证卡片屏幕尺寸恒定。

### 3.3 详情卡片（底部）

- 平时固定在地图底部，随状态变化：
  - **初始态**（未选地点、无行程）：显示路线图图标 + 「还没有规划行程」+ 「在地图上选择地点加入规划」。
  - **已选行程但未选地点**：显示路线图图标 + 「已选 N 个地点」+ 「点击「调整行程」查看或规划路线」。
  - **选中地点**：显示该地点的图片、类型、介绍、服务标签、演示评分，以及「加入规划 / 移出行程」按钮。
- 详情卡片的图片容器约 80×80（SVG 72×72），图片带阴影。

### 3.4 搜索、筛选、缩放、拖动

- 顶部搜索框：按地点名称 / 类型搜索，结果列表可点击定位。
- 分类筛选：全部 / 场馆 / 餐饮 / 休闲 / 礼品 / 卫生间 / 出入口。
  - **默认（全部）只显示：场馆、礼品、休闲**；出入口、卫生间默认不显示，可通过筛选查看。
- 地图缩放范围 **1 – 2.16**（按钮每档 ×1.2），支持拖动平移。
- 「定位」按钮回到「我的位置」（演示为固定坐标）。

### 3.5 行程与路线规划（演示）

- 地点可「加入规划 / 移出行程」，行程最多 8 个地点（当前放宽为 **1–8** 个即可规划）。
- 「行程」按钮：有 ≥2 个地点时直接规划；无地点时弹出「行程还是空的」气泡；**点击气泡可打开「游园规划 · 调整行程」弹窗**。
- 路线规划算法（`map-routing.mjs`）：
  - `buildRoutingGraph`：把道路（贝塞尔曲线）和地点接入路网，构建无向图。
  - `shortestPath`：Dijkstra 最短路。
  - `optimizeVisitOrder`：2–8 个途经点的访问顺序优化（旅行商思路）。
- 路线展示（当前版本）：
  - **只绘制「当前位置 → 下一站」这一段**（`state.plan.legs[0]`），不画完整多段路线。
  - 实线（无虚线），颜色 `#1672c9`，白色衬底。
  - 沿路线每隔约 220 个地图单位放一个**圆角方向箭头**（约 30×60，指向前进方向）。
- 「推荐行程」：按游玩时长（约1小时 / 2-3小时 / 半日游）和偏好（轻松慢游 / 演出优先 / 亲子互动）生成路线。

### 3.6 无障碍与响应式

- 搜索、筛选、卡片、弹窗均带 `aria-*` 属性；地点可键盘聚焦与激活。
- 适配 320 / 360 / 375 / 393px 手机宽度；桌面预览限制在手机宽度容器内。
- 尊重 `prefers-reduced-motion`。

---

## 4. 数据结构与坐标约定

### 4.1 map-data.json

```json
{
  "width": 1800,
  "height": 2400,
  "places": [
    { "id": "place-xxx", "name": "企鹅岛", "x": 1470, "y": 267, "number": 17,
      "tags": ["venue", "dining", "gift", "restroom"] }
  ],
  "network": {
    "nodes": [ { "id": "node-xxx", "label": "P1", "x": 218, "y": 1977 } ],
    "edges": [
      { "id": "edge-xxx", "a": "node-A", "b": "node-B",
        "control1": { "x": 265, "y": 1902 }, "control2": { "x": 314, "y": 1817 } }
    ]
  }
}
```

- `places[*]`：24 个地点；`tags` 取值：`venue / dining / leisure / gift / restroom / entrance`。
- `network`：39 个路网节点、42 条道路边；每条边是一段三次贝塞尔曲线（`a`、`b` 为端点节点，`control1/control2` 为控制点）。
- 地点与路网通过「最近点投影」接入（`buildRoutingGraph`），不要求地点正好在节点上。

### 4.2 坐标系统

- 统一使用 **地图坐标**：以底图左上角为原点，`x ∈ [0,1800]`，`y ∈ [0,2400]`，单位为「地图单位」。
- 页面中「我的位置」目前固定为 `demoLocation = { x: 361, y: 1714 }`，即静态演示坐标，不申请真实定位。

---

## 5. 后续接入「真实定位」——接口说明

### 5.1 目标

把静态的「我的位置」替换为真实设备定位，并在地图上实时显示；支持定位失败/无权限时的降级。

### 5.2 建议新增定位适配器

建议新增 `assets/location-provider.mjs`（或内联到 `map-design-page.mjs`），对外暴露：

```js
/**
 * 一次定位
 * @returns {Promise<{ lat:number, lng:number, accuracy?:number, timestamp:number }>}
 */
export async function getCurrentPosition();

/**
 * 持续监听定位变化
 * @param {(pos) => void} onChange
 * @param {(err) => void} onError
 * @param {{ enableHighAccuracy?:boolean, timeout?:number, maximumAge?:number }} [options]
 * @returns {number} watchId，用于 clearWatch
 */
export function watchPosition(onChange, onError, options);

export function clearWatch(watchId);
```

实现可基于浏览器原生 `navigator.geolocation`，也可以改为调用后端定位服务；对页面其余部分保持同一套 `{ lat, lng }` 返回结构。

### 5.3 经纬度 ↔ 地图坐标转换

手绘底图不满足真实地理投影，不能直接用经纬度线性换算，建议用**标定**方式：

1. 在园区现场取 **3 个（建议 4 个）已知点**，同时记录：
   - 该点在底图上的地图坐标 `{ x, y }`；
   - 该点的真实经纬度 `{ lat, lng }`。
2. 用仿射变换拟合 `{ x, y } ⇄ { lat, lng }`，封装为 `createGeoMapper(calibrationPoints)`：

```js
const calibrationPoints = [
  { map: { x: 256, y: 1852 }, geo: { lat: 30.xxxxxx, lng: 120.xxxxxx } }, // 公园入口
  { map: { x: 424, y: 2176 }, geo: { lat: 30.xxxxxx, lng: 120.xxxxxx } }, // 游客中心
  { map: { x: 1470, y: 267 },  geo: { lat: 30.xxxxxx, lng: 120.xxxxxx } }, // 企鹅岛
];

export function createGeoMapper(points) {
  // 返回 { geoToMap(lat,lng) -> {x,y}, mapToGeo(x,y) -> {lat,lng} }
}
```

3. 页面拿到经纬度后调用 `geoToMap(lat, lng)`，得到地图坐标再更新「我的位置」标记。

> 若园区有官方平面图 / 桩点坐标，优先用官方标定，精度更好。

### 5.4 与现有代码的对接点

- `map-design-page.mjs` 中 `demoLocation` 目前是写死的常量，且 `state.startId = demoLocation.id`。接入真实定位时：
  - 新增 `state.currentPosition = { x, y }`；
  - 「我的位置」圆点 / 标签改用 `state.currentPosition`；
  - `state.startId` 仍可保留为「我的位置」这个虚拟起点，或改为最近的路网节点。
- 路线规划起点改为真实位置（见第 6 节接口的 `start`）。
- 保留「定位」按钮：接入后改为请求真实定位并居中；无权限时给出提示。

### 5.5 降级与异常

- 用户拒绝授权 / 定位超时：提示「无法获取定位，已使用游客中心作为起点」，并回退到一个默认坐标（如游客中心）。
- 定位精度差（`accuracy` 过大）：可在地图上显示一个半透明范围圈，或提示用户。
- 建议对 `watchPosition` 做节流（如 2–3 秒一次），避免频繁重绘。

---

## 6. 后续接入「真实路线规划」——接口说明

### 6.1 目标

把当前基于手绘路网（`map-data.json` 的 `network`）的演示路线规划，替换为**真实步行/游园路线**（可以是后端规划服务，或高德/百度等地图 SDK 的步行路线）。

### 6.2 建议新增路线适配器

建议新增 `assets/route-planner.mjs`，对外暴露：

```js
/**
 * 规划路线
 * @param {{
 *   start: { x:number, y:number, id?:string },          // 起点（地图坐标）
 *   stops: Array<{ id:string, x:number, y:number }>,     // 途经点（地图坐标）
 *   options?: { optimizeOrder?:boolean, roundTrip?:boolean }
 * }} input
 * @returns {Promise<{
 *   order: string[],                                     // 访问顺序的地点 id
 *   legs: Array<{
 *     from: string,
 *     to: string,
 *     distance: number,                                  // 米或地图单位（需标注单位）
 *     duration?: number,                                 // 秒，可选
 *     geometry: Array<{ x:number, y:number }>            // 折线点（地图坐标）
 *   }>,
 *   totalDistance: number,
 *   totalDuration?: number
 * }>}
 */
export async function planRoute(input);
```

- 如果使用真实地图 SDK，可先在 SDK 坐标系里规划，再把返回的折线点逐个 `geoToMap` 转成地图坐标。
- 如果使用后端服务，接口返回 `geometry` 为地图坐标折线即可，前端不关心底层实现。

### 6.3 数据格式约定

- `geometry` 建议统一为**地图坐标折线点数组** `[{x,y}, ...]`；页面用 `M x y L ...` 绘制。
- `distance` / `duration` 明确单位（米 / 秒），不要混用「地图单位」。
- 访问顺序 `order` 用于标记站点序号、更新行程面板。

### 6.4 与现有代码的对接点

- `planRoute()`（`map-design-page.mjs`）目前直接调用 `optimizeVisitOrder(...)`；接入后改为调用 `RoutePlanner.plan({ start, stops })`，返回结果写回 `state.plan`。
- `renderRoute()` 目前按 `legs[0]` 只画「当前位置 → 下一站」；接入真实路线后：
  - 如需显示整条路线，改为遍历 `legs` 全部绘制；
  - 如需分段显示，仍可保持只画当前段。
- 路线样式在 `map-design.css` 的 `.route-line / .route-casing / .route-arrow`（当前实线 + 方向箭头），可按真实路线数据继续沿用。
- 站点序号 / 行程面板（`renderItineraryDialog`）可继续使用 `order`。

### 6.5 降级与异常

- 规划服务超时 / 失败：提示「路线规划失败，请稍后重试」，并保留当前选点。
- 部分地点不可达：提示「部分地点无法连通」，并给出可移除/替换的建议。
- 真实路线长度/耗时需与演示数据区分，避免把「地图单位」当「米」展示。

---

## 7. 接入步骤建议

1. **先做定位**：新增 `location-provider.mjs` + `geoToMap`，把「我的位置」从固定坐标改为实时坐标；保留无权限降级。
2. **再替换路线规划**：新增 `route-planner.mjs`，把 `planRoute()` 接到真实服务；先用「只画当前段」验证，再决定是否画完整路线。
3. **联调**：确认起终点、坐标系、单位一致；核对「我的位置」与路网/地点是否对齐。
4. **回归**：检查搜索、筛选、详情卡片、行程、缩放/拖动、320–393px 手机宽度下的表现。

---

## 8. 备注

- 本文档只覆盖地图页；账号、档案、问卷、书包预约等属于其他模块。
- `map_demo/` 中保留了地图设计源文件（SVG 叠层、编辑器工程、原始 PNG），可继续用于调图。
- 当前 `park-map.png`、`assets/animals/*.png` 为演示素材，接入真实定位/路线时可按需替换。
