import SukCode from "./sku-code";
import { CellStatus } from "../../core/enum";
import SkuPending from "./sku-pending";
import Joiner from "../../utils/joiner";

export default class Judger {
    fenceGroup
    pathDict = []
    skuPending
    constructor(fenceGroup) {
        this.fenceGroup = fenceGroup
        this._initSkuPending()
        this._initPathDict()
    }
    _initSkuPending() {
        this.skuPending = new SkuPending()
    }
    _initPathDict() {
        this.fenceGroup.skuList.forEach(element => {
            const skuCode = new SukCode(element.code);
            this.pathDict = this.pathDict.concat(skuCode.totalSegments)
        });
        console.log( this.pathDict)
    }

    judger({cell, x, y}) {
        this._changeCurrentCellStatus(cell, x, y)
        this.fenceGroup.eachCell((cell, x, y) => {
            const path = this._findPoterbtialPath(cell, x, y)
            if (!path) {
                return
            }
            if (this._isInDict(path)) {
                this.fenceGroup.fences[x].cells[y].status = CellStatus.WAITING
            } else {
                this.fenceGroup.fences[x].cells[y].status = CellStatus.FORBIDDEN
            }
        })
    }

    _isInDict(path) {
        return this.pathDict.includes(path)
    }
    _findPoterbtialPath(cell, x, y) { //查找当前路径 当前行 跟以前选中的行
        const joiner = new Joiner('#')
        for (let i = 0; i < this.fenceGroup.fences.length; i++) {
            const selectd = this.skuPending.findSelectdCell(i)
            if (x === i) { //当前行
                if (this.skuPending.isSelected(cell, x)) {
                    return
                }
                const cellCode = this._getCellCode(cell.spec)
                joiner.join(cellCode)
            } else if(selectd) {
                const selectCode = this._getCellCode(selectd.spec)
                joiner.join(selectCode)
            }
        }
        return joiner.getStr()
    }
    _getCellCode(spec) {
        return spec.key_id + '-' + spec.value_id
    }
    _changeCurrentCellStatus(cell, x, y) {
        if (cell.status === CellStatus.WAITING) {
            this.fenceGroup.fences[x].cells[y].status = CellStatus.SELECTED
            this.skuPending.insertCell(cell, x)
        } else if (cell.status === CellStatus.SELECTED) {
            this.fenceGroup.fences[x].cells[y].status = CellStatus.WAITING
            this.skuPending.removeCell(x)
        }

    }
}