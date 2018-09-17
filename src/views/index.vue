<template>
  <div>
	<p v-cloak>{{value}}</p>
    <multi-select v-model="value" :options="options" placeholder="请选择重点人员"></multi-select>
  </div>
</template>
<script>
import MultiSelect from '@/components/multi-select/index'
export default {
  components: {
    MultiSelect
  },
  data() {
    return {
      value: ['key3', 'key0', 'key10'],
      options: []
    }
  },
  mounted() {
    setTimeout(() => {
      this.options = [{
        value: 'key0',
        label: '选项零'
      },
      {
        value: 'key1',
        label: '选项一',
        disabled: true
      },
      {
        value: 'key2',
        label: '选项二'
      },
      {
        value: 'key3',
        label: '选项三'
      },
      {
        value: 'key4',
        label: '选项四'
      },
      {
        value: 'key5',
        label: '选项五'
      },
      {
        value: 'key6',
        label: '选项六'
      },
      {
        value: 'key7',
        label: '选项七'
      },
      {
        value: 'key8',
        label: '选项八'
      },
      {
        value: 'key9',
        label: '选项九'
      },
      {
        value: 'key10',
        label: '选项十'
      },
      {
        value: 'key11',
        label: '选项十一'
      },
      {
        value: 'key12',
        label: '选项十二'
      },
      {
        value: 'key13',
        label: '选项十三'
      },
      {
        value: 'key14',
        label: '选项十四'
      },
      {
        value: 'key15',
        label: '选项十五'
      },
      {
        value: 'key16',
        label: '选项十六'
      },
      {
        value: 'key17',
        label: '选项十七'
      },
      {
        value: 'key18',
        label: '选项十八'
      },
      {
        value: 'key19',
        label: '选项十九'
      }]
    }, 300)
  }
}
</script>
