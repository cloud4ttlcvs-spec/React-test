import fs from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_DIR = path.resolve(process.cwd(), 'public')

const SOURCE_URLS = {
  products:
    process.env.PRODUCTS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBtV8q3Ank7Bnhs83IbOb97U46juV-RKeL3NpdFiNcSu-ifI21fQYo1-io62S3JIrXEO5MiDArc1Lr/pub?gid=1623055155&single=true&output=csv',
  pitch:
    process.env.PITCH_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJaiIUkmBPfRcFADAoW4-_zbWB78gZb1yR_2gM9oORqRwCx8vb844cP-KcE58FgTVynptYk6L6o9pm/pub?gid=0&single=true&output=csv',
  promotions:
    process.env.PROMOTIONS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3hvcNJNEfLugUcwQdHTTu0NZcy2QHyMPvMaPpfU6g_p0MTrw3muXIGn3SPkISSPnbW9ou1GlHzRc6/pub?gid=74407584&single=true&output=csv',
  rank:
    process.env.RANKINGS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQj5QLrtaWikGcLNwMawbjiN8ZQDgFzW1RV7UECFgLzECWj16I2ugE_B6tzzLICCynsk1L6lAuJfccS/pub?gid=93142219&single=true&output=csv',
}

const nowIso = new Date().toISOString()
const buildId = nowIso.replace(/[-:TZ.]/g, '').slice(0, 14)

function normalizeKey(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-／/（）()\[\]【】「」『』:：]+/g, '')
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += ch
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  if (!rows.length) return []

  const headers = rows[0].map((h) => String(h || '').replace(/^\uFEFF/, '').trim())
  return rows
    .slice(1)
    .filter((r) => r.some((v) => String(v || '').trim() !== ''))
    .map((r) => {
      const obj = {}
      headers.forEach((header, idx) => {
        obj[header] = (r[idx] ?? '').trim()
      })
      return obj
    })
}

function buildValueGetter(row) {
  const entries = Object.entries(row || {})
  const normalized = new Map(entries.map(([key, value]) => [normalizeKey(key), value]))
  return (...candidates) => {
    for (const candidate of candidates.flat()) {
      const value = normalized.get(normalizeKey(candidate))
      if (value !== undefined && String(value).trim() !== '') return String(value).trim()
    }
    return ''
  }
}

function toNumber(value) {
  const cleaned = String(value || '').replace(/[,\sNT$元]/gi, '')
  if (!cleaned) return 0
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function toBool(value) {
  const raw = String(value || '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'y', '是', '有', '上架', 'active', 'x', 'v', '✓'].includes(raw)
}

function splitList(value) {
  return String(value || '')
    .split(/[\n\r,，;；、|]+/)
    .map((v) => v.trim())
    .filter(Boolean)
}

function normalizeDateString(value) {
  return String(value || '').trim().replace(/[.]/g, '/').replace(/-/g, '/')
}

function parseLooseDate(value) {
  const raw = normalizeDateString(value)
  if (!raw) return null
  const match = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const [, y, m, d] = match
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(dt.getTime()) ? null : dt
}

function inferPromoStatus(explicitStatus, startDate, endDate) {
  const raw = String(explicitStatus || '').trim().toLowerCase()
  if (['active', '進行中', 'on', 'ongoing'].includes(raw)) return 'active'
  if (['upcoming', '即將開始', 'coming', 'soon'].includes(raw)) return 'upcoming'
  if (['ended', '已結束', 'off', 'expired'].includes(raw)) return 'ended'

  const now = new Date()
  const start = parseLooseDate(startDate)
  const end = parseLooseDate(endDate)

  if (start && start > now) return 'upcoming'
  if (end && end < now) return 'ended'
  return 'active'
}

function channelFlagsFromRow(get) {
  const show = toBool(get('channel_showroom', 'showroom', 'show', '展售中心', '通路展售中心'))
  const mart = toBool(get('channel_mart', 'mart', '便利店', '通路便利店'))
  const eshop = toBool(get('channel_eshop', 'eshop', '購物網', '通路購物網'))
  const office = toBool(get('channel_office', 'office', '營業所', '通路營業所'))
  return { show, mart, eshop, office }
}

function channelLabelsFromFlags(ch) {
  const labels = []
  if (ch.show) labels.push('展售中心')
  if (ch.mart) labels.push('便利店')
  if (ch.eshop) labels.push('購物網')
  if (ch.office) labels.push('營業所')
  return labels
}

async function fetchCsvRows(url, label) {
  const res = await fetch(url, {
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  })

  if (!res.ok) {
    throw new Error(`${label} CSV 下載失敗：${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  return parseCsv(text)
}

function buildMergedFeed(productRows, pitchRows) {
  const pitchByCode = new Map()
  const pitchByName = new Map()

  for (const row of pitchRows) {
    const get = buildValueGetter(row)
    const code = get('code', '商品編號', '商品代號', 'item_code', '品號')
    const name = get('name', '商品名稱', '品名')
    const entry = {
      title: get('title', 'pitch_title', '主訴求', '標題'),
      content: get('content', 'pitch_content', '銷售話術', '話術內容', '文案'),
      tags: get('tags', 'pitch_tags', '標籤', '關鍵字'),
      isNew: toBool(get('isNew', 'is_new', '新品', 'new')),
      name,
    }
    if (code) pitchByCode.set(code, entry)
    if (name) pitchByName.set(name.trim().toLowerCase(), entry)
  }

  const items = productRows
    .map((row) => {
      const get = buildValueGetter(row)
      const code = get('code', '商品編號', '商品代號', 'item_code', '品號')
      const name = get('name', '商品名稱', '品名')
      if (!code || !name) return null

      const pitch = pitchByCode.get(code) || pitchByName.get(name.trim().toLowerCase()) || {
        title: '',
        content: '',
        tags: '',
        isNew: false,
        name,
      }

      return {
        code,
        name,
        category: get('category', '分類', 'category_name', '大類別', '商品分類'),
        price: toNumber(get('price', '售價', 'price_twd', '單價', '建議售價')),
        spec: get('spec', '規格', '容量規格'),
        photo: get('photo', 'image', 'image_url', 'img', '圖片', '商品圖片'),
        videoUrl: get('videoUrl', 'video_url', '影片連結', '影音連結'),
        moreLinksRaw: get('moreLinksRaw', 'more_links', '更多素材', 'more_links_raw'),
        pitch,
      }
    })
    .filter(Boolean)

  return {
    schemaVersion: 1,
    buildId,
    generatedAt: nowIso,
    source: {
      products: SOURCE_URLS.products,
      pitch: SOURCE_URLS.pitch,
      promotions: SOURCE_URLS.promotions,
      rank: SOURCE_URLS.rank,
    },
    count: items.length,
    items,
  }
}

function buildPromotions(rows) {
  const items = rows
    .map((row, index) => {
      const get = buildValueGetter(row)
      const ch = channelFlagsFromRow(get)
      const channelLabels = channelLabelsFromFlags(ch)
      const title = get('title', '活動名稱', 'promo_title', '促銷名稱')
      const shortTitle = get('shortTitle', '短標', '短標題', 'promo_short_title') || title
      const content = get('content', '活動說明', '促銷內容', 'promo_copy', '文案')
      const startDate = normalizeDateString(get('startDate', '開始日期', '活動開始日', 'start_date'))
      const endDate = normalizeDateString(get('endDate', '結束日期', '活動結束日', 'end_date'))
      const status = inferPromoStatus(get('status', '活動狀態', 'promo_status'), startDate, endDate)
      const relatedCodes = splitList(
        get('relatedCodes', '適用商品', '適用品號', '適用商品編號', 'product_codes', 'codes')
      )

      if (!title) return null

      return {
        promoId:
          get('promoId', '活動編號', 'id', 'promo_id') ||
          `${new Date().getFullYear()}_${String(index + 1).padStart(3, '0')}`,
        title,
        shortTitle,
        content,
        imgUrl: get('imgUrl', '圖片連結', '圖檔連結', 'image_url', 'img', 'image'),
        relatedCodes,
        startDate,
        endDate,
        status,
        bgColor: get('bgColor', '背景色', '卡片底色', 'bg_color'),
        ch,
        channelLabels,
      }
    })
    .filter(Boolean)

  return {
    generatedAt: nowIso,
    count: items.length,
    items,
  }
}

function buildRankings(rows) {
  const items = rows
    .map((row) => {
      const get = buildValueGetter(row)
      const code = get('code', '商品編號', '商品代號', 'item_code', '品號')
      if (!code) return null
      return {
        code,
        name: get('name', '商品名稱', '品名'),
        salesTwd2025: toNumber(get('salesTwd2025', 'sales_twd_2025', '2025銷售額', '銷售額', 'sales')),
        qty2025: toNumber(get('qty2025', 'qty_2025', '2025銷售量', '數量', 'qty')),
        rank: toNumber(get('rank', '排名', '名次')),
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank
      if (a.rank) return -1
      if (b.rank) return 1
      return b.salesTwd2025 - a.salesTwd2025
    })

  return {
    generatedAt: nowIso,
    count: items.length,
    items,
  }
}

async function writeJson(filename, payload) {
  const outputPath = path.join(OUTPUT_DIR, filename)
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`✅ 已輸出 ${outputPath}`)
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const [productRows, pitchRows, promotionRows, rankRows] = await Promise.all([
    fetchCsvRows(SOURCE_URLS.products, 'products'),
    fetchCsvRows(SOURCE_URLS.pitch, 'pitch'),
    fetchCsvRows(SOURCE_URLS.promotions, 'promotions'),
    fetchCsvRows(SOURCE_URLS.rank, 'rankings'),
  ])

  const mergedFeed = buildMergedFeed(productRows, pitchRows)
  const promotions = buildPromotions(promotionRows)
  const rankings = buildRankings(rankRows)

  await Promise.all([
    writeJson('merged-feed.json', mergedFeed),
    writeJson('promotions.json', promotions),
    writeJson('rankings.json', rankings),
  ])
}

main().catch((error) => {
  console.error('❌ build-json 失敗')
  console.error(error)
  process.exit(1)
})
