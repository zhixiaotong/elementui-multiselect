<!--
  author:lz
  dependency: el-input, el-popover, el-button-group, el-button
  desc:支持过滤、分页、全选、反选等功能的多选框组件
  api:
        1) 基础使用：<multi-select v-model="value" :options="options" placeholder="请选择重点人员"></multi-select>
        2) 额外可传入的参数为 -> :page-size="pageSize" [pageSize:指定分页每页展示的数据,默认为6], :show-select="showSelect" [showSelect:是否显示全选和清空按钮, 默认为true]
-->
<template>
  <el-popover popper-class="el-select-dropdown is-multiple no-padding" trigger="click" v-model="visible" transition="el-zoom-in-top" :width="inputWidth">
    <div class="filter-input">
      <el-input type="text" size="mini" v-model="query" :placeholder="filterPlaceholder" ref="filter"></el-input>
    </div>
    <p class="el-select-dropdown__empty" v-if="emptyText && currentOptions.length === 0">{{ emptyText }}</p>
    <!-- 存在过滤数据, 则展示 -->
    <ul class="uni-ul" v-show="currentOptions.length > 0">
      <li v-for="(item, id) of currentOptions" :key="id" @mouseenter="hoverItem(item)" @click.stop="selectOptionClick(item)" class="el-select-dropdown__item" :class="{
                  'selected': itemSelected(item),
                  'is-disabled': item.disabled,
                  'hover': id === hoverIndex
                }">
        <span>{{ item.label }}</span>
      </li>
    </ul>
    <!-- 全选清空 -->
    <div class="clearing" v-if="showSelect">
      <el-tooltip effect="dark" content="全选" placement="bottom">
        <el-button icon="el-icon-circle-check-outline" class="select-btn pull-left" size="mini" @click="selectAll()"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="清空" placement="bottom">
        <el-button icon="el-icon-delete" class="select-btn pull-right" size="mini" @click="unselectAll()"></el-button>
      </el-tooltip>
    </div>
    <!-- 分页信息 -->
    <div class="uni-pagin" v-show="currentOptions.length > 0">
      <div class="pagin-info">
        <i>{{filterOptions.length}}</i>条&nbsp;&nbsp;
        <i class="current blue">{{pageIndex}}</i>/
        <i>{{totalPageIndex}}</i>&nbsp;页</div>
      <div class="pagin-content">
        <el-button-group>
          <el-button icon="el-icon-arrow-left" class="pagin-btn" :disabled="pageIndex === 1" size="mini" @click="prev()"></el-button>
          <el-button icon="el-icon-arrow-right" class="pagin-btn" :disabled="pageIndex === totalPageIndex" size="mini" @click="next()"></el-button>
        </el-button-group>
      </div>
    </div>
    <!-- 引用 -->
    <div class="el-select" :class="[selectSize ? 'el-select--' + selectSize : '']" slot="reference">
      <el-input type="text" v-model="selectedLabels" ref="reference" :id="id" :name="name" :placeholder="curPlaceholder" :auto-complete="autoComplete" :class="{'is-focus':visible}" readonly @keydown.native.esc.stop.prevent="visible = false" @keydown.native.tab="visible = false" @mouseenter.native="inputHovering = true" @mouseleave.native="inputHovering = false">
        <i slot="suffix" :class="['el-select__caret', 'el-input__icon', 'el-icon-arrow-up']">
        </i>
      </el-input>
    </div>
  </el-popover>
</template>
<script>
import { debounce, addClass, removeClass } from './utils/index'
import { addResizeListener, removeResizeListener } from './utils/resize-event'
export default {
  data() {
    return {
      inputWidth: 0, // 下拉面板的宽度
      selected: [], // 选中的集
      curPlaceholder: this.placeholder,
      hoverIndex: -1, // 鼠标悬停索引
      visible: false, // 面板是否显示
      inputHovering: false, // 是否悬停在input上
      pageIndex: 1, // 当前页码, 从1开始
      totalPageIndex: 0, // 总页数
      optionsCount: 0, // 数据量
      query: '', // 过滤input中对应的v-model, 用于查询匹配的数据
      filterOptions: [], // 存储过滤后的数据
      filterPlaceholder: '多项匹配以空格隔开'
    }
  },
  props: {
    id: String,
    name: String,
    size: String,
    options: {
      // 外部传入的所有options
      required: true,
      default: []
    },
    showSelect: {
      // 显示选择
      type: Boolean,
      default: true
    },
    value: {
      required: true,
      default: []
    },
    autoComplete: {
      type: String,
      default: 'off'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    pageSize: {
      // 每一页显示的数据量
      type: Number,
      default: 6
    },
    multipleLimit: {
      // 多选上限
      type: Number,
      default: 0
    },
    clearable: Boolean, // 可清空
    filterable: {
      // 可过滤
      type: Boolean,
      default: true
    },
    labelKey: {
      // 显示值
      type: String,
      default: 'label'
    },
    valueKey: {
      // 标识值的字段,默认为value
      type: String,
      default: 'value'
    },
    noMatchText: {
      // 没有匹配的文字
      type: String,
      default: '无匹配数据'
    },
    noDataText: {
      // 没有数据的文字
      type: String,
      default: '暂无数据'
    }
  },
  watch: {
    placeholder(val) {
      this.curPlaceholder = val
    },
    value(val) {
      if (val.length > 0) {
        this.curPlaceholder = ''
      } else {
        this.curPlaceholder = this.placeholder
      }
      this.setSelected()
    },
    visible(val) {
      if (!val) {
        this.$refs.reference.$el.querySelector('input').blur()
        this.$refs.filter.$el.blur()
        this.handleIconHide()
        this.$nextTick(() => {
          if (
            this.$refs.reference &&
            this.$refs.reference.$el.querySelector('input').value === '' &&
            this.selected.length === 0
          ) {
            this.curPlaceholder = this.placeholder
          }
        })
      } else {
        this.handleIconShow()
        this.$refs.filter.$el.focus()
      }
    },
    /** watch query -> handleFilter */
    query(val) {
      this.handleQuery(val)
    },
    options(val) {
      this.options = val
      this.setSelected()
      this.handleQuery()
    }
  },
  computed: {
    /** 用于多选后input框回显的数据 */
    selectedLabels() {
      let labels = ''
      if (this.selected.length !== 0) {
        labels = this.selected.map(n => n[this.labelKey]).join(',')
      }
      return labels
    },
    /** 显示过滤项文字 */
    emptyText() {
      if (
        this.filterable &&
        this.query &&
        this.options.length > 0 &&
        this.filterOptions.length === 0
      ) {
        return this.noMatchText
      }
      if (this.options.length === 0) {
        return this.noDataText
      }
      return null
    },
    /** 当前页的数据 */
    currentOptions() {
      const datas = JSON.parse(JSON.stringify(this.filterOptions))
      return datas.slice(
        (this.pageIndex - 1) * this.pageSize,
        this.pageIndex * this.pageSize
      )
    },
    /** select下拉框的size */
    selectSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    }
  },
  created() {
    this.curPlaceholder = this.placeholder
    this.debouncedOnInputChange = debounce(this.debounce, () => {
      this.onInputChange()
    })
  },
  mounted() {
    if (Array.isArray(this.value) && this.value.length > 0) {
      this.curPlaceholder = ''
    }
    addResizeListener(this.$el, this.handleResize)
    this.handleQuery()
    this.setSelected()
  },
  methods: {
    // 上一页
    prev() {
      if (this.pageIndex > 1) this.pageIndex--
    },
    // 下一页
    next() {
      if (this.pageIndex < this.totalPageIndex) this.pageIndex++
    },
    /** 匹配过滤 */
    matchInput(input, data) {
      const search = input.split(' ')
      let findNum = 0
      let r, index
      for (r of search) {
        index = data.toLowerCase().indexOf(r.toLowerCase())
        if (index !== -1) findNum++
      }
      if (findNum === search.length) return true
      return false
    },
    /** 处理匹配过滤 */
    handleQuery(val) {
      if (val) {
        this.filterOptions = this.options.filter(n =>
          this.matchInput(val, n.label)
        )
      } else {
        this.filterOptions = this.options
      }
      // 记录过滤后的页码
      this.totalPageIndex = Math.ceil(
        this.filterOptions.length / this.pageSize
      )
      // 回到第一页
      this.pageIndex = 1
    },
    /** 重置宽度 */
    handleResize() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width
    },
    /** 隐藏面板时icon图标的处理 */
    handleIconHide() {
      const icon = this.$el.querySelector('.el-input__icon')
      if (icon) {
        removeClass(icon, 'is-reverse')
      }
    },
    /** 打开面板时icon图标的处理 */
    handleIconShow() {
      const icon = this.$el.querySelector('.el-input__icon')
      if (icon) {
        addClass(icon, 'is-reverse')
      }
    },
    /** 判断指定option是否悬停 */
    hoverItem(item) {
      if (!item.disabled) {
        this.hoverIndex = this.currentOptions.indexOf(item)
      }
    },
    /** 判断指定option是否选中 */
    itemSelected(item) {
      return this.selected.find(i => i[this.valueKey] === item[this.valueKey])
    },
    /** 选择option */
    selectOptionClick(option) {
      if (option.disabled !== true) {
        const value = this.value.slice()
        const optionIndex = value.findIndex(i => i === option[this.valueKey])
        if (optionIndex > -1) {
          value.splice(optionIndex, 1)
        } else if (
          this.multipleLimit <= 0 ||
          value.length < this.multipleLimit
        ) {
          value.push(option[this.valueKey])
        }
        this.$emit('input', value)
        if (this.filterable) {
          this.$refs.filter.$el.focus()
        }
      }
    },
    /** 设置初始化值 */
    setSelected() {
      const result = []
      if (Array.isArray(this.value) && this.options.length > 0) {
        this.value.forEach(v => {
          result.push(this.options.filter(n => n[this.valueKey] === v)[0])
        })
        this.selected = result
      }
    },
    /** 取消选中 */
    unselectAll() {
      this.$emit('input', [])
    },
    /** 全选 */
    selectAll() {
      this.$emit(
        'input',
        this.options.filter(n => !n.disabled).map(n => n[this.valueKey])
      )
    }
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) {
      removeResizeListener(this.$el, this.handleResize)
    }
  }
}
</script>
<style scoped>
.uni-ul{
  list-style: none;
  margin: 0;
  padding: 0;
}
.filter-input {
  padding: 5px;
  border-bottom-width: 1px;
}
.el-select-dropdown__item {
  list-style: none;
}
.uni-pagin {
  border-top: 1px solid #dcdfe6;
  padding: 5px;
  height: 30px;
  clear: both;
}
i {
  font-style: normal;
}
.pagin-info {
  font-size: 12px;
  float: left;
  height: 20px;
  line-height: 20px;
}
.pagin-content {
  float: right;
}
.pagin-btn,
.select-btn {
  padding: 3px;
}
.clearing {
  width: 120px;
  margin: 5px auto;
  height: 20px;
}
.pull-left{
  float: left;
}
.pull-right{
  float: right;
}
</style>
