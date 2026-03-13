import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  X,
  ChevronRight,
  Tags,
  LayoutGrid,
  ArrowUpDown,
  ScanSearch,
  Star,
  PlayCircle,
  ExternalLink,
} from 'lucide-react'

const CATEGORY_META = [
  { key: 'all', label: '全部', tone: 'from-slate-100 to-white text-slate-700 border-slate-200' },
  { key: '保健飲品', label: '保健飲品', tone: 'from-amber-50 to-yellow-50 text-amber-700 border-amber-200' },
  { key: '保健食品', label: '保健食品', tone: 'from-emerald-50 to-lime-50 text-emerald-700 border-emerald-200' },
  { key: '美容產品', label: '美容產品', tone: 'from-rose-50 to-pink-50 text-rose-700 border-rose-200' },
  { key: '清潔產品', label: '清潔產品', tone: 'from-cyan-50 to-sky-50 text-cyan-700 border-cyan-200' },
  { key: '其他', label: '其他', tone: 'from-violet-50 to-fuchsia-50 text-violet-700 border-violet-200' },
]

function normalizeCategory(raw) {
  const value = raw || ''
  if (value.includes('美容')) return '美容產品'
  if (value.includes('清潔')) return '清潔產品'
  if (value.includes('飲品') || value.includes('黑麥汁')) return '保健飲品'
  if (value.includes('保健食品') || value.includes('買一送一')) return '保健食品'
  return '其他'
}

function currency(value) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function sortProducts(items, sortKey) {
  const arr = [...items]
  switch (sortKey) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price)
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    case 'new':
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.name.localeCompare(b.name, 'zh-Hant'))
    default:
      return arr.sort((a, b) => a.group.localeCompare(b.group, 'zh-Hant') || a.name.localeCompare(b.name, 'zh-Hant'))
  }
}

function parseMoreLinks(raw) {
  if (!raw) return []
  return String(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [type = '', label = '', url = ''] = line.split('|')
      return { type, label, url }
    })
    .filter((item) => item.url)
}

function MetricCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-slate-200/70 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-2 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function TagPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function ProductCard({ product, selected, onToggleCompare, onOpen }) {
  const tone = CATEGORY_META.find((item) => item.key === product.group) || CATEGORY_META[0]
  return (
    <motion.button layout whileHover={{ y: -2 }} onClick={() => onOpen(product)} className="group text-left">
      <div className="h-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/70 transition group-hover:shadow-lg group-hover:shadow-slate-200/80">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={product.photo} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className={`rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-medium ${tone.tone}`}>
              {product.group}
            </span>
            {product.isNew ? <span className="rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-white">NEW</span> : null}
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{product.title}</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-500" />
            </div>
            <p className="line-clamp-2 text-sm text-slate-600">{product.content || '可在此放入產品主訴求、話術卡摘要或短影音導購文案。'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between gap-3 pt-1">
            <div>
              <p className="text-xs text-slate-400">建議售價</p>
              <p className="text-lg font-semibold text-slate-900">{currency(product.price)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleCompare(product.code)
              }}
              className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selected ? '已加入比較' : '加入比較'}
            </button>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function DetailPanel({ product, onClose }) {
  if (!product) return null

  const moreLinks = parseMoreLinks(product.moreLinksRaw)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-t-[32px] border border-white/60 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs tracking-wide text-slate-400">話術卡預覽</p>
              <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 overflow-y-auto p-5 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[28px] bg-slate-100">
                <img src={product.photo} alt={product.name} className="h-full w-full object-cover" />
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs tracking-wide text-slate-400">主訴求</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {product.content || '這裡可對接正式站的 pitch_30s / FAQ / promo_copy，驗證抽屜式話術卡的閱讀節奏。'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                <p className="text-xs tracking-wide text-slate-400">商品資訊</p>
                <dl className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4"><dt>商品代碼</dt><dd className="font-medium text-slate-900">{product.code}</dd></div>
                  <div className="flex justify-between gap-4"><dt>分類</dt><dd className="font-medium text-slate-900">{product.group}</dd></div>
                  <div className="flex justify-between gap-4"><dt>價格</dt><dd className="font-medium text-slate-900">{currency(product.price)}</dd></div>
                  <div className="flex justify-between gap-4"><dt>規格</dt><dd className="font-medium text-slate-900">{product.spec || '—'}</dd></div>
                </dl>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                <p className="text-xs tracking-wide text-slate-400">標籤切入</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.length
                    ? product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">#{tag}</span>
                      ))
                    : <span className="text-sm text-slate-400">尚未設定標籤</span>}
                </div>
              </div>

              {(product.videoUrl || moreLinks.length > 0) ? (
                <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                  <p className="text-xs tracking-wide text-slate-400">影音 / 更多素材</p>
                  <div className="mt-3 space-y-2">
                    {product.videoUrl ? (
                      <a
                        href={product.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <span className="inline-flex items-center gap-2"><PlayCircle className="h-4 w-4" /> 開啟主影片</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    {moreLinks.map((item, idx) => (
                      <a
                        key={`${item.url}-${idx}`}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <span>{item.label || item.url}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[28px] bg-slate-900 p-4 text-white">
                <p className="text-xs tracking-wide text-white/60">沙盒驗證重點</p>
                <ul className="mt-3 space-y-2 text-sm text-white/85">
                  <li>• 抽屜式話術卡是否比 modal 更順手</li>
                  <li>• 商品卡資訊密度是否適合手機首屏</li>
                  <li>• 標籤與搜尋是否該合併成單一導購入口</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [sortKey, setSortKey] = useState('featured')
  const [selectedCodes, setSelectedCodes] = useState([])
  const [activeProduct, setActiveProduct] = useState(null)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}merged-feed.json`
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const mapped = (data.items || []).map((item) => ({
          code: item.code,
          name: item.name,
          category: item.category || '',
          group: normalizeCategory(item.category || ''),
          price: Number(item.price || 0),
          spec: item.spec || '',
          photo: item.photo || 'https://placehold.co/1200x900?text=No+Image',
          videoUrl: item.videoUrl || '',
          moreLinksRaw: item.moreLinksRaw || '',
          title: item.pitch?.title || item.name,
          content: item.pitch?.content || '',
          tags: String(item.pitch?.tags || '')
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          isNew: Boolean(item.pitch?.isNew),
        }))
        if (!cancelled) setItems(mapped)
      } catch (err) {
        if (!cancelled) setError(`載入 merged-feed.json 失敗：${err.message}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const allTags = useMemo(() => {
    const counter = new Map()
    items.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)))
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag)
  }, [items])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    const base = items.filter((item) => {
      const categoryOk = activeCategory === 'all' || item.group === activeCategory
      const tagOk = !activeTag || item.tags.includes(activeTag)
      const haystack = [item.name, item.title, item.content, item.code, ...item.tags].join(' ').toLowerCase()
      const keywordOk = !q || haystack.includes(q)
      return categoryOk && tagOk && keywordOk
    })
    return sortProducts(base, sortKey)
  }, [items, keyword, activeCategory, activeTag, sortKey])

  const compareItems = useMemo(() => items.filter((item) => selectedCodes.includes(item.code)), [items, selectedCodes])

  const toggleCompare = (code) => {
    setSelectedCodes((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code].slice(-3)))
  }

  const clearFilters = () => {
    setKeyword('')
    setActiveCategory('all')
    setActiveTag('')
    setSortKey('featured')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,white_42%,#f8fafc)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/70 backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" />
                React + Tailwind 商品列表沙盒
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                先驗證元件化手感，再決定正式站要不要往 React 重構
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                這版只聚焦商品列表區：搜尋、分類、標籤、比較列、話術抽屜。目的不是複製正式站，而是驗證未來若改成 React + Tailwind，操作節奏與維護方式能不能更清楚。
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
              <MetricCard icon={LayoutGrid} label="總品項" value={items.length} hint="以 merged-feed.json 實際資料作為沙盒樣本" />
              <MetricCard icon={ScanSearch} label="目前篩選" value={filtered.length} hint="搜尋、分類、標籤、排序都走同一層 state" />
              <MetricCard icon={Star} label="比較列" value={compareItems.length} hint="先驗證 2–3 品比較的實用性" />
            </div>
          </div>
        </section>

        <section className="sticky top-4 z-30 rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜尋商品名稱、代碼、話術標題、標籤"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 sm:w-auto">
                <div className="relative min-w-[180px] flex-1 sm:flex-none">
                  <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="featured">預設排序</option>
                    <option value="new">新品優先</option>
                    <option value="price-asc">價格低到高</option>
                    <option value="price-desc">價格高到低</option>
                    <option value="name">名稱排序</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  清除條件
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_META.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveCategory(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeCategory === item.key
                      ? `bg-gradient-to-r ${item.tone} shadow-sm`
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 inline-flex items-center gap-2 text-sm text-slate-500">
                <Tags className="h-4 w-4" />
                熱門標籤
              </div>
              {allTags.map((tag) => (
                <TagPill key={tag} active={activeTag === tag} onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}>
                  #{tag}
                </TagPill>
              ))}
            </div>
          </div>
        </section>

        {compareItems.length > 0 ? (
          <section className="rounded-[32px] border border-slate-900 bg-slate-900 p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs tracking-wide text-white/60">比較列</p>
                <h2 className="mt-1 text-lg font-semibold">正在比較 {compareItems.length} 項商品</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {compareItems.map((item) => (
                  <button key={item.code} onClick={() => setActiveProduct(item)} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85 transition hover:bg-white/15">
                    {item.name}
                  </button>
                ))}
                <button onClick={() => setSelectedCodes([])} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                  清空比較
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            正在載入 merged-feed.json...
          </section>
        ) : error ? (
          <section className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
            {error}
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  selected={selectedCodes.includes(product.code)}
                  onToggleCompare={toggleCompare}
                  onOpen={setActiveProduct}
                />
              ))}
            </AnimatePresence>
          </section>
        )}
      </div>

      <DetailPanel product={activeProduct} onClose={() => setActiveProduct(null)} />
    </div>
  )
}
