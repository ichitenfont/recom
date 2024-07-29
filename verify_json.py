import json
import sys

srcfile = json.load(open("recommended-char-list.json", encoding="utf8"))


def getUnicodeChar(uniHex):
    return chr(int(uniHex, 16))


def getBig5Char(byteHex, charset="big5"):
    return bytes.fromhex(byteHex).decode(charset)

seenChars = set()
def verifyValidRecord(record):
    print(record)
    currentChar = record["char"]
    # override for special char to use unicode2
    if currentChar == "欅":
        currentChar = "櫸"
    elif currentChar == "㩮":
        currentChar = "攑"
    
    # check if no duplicates
    if currentChar in seenChars:
        if "repeated" in record and record["repeated"]:
            pass
        else:
            raise Exception("Duplicated character: %s" % currentChar)
    seenChars.add(currentChar)

    # check unicode
    unichar = getUnicodeChar(record["unicode"])
    assert unichar == currentChar

    # check should use is not current char
    if "shouldUse" in record:
        assert currentChar not in record["shouldUse"]

    # check big5
    if "big5" in record:
        charset = "cp950"
        if "hkscs" in record and record["hkscs"]:
            charset = "hkscs"

        # py dont have hkscs-2008, manual check
        if record["unicode"] == "8484":
            assert record["big5"] == "87AB"
            return
        elif record["unicode"] == "62C1":
            assert record["big5"] == "87DD"
            return

        big5char = getBig5Char(record["big5"], charset)
        if record["big5"] in ("C94A", "DDFC"):
            return  # dont check duplicate char

        assert big5char == currentChar
    else:
        try:
            possibleBig5 = currentChar.encode("hkscs")
            possibleBig5Num = int.from_bytes(possibleBig5, "big")
            raise Exception("Possible Big5: %s" % hex(possibleBig5Num))
        except UnicodeEncodeError:
            if "unicode2" in record:
                try:
                    possibleBig5 = getUnicodeChar(record["unicode2"]).encode("hkscs")
                    possibleBig5Num = int.from_bytes(possibleBig5, "big")
                    raise Exception("Possible Big5: %s" % hex(possibleBig5Num))
                except UnicodeEncodeError:
                    # no possible big5/hkscs, skip
                    pass


for table in ["表一", "表二"]:
    for record in srcfile[table]:
        # skip hidden
        if "hidden" in record:
            continue

        verifyValidRecord(record)

for _, table in srcfile["表三"].items():
    for record in table:
        # skip hidden
        if "hidden" in record:
            continue

        verifyValidRecord(record)
