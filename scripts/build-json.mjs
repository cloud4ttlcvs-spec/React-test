import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_SOURCE_URLS = {
  products: process.env.SOURCE_PRODUCTS_CSV || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBtV8q3Ank7Bnhs83IbOb97U46juV-RKeL3NpdFiNcSu-ifI21fQYo1-io62S3JIrXEO5MiDArc1Lr/pub?gid=1623055155&single=true&output=csv',
  pitch: process.env.SOURCE_PITCH_CSV || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJaiIUkmBPfRcFADAoW4-_zbWB78gZb1yR_2gM9oORqRwCx8vb844cP-KcE58FgTVynptYk6L6o9pm/pub?gid=0&single=true&output=csv',
  promotions: process.env.SOURCE_PROMOTIONS_CSV || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3hvcNJNEfLugUcwQdHTTu0NZcy2QHyMPvMaPpfU6g_p0MTrw3muXIGn3SPkISSPnbW9ou1GlHzRc6/pub?gid=74407584&single=true&output=csv',
  rank: process.env.SOURCE_RANK_CSV || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQj5QLrtaWikGcLNwMawbjiN8ZQDgFzW1RV7UECFgLzECWj16I2ugE_B6tzzLICCynsk1L6lAuJfccS/pub?gid=93142219&single=true&output=csv',
}

const OUTPUT_DIR = process.env.OUTPUT_DIR || process.cwd()
const TZ = process.env.PIPELINE_TIMEZONE || 'Asia/Taipei'

const HEADER_ALIASES = {
  productCode: ['code', 'product_code', 'productcode', 'item_code', 'itemcode', 'sku', '商品編號', '商品代碼', '品號', '料號', '編號'],
  productName: ['name', 'product_name', 'productname', 'item_name', 'itemname', '商品名稱', '品名', '名稱'],
  category: ['category', 'category_name', 'categoryname', '分類', '商品分類', '類別', '大類'],
  price: ['price', 'list_price', 'listprice', 'unit_price', 'unitprice', 'sale_price', 'saleprice', '價格', '售價', '單價', '建議售價'],
  spec: ['spec', 'specification', '商品規格', '規格', '規格說明'],
  photo: ['photo', 'image', 'image_url', 'imageurl', 'photo_url', 'photourl', '圖片', '圖片連結', '商品圖', '商品圖片'],
  videoUrl: ['video_url', 'videourl', 'video', '影音連結', '影片連結', '影片', '影音'],
  moreLinksRaw: ['more_links_raw', 'morelinksraw', 'more_links', 'morelinks', '更多素材', '更多素材連結', '素材連結'],

  pitchCode: ['code', 'product_code', 'productcode', 'item_code', 'itemcode', 'sku', '商品編號', '商品代碼', '品號', '料號', '編號'],
  pitchName: ['name', 'product_name', 'productname', 'item_name', 'itemname', '商品名稱', '品名', '名稱'],
  pitchTitle: ['title', 'pitch_title', 'pitchtitle', '主訴求', '標題', '話術標題'],
  pitchContent: ['content', 'pitch_content', 'pitchcontent', '文案', '內容', '話術內容'],
  pitchTags: ['tags', 'tag', '標籤', '關鍵字', 'hashtags'],
  pitchIsNew: ['is_new', 'isnew', '新品', 'new', '新品標記', '新品註記'],

  promoId: ['promo_id', 'promoid', 'id', '活動編號', '活動id'],
  promoTitle: ['title', 'promo_title', 'promotitle', '活動標題', '標題'],
  promoShortTitle: ['short_title', 'shorttitle', 'promo_short_title', 'promoshorttitle', '短標題', '短標', '活動短標'],
  promoContent: ['content', 'promo_content', 'promocontent', '活動說明', '說明', '內容'],
  promoImgUrl: ['img_url', 'imgurl', 'image_url', 'imageurl', 'banner_url', 'bannerurl', '圖片', '圖片連結', '活動圖片', '活動圖'],
  promoRelatedCodes: ['related_codes', 'relatedcodes', '商品代碼', '適用商品', '連動商品', '相關商品', '商品編號'],
  promoStartDate: ['start_date', 'startdate', '開始日期', '活動開始', 'start'],
  promoEndDate: ['end_date', 'enddate', '結束日期', '活動結束', 'end'],
  promoStatus: ['status', '狀態', '活動狀態'],
  promoBgColor: ['bg_color', 'bgcolor', '背景色', '背景顏色'],
  channelShow: ['channel_showroom', 'showroom', 'show', '展售中心'],
  channelMart: ['channel_mart', 'mart', '便利店'],
  channelEshop: ['channel_eshop', 'eshop', '購物網', '網購'],
  channelOffice: ['channel_office', 'office', '營業所'],
  channelLabels: ['channel_labels', 'channellabels', '通路', '通路標籤', '通路名稱'],

  rankCode: ['code', 'product_code', 'productcode', 'item_code', 'itemcode', 'sku', '商品編號', '商品代碼', '品號', '料號', '編號'],
  rankName: ['name', 'product_name', 'productname', 'item_name', 'itemname', '商品名稱', '品名', '名稱'],
  rankSales: ['sales_twd_2025', 'salestwd2025', 'sales_2025', 'sales', '銷售額', '銷售金額', '業績'],
  rankQty: ['qty_2025', 'qty2025', 'quantity_2025', 'quantity2025', 'qty', '數量', '銷量', '件數'],
  rankValue: ['rank', '排名'],
}

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[\s\-\/（）()【】\[\]．。·_:：]+/g, '')
}

function buildHeaderMap(headers) {
  const map = new Map()
  headers.forEach((header) => {
    const normalized = normalizeHeader(header)
    if (normalized && !map.has(normalized)) {
      map.set(normalized, header)
    }
  })
  return map
}

function getValue(row, aliases) {
  for (const alias of aliases) {
    const normalized = normalizeHeader(alias)
    for (const [key, value] of Object.entries(row)) {
      if (normalizeHeader(key) === normalized) {
        const stringValue = String(value ?? '').trim()
        if (stringValue !== '') return stringValue
      }
    }
  }
  return ''
}

function parseCsv(text) {
  const rows = []
  const currentRow = []
  let currentCell = ''
  let inQuotes = false

  const pushCell = () => {
    currentRow.push(currentCell)
    currentCell = ''
  }

  const pushRow = () => {
    if (currentRow.length === 1 && currentRow[0] === '' && rows.length === 0) {
      currentRow.length = 0
      return
    }
    rows.push([...currentRow])
    currentRow.length = 0
  }

  const normalized = String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      pushCell()
      continue
    }

    if (char === '\n' && !inQuotes) {
      pushCell()
      pushRow()
      continue
    }

    currentCell += char
  }

  pushCell()
  if (currentRow.length) pushRow()

  if (!rows.length) return []

  const [headerRow, ...dataRows] = rows
  const headers = headerRow.map((header) => String(header ?? '').replace(/^\uFEFF/, '').trim())

  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = String(row[index] ?? '').trim()
      })
      return obj
    })
}

function parseBoolean(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  return ['1', 'true', 'yes', 'y', 'on', 'ok', 'o', 'v', '✓', '✔', '是', '有', '開', '啟用'].includes(normalized)
}

function parseNumber(value, fallback = 0) {
  const normalized = String(value ?? '').replace(/[,$\s]/g, '')
  if (!normalized) return fallback
  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizeDateString(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  const direct = text.replace(/[.]/g, '/').replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, '')
  const compact = direct.match(/^(\d{4})[\/-]?(\d{1,2})[\/-]?(\d{1,2})$/)
  if (compact) {
    const [, year, month, day] = compact
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`
  }
  const date = new Date(text)
  if (!Number.isNaN(date.getTime())) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}/${m}/${d}`
  }
  return text
}

function toDateValue(value) {
  const normalized = normalizeDateString(value)
  if (!normalized) return null
  const safe = normalized.replace(/\//g, '-')
  const date = new Date(`${safe}T00:00:00+08:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function todayKeyInTz(timeZone = TZ) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'
  return `${year}-${month}-${day}`
}

function derivePromoStatus({ explicitStatus, startDate, endDate }) {
  const normalizedExplicit = String(explicitStatus ?? '').trim().toLowerCase()
  if (['active', 'upcoming', 'ended'].includes(normalizedExplicit)) return normalizedExplicit

  const today = new Date(`${todayKeyInTz()}T00:00:00+08:00`)
  const start = toDateValue(startDate)
  const end = toDateValue(endDate)

  if (start && start > today) return 'upcoming'
  if (end && end < today) return 'ended'
  return 'active'
}

function splitList(value) {
  return String(value ?? '')
    .split(/[\n,，;；、|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function stableStringify(value) {
  const seen = new WeakSet()
  return JSON.stringify(value, (key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (seen.has(val)) return val
      seen.add(val)
      return Object.keys(val).sort().reduce((acc, current) => {
        acc[current] = val[current]
        return acc
      }, {})
    }
    return val
  })
}

async function fetchCsv(url) {
  const response = await fetch(url, {
    headers: { 'cache-control': 'no-cache' },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText} (${url})`)
  }
  const text = await response.text()
  if (!text.trim()) {
    throw new Error(`Fetched empty CSV from ${url}`)
  }
  if (/^<!doctype html/i.test(text.trim())) {
    throw new Error(`Unexpected HTML response from ${url}`)
  }
  return text
}

function buildMergedFeed(productRows, pitchRows, sourceUrls) {
  const pitchByCode = new Map()
  const pitchByName = new Map()

  pitchRows.forEach((row) => {
    const code = getValue(row, HEADER_ALIASES.pitchCode)
    const name = getValue(row, HEADER_ALIASES.pitchName)
    const pitch = {
      title: getValue(row, HEADER_ALIASES.pitchTitle),
      content: getValue(row, HEADER_ALIASES.pitchContent),
      tags: getValue(row, HEADER_ALIASES.pitchTags),
      isNew: parseBoolean(getValue(row, HEADER_ALIASES.pitchIsNew)),
      name,
    }
    if (code) pitchByCode.set(code, pitch)
    if (name) pitchByName.set(name, pitch)
  })

  const items = productRows
    .map((row) => {
      const code = getValue(row, HEADER_ALIASES.productCode)
      const name = getValue(row, HEADER_ALIASES.productName)
      if (!code || !name) return null
      const pitch = pitchByCode.get(code) || pitchByName.get(name) || {
        title: '',
        content: '',
        tags: '',
        isNew: false,
        name,
      }
      return {
        code,
        name,
        category: getValue(row, HEADER_ALIASES.category),
        price: parseNumber(getValue(row, HEADER_ALIASES.price), 0),
        spec: getValue(row, HEADER_ALIASES.spec),
        photo: getValue(row, HEADER_ALIASES.photo),
        videoUrl: getValue(row, HEADER_ALIASES.videoUrl),
        moreLinksRaw: getValue(row, HEADER_ALIASES.moreLinksRaw),
        pitch,
      }
    })
    .filter(Boolean)

  if (!items.length) {
    throw new Error('Merged feed generation aborted: no valid product rows were produced.')
  }

  const timestamp = new Date().toISOString()
  const buildId = `merged-${timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`

  return {
    schemaVersion: 1,
    buildId,
    generatedAt: timestamp,
    source: {
      ...sourceUrls,
      sourceFiles: {
        products: 'Google Sheets published CSV',
        pitch: 'Google Sheets published CSV',
        promotions: 'Google Sheets published CSV',
        rank: 'Google Sheets published CSV',
      },
    },
    count: items.length,
    items,
  }
}

function buildPromotions(rows, sourceUrls) {
  const items = rows
    .map((row, index) => {
      const title = getValue(row, HEADER_ALIASES.promoTitle)
      if (!title) return null

      const show = parseBoolean(getValue(row, HEADER_ALIASES.channelShow))
      const mart = parseBoolean(getValue(row, HEADER_ALIASES.channelMart))
      const eshop = parseBoolean(getValue(row, HEADER_ALIASES.channelEshop))
      const office = parseBoolean(getValue(row, HEADER_ALIASES.channelOffice))

      const fallbackLabels = []
      if (show) fallbackLabels.push('展售中心')
      if (mart) fallbackLabels.push('便利店')
      if (eshop) fallbackLabels.push('購物網')
      if (office) fallbackLabels.push('營業所')

      const startDate = normalizeDateString(getValue(row, HEADER_ALIASES.promoStartDate))
      const endDate = normalizeDateString(getValue(row, HEADER_ALIASES.promoEndDate))

      return {
        promoId: getValue(row, HEADER_ALIASES.promoId) || `promo-${String(index + 1).padStart(3, '0')}`,
        title,
        shortTitle: getValue(row, HEADER_ALIASES.promoShortTitle) || title,
        content: getValue(row, HEADER_ALIASES.promoContent),
        imgUrl: getValue(row, HEADER_ALIASES.promoImgUrl),
        relatedCodes: splitList(getValue(row, HEADER_ALIASES.promoRelatedCodes)),
        startDate,
        endDate,
        status: derivePromoStatus({
          explicitStatus: getValue(row, HEADER_ALIASES.promoStatus),
          startDate,
          endDate,
        }),
        bgColor: getValue(row, HEADER_ALIASES.promoBgColor) || '#fff6d5',
        ch: { show, mart, eshop, office },
        channelLabels: fallbackLabels.length ? fallbackLabels : splitList(getValue(row, HEADER_ALIASES.channelLabels)),
      }
    })
    .filter(Boolean)

  return {
    generatedAt: new Date().toISOString(),
    source: {
      promotions: sourceUrls.promotions,
    },
    count: items.length,
    items,
  }
}

function buildRankings(rows, sourceUrls) {
  let items = rows
    .map((row) => {
      const code = getValue(row, HEADER_ALIASES.rankCode)
      const name = getValue(row, HEADER_ALIASES.rankName)
      if (!code || !name) return null
      return {
        code,
        name,
        salesTwd2025: parseNumber(getValue(row, HEADER_ALIASES.rankSales), 0),
        qty2025: parseNumber(getValue(row, HEADER_ALIASES.rankQty), 0),
        rank: parseNumber(getValue(row, HEADER_ALIASES.rankValue), 0),
      }
    })
    .filter(Boolean)

  const hasExplicitRank = items.some((item) => item.rank > 0)
  if (!hasExplicitRank) {
    items = items
      .sort((a, b) => b.salesTwd2025 - a.salesTwd2025 || b.qty2025 - a.qty2025 || a.code.localeCompare(b.code))
      .map((item, index) => ({ ...item, rank: index + 1 }))
  } else {
    items = items.sort((a, b) => a.rank - b.rank || b.salesTwd2025 - a.salesTwd2025)
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      rank: sourceUrls.rank,
    },
    count: items.length,
    items,
  }
}

async function writeJsonFile(filename, data) {
  const target = path.join(OUTPUT_DIR, filename)
  const formatted = `${JSON.stringify(data, null, 2)}\n`
  await fs.writeFile(target, formatted, 'utf8')
}

export async function generateJsonFiles() {
  const [productsCsv, pitchCsv, promotionsCsv, rankCsv] = await Promise.all([
    fetchCsv(DEFAULT_SOURCE_URLS.products),
    fetchCsv(DEFAULT_SOURCE_URLS.pitch),
    fetchCsv(DEFAULT_SOURCE_URLS.promotions),
    fetchCsv(DEFAULT_SOURCE_URLS.rank),
  ])

  const productRows = parseCsv(productsCsv)
  const pitchRows = parseCsv(pitchCsv)
  const promotionRows = parseCsv(promotionsCsv)
  const rankRows = parseCsv(rankCsv)

  if (!productRows.length) {
    throw new Error('Products CSV parsed to zero rows. Aborting to avoid empty deployment.')
  }

  const mergedFeed = buildMergedFeed(productRows, pitchRows, DEFAULT_SOURCE_URLS)
  const promotions = buildPromotions(promotionRows, DEFAULT_SOURCE_URLS)
  const rankings = buildRankings(rankRows, DEFAULT_SOURCE_URLS)

  await Promise.all([
    writeJsonFile('merged-feed.json', mergedFeed),
    writeJsonFile('promotions.json', promotions),
    writeJsonFile('rankings.json', rankings),
  ])

  return {
    mergedFeed,
    promotions,
    rankings,
  }
}

async function main() {
  const startedAt = new Date().toISOString()
  console.log(`[build-json] start ${startedAt}`)
  const result = await generateJsonFiles()
  console.log(`[build-json] merged-feed items: ${result.mergedFeed.count}`)
  console.log(`[build-json] promotions items: ${result.promotions.count}`)
  console.log(`[build-json] rankings items: ${result.rankings.count}`)
  console.log(`[build-json] wrote files to ${OUTPUT_DIR}`)
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  main().catch((error) => {
    console.error('[build-json] failed')
    console.error(error)
    process.exit(1)
  })
}
