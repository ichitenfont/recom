# 傳承字形推薦形體表——網頁排版源文件

本倉庫用於存放和托管《傳承字形推薦形體表》的網頁排版源文件。訪問本倉庫對應的 [GitHub Pages 網頁]()可以在瀏覽器內排版渲染《傳承字形推薦形體表》的 PDF 文件。

本文檔使用 [Paged.js](https://pagedjs.org) 排版。使用 Chrome 123+ 版的排版效果最佳，因爲 Chrome 123 版起開始默認啓用 CSS 標點擠壓，較爲貼近舊版《傳承字形推薦形體表》1.04 版使用 Microsoft Word 排版的效果。

## 文件

此處的 `本地` 指的是當前使用的電腦終端。

* `index.html`：排版顯示的網頁。固定文本（如前言、作者、各表標題等）都在這個文件編寫。也負責導入其他文件。
* `index.css`：定義網頁顯示效果，例如頁眉頁脚、字表格式等。
* `index.js`：排版邏輯，引入純文本的 JSON 文件來進行排版。
* `recommended-char-list.json`：字表的純文本 JSON 文件。格式如下節所述。
* `variant-forms.json`：〈附錄一：變體部件表〉的純文本 JSON 文件。格式如下節所述。
* `verify_json.py`：小工具程序，用於驗證 `recommended-char-list.json` 的 Big5/Unicode 編碼是否正確。需要在本地自行使用 Python 運行。

### 文件夾

* `svg/`：註釋需要的特殊未編碼漢字，以 SVG 圖檔格式存放於此文件夾內。
* `var/`：〈附錄一：變體部件表〉需要的特殊異體字形，以 SVG 圖檔格式存放於此文件夾內。應該已經上色對應異體等級。
* `webfont/I.Iosevka.otf`：字表中 Big5 碼使用的等寬字型。
* `webfont/Inter-Regular.woff2`：字表中 Unicode 碼使用的無襯綫字型。
* `webfont/I.MingWebVar.otf`：〈附錄一：變體部件表〉需要的異體字形。一個 Unicode 只能對應一個異體字形。如果某部件需要多過一個異體字形，需要存放進 `var/` 文件夾內。
* `webfont/I.MingWebWriting.otf`：前言需要的手寫字形。

排版使用的「一點明體」沒有存放於此倉庫，默認使用本地字體以保證排版時使用的是最新的字型版本。請確保電腦本地內裝有最新的 [`I.Ming-vX.XX.otf`](https://github.com/ichitenfont/I.Ming) 以顯示正確的字形。

## JSON 格式備注

在以下兩個文件裏，"--使用方式" 裏面的內容屬於備注，不在排版時使用。

## 字表格式：`recommended-char-list.json`

此表用於排版〈表一：一級漢字區〉、〈表二：二級漢字區〉和〈表三：添補漢字區〉，使用 [JSON 格式](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Objects/JSON)，屬於純文本格式。使用的格式大致如下：

```json
{
    "版本": "1.050",
    "日期": "2024 年 1 月 1 日",
    "表一": [
        {"char": "字", "big5": "A672", "unicode":"5B57", "comment": "註釋"},
        ...
    ],
    "表二": [...],
    "表三": {
        "１級": [...],
        ...
    }
}
```

詳細的格式如下：
### 分表
* "版本"：當前《傳承字形推薦形體表》的版本號。用於頁眉和最後一頁。
* "日期"：當前《傳承字形推薦形體表》的更新日期。用於最後一頁。
* "表一"：〈表一：一級漢字區〉的內容。依照漢字順序排序。
* "表二"：〈表二：二級漢字區〉的內容。依照漢字順序排序。
* "表三"：〈表三：添補漢字區〉的內容。依照排列的 **分表** 順序排序。
    * "１級"：顯示的子標題，以黃色格子標識。依照漢字順序排序。每個分表會斷行，保證黃色格子是在該行的第一格。

### 漢字內容
* "big5"：Big5 碼。如果沒有，排版時會自動填入 -。不要手動填充 -，應該直接不寫 "big5"。
* "hkscs"：標注 Big5 碼是不是源於 HKSCS，値爲 true/false（沒有引號），排版時在前面標上 H-。沒有big5碼無效。
* "char"：顯示的漢字。
* "unicode"：字符的 Unicode。
* "unicode2"：字符的第二個 Unicode。顯示在 "unicode" 下面
* "shouldRemove"：應該移除的不恰當收字，値爲 true/false（沒有引號），排版時顯示為灰底深紅色。
* "shouldUse"：應該使用的其他漢字，排版時暫未使用，暫時爲 informative
* "repeated"：重複收字，値爲 true/false（沒有引號），排版時顯示為灰底綠色。
* "comment"：註釋內容。可用 HTML 標記，如 `<br>` 表示換行。可接受圖片，使用 `<img src='文件夾/文件名.svg'>` 格式引入，文件名外面只能用單引號（'）。同樣ref的漢字只能有一個comment。
* "ref"：引用標簽（tag），有相同ref的漢字會指向相同的註釋號碼。排版後ref內的文字tag不會顯示在文檔中。同樣ref的漢字只能有一個comment，否則可能會混淆。跨表（表一、二、三之間）無法引用。

以下是正確 ref 引用示範：
表三內的各分表可以互相引用，都會在表三註釋區顯示。
```json
{
    "表一": [
        {"big5":"A45C", "char":"么", "unicode":"4E48", "ref":"么幺", "comment":"「么」（4E48）應作「幺」（5E7A）。"},
        {"big5":"FBF4", "char":"幺", "unicode":"5E7A", "ref":"么幺"}
    ], 
    "表三": {
        "１級": [{"big5":"A45C", "char":"么", "unicode":"4E48", "ref":"么幺", "comment":"「么」（4E48）應作「幺」（5E7A）。"}],
        "２級": [{"big5":"FBF4", "char":"幺", "unicode":"5E7A", "ref":"么幺"}]
    }
}
```

以下是錯誤 ref 引用示範：
* 跨表 ref。表一、表二、表三各有自己的註釋區，因此不宜跨表引用。
    ```json
    {
        "表一": [
            {"big5":"A45C", "char":"么", "unicode":"4E48", "ref":"么幺", "comment":"「么」（4E48）應作「幺」（5E7A）。"}
        ],
        "表二": [
            {"big5":"FBF4", "char":"幺", "unicode":"5E7A", "ref":"么幺"}
        ]
    }
    ```
* ref但沒有任何註釋。排版時會報錯。
    ```json
    {
        "表一": [
            {"big5":"A45C", "char":"么", "unicode":"4E48", "ref":"么幺"},
            {"big5":"FBF4", "char":"幺", "unicode":"5E7A", "ref":"么幺"}
        ]
    }
    ```
* ref但有多個註釋。排版時會報錯以避免混淆。
    ```json
    {
        "表一": [
            {"big5":"A45C", "char":"么", "unicode":"4E48", "ref":"么幺", "comment":"「么」（4E48）應作「幺」（5E7A）。"},
            {"big5":"FBF4", "char":"幺", "unicode":"5E7A", "ref":"么幺", "comment":"「么」（4E48）應作「幺」（5E7A）。"}
        ]
    }
    ```

### 特殊格式
* "hidden"：隱藏該項目，値爲 true/false（沒有引號）。只在需要把註釋放在列表最前面時，但不影響漢字順序使用。如果加上 ref，則表內漢字也會引用同樣的註釋。上面的跨表ref、一個ref多個註釋仍舊禁止。

使用hidden和ref引用例子：
```json
{
    "表二": [
        {"hidden":true, "ref": "repeat-table1", "comment":"原收於 Big5 碼常用字區的「勗」和「裡」不符傳承字形推薦形體要求，應以收於 Big5 碼次常用字區的「勖」（52D6）、「裏」（88CF）取代，故在一級漢字區（即表一）裏已增列「勖、裏」二字。此外，原 Big5 碼常用字區的「枴」（67B4）與原 Big5 碼次常用字區所收的「枴」（67FA）在傳承字形裏同形。爲保留原 Big5 碼格局，此表二重出「勖、裏、枴」這三字。"},
        {"char":"柺", "unicode":"67FA", "unicode2":"67B4", "repeated":true, "ref":"repeat-table1"}
    ]
}
```

## 異體部件表格式：`variant-forms.json`

此表用於排版〈附錄一：變體部件表〉，使用 [JSON 格式](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Objects/JSON)，屬於純文本格式。

此表分爲兩表：形似部件和單獨部件。如果要修改異體字形，應該修改 `webfont/I.MingWebVar.otf` 內對應 "display-char" 的漢字。

使用的格式大致如下：

```json
{
    "形類": [
        {
            "group-title": "鼠",
            "display-char": "巤鼠",
            "components": {
                "巤部件": {"type": "海", "display-char":"巤"},
                ...
            }
        },
        ...
    ],
    "單獨": [
        {"name": "X部件", "type": "地", "display-char":"巂", "display-pic": "<img src='var/9F4B.svg'>"},
        ...
    ],
}
```

* "形類"：排版形似部件。
* "單獨"：排版單獨部件。

### "形類" 格式

* "group-title"：歸類組的顯示標題，盡量用一個字/部件。以黃色標題格顯示。
* "display-char"：默認顯示的全部推薦形體，黑色。應該是本地「一點明體」默認使用的字形。
* "components"：把多個單部件歸類在一起的數組，子格式如下：
    * "巤部件"：顯示的部件名。
        * "type"：變體種類，値爲：天（淺藍）、海（深藍）、地（綠色）。
        * "display-char"：默認顯示的變體字形。使用 `webfont/I.MingWebVar.otf` 顯示。
        * "display-pic"：顯示的其他變體圖檔。存放於 `var/` 文件夾內。使用 `<img src='文件夾/文件名.svg'>` 格式引入，文件名外面只能用單引號（'）。可以使用 `['<img a.svg>','<img b.svg>']` 格式顯示多個圖片。

需要特別注意顯示的 components 是按順序顯示異體，因此部分條目使用 hack 以保證顯示效果正確。

### "單獨" 格式

* "name"：顯示的部件名。
* "type"：變體種類，値爲：天（淺藍）、海（深藍）、地（綠色）。
* "display-char"：默認顯示的推薦形體和變體字形。推薦形體使用本地「一點明體」的字形，變體字形使用 `webfont/I.MingWebVar.otf` 顯示。
* "display-pic"：顯示的其他變體圖檔。存放於 `var/` 文件夾內。使用 `<img src='文件夾/文件名.svg'>` 格式引入，文件名外面只能用單引號（'）。可以使用 `['<img a.svg>','<img b.svg>']` 格式顯示多個圖片。

* "comment"：註釋內容。只在單獨部件內使用。
* "ref"：引用標簽，有相同ref的部件會指向相同的註釋號碼，排版後不會顯示在文檔中。只在「單獨」部件內使用。

"comment" 和 "ref" 和字表功能一樣。

## 授權

本倉庫源文件（除了 `webfont/` 內的字型文件）和其衍生品《傳承字形推薦形體表》 PDF 皆以 [共享創意-署名4.0授權協議](https://creativecommons.org/licenses/by/4.0/) 授權。

`webfont/` 內的字型文件以各自的字型授權使用。`I.Iosevka` 及 `Inter` 以 SIL OFL 授權，`I.MingWebVar` 以 IPA開放字型授權協議 1.0版授權。

[`pagedjs` 0.4.3](https://www.npmjs.com/package/pagedjs) 及 [`browser-dtector` 4.1.0](https://www.npmjs.com/package/browser-dtector) 爲冷凍的引用模塊，以 MIT 授權使用。

## 致謝

感謝 [@rwxguo](https://github.com/rwxguo) 初期協助進行數據校驗。