// ==========================================================================
// 1. 初期データ定義 & 状態管理
// ==========================================================================

// 初期サンプルデータ
const defaultItems = [
    // 野菜庫 (vegetables)
    { id: "v1", name: "キャベツ", category: "vegetables", unitType: "percentage", total: 100, current: 80, updatedAt: Date.now() },
    { id: "v2", name: "にんじん", category: "vegetables", unitType: "percentage", total: 100, current: 50, updatedAt: Date.now() },
    { id: "v3", name: "たまねぎ", category: "vegetables", unitType: "percentage", total: 100, current: 70, updatedAt: Date.now() },
    
    // 肉と魚 (meat-fish)
    { id: "m1", name: "豚バラ肉", category: "meat-fish", unitType: "weight", total: 400, current: 300, updatedAt: Date.now() },
    { id: "m2", name: "鶏もも肉", category: "meat-fish", unitType: "weight", total: 500, current: 500, updatedAt: Date.now() },
    { id: "m3", name: "鮭の切り身", category: "meat-fish", unitType: "weight", total: 200, current: 200, updatedAt: Date.now() },
    
    // その他・調味料 (others)
    { id: "o1", name: "しょうゆ", category: "others", unitType: "volume", total: 500, current: 350, updatedAt: Date.now() },
    { id: "o2", name: "牛乳", category: "others", unitType: "volume", total: 1000, current: 800, updatedAt: Date.now() },
    { id: "o3", name: "マヨネーズ", category: "others", unitType: "weight", total: 400, current: 250, updatedAt: Date.now() }
];

// 料理に関係のない日用品・非食品キーワード (自動で弾くため)
const nonFoodKeywords = [
    "洗剤", "ソープ", "シャンプー", "リンス", "トリートメント", "ハブラシ", "歯ブラシ", "歯磨き", "はみがき",
    "ペーパー", "ティッシュ", "ナプキン", "スポンジ", "電池", "ソックス", "靴下", "タオル", "お皿", "コップ",
    "スプーン", "フォーク", "箸", "レジ袋", "ポリ袋", "ゴミ袋", "マスク", "傘", "アルミホイル", "ラップ",
    "ジップロック", "クッキングシート", "たわし", "洗顔", "ソフター", "柔軟剤", "クリーナー", "消臭", "芳香",
    "ノート", "ペン", "鉛筆", "本", "雑誌", "切手", "ハサミ", "のり", "接着剤", "化粧", "メイク", "スキンケア",
    "ドッグフード", "キャットフード", "ペット", "タバコ", "たばこ", "煙草", "電球", "コード", "フィルター"
];

// 食材カテゴリ自動分類用キーワード
const meatFishKeywords = [
    "肉", "豚", "牛", "鶏", "バラ", "ロース", "モモ", "挽肉", "ひき肉", "ソーセージ", "ハム", "ベーコン", "ウインナー",
    "魚", "サケ", "鮭", "マグロ", "鮪", "タイ", "鯛", "アジ", "イワシ", "サバ", "鯖", "エビ", "海老", "イカ", "タコ",
    "貝", "アサリ", "しじみ", "カキ", "牡蠣", "たらこ", "明太子", "ちくわ", "かまぼこ", "サーモン", "ステーキ", "カルビ"
];

const vegetableKeywords = [
    "キャベツ", "にんじん", "人参", "たまねぎ", "玉ねぎ", "玉ネギ", "じゃがいも", "馬鈴薯", "レタス", "トマト", 
    "きゅうり", "キュウリ", "なす", "ナス", "ピーマン", "ねぎ", "ネギ", "大根", "ダイコン", "ほうれん草", "ホウレン草",
    "小松菜", "きのこ", "椎茸", "シイタケ", "しめじ", "えのき", "エリンギ", "マッシュルーム", "かぼちゃ", "南瓜", 
    "アボカド", "パセリ", "セロリ", "ブロッコリー", "アスパラ", "白菜", "もやし", "モヤシ", "ごぼう", "ゴボウ", 
    "れんこん", "レンコン", "さつまいも", "サツマイモ", "にんにく", "ニンニク", "しょうが", "ショウガ", "生姜"
];

// アプリケーションの状態
let state = {
    items: [],
    isFridgeOpen: false,
    currentOcrResults: [],      // レシピ減算の保留リスト
    currentReceiptResults: []   // レシート追加の保留リスト
};

// ==========================================================================
// 2. DOMの取得
// ==========================================================================
const fridge = document.getElementById("main-fridge");
const containerOthers = document.getElementById("container-others");
const containerMeatFish = document.getElementById("container-meat-fish");
const containerVegetables = document.getElementById("container-vegetables");

const meatFishCount = document.getElementById("meat-fish-count");
const vegetablesCount = document.getElementById("vegetables-count");
const othersCount = document.getElementById("others-count");

// モーダル・ボタン
const addBtn = document.getElementById("add-item-btn");
const scanBtn = document.getElementById("scan-recipe-btn");
const scanReceiptBtn = document.getElementById("scan-receipt-btn");

const addModal = document.getElementById("add-modal");
const scanModal = document.getElementById("scan-modal");
const receiptModal = document.getElementById("receipt-modal");

const closeAddModal = document.getElementById("close-add-modal");
const closeScanModal = document.getElementById("close-scan-modal");
const closeReceiptModal = document.getElementById("close-receipt-modal");

const addItemForm = document.getElementById("add-item-form");
const itemUnitType = document.getElementById("item-unit-type");
const totalValGroup = document.getElementById("total-val-group");
const totalLabel = document.getElementById("total-label");
const currentLabel = document.getElementById("current-label");

// レシピOCR関連のDOM
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const loadDemoBtn = document.getElementById("load-demo-btn");
const previewArea = document.getElementById("preview-area");
const imagePreview = document.getElementById("image-preview");
const ocrStatusBox = document.getElementById("ocr-status-box");
const ocrStatusText = document.getElementById("ocr-status-text");
const progressFill = document.getElementById("progress-fill");
const resultsArea = document.getElementById("results-area");
const matchingTbody = document.getElementById("matching-tbody");
const cancelScanBtn = document.getElementById("cancel-scan-btn");
const applyScanBtn = document.getElementById("apply-scan-btn");

// レシートOCR関連のDOM
const receiptDropZone = document.getElementById("receipt-drop-zone");
const receiptFileInput = document.getElementById("receipt-file-input");
const loadReceiptDemoBtn = document.getElementById("load-receipt-demo-btn");
const receiptPreviewArea = document.getElementById("receipt-preview-area");
const receiptImagePreview = document.getElementById("receipt-image-preview");
const receiptOcrStatusBox = document.getElementById("receipt-ocr-status-box");
const receiptOcrStatusText = document.getElementById("receipt-ocr-status-text");
const receiptProgressFill = document.getElementById("receipt-progress-fill");
const receiptResultsArea = document.getElementById("receipt-results-area");
const receiptTbody = document.getElementById("receipt-tbody");
const cancelReceiptBtn = document.getElementById("cancel-receipt-btn");
const applyReceiptBtn = document.getElementById("apply-receipt-btn");

const toast = document.getElementById("toast");

// ==========================================================================
// 3. アプリ初期化 & 描画ロジック
// ==========================================================================

function initApp() {
    // ローカルストレージからデータを読み込む
    const saved = localStorage.getItem("my_fridge_items");
    if (saved) {
        state.items = JSON.parse(saved);
    } else {
        state.items = [...defaultItems];
        saveToLocalStorage();
    }
    
    // Lucideアイコンの初期化
    lucide.createIcons();
    
    renderFridge();
    setupEventListeners();
}

function saveToLocalStorage() {
    localStorage.setItem("my_fridge_items", JSON.stringify(state.items));
}

// 冷蔵庫の中身を描画
function renderFridge() {
    containerOthers.innerHTML = "";
    containerMeatFish.innerHTML = "";
    containerVegetables.innerHTML = "";
    
    let others = 0;
    let meatFish = 0;
    let vegetables = 0;
    
    state.items.forEach(item => {
        const card = createItemCard(item);
        if (item.category === "others") {
            containerOthers.appendChild(card);
            others++;
        } else if (item.category === "meat-fish") {
            containerMeatFish.appendChild(card);
            meatFish++;
        } else if (item.category === "vegetables") {
            containerVegetables.appendChild(card);
            vegetables++;
        }
    });
    
    // 統計の更新
    meatFishCount.textContent = meatFish;
    vegetablesCount.textContent = vegetables;
    othersCount.textContent = others;
    
    checkEmptyShelf(containerOthers, "その他・調味料は空です");
    checkEmptyShelf(containerMeatFish, "肉と魚は空です");
    checkEmptyShelf(containerVegetables, "野菜庫は空です");
    
    lucide.createIcons();
}

function checkEmptyShelf(container, message) {
    if (container.children.length === 0) {
        const div = document.createElement("div");
        div.className = "empty-shelf-text";
        div.innerHTML = `<i data-lucide="info" style="width: 14px; height: 14px;"></i> <span>${message}</span>`;
        container.appendChild(div);
    }
}

// 食材カードのHTML要素を作成
function createItemCard(item) {
    const card = document.createElement("div");
    card.className = `item-card category-${item.category}`;
    card.dataset.id = item.id;
    
    let pct = 0;
    let qtyDisplay = "";
    
    if (item.unitType === "percentage") {
        pct = item.current;
        qtyDisplay = `<span class="qty-bold">${pct}%</span>残`;
    } else if (item.unitType === "weight") {
        pct = Math.round((item.current / item.total) * 100);
        qtyDisplay = `<span class="qty-bold">${item.current}g</span> / ${item.total}g`;
    } else if (item.unitType === "volume") {
        pct = Math.round((item.current / item.total) * 100);
        qtyDisplay = `<span class="qty-bold">${item.current}ml</span> / ${item.total}ml`;
    }
    
    pct = Math.max(0, Math.min(100, pct));
    
    card.innerHTML = `
        <div class="item-header">
            <span class="item-name" title="${item.name}">${item.name}</span>
        </div>
        <div class="item-body">
            <div class="item-qty-text">
                <span>残量</span>
                <span>${qtyDisplay}</span>
            </div>
            <div class="progress-container">
                <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
        </div>
        <div class="item-actions">
            <button class="action-btn btn-minus" title="減らす"><i data-lucide="minus"></i></button>
            <button class="action-btn btn-plus" title="増やす"><i data-lucide="plus"></i></button>
            <button class="action-btn btn-delete" title="削除"><i data-lucide="trash-2"></i></button>
        </div>
    `;
    
    card.querySelector(".btn-plus").addEventListener("click", (e) => {
        e.stopPropagation();
        adjustQuantity(item.id, 1);
    });
    
    card.querySelector(".btn-minus").addEventListener("click", (e) => {
        e.stopPropagation();
        adjustQuantity(item.id, -1);
    });
    
    card.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`「${item.name}」を冷蔵庫から取り出しますか？`)) {
            deleteItem(item.id);
        }
    });
    
    return card;
}

// ==========================================================================
// 4. 操作ロジック (手動増減・個別追加・削除)
// ==========================================================================

function adjustQuantity(id, direction) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    
    let change = 0;
    if (item.unitType === "percentage") {
        change = 10 * direction;
        item.current = Math.max(0, Math.min(100, item.current + change));
    } else if (item.unitType === "weight") {
        change = 50 * direction;
        item.current = Math.max(0, Math.min(item.total, item.current + change));
    } else if (item.unitType === "volume") {
        change = 50 * direction;
        item.current = Math.max(0, Math.min(item.total, item.current + change));
    }
    
    item.updatedAt = Date.now();
    saveToLocalStorage();
    renderFridge();
    showToast(`${item.name} の残量を変更しました`);
}

function addItem(name, category, unitType, total, current) {
    const newItem = {
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        name,
        category,
        unitType,
        total: unitType === "percentage" ? 100 : Number(total),
        current: Number(current),
        updatedAt: Date.now()
    };
    
    state.items.push(newItem);
    saveToLocalStorage();
    renderFridge();
    showToast(`${name} を冷蔵庫に追加しました`);
}

function deleteItem(id) {
    const index = state.items.findIndex(i => i.id === id);
    if (index !== -1) {
        const name = state.items[index].name;
        state.items.splice(index, 1);
        saveToLocalStorage();
        renderFridge();
        showToast(`${name} を削除しました`);
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================================================
// 5. レシピ画像OCR & 減算ロジック
// ==========================================================================

function parseRecipeText(text) {
    const lines = text.split("\n");
    const results = [];
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        const match = line.match(/^([^\s\d\(\)\[\]\{\}・:：]+)\s*(.*)$/);
        if (!match) return;
        
        const rawName = match[1].trim();
        const rawQty = match[2].trim();
        
        if (rawName.length < 1 || !rawQty) return;
        
        let numericValue = 0;
        let unit = "";
        
        const weightMatch = rawQty.match(/(\d+)\s*(g|グラム)/i);
        const volumeMatch = rawQty.match(/(\d+)\s*(ml|ミリリットル|cc)/i);
        const tbspMatch = rawQty.match(/(大さじ|大匙)\s*(\d+(\.\d+)?|半|１|２|３|４|５)/);
        const tspMatch = rawQty.match(/(小さじ|小匙)\s*(\d+(\.\d+)?|半|１|２|３|４|５)/);
        const cupMatch = rawQty.match(/(\d+)\s*(カップ)|カップ\s*(\d+)/);
        const fractionMatch = rawQty.match(/(\d+)\/(\d+)\s*(個|玉|本|パック|袋)/);
        const percentMatch = rawQty.match(/(\d+)\s*(%|パーセント|割)/);

        if (weightMatch) {
            numericValue = parseInt(weightMatch[1], 10);
            unit = "g";
        } else if (volumeMatch) {
            numericValue = parseInt(volumeMatch[1], 10);
            unit = "ml";
        } else if (tbspMatch) {
            const val = parseJapaneseNumber(tbspMatch[2]);
            numericValue = val * 15;
            unit = "ml";
        } else if (tspMatch) {
            const val = parseJapaneseNumber(tspMatch[2]);
            numericValue = val * 5;
            unit = "ml";
        } else if (cupMatch) {
            const val = parseInt(cupMatch[1] || cupMatch[3], 10);
            numericValue = val * 200;
            unit = "ml";
        } else if (fractionMatch) {
            const num = parseInt(fractionMatch[1], 10);
            const den = parseInt(fractionMatch[2], 10);
            numericValue = Math.round((num / den) * 100);
            unit = "%";
        } else if (percentMatch) {
            const val = parseInt(percentMatch[1], 10);
            numericValue = rawQty.includes("割") ? val * 10 : val;
            unit = "%";
        } else {
            const simpleNum = rawQty.match(/(\d+)/);
            if (simpleNum) {
                numericValue = parseInt(simpleNum[1], 10);
                unit = "個";
            }
        }
        
        if (numericValue > 0) {
            results.push({
                rawName,
                rawQty,
                detectedName: rawName,
                amount: numericValue,
                unit: unit || "g"
            });
        }
    });
    
    return results;
}

function parseJapaneseNumber(str) {
    if (str === "半") return 0.5;
    const normalized = str.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 1 : parsed;
}

function matchScannedItems(scannedList) {
    const matched = [];
    
    scannedList.forEach(scanned => {
        let bestMatch = null;
        let maxScore = 0;
        
        state.items.forEach(fridgeItem => {
            const score = calculateSimilarity(scanned.detectedName, fridgeItem.name);
            if (score > maxScore && score > 0.3) {
                maxScore = score;
                bestMatch = fridgeItem;
            }
        });
        
        matched.push({
            id: "match_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            scannedName: scanned.rawName,
            scannedQtyText: scanned.rawQty,
            detectedAmount: scanned.amount,
            detectedUnit: scanned.unit,
            fridgeItemId: bestMatch ? bestMatch.id : "",
            ignored: false
        });
    });
    
    return matched;
}

function calculateSimilarity(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    
    if (str1 === str2) return 1.0;
    if (str1.includes(str2) || str2.includes(str1)) {
        return Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length) * 0.9;
    }
    
    let commonChars = 0;
    const chars1 = new Set(str1);
    for (let char of str2) {
        if (chars1.has(char)) {
            commonChars++;
        }
    }
    
    return commonChars / Math.max(str1.length, str2.length);
}

// Tesseract.jsによるレシピ画像解析
async function runOCR(imageSrc) {
    ocrStatusBox.style.display = "flex";
    resultsArea.style.display = "none";
    progressFill.style.width = "0%";
    ocrStatusText.textContent = "OCRエンジンを準備しています...";
    
    if (typeof Tesseract === 'undefined') {
        console.warn("Tesseract.js is not loaded. Falling back to mock OCR.");
        ocrStatusText.textContent = "OCRライブラリがオフラインのため、擬似解析を行います...";
        
        setTimeout(() => {
            progressFill.style.width = "50%";
            ocrStatusText.textContent = "擬似テキストを抽出中...";
            
            setTimeout(() => {
                progressFill.style.width = "100%";
                const mockText = "【材料 (2人分)】\n豚バラ肉 150g\nキャベツ 1/4個\nしょうゆ 大さじ1\n牛乳 200ml";
                const parsed = parseRecipeText(mockText);
                state.currentOcrResults = matchScannedItems(parsed);
                renderMatchingResults();
                ocrStatusBox.style.display = "none";
                resultsArea.style.display = "block";
                showToast("オフラインモードで擬似解析を完了しました");
            }, 1000);
        }, 1000);
        return;
    }
    
    try {
        const worker = await Tesseract.createWorker('jpn');
        ocrStatusText.textContent = "画像を解析しています (日本語OCR)...";
        progressFill.style.width = "40%";
        
        const ret = await worker.recognize(imageSrc);
        progressFill.style.width = "90%";
        ocrStatusText.textContent = "テキスト解析中...";
        
        const text = ret.data.text;
        await worker.terminate();
        
        const parsed = parseRecipeText(text);
        if (parsed.length === 0) {
            throw new Error("画像から食材や分量を認識できませんでした。");
        }
        
        state.currentOcrResults = matchScannedItems(parsed);
        renderMatchingResults();
        
        ocrStatusBox.style.display = "none";
        resultsArea.style.display = "block";
    } catch (error) {
        console.error("OCR Error: ", error);
        alert("OCR解析に失敗しました: " + error.message + "\n(擬似解析モードで処理を続行します)");
        
        const fallbackText = "【材料 (2人分)】\n豚バラ肉 200g\nキャベツ 100g\nしょうゆ 15ml";
        const parsed = parseRecipeText(fallbackText);
        state.currentOcrResults = matchScannedItems(parsed);
        renderMatchingResults();
        ocrStatusBox.style.display = "none";
        resultsArea.style.display = "block";
    }
}

function renderMatchingResults() {
    matchingTbody.innerHTML = "";
    
    if (state.currentOcrResults.length === 0) {
        matchingTbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">食材を検出できませんでした。</td></tr>`;
        return;
    }
    
    state.currentOcrResults.forEach((result, idx) => {
        const tr = document.createElement("tr");
        if (result.ignored) tr.className = "ignored-row";
        
        let selectHtml = `<select class="match-select" data-index="${idx}">`;
        selectHtml += `<option value="">-- マッチングなし (減算しない) --</option>`;
        state.items.forEach(item => {
            const selected = item.id === result.fridgeItemId ? "selected" : "";
            const unitStr = item.unitType === "percentage" ? "%" : item.unitType === "weight" ? "g" : "ml";
            selectHtml += `<option value="${item.id}" ${selected}>${item.name} (残: ${item.current}${unitStr})</option>`;
        });
        selectHtml += `</select>`;
        
        let currentQtyText = "-";
        let afterQtyText = "-";
        let matchedItem = state.items.find(i => i.id === result.fridgeItemId);
        let reductionAmount = result.detectedAmount;
        
        if (matchedItem) {
            const unitStr = matchedItem.unitType === "percentage" ? "%" : matchedItem.unitType === "weight" ? "g" : "ml";
            currentQtyText = `${matchedItem.current}${unitStr}`;
            
            let finalReduction = reductionAmount;
            if (matchedItem.unitType === "percentage" && result.detectedUnit !== "%") {
                finalReduction = Math.round((reductionAmount / 800) * 100);
            } else if (matchedItem.unitType !== "percentage" && result.detectedUnit === "%") {
                finalReduction = Math.round((reductionAmount / 100) * matchedItem.total);
            }
            
            const afterVal = Math.max(0, matchedItem.current - finalReduction);
            afterQtyText = `${afterVal}${unitStr}`;
            result.calculatedReduction = finalReduction;
        } else {
            result.calculatedReduction = 0;
        }
        
        tr.innerHTML = `
            <td><strong>${result.scannedName}</strong></td>
            <td>${result.scannedQtyText} (解析: ${result.detectedAmount}${result.detectedUnit})</td>
            <td>${selectHtml}</td>
            <td>${currentQtyText}</td>
            <td id="after-val-${idx}">${afterQtyText}</td>
            <td>
                <button class="row-action-ignore" data-index="${idx}">
                    ${result.ignored ? "戻す" : "除外"}
                </button>
            </td>
        `;
        matchingTbody.appendChild(tr);
    });
    
    setupMatchingTableEvents();
}

function setupMatchingTableEvents() {
    document.querySelectorAll(".match-select").forEach(select => {
        select.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            state.currentOcrResults[idx].fridgeItemId = e.target.value;
            recalculateRow(idx);
        });
    });
    
    document.querySelectorAll(".row-action-ignore").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            state.currentOcrResults[idx].ignored = !state.currentOcrResults[idx].ignored;
            renderMatchingResults();
        });
    });
}

function recalculateRow(idx) {
    const result = state.currentOcrResults[idx];
    const select = document.querySelector(`.match-select[data-index="${idx}"]`);
    const afterCell = document.getElementById(`after-val-${idx}`);
    const matchedItem = state.items.find(i => i.id === result.fridgeItemId);
    const tr = select.closest("tr");
    
    if (result.ignored || !matchedItem) {
        afterCell.textContent = "-";
        result.calculatedReduction = 0;
        return;
    }
    
    const unitStr = matchedItem.unitType === "percentage" ? "%" : matchedItem.unitType === "weight" ? "g" : "ml";
    let finalReduction = result.detectedAmount;
    
    if (matchedItem.unitType === "percentage" && result.detectedUnit !== "%") {
        finalReduction = Math.round((result.detectedAmount / 800) * 100);
    } else if (matchedItem.unitType !== "percentage" && result.detectedUnit === "%") {
        finalReduction = Math.round((result.detectedAmount / 100) * matchedItem.total);
    }
    
    const afterVal = Math.max(0, matchedItem.current - finalReduction);
    afterCell.textContent = `${afterVal}${unitStr}`;
    result.calculatedReduction = finalReduction;
    tr.children[3].textContent = `${matchedItem.current}${unitStr}`;
}

function applyOcrReductions() {
    let appliedCount = 0;
    
    state.currentOcrResults.forEach(result => {
        if (result.ignored || !result.fridgeItemId) return;
        
        const item = state.items.find(i => i.id === result.fridgeItemId);
        if (item) {
            item.current = Math.max(0, item.current - result.calculatedReduction);
            item.updatedAt = Date.now();
            appliedCount++;
        }
    });
    
    if (appliedCount > 0) {
        saveToLocalStorage();
        renderFridge();
        showToast(`${appliedCount}件の食材を減算しました`);
    }
    closeModal(scanModal);
    resetScanModal();
}

function resetScanModal() {
    previewArea.style.display = "none";
    resultsArea.style.display = "none";
    dropZone.style.display = "flex";
    imagePreview.src = "";
    fileInput.value = "";
    state.currentOcrResults = [];
}

function loadDemoRecipe() {
    dropZone.style.display = "none";
    previewArea.style.display = "flex";
    ocrStatusBox.style.display = "flex";
    ocrStatusText.textContent = "デモ用レシピ（肉野菜炒め）を読み込んでいます...";
    progressFill.style.width = "20%";
    
    imagePreview.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23faf8f5'/><rect width='100%' height='100%' fill='none' stroke='%23e5e7eb' stroke-width='4'/><text x='50%' y='40%' font-size='16' font-weight='bold' fill='%231f2937' font-family='sans-serif' text-anchor='middle'>デモレシピ: 肉野菜炒め</text><text x='50%' y='65%' font-size='12' fill='%234b5563' font-family='sans-serif' text-anchor='middle'>・豚バラ肉 150g</text><text x='50%' y='80%' font-size='12' fill='%234b5563' font-family='sans-serif' text-anchor='middle'>・キャベツ 1/4個 (約200g)</text><text x='50%' y='95%' font-size='12' fill='%234b5563' font-family='sans-serif' text-anchor='middle'>・しょうゆ 大さじ1 (15ml)</text></svg>";
    
    setTimeout(() => {
        progressFill.style.width = "60%";
        ocrStatusText.textContent = "文字認識を実行中...";
        setTimeout(() => {
            progressFill.style.width = "100%";
            const dummyText = "【材料 (2人分)】\n豚バラ肉 150g\nキャベツ 1/4個\nしょうゆ 大さじ1\nにんにく 1片";
            const parsed = parseRecipeText(dummyText);
            state.currentOcrResults = matchScannedItems(parsed);
            renderMatchingResults();
            ocrStatusBox.style.display = "none";
            resultsArea.style.display = "block";
            showToast("デモレシピを読み込みました");
        }, 800);
    }, 800);
}

// ==========================================================================
// 6. レシート画像OCR & 食材追加ロジック (新規追加)
// ==========================================================================

// レシートテキストのパース
function parseReceiptText(text) {
    const lines = text.split("\n");
    const parsedItems = [];
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // 商品名と価格の単純な分割パターン (例: "豚バラ肉 398", "アタック洗剤 298")
        const match = line.match(/^([^\d\s¥\\\/]+)\s*(?:¥|\\)?\s*(\d+)$/);
        if (!match) return;
        
        const rawName = match[1].trim();
        const price = parseInt(match[2], 10);
        
        // 非食品キーワードが含まれるかを自動判定
        let isFood = true;
        let matchedKeyword = "";
        
        for (const kw of nonFoodKeywords) {
            if (rawName.includes(kw)) {
                isFood = false;
                matchedKeyword = kw;
                break;
            }
        }
        
        // 食材カテゴリと管理タイプの推測
        let category = "others";
        let unitType = "weight";
        let defaultTotal = 300; // デフォルト 300g
        let defaultCurrent = 300;
        
        // 肉・魚の判定
        for (const kw of meatFishKeywords) {
            if (rawName.includes(kw)) {
                category = "meat-fish";
                unitType = "weight";
                defaultTotal = 300;
                defaultCurrent = 300;
                break;
            }
        }
        
        // 野菜の判定
        for (const kw of vegetableKeywords) {
            if (rawName.includes(kw)) {
                category = "vegetables";
                unitType = "percentage";
                defaultTotal = 100;
                defaultCurrent = 100; // 割合の初期値は100%
                break;
            }
        }
        
        // 牛乳や醤油など、液体（ml）の推測
        if (category === "others") {
            const liquidKeywords = ["牛乳", "しょうゆ", "醤油", "みりん", "酒", "酢", "ジュース", "麦茶", "ドレッシング", "油"];
            for (const kw of liquidKeywords) {
                if (rawName.includes(kw)) {
                    unitType = "volume";
                    defaultTotal = 500; // デフォルト 500ml
                    defaultCurrent = 500;
                    break;
                }
            }
        }
        
        parsedItems.push({
            id: "receipt_item_" + Math.random().toString(36).substr(2, 5),
            rawName,
            price,
            isFood,
            matchedKeyword,
            category,
            unitType,
            total: defaultTotal,
            current: defaultCurrent,
            selected: isFood // 食品のみ初期チェックON
        });
    });
    
    return parsedItems;
}

// レシート画像OCRスキャンの実行
async function runReceiptOCR(imageSrc) {
    receiptOcrStatusBox.style.display = "flex";
    receiptResultsArea.style.display = "none";
    receiptProgressFill.style.width = "0%";
    receiptOcrStatusText.textContent = "OCRエンジンを準備しています...";
    
    if (typeof Tesseract === 'undefined') {
        console.warn("Tesseract.js is not loaded. Falling back to mock Receipt OCR.");
        receiptOcrStatusText.textContent = "OCRライブラリがオフラインのため、擬似レシート解析を行います...";
        
        setTimeout(() => {
            receiptProgressFill.style.width = "50%";
            receiptOcrStatusText.textContent = "商品名と価格を抽出中...";
            
            setTimeout(() => {
                receiptProgressFill.style.width = "100%";
                
                const mockReceiptText = "豚ロース肉パック 450\nキャベツ 120\n食器用洗剤 198\n明治おいしい牛乳 220\nアルミホイル 98\nレジ袋 3";
                
                state.currentReceiptResults = parseReceiptText(mockReceiptText);
                renderReceiptResults();
                
                receiptOcrStatusBox.style.display = "none";
                receiptResultsArea.style.display = "block";
                showToast("レシートの擬似スキャンを完了しました");
            }, 1000);
        }, 1000);
        return;
    }
    
    try {
        const worker = await Tesseract.createWorker('jpn');
        receiptOcrStatusText.textContent = "レシート画像を認識しています...";
        receiptProgressFill.style.width = "40%";
        
        const ret = await worker.recognize(imageSrc);
        receiptProgressFill.style.width = "90%";
        receiptOcrStatusText.textContent = "商品リスト作成中...";
        
        const text = ret.data.text;
        await worker.terminate();
        
        state.currentReceiptResults = parseReceiptText(text);
        if (state.currentReceiptResults.length === 0) {
            throw new Error("レシートから商品情報を検出できませんでした。");
        }
        
        renderReceiptResults();
        
        receiptOcrStatusBox.style.display = "none";
        receiptResultsArea.style.display = "block";
    } catch (error) {
        console.error("Receipt OCR Error: ", error);
        alert("レシート解析に失敗しました: " + error.message + "\n(デモデータで実行します)");
        
        const fallbackReceiptText = "豚ロース肉パック 450\nキャベツ 120\n食器用洗剤 198\n明治おいしい牛乳 220";
        state.currentReceiptResults = parseReceiptText(fallbackReceiptText);
        renderReceiptResults();
        receiptOcrStatusBox.style.display = "none";
        receiptResultsArea.style.display = "block";
    }
}

// レシート解析結果のテーブル描画
function renderReceiptResults() {
    receiptTbody.innerHTML = "";
    
    if (state.currentReceiptResults.length === 0) {
        receiptTbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">商品を検出できませんでした。</td></tr>`;
        return;
    }
    
    state.currentReceiptResults.forEach((item, idx) => {
        const tr = document.createElement("tr");
        if (!item.selected) {
            tr.className = "ignored-row";
        }
        
        // 判定バッジ
        const badgeHtml = item.isFood 
            ? `<span class="badge badge-food">食品</span>` 
            : `<span class="badge badge-excluded" title="キーワード '${item.matchedKeyword}' に該当">非食品 (除外)</span>`;
            
        // カテゴリセレクトボックス
        let catSelect = `<select class="receipt-cat-select" data-index="${idx}">`;
        catSelect += `<option value="vegetables" ${item.category === "vegetables" ? "selected" : ""}>野菜庫</option>`;
        catSelect += `<option value="meat-fish" ${item.category === "meat-fish" ? "selected" : ""}>肉と魚</option>`;
        catSelect += `<option value="others" ${item.category === "others" ? "selected" : ""}>その他</option>`;
        catSelect += `</select>`;
        
        // 管理タイプセレクトボックス
        let unitSelect = `<select class="receipt-unit-select" data-index="${idx}">`;
        unitSelect += `<option value="percentage" ${item.unitType === "percentage" ? "selected" : ""}>割合 (%)</option>`;
        unitSelect += `<option value="weight" ${item.unitType === "weight" ? "selected" : ""}>重さ (g)</option>`;
        unitSelect += `<option value="volume" ${item.unitType === "volume" ? "selected" : ""}>体積 (ml)</option>`;
        unitSelect += `</select>`;
        
        // 容量インプット
        const valInput = item.unitType === "percentage"
            ? `-`
            : `<input type="number" class="receipt-total-input" data-index="${idx}" value="${item.total}" style="width: 70px;">`;
            
        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="receipt-item-checkbox" data-index="${idx}" ${item.selected ? "checked" : ""}>
            </td>
            <td><strong>${item.rawName}</strong></td>
            <td>${badgeHtml}</td>
            <td>${catSelect}</td>
            <td>${unitSelect}</td>
            <td id="receipt-total-td-${idx}">${valInput}</td>
        `;
        
        receiptTbody.appendChild(tr);
    });
    
    setupReceiptTableEvents();
}

function setupReceiptTableEvents() {
    // 追加対象チェックボックス
    document.querySelectorAll(".receipt-item-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            state.currentReceiptResults[idx].selected = e.target.checked;
            
            // 行の見た目更新
            const tr = e.target.closest("tr");
            if (e.target.checked) {
                tr.classList.remove("ignored-row");
            } else {
                tr.classList.add("ignored-row");
            }
        });
    });
    
    // カテゴリ変更
    document.querySelectorAll(".receipt-cat-select").forEach(select => {
        select.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            state.currentReceiptResults[idx].category = e.target.value;
            
            // 野菜庫が選ばれた場合は自動で割合（%）に
            if (e.target.value === "vegetables") {
                const unitSelect = document.querySelector(`.receipt-unit-select[data-index="${idx}"]`);
                unitSelect.value = "percentage";
                state.currentReceiptResults[idx].unitType = "percentage";
                updateReceiptTotalCell(idx);
            }
        });
    });
    
    // 管理タイプ変更
    document.querySelectorAll(".receipt-unit-select").forEach(select => {
        select.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            state.currentReceiptResults[idx].unitType = e.target.value;
            updateReceiptTotalCell(idx);
        });
    });
}

function updateReceiptTotalCell(idx) {
    const td = document.getElementById(`receipt-total-td-${idx}`);
    const item = state.currentReceiptResults[idx];
    
    if (item.unitType === "percentage") {
        td.textContent = "-";
        item.total = 100;
        item.current = 100;
    } else {
        const defaultTotal = item.unitType === "volume" ? 500 : 300;
        item.total = defaultTotal;
        item.current = defaultTotal;
        td.innerHTML = `<input type="number" class="receipt-total-input" data-index="${idx}" value="${defaultTotal}" style="width: 70px;">`;
        
        // インプット変更イベントの再バインド
        td.querySelector(".receipt-total-input").addEventListener("change", (e) => {
            item.total = Number(e.target.value);
            item.current = Number(e.target.value);
        });
    }
}

// 選択した食材を冷蔵庫に一括追加
function applyReceiptAdditions() {
    let addedCount = 0;
    
    state.currentReceiptResults.forEach(item => {
        if (!item.selected) return;
        
        // 容量インプットからの最新の値を読み取る
        const tr = document.querySelector(`.receipt-item-checkbox[data-index]`).closest("tbody");
        const idx = state.currentReceiptResults.indexOf(item);
        const input = document.querySelector(`.receipt-total-input[data-index="${idx}"]`);
        if (input) {
            item.total = Number(input.value);
            item.current = Number(input.value);
        }
        
        addItem(item.rawName, item.category, item.unitType, item.total, item.current);
        addedCount++;
    });
    
    if (addedCount > 0) {
        saveToLocalStorage();
        renderFridge();
        showToast(`${addedCount}件の食材を冷蔵庫に追加しました`);
        
        if (!state.isFridgeOpen) {
            openFridge();
        }
    }
    
    closeModal(receiptModal);
    resetReceiptModal();
}

function resetReceiptModal() {
    receiptPreviewArea.style.display = "none";
    receiptResultsArea.style.display = "none";
    receiptDropZone.style.display = "flex";
    receiptImagePreview.src = "";
    receiptFileInput.value = "";
    state.currentReceiptResults = [];
}

function loadReceiptDemo() {
    receiptDropZone.style.display = "none";
    receiptPreviewArea.style.display = "flex";
    receiptOcrStatusBox.style.display = "flex";
    receiptOcrStatusText.textContent = "デモ用レシートを読み込んでいます...";
    receiptProgressFill.style.width = "20%";
    
    receiptImagePreview.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='320' viewBox='0 0 240 320'><rect width='100%' height='100%' fill='%23fafaf9'/><path d='M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10 L70 0 L80 10 L90 0 L100 10 L110 0 L120 10 L130 0 L140 10 L150 0 L160 10 L170 0 L180 10 L190 0 L200 10 L210 0 L220 10 L230 0 L240 10 L240 310 L230 320 L220 310 L210 320 L200 310 L190 320 L180 310 L170 320 L160 310 L150 320 L140 310 L130 320 L120 310 L110 320 L100 310 L90 320 L80 310 L70 320 L60 310 L50 320 L40 310 L30 320 L20 310 L10 320 L0 310 Z' fill='white' stroke='%23d1d5db' stroke-width='2'/><text x='50%' y='40' font-size='14' font-weight='bold' fill='%23374151' font-family='sans-serif' text-anchor='middle'>スーパーさくら</text><text x='20' y='80' font-size='10' fill='%234b5563' font-family='sans-serif'>豚ロース肉パック   ¥450</text><text x='20' y='110' font-size='10' fill='%234b5563' font-family='sans-serif'>キャベツ 1玉       ¥158</text><text x='20' y='140' font-size='10' fill='%234b5563' font-family='sans-serif'>アタック液体洗剤   ¥298</text><text x='20' y='170' font-size='10' fill='%234b5563' font-family='sans-serif'>明治おいしい牛乳   ¥220</text><text x='20' y='200' font-size='10' fill='%234b5563' font-family='sans-serif'>アルミホイル 8m   ¥98</text><text x='20' y='230' font-size='10' fill='%234b5563' font-family='sans-serif'>レジ袋 M           ¥3</text><line x1='20' y1='250' x2='220' y2='250' stroke='%23d1d5db' stroke-width='1' stroke-dasharray='4'/><text x='20' y='270' font-size='12' font-weight='bold' fill='%231f2937' font-family='sans-serif'>合計              ¥1,227</text></svg>";
    
    setTimeout(() => {
        receiptProgressFill.style.width = "60%";
        receiptOcrStatusText.textContent = "レシートOCR文字解析中...";
        
        setTimeout(() => {
            receiptProgressFill.style.width = "100%";
            
            // ダミーレシートのテキスト
            const dummyReceiptText = "豚ロース肉パック 450\nキャベツ 158\nアタック液体洗剤 298\n明治おいしい牛乳 220\nアルミホイル 98\nレジ袋 3";
            
            state.currentReceiptResults = parseReceiptText(dummyReceiptText);
            renderReceiptResults();
            
            receiptOcrStatusBox.style.display = "none";
            receiptResultsArea.style.display = "block";
            showToast("デモレシートを読み込みました");
        }, 800);
    }, 800);
}

// ==========================================================================
// 7. UIイベント・開閉処理・モーダル制御
// ==========================================================================

function setupEventListeners() {
    // 冷蔵庫の開閉 (本体をクリック)
    fridge.addEventListener("click", (e) => {
        if (e.target.closest(".shelf-items-container") || e.target.closest(".action-btn")) {
            return;
        }
        if (!state.isFridgeOpen) {
            openFridge();
        }
    });

    // ドア自体をクリックしても開閉できる
    document.querySelectorAll(".fridge-door").forEach(door => {
        door.addEventListener("click", (e) => {
            e.stopPropagation();
            if (state.isFridgeOpen) {
                closeFridge();
            } else {
                openFridge();
            }
        });
    });
    
    // モーダルを開く
    addBtn.addEventListener("click", () => openModal(addModal));
    scanBtn.addEventListener("click", () => openModal(scanModal));
    scanReceiptBtn.addEventListener("click", () => openModal(receiptModal));
    
    // モーダルを閉じる
    closeAddModal.addEventListener("click", () => closeModal(addModal));
    closeScanModal.addEventListener("click", () => {
        closeModal(scanModal);
        resetScanModal();
    });
    closeReceiptModal.addEventListener("click", () => {
        closeModal(receiptModal);
        resetReceiptModal();
    });
    
    // モーダルの外側をクリックして閉じる
    window.addEventListener("click", (e) => {
        if (e.target === addModal) closeModal(addModal);
        if (e.target === scanModal) {
            closeModal(scanModal);
            resetScanModal();
        }
        if (e.target === receiptModal) {
            closeModal(receiptModal);
            resetReceiptModal();
        }
    });
    
    // 食材追加フォームの管理タイプに応じた入力欄の切り替え
    itemUnitType.addEventListener("change", () => {
        const type = itemUnitType.value;
        if (type === "percentage") {
            totalValGroup.style.display = "none";
            document.getElementById("item-total").required = false;
            currentLabel.textContent = "現在の残量 (割合 %)";
            document.getElementById("item-current").placeholder = "例: 80";
            document.getElementById("item-current").max = 100;
        } else {
            totalValGroup.style.display = "block";
            document.getElementById("item-total").required = true;
            if (type === "weight") {
                totalLabel.textContent = "購入時の量 (g)";
                currentLabel.textContent = "現在の残量 (g)";
                document.getElementById("item-total").placeholder = "例: 500";
                document.getElementById("item-current").placeholder = "例: 250";
            } else if (type === "volume") {
                totalLabel.textContent = "購入時の量 (ml)";
                currentLabel.textContent = "現在の残量 (ml)";
                document.getElementById("item-total").placeholder = "例: 1000";
                document.getElementById("item-current").placeholder = "例: 800";
            }
            document.getElementById("item-current").removeAttribute("max");
        }
    });
    
    // 新規食材追加フォーム送信
    addItemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("item-name").value;
        const category = document.getElementById("item-category").value;
        const unitType = itemUnitType.value;
        const total = document.getElementById("item-total").value;
        const current = document.getElementById("item-current").value;
        
        if (unitType !== "percentage" && Number(current) > Number(total)) {
            alert("残量が購入時の量を超えています！");
            return;
        }
        if (unitType === "percentage" && Number(current) > 100) {
            alert("割合は100%以下で入力してください！");
            return;
        }
        
        addItem(name, category, unitType, total, current);
        closeModal(addModal);
        addItemForm.reset();
        
        if (!state.isFridgeOpen) {
            openFridge();
        }
    });
    
    // --- レシピOCRファイル選択関連 ---
    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    });
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageFile(file);
        } else {
            alert("画像ファイルをドロップしてください。");
        }
    });
    
    loadDemoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        loadDemoRecipe();
    });
    cancelScanBtn.addEventListener("click", () => resetScanModal());
    applyScanBtn.addEventListener("click", () => applyOcrReductions());

    // --- レシートOCRファイル選択関連 ---
    receiptDropZone.addEventListener("click", () => receiptFileInput.click());
    receiptFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleReceiptImageFile(file);
    });
    receiptDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        receiptDropZone.classList.add("drag-over");
    });
    receiptDropZone.addEventListener("dragleave", () => {
        receiptDropZone.classList.remove("drag-over");
    });
    receiptDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        receiptDropZone.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleReceiptImageFile(file);
        } else {
            alert("画像ファイルをドロップしてください。");
        }
    });

    loadReceiptDemoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        loadReceiptDemo();
    });
    cancelReceiptBtn.addEventListener("click", () => resetReceiptModal());
    applyReceiptBtn.addEventListener("click", () => applyReceiptAdditions());
}

function openFridge() {
    state.isFridgeOpen = true;
    fridge.classList.add("open");
    document.querySelector(".fridge-instruction").innerHTML = `
        <span class="pulse-icon"><i data-lucide="hand"></i></span>
        ドアをタップして冷蔵庫を閉めることができます
    `;
    lucide.createIcons();
}

function closeFridge() {
    state.isFridgeOpen = false;
    fridge.classList.remove("open");
    document.querySelector(".fridge-instruction").innerHTML = `
        <span class="pulse-icon"><i data-lucide="hand"></i></span>
        冷蔵庫をタップして開けてみましょう！
    `;
    lucide.createIcons();
}

function openModal(modal) {
    modal.classList.add("active");
}

function closeModal(modal) {
    modal.classList.remove("active");
}

function handleImageFile(file) {
    dropZone.style.display = "none";
    previewArea.style.display = "flex";
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        runOCR(e.target.result);
    };
    reader.readAsDataURL(file);
}

function handleReceiptImageFile(file) {
    receiptDropZone.style.display = "none";
    receiptPreviewArea.style.display = "flex";
    
    const reader = new FileReader();
    reader.onload = function(e) {
        receiptImagePreview.src = e.target.result;
        runReceiptOCR(e.target.result);
    };
    reader.readAsDataURL(file);
}

// 起動
document.addEventListener("DOMContentLoaded", initApp);
