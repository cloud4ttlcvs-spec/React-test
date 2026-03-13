import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  Tags,
  ArrowUpDown,
  Star,
  LayoutGrid,
  PanelTop,
  Layers3,
  SlidersHorizontal,
} from "lucide-react";

const PRODUCTS = [
  {
    "code": "341371-12",
    "name": "烏梅黑麥汁(六入)*4",
    "category": "保健飲品（箱購｜配送）",
    "price": 672,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E7%83%8F%E6%A2%85%E9%BB%91%E9%BA%A5%E6%B1%816%E5%85%A5.jpeg",
    "title": "黑麥汁．烏梅",
    "content": "添加烏梅風味，酸甜開胃。",
    "tags": ["麥汁", "黑麥汁", "烏梅"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "341368-12",
    "name": "紅麴黑麥汁(六入) *4",
    "category": "保健飲品（箱購｜配送）",
    "price": 672,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E7%B4%85%E9%BA%B4%E9%BB%91%E9%BA%A5%E6%B1%816%E5%85%A5.jpeg",
    "title": "黑麥汁．紅麴",
    "content": "添加紅麴成分，風味更有層次。",
    "tags": ["麥汁", "黑麥汁", "紅麴"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "341369-12",
    "name": "桂圓黑麥汁(六入)*4",
    "category": "保健飲品（箱購｜配送）",
    "price": 672,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E6%A1%82%E5%9C%93%E9%BB%91%E9%BA%A5%E6%B1%816%E5%85%A5.jpeg",
    "title": "黑麥汁．桂圓",
    "content": "添加桂圓風味，口感溫潤順口。",
    "tags": ["麥汁", "黑麥汁", "桂圓"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "341372-12",
    "name": "原味黑麥汁(六入)*4",
    "category": "保健飲品（箱購｜配送）",
    "price": 672,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E5%8E%9F%E5%91%B3%E9%BB%91%E9%BA%A5%E6%B1%816%E5%85%A5.jpeg",
    "title": "黑麥汁．原味",
    "content": "經典原味黑麥汁，減糖好喝。",
    "tags": ["麥汁", "黑麥汁", "原味"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "34130014-12",
    "name": "纖麥汁(六入)*4",
    "category": "保健飲品*（箱購｜配送）",
    "price": 840,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%BA%96%E9%BA%A5%E6%B1%81-%E5%85%AD%E5%85%A5.jpg",
    "title": "啤酒花．胜肽．纖麥汁",
    "content": "添加機能性異麥芽寡醣、大麥苗粉、大豆胜肽與啤酒花，作為日常飲用的多元搭配。",
    "tags": ["啤酒花", "麥汁", "胜肽", "寡醣"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "37110009-12",
    "name": "安可健納豆紅麴+鉻雙效膠囊",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1200,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/9252229dd4c45dc2f475b07dffe32591b5fb1af0/%E5%AE%89%E5%8F%AF%E5%81%A5%E7%B4%8D%E8%B1%86%E7%B4%85%E9%BA%B4%2B%E9%89%BB%E9%9B%99%E6%95%88%E8%86%A0%E5%9B%8A.png",
    "title": "紅麴．納豆．Q10",
    "content": "選用 MIT 紅麴、納豆激酶、天然來源 Q10 與鉻配方，成分組合完整，日常補給更方便。",
    "tags": ["紅麴", "納豆", "Q10", "鉻", "膠囊"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "37110010-12",
    "name": "益立捷",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1690,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%9B%8A%E7%AB%8B%E6%8D%B7.png",
    "title": "活力不卡卡．關鍵成分足量添加",
    "content": "添加UCII®、橄欖多酚與啤酒花萃取，一天一錠，食用便利，舒適有感。",
    "tags": ["UCII", "橄欖多酚", "啤酒花"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "375156-12",
    "name": "紅麴膠囊(健康食品認證)",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1300,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E5%AE%89%E5%8F%AF%E5%81%A5%E7%B4%85%E9%BA%B4%E8%86%A0%E5%9B%8A.png",
    "title": "紅麴．膠囊",
    "content": "選用經篩選的紅麴菌種製成，品質控管嚴謹，作為日常補給選擇。",
    "tags": ["膠囊", "紅麴"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "375132-12",
    "name": "納豆紅麴膠囊",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1500,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E5%AE%89%E5%8F%AF%E5%81%A5%E7%B4%8D%E8%B1%86%E7%B4%85%E9%BA%B4%E8%86%A0%E5%9B%8A.png",
    "title": "紅麴．納豆",
    "content": "結合紅麴菌種與高安定性納豆菌孢子，成分搭配完整，日常食用方便。",
    "tags": ["膠囊", "紅麴", "納豆"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "37110007-12",
    "name": "深海魚油軟膠囊",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 500,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E6%B7%B1%E6%B5%B7%E9%AD%9A%E6%B2%B9%E8%BB%9F%E8%86%A0%E5%9B%8A.png",
    "title": "魚油．Omega-3",
    "content": "內含 Omega-3 不飽和脂肪酸，提供 EPA 與 DHA。符合國際魚油五星標準（IFOS 5 star），品質安心。",
    "tags": ["膠囊", "魚油", "DHA", "EPA"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "385104-12",
    "name": "葡萄糖胺複方錠",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 990,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E8%91%A1%E8%90%84%E7%B3%96%E8%83%BA%E8%86%A0%E9%8C%A0.png",
    "title": "葡萄糖胺．胜肽．營養",
    "content": "選用葡萄糖胺與酪蛋白水解物含 CPP 等成分，作為日常營養補給搭配。",
    "tags": ["胜肽", "葡萄糖胺", "營養"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "375165-12",
    "name": "葉黃素軟膠囊",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1350,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E8%91%89%E9%BB%83%E7%B4%A0%E8%BB%9F%E8%86%A0%E5%9B%8A.png",
    "title": "葉黃素．魚油．DHA",
    "content": "含魚油（DHA、EPA）、大豆油、葉黃素與維生素 E 等成分，作為日常補給選擇。",
    "tags": ["膠囊", "葉黃素", "魚油", "DHA", "EPA"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "385102-12",
    "name": "茄紅南瓜子油軟膠囊",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 890,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E8%8C%84%E7%B4%85%E5%8D%97%E7%93%9C%E5%AD%90%E6%B2%B9%E8%BB%9F%E8%86%A0%E5%9B%8A.png",
    "title": "南瓜子油．茄紅",
    "content": "南瓜子油含多種不飽和脂肪酸，搭配蕃茄萃取物，成分搭配完整。",
    "tags": ["膠囊", "南瓜子油", "茄紅"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "375175-12",
    "name": "台啤酵母錠(食品)",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 499,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E9%85%B5%E6%AF%8D%E9%8C%A0.png",
    "title": "台啤酵母．維生素 B 群",
    "content": "含啤酒酵母、綜合維生素 B 群與礦物質，作為日常營養補給選擇。",
    "tags": ["維生素B群", "酵母"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "37110011-12",
    "name": "酵母鋅-挺立佳",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1050,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E9%85%B5%E6%AF%8D%E9%8B%85-%E6%8C%BA%E7%AB%8B%E4%BD%B3.png",
    "title": "蛋白鋅．好吸收",
    "content": "含鋅酵母、BCAA 支鏈胺基酸與黑胡椒萃取，作為日常補給使用。",
    "tags": ["鋅", "BCAA", "酵母"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "375163-12",
    "name": "金牌啤酒酵母粉",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 420,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E9%87%91%E7%89%8C%E5%95%A4%E9%85%92%E9%85%B5%E6%AF%8D%E7%B2%89.png",
    "title": "酵母粉．營養補給",
    "content": "選用啤酒酵母粉，作為日常營養補給。可搭配牛奶、豆漿、湯品與粥品。",
    "tags": ["酵母", "酵母粉"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "37110008-12",
    "name": "酵母B群益生菌",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 850,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E9%85%B5%E6%AF%8DB%E7%BE%A4%E7%9B%8A%E7%94%9F%E8%8F%8C.png",
    "title": "酵母B群．益生菌",
    "content": "添加益生菌、綜合維生素 B 群與鉻，作為日常營養補給搭配。",
    "tags": ["益生菌", "維生素B群", "酵母"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "385161-12",
    "name": "精力湯",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 800,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E7%B2%BE%E5%8A%9B%E6%B9%AF.png",
    "title": "養生配方．精力湯",
    "content": "含薏仁、山藥、紅蘿蔔、高麗菜、香菇、酵母抽出物等多種食材，適合作為日常沖泡飲用。",
    "tags": ["酵母", "沖泡"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "37110012-12",
    "name": "益生菌-順暢佳(30包/盒)",
    "category": "保健食品\n單件9折、3件(含)以上7折",
    "price": 1000,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%9B%8A%E7%94%9F%E8%8F%8C-%E9%A0%86%E6%9A%A2%E4%BD%B3(30%E5%8C%85-%E7%9B%92).png",
    "title": "專利益生菌．酵母胜肽",
    "content": "使用專利益生菌與酵母胜肽等成分，搭配膳食纖維，作為日常補給選擇。",
    "tags": ["益生菌", "胜肽"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "37110013-12",
    "name": "益生菌-順暢佳(90包/盒)",
    "category": "保健食品-買一送一",
    "price": 3000,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%9B%8A%E7%94%9F%E8%8F%8C-%E9%A0%86%E6%9A%A2%E4%BD%B3(90%E5%8C%85-%E7%9B%92).png",
    "title": "專利益生菌．酵母胜肽",
    "content": "使用專利益生菌與酵母胜肽等成分，搭配膳食纖維，作為日常補給選擇。",
    "tags": ["益生菌", "胜肽"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "37110014-12",
    "name": "瑪卡鋅-衝勁佳",
    "category": "保健食品-買一送一",
    "price": 1500,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%91%AA%E5%8D%A1%E9%8B%85-%E8%A1%9D%E5%8B%81%E4%BD%B3.png",
    "title": "馬卡．鋅",
    "content": "添加瑪卡、BCAA 支鏈胺基酸與鋅酵母，作為日常補給搭配。",
    "tags": ["鋅", "馬卡", "BCAA"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "37110015-12",
    "name": "魚胜肽胜肽飲(10包/盒)",
    "category": "保健食品-買一送一",
    "price": 2500,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E9%AD%9A%E8%83%9C%E8%82%BD%E8%83%9C%E8%82%BD%E9%A3%B2(10%E5%8C%85-%E7%9B%92).png",
    "title": "雙胜肽．營養補給",
    "content": "添加魚類小分子膠原胜肽與酵母胜肽，搭配維生素 C，作為營養補給搭配。",
    "tags": ["魚胜肽", "胜肽", "酵母"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381026-12",
    "name": "VINATA 酒粕面膜(單片)1片裝",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 99,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%9D%A2%E8%86%9C.png",
    "title": "酒粕面膜",
    "content": "使用酒粕及 8 種胺基酸來源保濕成分，讓敷面同步感受潤澤與舒適。",
    "tags": ["面膜", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381090-12",
    "name": "VINATA酒粕逆齡活膚青春露",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1280,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E9%9C%B2.png",
    "title": "酒粕青春露",
    "content": "結合酒粕與植萃保濕成分，作為日常保養第一步，質地清爽滑順。",
    "tags": ["青春露", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381096-12",
    "name": "VINATA酒粕逆齡活膚青春精華液",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1380,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E7%B2%BE%E8%8F%AF%E6%B6%B2.png",
    "title": "酒粕精華液",
    "content": "含酒粕來源保濕成分與多重植萃，質地柔滑，保養使用感佳。",
    "tags": ["精華液", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381099-12",
    "name": "VINATA酒粕逆齡活膚青春凍膜",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1280,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E5%87%8D%E8%86%9C.png",
    "title": "酒粕凍膜",
    "content": "夜間保養可搭配使用，質地清透、延展性佳，提供肌膚潤澤感。",
    "tags": ["凍膜", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381097-12",
    "name": "VINATA酒粕逆齡活膚青春乳霜",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1380,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E4%B9%B3%E9%9C%9C.png",
    "title": "酒粕乳霜",
    "content": "搭配酒粕來源成分與植萃，作為日常保養最後一道程序，質地細緻。",
    "tags": ["乳霜", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381095-12",
    "name": "VINATA酒粕逆齡活膚青春眼霜",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1080,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E7%9C%BC%E9%9C%9C.png",
    "title": "酒粕眼霜",
    "content": "眼周保養用，質地滋潤而不厚重，可搭配日常保養程序。",
    "tags": ["眼霜", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381094-12",
    "name": "VINATA酒粕逆齡活膚青春雙效潔顏慕斯",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 780,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/VINATA%E9%85%92%E7%B2%95%E9%80%86%E9%BD%A1%E6%B4%BB%E8%86%9A%E9%9D%92%E6%98%A5%E9%9B%99%E6%95%88%E6%BD%94%E9%A1%8F%E6%85%95%E6%96%AF.png",
    "title": "酒粕潔顏慕斯",
    "content": "泡沫細緻綿密，清潔同時兼顧舒適洗感。",
    "tags": ["潔顏", "酒粕"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381104-12",
    "name": "VINATA酒粕極潤青春面膜 5片裝",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 580,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E6%A5%B5%E6%BD%A4%E9%9D%92%E6%98%A5%E9%9D%A2%E8%86%9C%205%E7%89%87%E8%A3%9D.png",
    "title": "酒粕極潤青春面膜",
    "content": "融合 8 種胺基酸、甘油、玻尿酸與維他命 B3 等成分，保濕敷感佳。",
    "tags": ["面膜", "酒粕", "玻尿酸"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381105-12",
    "name": "VINATA酒粕水感青春露 120ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1180,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E6%B0%B4%E6%84%9F%E9%9D%92%E6%98%A5%E9%9C%B2%20120ml.png",
    "title": "酒粕水感青春露",
    "content": "結合酒粕發酵濾液與高保濕配方，清爽中帶有潤澤感。",
    "tags": ["青春露", "酒粕", "玻尿酸"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381106-12",
    "name": "VINATA酒粕彈潤青春精華液 30ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1280,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E5%BD%88%E6%BD%A4%E9%9D%92%E6%98%A5%E7%B2%BE%E8%8F%AF%E6%B6%B2%2030ml.png",
    "title": "酒粕彈潤青春精華液",
    "content": "結合酒粕發酵濾液、玻尿酸與多元保濕成分，質地柔滑細緻。",
    "tags": ["精華液", "酒粕", "玻尿酸"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381107-12",
    "name": "VINATA酒粕緊緻青春霜 50ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1280,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E7%B7%8A%E7%B7%BB%E9%9D%92%E6%98%A5%E9%9C%9C%2050ml.png",
    "title": "酒粕緊緻青春霜",
    "content": "乳霜質地細緻滑順，搭配保濕型成分，適合作為保養收尾。",
    "tags": ["乳霜", "酒粕", "玻尿酸"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381108-12",
    "name": "VINATA酒粕亮眼青春精華 15ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 980,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E4%BA%AE%E7%9C%BC%E9%9D%92%E6%98%A5%E7%B2%BE%E8%8F%AF%2015ml.png",
    "title": "酒粕亮眼青春精華",
    "content": "眼周精華型保養，質地滑順，適合搭配日夜保養程序使用。",
    "tags": ["眼部", "酒粕"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381109-12",
    "name": "VINATA酒粕柔膚青春潔顏慕斯 150ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 720,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E6%9F%94%E8%86%9A%E9%9D%92%E6%98%A5%E6%BD%94%E9%A1%8F%E6%85%95%E6%96%AF%20150ml.png",
    "title": "酒粕柔膚青春潔顏慕斯",
    "content": "泡沫細緻綿密，洗感柔和，適合作為日常清潔第一步。",
    "tags": ["潔顏", "酒粕"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381110-12",
    "name": "VINATA酒粕高保濕青春凍膜 80ml",
    "category": "美容自由配_單件9折_2件85折_3件以上79折",
    "price": 1180,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/VINATA%E9%85%92%E7%B2%95%E9%AB%98%E4%BF%9D%E6%BF%95%E9%9D%92%E6%98%A5%E5%87%8D%E8%86%9C%2080ml.png",
    "title": "酒粕高保濕青春凍膜",
    "content": "可作為夜間保養加強使用，清透凝凍質地帶來舒適膚感。",
    "tags": ["凍膜", "酒粕", "玻尿酸"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381010-12",
    "name": "青春露體驗瓶 30ml",
    "category": "",
    "price": 99,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E9%9D%92%E6%98%A5%E9%9C%B2%E9%AB%94%E9%A9%97%E7%93%B6%2030ml.png",
    "title": "青春露體驗瓶",
    "content": "體驗用規格，適合作為嘗試與導購切入。",
    "tags": ["青春露", "體驗瓶"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381011-12",
    "name": "精華液體驗瓶 10ml",
    "category": "",
    "price": 99,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E7%B2%BE%E8%8F%AF%E6%B6%B2%E9%AB%94%E9%A9%97%E7%93%B6%2010ml.png",
    "title": "精華液體驗瓶",
    "content": "體驗用精華液小容量，適合作為試用與組合導購。",
    "tags": ["精華液", "體驗瓶"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381012-12",
    "name": "青春霜體驗瓶 10g",
    "category": "",
    "price": 99,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E9%9D%92%E6%98%A5%E9%9C%9C%E9%AB%94%E9%A9%97%E7%93%B6%2010g.png",
    "title": "青春霜體驗瓶",
    "content": "體驗型乳霜規格，可作為嘗鮮與加購切入。",
    "tags": ["乳霜", "體驗瓶"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381005-12",
    "name": "冰河胺基酸濃密潤澤洗髮精 500ml",
    "category": "清潔用品 單件85折、2件(含)以上8折-正品",
    "price": 650,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E6%B4%97%E9%AB%AE%E7%B2%BE.png",
    "title": "洗髮精．冰河胺基酸",
    "content": "洗感清爽，泡沫細緻綿密，適合作為日常清潔使用。",
    "tags": ["洗髮精", "清潔"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381007-12",
    "name": "啤酒花舒活去角質洗顏泥 200g",
    "category": "清潔用品 單件85折、2件(含)以上8折",
    "price": 490,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E5%95%A4%E9%85%92%E8%8A%B1%E8%88%92%E6%B4%BB%E5%8E%BB%E8%A7%92%E8%B3%AA%E6%B4%97%E9%A1%8F%E6%B3%A5%20200g.png",
    "title": "啤酒花洗顏泥",
    "content": "洗感清爽，泥狀質地延展性佳，適合日常深層潔淨需求。",
    "tags": ["洗顏泥", "啤酒花", "清潔"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381008-12",
    "name": "啤酒花沁涼提神沐浴露 500ml",
    "category": "清潔用品 單件85折、2件(含)以上8折",
    "price": 490,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E5%95%A4%E9%85%92%E8%8A%B1%E6%B2%81%E6%B6%BC%E6%8F%90%E7%A5%9E%E6%B2%90%E6%B5%B4%E9%9C%B2%20500ml.png",
    "title": "啤酒花沐浴露",
    "content": "清爽型沐浴露，洗後膚感舒適，適合作為夏季主打清潔品。",
    "tags": ["沐浴露", "啤酒花", "清潔"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381006-12",
    "name": "冰河胺基酸保濕滋潤沐浴露 500ml",
    "category": "清潔用品 單件85折、2件(含)以上8折",
    "price": 650,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/refs/heads/main/%E6%B2%90%E6%B5%B4%E4%B9%B3.png",
    "title": "冰河胺基酸沐浴露",
    "content": "質地柔和細緻，適合作為日常保濕型清潔選擇。",
    "tags": ["沐浴露", "清潔"],
    "isNew": false,
    "spec": ""
  },
  {
    "code": "381013-12",
    "name": "胺基酸濃密潤澤洗髮精補充包 450ml",
    "category": "清潔用品 單件85折、2件(含)以上8折-補充包",
    "price": 420,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E8%83%BA%E5%9F%BA%E9%85%B8%E6%BF%83%E5%AF%86%E6%BD%A4%E6%BE%A4%E6%B4%97%E9%AB%AE%E7%B2%BE%E8%A3%9C%E5%85%85%E5%8C%85%20450ml.png",
    "title": "洗髮精補充包",
    "content": "補充包規格，方便回購使用。",
    "tags": ["洗髮精", "補充包", "清潔"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "381014-12",
    "name": "沐浴露補充包 450ml",
    "category": "清潔用品 單件85折、2件(含)以上8折-補充包",
    "price": 420,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E6%B2%90%E6%B5%B4%E9%9C%B2%E8%A3%9C%E5%85%85%E5%8C%85%20450ml.png",
    "title": "沐浴露補充包",
    "content": "補充包規格，適合作為回購搭配。",
    "tags": ["沐浴露", "補充包", "清潔"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "391001-12",
    "name": "台酒生技潔淨洗衣球 12顆",
    "category": "清潔用品 單件85折、2件(含)以上8折-洗衣系列",
    "price": 199,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E6%B4%97%E8%A1%A3%E7%90%83%2012%E9%A1%86.png",
    "title": "潔淨洗衣球",
    "content": "使用便利，適合作為日常洗衣清潔搭配。",
    "tags": ["洗衣球", "清潔"],
    "isNew": true,
    "spec": ""
  },
  {
    "code": "391002-12",
    "name": "台酒生技酵素濃縮洗衣精 1800ml",
    "category": "清潔用品 單件85折、2件(含)以上8折-洗衣系列",
    "price": 249,
    "photo": "https://raw.githubusercontent.com/cloud4ttlcvs-spec/product-images/main/%E6%BF%83%E7%B8%AE%E6%B4%97%E8%A1%A3%E7%B2%BE%201800ml.png",
    "title": "酵素濃縮洗衣精",
    "content": "大容量規格，適合家庭清潔使用。",
    "tags": ["洗衣精", "清潔"],
    "isNew": true,
    "spec": ""
  }
];

const CATEGORY_META = [
  {
    key: "all",
    label: "全部",
    anchor: "all",
    tone: "border-slate-200 bg-white text-slate-700",
    surface: "from-slate-50 to-white",
    section: "border-slate-200/80 bg-white/90",
    accent: "bg-slate-900"
  },
  {
    key: "保健飲品",
    label: "保健飲品",
    anchor: "drinks",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    surface: "from-amber-50 to-yellow-50",
    section: "border-amber-200/80 bg-white/90",
    accent: "bg-amber-500"
  },
  {
    key: "保健食品",
    label: "保健食品",
    anchor: "health",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    surface: "from-emerald-50 to-lime-50",
    section: "border-emerald-200/80 bg-white/90",
    accent: "bg-emerald-500"
  },
  {
    key: "美容產品",
    label: "美容產品",
    anchor: "beauty",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
    surface: "from-rose-50 to-pink-50",
    section: "border-rose-200/80 bg-white/90",
    accent: "bg-rose-500"
  },
  {
    key: "清潔產品",
    label: "清潔產品",
    anchor: "cleaning",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-800",
    surface: "from-cyan-50 to-sky-50",
    section: "border-cyan-200/80 bg-white/90",
    accent: "bg-cyan-500"
  },
  {
    key: "其他",
    label: "其他",
    anchor: "others",
    tone: "border-violet-200 bg-violet-50 text-violet-800",
    surface: "from-violet-50 to-fuchsia-50",
    section: "border-violet-200/80 bg-white/90",
    accent: "bg-violet-500"
  }
];

function normalizeCategory(raw) {
  const value = raw || "";
  if (value.includes("美容")) return "美容產品";
  if (value.includes("清潔")) return "清潔產品";
  if (value.includes("飲品") || value.includes("黑麥汁")) return "保健飲品";
  if (value.includes("保健食品") || value.includes("買一送一")) return "保健食品";
  return "其他";
}

function currency(value) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function sortProducts(items, sortKey) {
  const arr = [...items];
  switch (sortKey) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
    case "new":
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.name.localeCompare(b.name, "zh-Hant"));
    default:
      return arr.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  }
}

function getMeta(key) {
  return CATEGORY_META.find((item) => item.key === key) || CATEGORY_META[0];
}

function MetricCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-sm shadow-slate-200/70 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-2 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FilterPill({ active, children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${className} ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function ProductRowCard({ product, selected, onToggleCompare, onOpen }) {
  const meta = getMeta(product.group);
  return (
    <motion.button
      layout
      whileHover={{ y: -1 }}
      onClick={() => onOpen(product)}
      className="w-full text-left"
    >
      <div className="group flex h-full gap-3 rounded-[26px] border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:shadow-md md:gap-4 md:p-4">
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:h-28 md:w-28">
            <img
              src={product.photo}
              alt={product.name}
              className="h-full w-full object-contain p-1.5 transition duration-300 group-hover:scale-[1.03]"
            />
          </div>
          {product.isNew ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
              NEW
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.tone}`}>
                  {product.group}
                </span>
                <span className="text-[11px] text-slate-400">{product.code}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900 md:text-base">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-600">{product.title}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                {product.content || "可在此放入正式站話術摘要、導購主訴求與近期活動重點。"}
              </p>
            </div>

            <div className="flex shrink-0 items-end justify-between gap-3 md:min-w-[168px] md:flex-col md:items-end">
              <div className="text-right">
                <p className="text-[11px] tracking-wide text-slate-400">建議售價</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{currency(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(product.code);
                  }}
                  className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                    selected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {selected ? "已比較" : "加入比較"}
                </button>
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-400 transition group-hover:text-slate-700">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function DetailPanel({ product, onClose }) {
  if (!product) return null;
  const meta = getMeta(product.group);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: "spring", stiffness: 250, damping: 24 }}
          className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-t-[32px] border border-white/60 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs tracking-wide text-slate-400">商品話術卡 / 沙盒評估視窗</p>
              <h3 className="truncate text-lg font-semibold text-slate-900">{product.name}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 overflow-y-auto p-5 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className={`rounded-[28px] border bg-gradient-to-br ${meta.surface} p-5`}>
                <div className="mx-auto flex h-64 items-center justify-center rounded-[24px] border border-white/80 bg-white/80 p-4">
                  <img src={product.photo} alt={product.name} className="max-h-full w-full object-contain" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>{product.group}</span>
                  {product.isNew ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">新品</span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs tracking-wide text-slate-400">簡要評估</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>• 此版改成正式站感較強的列表式瀏覽，圖片比例更保守。</li>
                  <li>• 商品資訊密度明顯提高，較適合大量品項快速掃讀。</li>
                  <li>• 若後續導入促銷與話術提示，這個版型會比大圖卡更穩。</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <p className="text-xs tracking-wide text-slate-400">主訴求</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{product.title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{product.content}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                  <p className="text-xs tracking-wide text-slate-400">商品資訊</p>
                  <dl className="mt-3 space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between gap-4"><dt>商品代碼</dt><dd className="font-medium text-slate-900">{product.code}</dd></div>
                    <div className="flex justify-between gap-4"><dt>分類</dt><dd className="font-medium text-slate-900">{product.group}</dd></div>
                    <div className="flex justify-between gap-4"><dt>價格</dt><dd className="font-medium text-slate-900">{currency(product.price)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>規格</dt><dd className="font-medium text-slate-900">{product.spec || "—"}</dd></div>
                  </dl>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                  <p className="text-xs tracking-wide text-slate-400">標籤切入</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.tags.length ? (
                      product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">尚未設定標籤</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-900 p-5 text-white">
                <p className="text-xs tracking-wide text-white/55">下一步可疊加的正式站元素</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/85">
                  <li>• 促銷角標與活動提示條</li>
                  <li>• 話術卡 / FAQ / promo copy 的正式資料欄位</li>
                  <li>• 商品影音與更多素材入口</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionBlock({ title, count, children, meta, anchor }) {
  return (
    <section id={anchor} className={`scroll-mt-36 rounded-[30px] border ${meta.section} p-4 shadow-sm shadow-slate-200/60 md:p-5`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-1.5 rounded-full ${meta.accent}`} />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">目前 {count} 項商品</p>
          </div>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-sm font-medium ${meta.tone}`}>
          {title}
        </span>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

export default function TtlBioTechProductListSandbox() {
  const normalized = useMemo(
    () => PRODUCTS.map((product) => ({ ...product, group: normalizeCategory(product.category) })),
    []
  );

  const allTags = useMemo(() => {
    const counter = new Map();
    normalized.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)));
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag);
  }, [normalized]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    normalized.forEach((item) => counts.set(item.group, (counts.get(item.group) || 0) + 1));
    return counts;
  }, [normalized]);

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState("");
  const [sortKey, setSortKey] = useState("featured");
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const base = normalized.filter((item) => {
      const categoryOk = activeCategory === "all" || item.group === activeCategory;
      const tagOk = !activeTag || item.tags.includes(activeTag);
      const haystack = [item.name, item.title, item.content, item.code, ...item.tags].join(" ").toLowerCase();
      const keywordOk = !q || haystack.includes(q);
      return categoryOk && tagOk && keywordOk;
    });
    return sortProducts(base, sortKey);
  }, [normalized, keyword, activeCategory, activeTag, sortKey]);

  const groupedSections = useMemo(() => {
    const groups = new Map();
    filtered.forEach((item) => {
      const key = item.group || "其他";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return CATEGORY_META.filter((meta) => meta.key !== "all" && groups.has(meta.key)).map((meta) => ({
      ...meta,
      items: groups.get(meta.key) || []
    }));
  }, [filtered]);

  const compareItems = useMemo(
    () => normalized.filter((item) => selectedCodes.includes(item.code)),
    [normalized, selectedCodes]
  );

  const toggleCompare = (code) => {
    setSelectedCodes((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code].slice(-3)));
  };

  const clearFilters = () => {
    setKeyword("");
    setActiveCategory("all");
    setActiveTag("");
    setSortKey("featured");
  };

  const openCategoryAnchor = (key) => {
    setActiveCategory(key);
    const meta = getMeta(key);
    requestAnimationFrame(() => {
      document.getElementById(meta.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,white_34%,#f8fafc)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
        <section className="rounded-[26px] border border-white/70 bg-white/95 p-4 shadow-sm shadow-slate-200/70 backdrop-blur md:rounded-[32px] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white md:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                React 商品列表沙盒 v2｜正式站感強化版
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                改成更接近正式站的緊湊列表瀏覽，先驗證手機檢視是否更順
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base md:leading-7">
                這版優先處理手機檢視：縮短標題區高度、降低固定列占比，先把首屏可觀看商品的空間拉回來，再逐步補齊促銷與話術層。
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 lg:max-w-xl lg:gap-3">
              <MetricCard icon={Layers3} label="總品項" value={normalized.length} hint="真實商品資料樣本" />
              <MetricCard icon={LayoutGrid} label="目前篩選" value={filtered.length} hint="搜尋與分類整合" />
              <MetricCard icon={Star} label="比較列" value={compareItems.length} hint="持續評估是否保留" />
            </div>
          </div>
        </section>

        <section className="sticky top-2 z-40 rounded-[24px] border border-white/70 bg-white/92 p-3 shadow-lg shadow-slate-200/50 backdrop-blur md:top-4 md:rounded-[30px] md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:hidden">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜尋商品名稱、代碼、標籤"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                />
              </div>
              <button
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                篩選
                <ChevronDown className={`h-4 w-4 transition ${mobileFiltersOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="hidden flex-col gap-4 md:flex">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜尋商品名稱、代碼、主訴求或標籤"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 sm:w-auto">
                  <div className="relative min-w-[185px] flex-1 sm:flex-none">
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
                {CATEGORY_META.filter((item) => item.key !== "其他").map((item) => (
                  <FilterPill
                    key={item.key}
                    active={activeCategory === item.key || (item.key === "all" && activeCategory === "all")}
                    onClick={() => (item.key === "all" ? clearFilters() : openCategoryAnchor(item.key))}
                    className={activeCategory === item.key || (item.key === "all" && activeCategory === "all") ? "" : item.tone}
                  >
                    {item.label}
                    {item.key !== "all" ? ` · ${categoryCounts.get(item.key) || 0}` : ` · ${normalized.length}`}
                  </FilterPill>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-1 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Tags className="h-4 w-4" />
                  熱門標籤
                </div>
                {allTags.map((tag) => (
                  <FilterPill key={tag} active={activeTag === tag} onClick={() => setActiveTag((prev) => (prev === tag ? "" : tag))}>
                    #{tag}
                  </FilterPill>
                ))}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {mobileFiltersOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden md:hidden"
                >
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={sortKey}
                          onChange={(e) => setSortKey(e.target.value)}
                          className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
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
                        className="h-11 shrink-0 rounded-2xl border border-slate-200 px-3 text-sm font-medium text-slate-600"
                      >
                        清除
                      </button>
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {CATEGORY_META.filter((item) => item.key !== "其他").map((item) => (
                        <FilterPill
                          key={item.key}
                          active={activeCategory === item.key || (item.key === "all" && activeCategory === "all")}
                          onClick={() => (item.key === "all" ? clearFilters() : openCategoryAnchor(item.key))}
                          className={`whitespace-nowrap ${activeCategory === item.key || (item.key === "all" && activeCategory === "all") ? "" : item.tone}`}
                        >
                          {item.label}
                        </FilterPill>
                      ))}
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {allTags.map((tag) => (
                        <FilterPill
                          key={tag}
                          active={activeTag === tag}
                          onClick={() => setActiveTag((prev) => (prev === tag ? "" : tag))}
                          className="whitespace-nowrap"
                        >
                          #{tag}
                        </FilterPill>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {compareItems.length ? (
          <section className="rounded-[30px] border border-slate-900 bg-slate-900 p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs tracking-wide text-white/60">比較列</p>
                <h2 className="mt-1 text-lg font-semibold">正在比較 {compareItems.length} 項商品</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {compareItems.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setActiveProduct(item)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85 transition hover:bg-white/15"
                  >
                    {item.name}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedCodes([])}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  清空比較
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-5">
          {groupedSections.length ? (
            groupedSections.map((section) => (
              <SectionBlock
                key={section.key}
                title={section.label}
                count={section.items.length}
                meta={section}
                anchor={section.anchor}
              >
                <AnimatePresence mode="popLayout">
                  {section.items.map((product) => (
                    <ProductRowCard
                      key={product.code}
                      product={product}
                      selected={selectedCodes.includes(product.code)}
                      onToggleCompare={toggleCompare}
                      onOpen={setActiveProduct}
                    />
                  ))}
                </AnimatePresence>
              </SectionBlock>
            ))
          ) : (
            <section className="rounded-[30px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm shadow-slate-200/60">
              <PanelTop className="mx-auto h-8 w-8 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">目前沒有符合條件的商品</h2>
              <p className="mt-2 text-sm text-slate-500">可調整搜尋字詞、分類或標籤，再重新檢視列表結果。</p>
            </section>
          )}
        </div>
      </div>

      <DetailPanel product={activeProduct} onClose={() => setActiveProduct(null)} />
    </div>
  );
}
