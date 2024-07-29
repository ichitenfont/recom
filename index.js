export {parseContentData, parseAppendixData};

/************ 內容表 *************/
const char_per_row = 8;

function generateNormalTable(list, tableNode, refEndnotesNode, uniqueTag) {
    // 儲存注釋資料
    let parsedRefs = [];
    // 裏面的 object 資料格式：
    // refObj = {
    //     refTag: 引用標簽，如果沒有會自動生成（文檔内看不到）,
    //     comment: 註釋内容,
    //     cellRefNodes: [一堆表格内單獨格子 td 裏面 “[註1]” 的超鏈接 a 元素],
    // };

    let newRow = document.createElement("tr")
    tableNode.appendChild(newRow);
    for (let [index, item] of list.entries()){
        // 檢査是不是隱藏的注釋
        if (item.hidden && item.comment) {
            
            // 添加新引用object，提取ref tag
            parsedRefs.push({
                refTag: item.ref,
                comment: item.comment,
                cellRefNodes: []
            });

            // 跳過此格
            continue;
        }

        // 創建格子
        let newCell = createHanziCell(item, parsedRefs);
    
        //在行内添加當前格子
        newRow.appendChild(newCell)
        if (newRow.childElementCount === char_per_row) {
            // 第8格開始新的一行
            newRow = document.createElement("tr");
            tableNode.appendChild(newRow);
        }
    }
    // 加上一个空白格，避免換頁時沒有寬度補充
    if (newRow.childElementCount !== char_per_row && newRow.childElementCount !== 0) {
        let fitCell = document.createElement("td");
        fitCell.colSpan = char_per_row - newRow.childElementCount;
        fitCell.style.width = 'auto';
        newRow.appendChild(fitCell);
    }

    generateFootnotes(parsedRefs, refEndnotesNode, uniqueTag)
}

function generateSectionedTable(sectionList, tableNode, refEndnotesNode, uniqueTag) {
    // 儲存注釋資料
    let parsedRefs = [];
    // 裏面的 object 資料格式：
    // refObj = {
    //     refTag: 引用標簽，如果沒有會自動生成（文檔内看不到）,
    //     comment: 註釋内容,
    //     cellRefNodes: [一堆表格内單獨格子 td 裏面 “[註1]” 的超鏈接 a 元素],
    // };

    // 目錄添加分級標題的位置
    let tocAppendBeforeLocation = document.querySelector("#toc-table3-endnote");

    for (let [keyname, list] of Object.entries(sectionList)){
        // 爲每個分級循環

        // 先加上新的一行
        let newRow = document.createElement("tr");3
        tableNode.appendChild(newRow)

        // 這個分級的標題
        let headerCell = document.createElement("th");
        headerCell.classList.add('part-header');
        headerCell.innerText = keyname;
        let headerCellID = [uniqueTag, 'sectioned', 'header', keyname].join('-')
        headerCell.id = headerCellID;
        newRow.appendChild(headerCell)

        // 目錄添加分級標題
        let newTOC = document.createElement("li");
        let newTOCaHref = document.createElement("a");
        newTOCaHref.innerText = keyname;
        newTOCaHref.href = '#' + headerCellID;
        newTOC.appendChild(newTOCaHref);
        newTOC.setAttribute('data-title-level', 'h2');
        tocAppendBeforeLocation.parentNode.insertBefore(newTOC, tocAppendBeforeLocation);

        // 然後才循環裏面的漢字
        for (let [index, item] of list.entries()){
            // 檢査是不是隱藏的注釋
            if (item.hidden && item.comment) {
                // 添加新引用object，提取ref tag
                parsedRefs.push({
                    refTag: item.ref,
                    comment: item.comment,
                    cellRefNodes: []
                });
    
                // 跳過此格
                continue;
            }

            // 創建格子
            let newCell = createHanziCell(item, parsedRefs);
        
            //在行内添加當前格子
            newRow.appendChild(newCell)
            if (newRow.childElementCount === char_per_row) {
                // 第8格后插入一行，開始新的一行
                newRow = document.createElement("tr");
                tableNode.appendChild(newRow);
            }
        }

        // 加上一个空白格，避免換頁時沒有寬度補充
        if (newRow.childElementCount !== char_per_row && newRow.childElementCount !== 0) {
            let fitCell = document.createElement("td");
            fitCell.colSpan = char_per_row - newRow.childElementCount;
            fitCell.style.width = 'auto';
            newRow.appendChild(fitCell);
        }
    }

    generateFootnotes(parsedRefs, refEndnotesNode, uniqueTag)
}

// 處理單個漢字資料並返回可以加入 HTMl 的 element
function createHanziCell(item, parsedRefs) {
    let newCell = document.createElement("td");

    // 植入資料
    let big5 = document.createElement("span");
    big5.classList.add('big5');
    if (item.big5 === undefined || item.big5.trim().length === 0){
        big5.innerHTML = "-"; // 沒有big5碼
    } else {
        if (item.hkscs) { // HKSCS 標簽
            let hkTag = document.createElement("span");
            hkTag.classList.add('hkscs');
            hkTag.innerText = "H-";
            big5.appendChild(hkTag);
        }
        big5.innerHTML += item.big5; // big5碼
    }
    newCell.appendChild(big5);

    let char = document.createElement("span");
    char.classList.add('sample-char');
    char.innerText = item.char; // 預覽漢字
    newCell.appendChild(char);
    
    let uni = document.createElement("span");
    uni.classList.add('unicode');
    uni.innerText = item.unicode; // unicode
    newCell.appendChild(uni);
    
    if ('unicode2' in item) { // 第二個unicode
        let uni2 = document.createElement("span");
        uni2.classList.add('unicode');
        uni2.innerText = item.unicode2;
        newCell.appendChild(uni2);
    }

    // 特別漢字上色
    if ('shouldRemove' in item && item.shouldRemove) {
        newCell.classList.add('not-suggested');
    } else if ('repeated' in item && item.repeated){
        newCell.classList.add('repeated');
    }
    
    //註釋/註釋引用
    if ('comment' in item || 'ref' in item) {
        let refTag = parseEndnote(item, parsedRefs);
        newCell.appendChild(refTag);
    }

    return newCell;
}

function parseEndnote(item, parsedRefs) {
    let refTag = null;

    // 檢查註釋/註釋引用
    if ('comment' in item) { // 有註釋
        if ('ref' in item) {
            // 註釋有引用 ref tag
            // 找是否已經遇過同樣的tag
            let refObj = parsedRefs.find(x => x.refTag === item.ref);

            if (refObj === undefined) {
                // 創建新的註釋 object
                refObj = {
                    refTag: item.ref,
                    comment: item.comment,
                    cellRefNodes: []
                };
                parsedRefs.push(refObj);
            } else {
                // 已經有同樣tag的註釋
                if (refObj.comment === undefined){
                    // 沒有註釋文本
                    refObj.comment = item.comment;
                } else {
                    // 有註釋文本，出錯了
                    console.log(refObj)
                    alert('同樣標簽但在不同字符内可能有不同註釋，請只保留一個：' + item.ref);
                }
            }

            // 預留當前格子的註釋號碼
            refTag = document.createElement("a");
            refTag.innerText = "[註 ]";
            refTag.classList.add('ref-tag-in-table');

            // 引用object裏面 添加指向當前格子的註釋號碼
            refObj.cellRefNodes.push(refTag);
        } else {
            // 註釋沒有引用 ref tag，默認不會在其他漢字重複引用
            
            // 預留當前格子的註釋號碼
            refTag = document.createElement("a");
            refTag.innerText = "[註 ]";
            refTag.classList.add('ref-tag-in-table');
            
            // 添加新引用object，默認不用refTag
            parsedRefs.push({
                comment: item.comment,
                cellRefNodes: [refTag]
            });
        }
    } else if ('ref' in item) {
        // 找是否已經遇過同樣的tag
        let refObj = parsedRefs.find(x => x.refTag === item.ref);

        if (refObj === undefined) {
            // 還沒看見相同的註釋引用，創建新的記錄
            
            refObj = {
                refTag: item.ref,
                comment: item.comment,
                cellRefNodes: []
            }
            // 添加新引用object
            parsedRefs.push(refObj);
        }

        // 預留當前格子的註釋號碼
        refTag = document.createElement("a");
        refTag.innerText = "[註 ]";
        refTag.classList.add('ref-tag-in-table');

        // 引用object裏面 添加指向當前格子的註釋號碼
        refObj.cellRefNodes.push(refTag);
    }

    return refTag
}

function generateFootnotes(parsedRefs, refEndnotesNode, uniqueTag, addTagBehindComment=true) {
    // 完畢后填入引用資料
    for (let [index, refObj] of parsedRefs.entries()) {
        // 為每一個註釋資料

        let refNumber = index + 1; // 註釋列表顯示的序號
        // 創建新的 HTML 列表條目並加入列表
        let newCommentItem = document.createElement("li");
        refEndnotesNode.appendChild(newCommentItem);

        // 添加註釋列表裏面註釋的 HTML ID，定位用
        let commentNodeID = [uniqueTag, "endnote", "comment", refNumber].join("-");
        newCommentItem.id = commentNodeID;

        // 添加格子裏面引用的 HTML ID，並且超鏈接連上註釋列表
        let cellNodeIDs = []; // 存每個漢字格子的 HTMl ID
        if (refObj.cellRefNodes.length === 1) {
            // 表格内只有一個漢字引用
            let cellNodeID = [uniqueTag, "inline", "cell", refNumber].join("-"); // 定位用的 ID
            refObj.cellRefNodes[0].innerText = "[註 " + refNumber + "]"; // 註釋編號
            refObj.cellRefNodes[0].href = "#" + commentNodeID; // 跳轉去的位置

            refObj.cellRefNodes[0].parentNode.id = cellNodeID; // 定位去對應上一層的格子（td），不是去href
            cellNodeIDs.push([cellNodeID, null]);
        } else {
            // 表格内有多個漢字引用，每一個都要生成
            for (let cellNode of refObj.cellRefNodes){
                let parentChar = cellNode.parentNode.querySelector("span.sample-char").innerText; //按順序加字母
                let cellNodeID = [
                    uniqueTag, "inline", "cell", refNumber, parentChar
                ].join("-"); // 定位用的 ID
                cellNode.innerText = "[註 " + refNumber + "]"; // 註釋編號（帶字母）
                cellNode.href = "#" + commentNodeID; // 跳轉去的位置

                cellNode.parentNode.id = cellNodeID;// 定位去對應上一層的格子（td），不是去href
                cellNodeIDs.push([cellNodeID, parentChar]);
            }
        }

        // 添加註釋列表裏面註釋的文本
        // 先加上註釋内容
        let commentText = document.createElement("span");
        commentText.innerHTML = refObj.comment; // 註釋文本
        newCommentItem.appendChild(commentText);

        // 可選擇是否在後面加返回前面的鏈接
        if (addTagBehindComment) {
            // 然後加上跳轉回去漢字格子的返回鏈接
            for (let [cellNodeID, parentChar] of cellNodeIDs) {
                let jumpBackHyperlink = document.createElement("a");
                // 超鏈接顯示的文本
                if (parentChar){
                    jumpBackHyperlink.innerHTML = `^<sup>${parentChar}</sup>`; 
                } else {
                    jumpBackHyperlink.innerText = "^";
                }
                jumpBackHyperlink.href = "#" + cellNodeID; // 超鏈接跳轉回去的位置
                jumpBackHyperlink.classList.add("endnote-refer-back")
                newCommentItem.appendChild(jumpBackHyperlink);
            }
        }
        if (refObj.comment === undefined) {
            console.log(refObj)
            alert('以下ref標簽沒有提供註釋内容文本（comment）：' + refObj.refTag);
        }
    }
}

function setImageCSS(node){
    let picturesInText = node.querySelectorAll("img");
    // 將註釋裏面的圖片加上 CSS class 進行格式定義
    picturesInText.forEach(element => {
        element.classList.add('picture-char')
    });
}

function parseContentData(data){
    // 更新文檔meta信息版本
    document.querySelector('meta[name="version"]').setAttribute("content", data["版本"]);
    document.querySelector('meta[name="description"]').setAttribute(
        "content", 
        document.querySelector('meta[name="description"]').getAttribute('content') + data["版本"] + "版"
    );
    document.documentElement.style.setProperty('--version-number', JSON.stringify(data["版本"]));
    // 尾頁版本和日期
    document.querySelector('section#endcover span#version').innerText += data["版本"];
    document.querySelector('section#endcover span#edit-date').innerText += data["日期"];

    // 處理表一
    let table1 = document.getElementById("chap1-charlist");
    let refEndnotes1 = document.getElementById("chap1-endnotes");
    generateNormalTable(data["表一"], table1, refEndnotes1, 'table1');
    setImageCSS(refEndnotes1)
    
    // 處理表二
    let table2 = document.getElementById("chap2-charlist");
    let refEndnotes2 = document.getElementById("chap2-endnotes");
    generateNormalTable(data["表二"], table2, refEndnotes2, 'table2');
    setImageCSS(refEndnotes2)

    // 處理表三，不同格式
    let table3 = document.getElementById("chap3-charlist");
    let refEndnotes3 = document.getElementById("chap3-endnotes");
    generateSectionedTable(data["表三"], table3, refEndnotes3, 'table3');
    setImageCSS(refEndnotes3)
}



/************ 附錄 *************/
const variant_component_per_row = 4;

function parseAppendixData(data) {
    generateAppendixSharedTable(data["形類"]);
    generateAppendixIndividualTable(data["單獨"]);
}

function generateAppendixSharedTable(componentGroups) {
    let table = document.getElementById("appendix1-similar-component");

    for (let groupItem of componentGroups) {
        let newRow = document.createElement('tr');
        table.appendChild(newRow)

        // 左邊的標題欄
        let headerCell = document.createElement('th');
        headerCell.innerHTML = groupItem["group-title"];
        newRow.appendChild(headerCell);

        // 右邊的內容欄
        let contentCell = document.createElement('td');
        newRow.appendChild(contentCell);
        
        // 部件名
        let componentRow = document.createElement('p');
        componentRow.classList.add('header-component');
        contentCell.appendChild(componentRow);

        // 預覽部件漢字
        let sampleCharRow = document.createElement('p');
        sampleCharRow.classList.add('shown-char');
        contentCell.appendChild(sampleCharRow);
        sampleCharRow.appendChild(document.createTextNode(groupItem["display-char"])); // 正體漢字
        sampleCharRow.appendChild(document.createTextNode('\u3000')); //分隔空格

        for (let [key, component] of Object.entries(groupItem["components"])) {
            if (componentRow.textContent.trim().length !== 0) {
                //如果不是空白，在部件列表前面加頓號
                componentRow.appendChild(document.createTextNode("、"))
            } 
            // 部件名
            componentRow.appendChild(document.createTextNode(key))
            
            // 異體部件預覽
            let sampleChar = document.createElement('span');
            sampleChar.classList.add('sample-variant-char');
            sampleCharRow.appendChild(sampleChar);
            if (Object.keys(component).includes("display-char")) {
                // 預覽文字
                if (Array.isArray(component["display-char"])) {
                    component["display-char"].forEach(text => sampleChar.innerText += text);
                } else {
                    sampleChar.innerText = component["display-char"];
                }
            } else if (Object.keys(component).includes("display-pic")) {
                // 預覽圖片
                if (Array.isArray(component["display-pic"])) {
                    component["display-pic"].forEach(pic => sampleChar.innerHTML += pic);1
                } else {
                    sampleChar.innerHTML += component["display-pic"];
                }
            }
            //添加顏色
            switch (component["type"]) {
                case "海":
                    sampleChar.classList.add('recommended-form'); break;
                case "天":
                    sampleChar.classList.add('orthography-form'); break;
                case "地":
                    sampleChar.classList.add('aesthetic-form'); break;
            }
        }
    }
    setImageCSS(table);
}

function generateAppendixIndividualTable(componentList) {
    let tableNode = document.getElementById("appendix1-individual-component");
    let refEndnotesNode = document.getElementById("appendix1-individual-component-endnotes");

    // 儲存注釋資料
    let parsedRefs = [];

    let newRow = document.createElement("tr")
    tableNode.appendChild(newRow);
    for (let component of componentList) {
        // 添加新格子
        let newCell = document.createElement("td");
        newRow.appendChild(newCell);
        
        // 部件名
        let componentRow = document.createElement('p');
        componentRow.classList.add('header-component');
        componentRow.innerText = component["name"];
        newCell.appendChild(componentRow);

        // 預覽部件漢字
        let sampleCharRow = document.createElement('p');
        sampleCharRow.classList.add('shown-char');
        newCell.appendChild(sampleCharRow);

        let standardChar = document.createElement("span"); // 用於注釋生成漢字使用的
        standardChar.classList.add('sample-char');
        standardChar.innerText = component["display-char"];
        sampleCharRow.appendChild(standardChar); // 正體漢字
        
        // 異體漢字
        let sampleChar = document.createElement('span');
        sampleChar.classList.add('sample-variant-char');
        sampleCharRow.appendChild(sampleChar);
        // 同時允許，主要給（齋）
        if (Object.keys(component).includes("display-char")) {
            // 預覽文字
            sampleChar.innerText = component["display-char"];
        }
        if (Object.keys(component).includes("display-pic")) {
            // 預覽圖片
            sampleChar.innerHTML += component["display-pic"];
        }
        //添加顏色
        switch (component["type"]) {
            case "海":
                sampleChar.classList.add('recommended-form'); break;
            case "天":
                sampleChar.classList.add('orthography-form'); break;
            case "地":
                sampleChar.classList.add('aesthetic-form'); break;
        }

        //註釋/註釋引用
        if ('comment' in component || 'ref' in component) {
            let refTag = parseEndnote(component, parsedRefs);
            newCell.appendChild(refTag);
        }

        if (newRow.childElementCount === variant_component_per_row) {
            // 第8格開始新的一行
            newRow = document.createElement("tr");
            tableNode.appendChild(newRow);
        }
    }
    // 加上一个空白格，避免換頁時沒有寬度補充
    if (newRow.childElementCount !== variant_component_per_row && newRow.childElementCount !== 0) {
        let fitCell = document.createElement("td");
        fitCell.colSpan = variant_component_per_row - newRow.childElementCount;
        fitCell.style.width = 'auto';
        newRow.appendChild(fitCell);
    }

    generateFootnotes(parsedRefs, refEndnotesNode, 'appendix1', false)
    setImageCSS(tableNode);
    setImageCSS(refEndnotesNode);
}
