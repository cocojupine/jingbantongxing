<template>
  <view class="page">
    <view class="top-bar">
      <view class="top-left" @click="handleBackTap">
        <text class="back-icon">←</text>
        <text class="back-text">{{ isExitConfirming ? '确认退出' : '返回' }}</text>
      </view>
      <view class="top-center">
        <text class="page-title">感官测评</text>
        <text class="page-subtitle">{{ isExitConfirming ? '再次点击左上角将退出测评' : '请选择最接近当前真实感受的选项' }}</text>
      </view>
      <text class="progress">第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</text>
    </view>

    <view v-if="currentQuestion" class="question-card">
      <view class="dimension-tag" :style="{ backgroundColor: currentQuestion.themeColor }">
        <text class="dimension-title">{{ currentQuestion.dimensionTitle }}</text>
      </view>
      <text class="question-title">测评问题</text>
      <text class="question-text">{{ currentQuestion.text }}</text>

      <view class="option-list">
        <view
          v-for="option in currentQuestion.options"
          :key="option.value"
          class="option-item"
          :class="{ 'is-active': selectedValue === option.value }"
          @click="selectOption(option.value)"
        >
          <view class="option-radio">
            <view class="option-radio-dot"></view>
          </view>
          <view class="option-content">
            <text class="option-score">{{ option.value }}分</text>
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <view class="footer">
        <button class="nav-btn secondary" :disabled="currentIndex === 0" @click="goPrev">
          上一题
        </button>
        <button class="nav-btn primary" :disabled="!selectedValue" @click="goNextOrSubmit">
          {{ isLastQuestion ? '提交问卷' : '确认并下一题' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { sensoryData } from '../../data/questionnaire.js'
import calculateRules from '../../../calculate.json'
import { getStoredAuth } from '@/services/auth'
import { runCozeProfileWorkflow } from '@/services/coze'
import { syncPreTripToStorage, syncQuestionnaireLocally, upsertAsdDetails } from '@/services/backend'

const answers = reactive({})
const currentIndex = ref(0)
const isExitConfirming = ref(false)
let exitConfirmTimer = null

const dimensionKeyMap = calculateRules.dimensionKeyMap || {}
const uOffset = Number(calculateRules.uOffset ?? 1)
const uDivisor = Number(calculateRules.uDivisor ?? 9)
const precision = Number(calculateRules.precision ?? 6)
const questionPrefix = calculateRules.questionPrefix || 'Q'

const normalizeQuestionText = (text) => {
  const pureText = String(text || '').split('（')[0].trim()
  return pureText.replace(/^Q\d+[:：]?/, '')
}

const calculateU = (raw) => {
  const value = (Number(raw) - uOffset) / uDivisor
  return Number(value.toFixed(precision))
}

const buildUserdataPayload = () => {
  return sensoryData.reduce((acc, dimension) => {
    const outputKey = dimensionKeyMap[dimension.id] || dimension.id
    acc[outputKey] = dimension.questions.map((question, index) => {
      const raw = answers[question.id] ?? null
      return {
        q: `${questionPrefix}${index + 1}:${normalizeQuestionText(question.text)}`,
        raw,
        u: raw === null ? null : calculateU(raw)
      }
    })
    return acc
  }, {})
}

const buildSensoryObject = (matrix) => {
  const avg = (list) => {
    if (!Array.isArray(list) || !list.length) return 0
    const nums = list
      .map(item => (item && typeof item.u !== 'undefined' ? Number(item.u) : NaN))
      .filter(item => !Number.isNaN(item))
    if (!nums.length) return 0
    const sum = nums.reduce((a, b) => a + b, 0)
    return Number((sum / nums.length).toFixed(2))
  }
  return {
    v: avg(matrix.visual),
    a: avg(matrix.auditory),
    t: avg(matrix.tactile),
    o: avg(matrix.olfactory),
    ta: avg(matrix.taste)
  }
}

const syncUserdata = () => {
  const sensoryMatrix = buildUserdataPayload()
  const sensoryObject = buildSensoryObject(sensoryMatrix)
  syncQuestionnaireLocally({ sensoryMatrix, sensoryObject })
  return { sensoryMatrix, sensoryObject }
}

const questionList = computed(() => {
  return sensoryData.flatMap((dimension) =>
    dimension.questions.map((question) => ({
      id: question.id,
      text: question.text,
      dimensionTitle: dimension.title,
      themeColor: dimension.themeColor,
      bgLight: dimension.bgLight,
      options: dimension.scale
    }))
  )
})

const totalQuestions = computed(() => questionList.value.length)

const currentQuestion = computed(() => {
  return questionList.value[currentIndex.value] || null
})

const selectedValue = computed(() => {
  if (!currentQuestion.value) return null
  return answers[currentQuestion.value.id] || null
})

const isLastQuestion = computed(() => {
  return currentIndex.value === totalQuestions.value - 1
})

const selectOption = (value) => {
  if (!currentQuestion.value) return
  answers[currentQuestion.value.id] = value
  syncUserdata()
}

const goPrev = () => {
  if (currentIndex.value === 0) return
  currentIndex.value -= 1
}

const goNextOrSubmit = async () => {
  if (!selectedValue.value) return
  if (isLastQuestion.value) {
    const payload = syncUserdata()
    uni.setStorageSync('ocean:sensoryAnswers', JSON.stringify(answers))
    uni.setStorageSync('ocean:userdata:lastUpdatedAt', Date.now())
    const auth = getStoredAuth()

    if (auth.loggedIn && auth.userId) {
      try {
        const saved = await upsertAsdDetails({
          profile_id: auth.userId,
          sensory_matrix: payload.sensoryMatrix,
          sensory_object: payload.sensoryObject
        })
        if (saved?.pre_trip) {
          syncPreTripToStorage(saved.pre_trip)
        }

        const workflow = await runCozeProfileWorkflow({ visitorId: auth.userId })
        const structured = workflow && workflow.structured ? workflow.structured : null
        const workflowAnswer = String(workflow && workflow.answer ? workflow.answer : '').trim()
        if (structured) {
          const nextDetail = {
            profile_id: auth.userId,
            sensory_matrix: payload.sensoryMatrix,
            sensory_object: payload.sensoryObject
          }
          if (structured.ai_description) nextDetail.ai_description = structured.ai_description
          if (structured.plan_json) nextDetail.plan_json = structured.plan_json
          await upsertAsdDetails(nextDetail)
        } else if (workflowAnswer) {
          await upsertAsdDetails({
            profile_id: auth.userId,
            sensory_matrix: payload.sensoryMatrix,
            sensory_object: payload.sensoryObject,
            ai_description: workflowAnswer
          })
        }
      } catch (error) {
        console.log('questionnaire sync failed', error)
      }
    }

    uni.showToast({ title: '测评已提交', icon: 'success' })
    return
  }
  currentIndex.value += 1
}

const resetExitConfirm = () => {
  isExitConfirming.value = false
  if (exitConfirmTimer) {
    clearTimeout(exitConfirmTimer)
    exitConfirmTimer = null
  }
}

const exitPage = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({
    url: '/pages/planner/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/planner/index' })
    }
  })
}

const handleBackTap = () => {
  if (isExitConfirming.value) {
    resetExitConfirm()
    exitPage()
    return
  }
  isExitConfirming.value = true
  uni.showToast({
    title: '再次点击左上角返回退出测评',
    icon: 'none',
    duration: 1500
  })
  exitConfirmTimer = setTimeout(() => {
    isExitConfirming.value = false
    exitConfirmTimer = null
  }, 1800)
}
</script>

<style scoped>
.page {
  background-color: #f7f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24rpx 24rpx 16rpx;
}

.top-bar {
  padding: 14rpx 2rpx 10rpx;
  margin-bottom: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-left {
  min-width: 110rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 34rpx;
  color: #455968;
  line-height: 1;
}

.back-text {
  margin-left: 8rpx;
  font-size: 26rpx;
  color: #455968;
}

.top-center {
  flex: 1;
  padding: 0 16rpx;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #273a4a;
  text-align: center;
}

.page-subtitle {
  margin-top: 6rpx;
  display: block;
  font-size: 23rpx;
  color: #72808b;
  text-align: center;
}

.progress {
  min-width: 150rpx;
  text-align: right;
  font-size: 24rpx;
  color: #5b6976;
}

.question-card {
  flex: 1;
  margin-top: 8rpx;
  background-color: #ffffff;
  border: 2rpx solid #e7ebf4;
  border-radius: 28rpx;
  padding: 24rpx 22rpx calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 8rpx 24rpx rgba(93, 108, 152, 0.08);
}

.dimension-tag {
  width: fit-content;
  min-width: 176rpx;
  min-height: 68rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.question-title {
  margin-top: 28rpx;
  display: block;
  font-size: 24rpx;
  color: #6a7785;
}

.question-text {
  margin-top: 12rpx;
  display: block;
  font-size: 34rpx;
  color: #2f4356;
  line-height: 1.55;
  font-weight: 600;
}

.option-list {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.option-item {
  min-height: 114rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  border: 2rpx solid #dde5ef;
  background-color: #ffffff;
  display: flex;
  align-items: center;
}

.is-active {
  border-color: #787ee6;
  background-color: #f6f4ff;
  box-shadow: 0 8rpx 18rpx rgba(122, 127, 228, 0.12);
}

.option-radio {
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  border: 4rpx solid #ccd7e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-radio-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
  background-color: transparent;
}

.is-active .option-radio {
  border-color: #7a7fe4;
}

.is-active .option-radio-dot {
  background-color: #7a7fe4;
}

.option-content {
  margin-left: 16rpx;
  flex: 1;
}

.option-score {
  font-size: 30rpx;
  color: #374f67;
  font-weight: 700;
}

.option-text {
  margin-top: 4rpx;
  display: block;
  font-size: 27rpx;
  color: #607283;
  line-height: 1.35;
  font-weight: 600;
}

.is-active .option-score {
  color: #32388c;
}

.is-active .option-text {
  color: #4f599a;
}

.footer {
  margin-top: 22rpx;
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  flex: 1;
  min-height: 94rpx;
  line-height: 94rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.secondary {
  background-color: #e9edf1;
  color: #5a6c7d;
}

.primary {
  background-color: #7a7fe4;
  color: #ffffff;
}

.nav-btn[disabled] {
  background-color: #cad3dd;
  color: #f5f8fb;
}

button::after {
  border: none;
}
</style>
