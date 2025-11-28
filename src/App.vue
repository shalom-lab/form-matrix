<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { templateSources } from './data/templateList'

const templates = ref([])
const selectedTemplateId = ref(null)
const loadingTemplates = ref(false)
const loadError = ref('')
const repoUrl = 'https://github.com/shalom-lab/form-matrix'

const formSpec = reactive({
  name: '',
  filename: '',
  fieldOrder: [],
  fields: {},
})

const editingFieldKey = ref(null)
const notification = ref('')
const notificationTimeout = ref(null)
const templateCollapsed = ref(false)
const previewTab = ref('fields')

const newField = reactive({
  key: '',
  label: '',
  type: 'text',
  placeholder: '',
  required: true,
  defaultValue: '',
  checkboxDefault: false,
  optionsText: '',
})

const fieldTypeOptions = [
  { value: 'text', label: '文本输入' },
  { value: 'textarea', label: '多行文本' },
  { value: 'select', label: '下拉选择' },
  { value: 'date', label: '日期选择' },
  { value: 'number', label: '数字输入' },
  { value: 'checkbox', label: '开关/勾选' },
  { value: 'radio', label: '单选' },
  { value: 'array', label: '标签/数组' },
]

onMounted(async () => {
  await fetchTemplates()
})

async function fetchTemplates() {
  loadingTemplates.value = true
  loadError.value = ''
  try {
    const fetched = []
    for (const tpl of templateSources) {
      const res = await fetch(tpl.path)
      if (!res.ok) throw new Error(`无法读取 ${tpl.name}`)
      const data = await res.json()
      fetched.push({ ...tpl, data: data.field_types })
    }
    templates.value = fetched
    if (fetched.length) {
      applyTemplate(fetched[0].id)
    } else {
      startFromBlank()
    }
  } catch (err) {
    loadError.value = err.message || '模板加载失败'
    startFromBlank()
  } finally {
    loadingTemplates.value = false
  }
}

function applyTemplate(templateId) {
  const target = templates.value.find((tpl) => tpl.id === templateId)
  if (!target) return
  selectedTemplateId.value = target.id
  hydrateSpec(target.data)
  showToast(`已载入「${target.name}」`)
}

function startFromBlank() {
  selectedTemplateId.value = null
  hydrateSpec({
    name: '',
    filename: 'data-raw/new-form.json',
    fieldOrder: [],
    fields: {},
  })
  showToast('已准备空白模板')
}

function hydrateSpec(data) {
  formSpec.name = data.name || ''
  formSpec.filename = data.filename || ''
  formSpec.fieldOrder = Array.isArray(data.fieldOrder) ? [...data.fieldOrder] : []
  formSpec.fields = data.fields ? { ...data.fields } : {}
  resetFieldEditor()
}

const orderedFields = computed(() =>
  formSpec.fieldOrder.map((key) => ({
    key,
    ...(formSpec.fields[key] || {}),
  })),
)

const exportJson = computed(() =>
  JSON.stringify(
    {
      field_types: {
        name: formSpec.name,
        filename: formSpec.filename,
        fieldOrder: formSpec.fieldOrder,
        fields: formSpec.fields,
      },
    },
    null,
    2,
  ),
)

function handleFieldSubmit() {
  if (!newField.key.trim()) {
    showToast('字段 Key 不能为空', true)
    return
  }
  if (!newField.label.trim()) {
    showToast('请填写字段标题', true)
    return
  }

  const key = newField.key.trim()
  const isEditing = Boolean(editingFieldKey.value)
  const keyChanged = isEditing && editingFieldKey.value !== key

  if (!isEditing && formSpec.fieldOrder.includes(key)) {
    showToast('字段 Key 已存在', true)
    return
  }

  if (keyChanged && formSpec.fieldOrder.includes(key)) {
    showToast('新的字段 Key 已被占用', true)
    return
  }

  const fieldConfig = buildFieldConfig()
  const nextFields = { ...formSpec.fields }

  if (keyChanged) {
    delete nextFields[editingFieldKey.value]
    formSpec.fieldOrder = formSpec.fieldOrder.map((k) =>
      k === editingFieldKey.value ? key : k,
    )
  }

  nextFields[key] = fieldConfig
  formSpec.fields = nextFields

  if (!isEditing) {
    formSpec.fieldOrder = [...formSpec.fieldOrder, key]
  }

  showToast(isEditing ? '字段已更新' : '字段已添加')
  resetFieldEditor()
}

function buildFieldConfig() {
  const base = {
    type: newField.type,
    label: newField.label.trim(),
    required: Boolean(newField.required),
  }

  if (newField.placeholder.trim()) {
    base.placeholder = newField.placeholder.trim()
  }

  const optionsNeeded = ['select', 'radio']
  if (optionsNeeded.includes(newField.type)) {
    const optionList = newField.optionsText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    base.options = optionList
  }

  switch (newField.type) {
    case 'number':
      base.default =
        newField.defaultValue === ''
          ? undefined
          : Number(newField.defaultValue)
      break
    case 'checkbox':
      base.default = Boolean(newField.checkboxDefault)
      break
    case 'array':
      base.default = newField.defaultValue
        ? newField.defaultValue
            .split(/[\n,，]+/)
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []
      if (!base.placeholder) {
        base.placeholder = '输入标签后回车'
      }
      break
    default:
      base.default = newField.defaultValue
      break
  }

  if (base.default === undefined || base.default === '') {
    delete base.default
  }

  return base
}

function editField(key) {
  const field = formSpec.fields[key]
  if (!field) return
  editingFieldKey.value = key
  newField.key = key
  newField.label = field.label || ''
  newField.type = field.type || 'text'
  newField.placeholder = field.placeholder || ''
  newField.required = Boolean(field.required)
  newField.checkboxDefault = Boolean(field.default)
  if (field.type === 'array') {
    newField.defaultValue = Array.isArray(field.default)
      ? field.default.join('\n')
      : ''
  } else if (field.type === 'checkbox') {
    newField.defaultValue = ''
  } else {
    newField.defaultValue =
      field.default === undefined ? '' : String(field.default)
  }
  newField.optionsText = Array.isArray(field.options)
    ? field.options.join('\n')
    : ''
}

function removeField(key) {
  formSpec.fieldOrder = formSpec.fieldOrder.filter((item) => item !== key)
  const nextFields = { ...formSpec.fields }
  delete nextFields[key]
  formSpec.fields = nextFields
  if (editingFieldKey.value === key) {
    resetFieldEditor()
  }
  showToast('字段已删除')
}

function moveField(key, direction) {
  const idx = formSpec.fieldOrder.indexOf(key)
  if (idx === -1) return
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= formSpec.fieldOrder.length) return
  const nextOrder = [...formSpec.fieldOrder]
  ;[nextOrder[idx], nextOrder[target]] = [nextOrder[target], nextOrder[idx]]
  formSpec.fieldOrder = nextOrder
}

function resetFieldEditor() {
  editingFieldKey.value = null
  newField.key = ''
  newField.label = ''
  newField.type = 'text'
  newField.placeholder = ''
  newField.required = true
  newField.defaultValue = ''
  newField.checkboxDefault = false
  newField.optionsText = ''
}

function copyJson() {
  navigator.clipboard.writeText(exportJson.value).then(() => {
    showToast('JSON 已复制到剪贴板')
  })
}

function downloadJson() {
  const blob = new Blob([exportJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = formSpec.filename || 'field-types.json'
  link.click()
  URL.revokeObjectURL(url)
  showToast('JSON 已下载')
}

function showToast(message, isError = false) {
  notification.value = message
  if (isError) {
    notification.value = `⚠️ ${message}`
  }
  clearTimeout(notificationTimeout.value)
  notificationTimeout.value = setTimeout(() => {
    notification.value = ''
  }, 2600)
}

function toggleTemplatePanel() {
  templateCollapsed.value = !templateCollapsed.value
}
</script>

<template>
  <div class="page-wrapper">
    <header class="hero">
      <div class="hero-text">
        <p class="eyebrow">Form Matrix · 交互式表单工坊</p>
        <h1>一站式打造专业级表单规范</h1>
        <p class="subtitle">
          可视化地组合字段、实时预览 JSON，并一键复制或下载生成的配置。
        </p>
      </div>
      <a
        class="star-badge"
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
      >
        ⭐️
      </a>
    </header>

    <section class="action-strip">
      <div class="action-strip-left" :class="{ active: Boolean(notification) }">
        <p class="strip-title">
          {{ notification || '工具栏' }}
        </p>
        <span class="muted">
          {{
            notification
              ? '最新状态已就绪，可继续编辑表单'
              : '快速完成模板初始化与结果导出'
          }}
        </span>
      </div>
      <div class="hero-actions">
        <button class="secondary" @click="startFromBlank">新建空白模板</button>
        <button class="primary" @click="copyJson">复制 JSON</button>
        <button class="primary" @click="downloadJson">下载 JSON</button>
      </div>
    </section>

    <main class="grid" :class="{ 'template-collapsed': templateCollapsed }">
      <aside class="panel template-panel" :class="{ collapsed: templateCollapsed }">
        <div class="panel-head">
          <h2>模板仓库</h2>
          <div class="head-actions">
            <span v-if="loadingTemplates && !templateCollapsed" class="muted">加载中...</span>
            <button class="ghost xs" @click="toggleTemplatePanel">
              {{ templateCollapsed ? '展开' : '折叠' }}
            </button>
          </div>
        </div>
        <template v-if="!templateCollapsed">
          <p v-if="loadError" class="error">{{ loadError }}</p>
          <div class="template-list">
            <button
              v-for="tpl in templates"
              :key="tpl.id"
              class="template-card"
              :class="{ active: tpl.id === selectedTemplateId }"
              @click="applyTemplate(tpl.id)"
            >
              <div class="template-name">{{ tpl.name }}</div>
              <p>{{ tpl.description }}</p>
            </button>
          </div>
        </template>
      </aside>

      <section class="panel">
        <h2>表单基础信息</h2>
        <div class="form-grid">
          <label>
            <span>名称 (name)</span>
            <input
              v-model="formSpec.name"
              type="text"
              placeholder="例如：🔎 模板示例"
            />
          </label>
          <label>
            <span>文件名 (filename)</span>
            <input
              v-model="formSpec.filename"
              type="text"
              placeholder="data-raw/examples.json"
            />
          </label>
        </div>

        <div class="field-builder">
          <div class="builder-form builder-right">
            <div class="section-head">
              <h3>{{ editingFieldKey ? '编辑字段' : '新增字段' }}</h3>
              <button v-if="editingFieldKey" class="ghost xs" @click="resetFieldEditor">
                取消
              </button>
            </div>
            <form class="field-form" @submit.prevent="handleFieldSubmit">
              <label>
                <span>字段 Key</span>
                <input
                  v-model="newField.key"
                  type="text"
                  placeholder="text_example"
                />
              </label>
              <label>
                <span>字段标题</span>
                <input
                  v-model="newField.label"
                  type="text"
                  placeholder="文本输入"
                />
              </label>
              <label>
                <span>类型</span>
                <select v-model="newField.type">
                  <option v-for="type in fieldTypeOptions" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </label>
              <label v-if="newField.type !== 'checkbox'">
                <span>Placeholder (可选)</span>
                <input
                  v-model="newField.placeholder"
                  type="text"
                  placeholder="请输入内容"
                />
              </label>
              <label v-if="['select', 'radio'].includes(newField.type)">
                <span>选项（每行一个）</span>
                <textarea
                  v-model="newField.optionsText"
                  rows="3"
                  placeholder="选项A&#10;选项B&#10;选项C"
                ></textarea>
              </label>
              <label v-if="newField.type === 'checkbox'" class="checkbox-row">
                <input v-model="newField.checkboxDefault" type="checkbox" />
                <span>默认选中</span>
              </label>
              <label v-else>
                <span>默认值 (可选)</span>
                <textarea
                  v-if="newField.type === 'textarea' || newField.type === 'array'"
                  v-model="newField.defaultValue"
                  rows="3"
                  placeholder="textarea: 可换行&#10;array: 一行一个标签"
                ></textarea>
                <input
                  v-else
                  v-model="newField.defaultValue"
                  :type="newField.type === 'number' ? 'number' : 'text'"
                  placeholder="根据字段类型填写"
                />
              </label>
              <label class="checkbox-row">
                <input v-model="newField.required" type="checkbox" />
                <span>必填</span>
              </label>
              <button class="primary w-100" type="submit">
                {{ editingFieldKey ? '保存字段' : '添加字段' }}
              </button>
            </form>
          </div>

          <div class="builder-preview builder-list-panel">
            <div class="tabs">
              <button
                class="tab-btn"
                :class="{ active: previewTab === 'fields' }"
                @click="previewTab = 'fields'"
              >
                字段列表
              </button>
              <button
                class="tab-btn"
                :class="{ active: previewTab === 'json' }"
                @click="previewTab = 'json'"
              >
                JSON 预览
              </button>
            </div>

            <div v-if="previewTab === 'fields'" class="tab-content">
              <div class="section-head">
                <h3>字段列表</h3>
                <span class="muted">{{ formSpec.fieldOrder.length }} 个字段</span>
              </div>
              <div v-if="!formSpec.fieldOrder.length" class="empty">
                还没有字段，可以在左侧添加
              </div>
              <div v-else class="field-list">
                <div v-for="field in orderedFields" :key="field.key" class="field-row">
  <div>
                    <p class="field-title">
                      {{ field.label || field.key }}
                      <span class="pill">{{ field.type }}</span>
                    </p>
                    <p class="field-meta">{{ field.key }}</p>
                  </div>
                  <div class="field-actions">
                    <button @click="moveField(field.key, 'up')">↑</button>
                    <button @click="moveField(field.key, 'down')">↓</button>
                    <button @click="editField(field.key)">编辑</button>
                    <button class="danger" @click="removeField(field.key)">删除</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="tab-content">
              <h3>JSON 预览</h3>
              <pre class="json-preview">{{ exportJson }}</pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
