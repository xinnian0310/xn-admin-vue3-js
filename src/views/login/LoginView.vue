<template>
  <div class="login-page">
    <div class="login-atmosphere" aria-hidden="true">
      <div class="orb orb-a" />
      <div class="orb orb-b" />
      <div class="orb orb-c" />
      <div class="mesh" />
      <div class="circuit" />
    </div>

    <div class="login-shell">
      <aside class="login-brand">
        <div class="brand-glow" aria-hidden="true" />
        <div class="brand-inner">
          <div class="brand-logo-plate">
            <img
              class="brand-logo"
              :src="appConfig.app.logo || '/xinnian-tech-logo.png'"
              alt="心念科技"
            />
          </div>
          <p class="brand-slogan">心有所念，码有所成</p>
          <p class="brand-desc">
            专注于 IT 开发与软件创新，将每一个想法转化为可靠的软件产品，技术赋能企业数字化发展。
          </p>
          <ul class="brand-features">
            <li v-for="(f, i) in intro.features" :key="f.title" :style="{ '--i': i }">
              <span class="feature-icon">
                <el-icon :size="18"><component :is="iconOf(f.icon)" /></el-icon>
              </span>
              <span class="feature-text">
                <strong>{{ f.title }}</strong>
                <em>{{ f.desc }}</em>
              </span>
            </li>
          </ul>
        </div>
        <div class="brand-foot">
          <span>{{ intro.title }}</span>
          <span class="dot" />
          <span>{{ intro.version }}</span>
        </div>
      </aside>

      <section class="login-panel">
        <div class="login-card">
          <header class="login-header">
            <p class="welcome">欢迎回来</p>
            <h1>{{ appConfig.app.name }}</h1>
            <p class="hint">登录以继续管理您的系统</p>
          </header>

          <el-form
            ref="formRef"
            class="login-form"
            :model="form"
            :rules="rules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item v-if="captchaEnabled && captchaType === 'IMAGE'" prop="captcha">
              <div class="captcha-row">
                <el-input
                  v-model="form.captcha"
                  placeholder="请输入验证码"
                  maxlength="6"
                  @keyup.enter="handleLogin"
                />
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  class="captcha-canvas"
                  title="点击刷新"
                  alt="验证码"
                  @click="refreshCaptcha"
                />
                <div
                  v-else
                  class="captcha-canvas captcha-placeholder"
                  title="点击刷新"
                  @click="refreshCaptcha"
                >
                  刷新
                </div>
              </div>
            </el-form-item>

            <el-form-item v-if="captchaEnabled && captchaType === 'SLIDER'" prop="sliderOk">
              <div class="slider-wrap">
                <div class="slider-track">
                  <div class="slider-progress" :style="{ width: `${sliderPercent}%` }" />
                  <span class="slider-text">{{ sliderOk ? '验证通过' : '拖动滑块完成验证' }}</span>
                </div>
                <div
                  class="slider-thumb"
                  :style="{ left: `calc(${sliderPercent}% - 18px)` }"
                  @pointerdown="onSliderStart"
                >
                  <span v-if="sliderOk">✓</span>
                  <span v-else>»</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item class="login-action">
              <el-button
                type="primary"
                class="login-btn"
                :loading="loading"
                native-type="submit"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>

          <footer class="login-foot">
            {{ appConfig.app.footer || `${intro.title} · Copyright © 2026` }}
          </footer>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { appConfig } from '@/config/app'
import { homeConfig } from '@/config/home'
import { useUserStore } from '@/stores/user'
import { getActive } from '@/api/login-page'
import { fetchCaptcha, verifySliderCaptcha } from '@/api/auth'
const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const intro = homeConfig.intro
const captchaEnabled = ref(false)
const captchaType = ref(null)
const captchaId = ref('')
const captchaImage = ref('')
const sliderPercent = ref(0)
const sliderOk = ref(false)
const sliding = ref(false)
const slideStartX = ref(0)
const slideStartPercent = ref(0)
const form = reactive({
  username: 'admin',
  password: 'admin',
  captcha: '',
  sliderOk: false,
})
const iconMap = ElementPlusIconsVue
function iconOf(name) {
  return iconMap[name] || ElementPlusIconsVue.InfoFilled
}
const rules = computed(() => {
  const base = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }
  if (captchaEnabled.value && captchaType.value === 'IMAGE') {
    base.captcha = [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }
  if (captchaEnabled.value && captchaType.value === 'SLIDER') {
    base.sliderOk = [
      {
        validator: (_r, _value, callback) => {
          if (!sliderOk.value) {
            callback(new Error('请完成滑块验证'))
            return
          }
          callback()
        },
        trigger: 'change',
      },
    ]
  }
  return base
})
async function refreshCaptcha() {
  if (!captchaEnabled.value) return
  form.captcha = ''
  resetSlider()
  try {
    const res = await fetchCaptcha()
    const data = res.data
    if (!data) {
      captchaId.value = ''
      captchaImage.value = ''
      return
    }
    captchaId.value = data.captchaId
    captchaType.value = data.captchaType
    captchaImage.value = data.imageBase64 || ''
  } catch {
    ElMessage.error('获取验证码失败')
  }
}
function resetSlider() {
  sliderPercent.value = 0
  sliderOk.value = false
  form.sliderOk = false
}
function onSliderStart(e) {
  if (sliderOk.value) return
  sliding.value = true
  slideStartX.value = e.clientX
  slideStartPercent.value = sliderPercent.value
  window.addEventListener('pointermove', onSliderMove)
  window.addEventListener('pointerup', onSliderEnd)
}
function onSliderMove(e) {
  if (!sliding.value) return
  const track = document.querySelector('.slider-wrap')
  const width = track?.clientWidth || 280
  const delta = ((e.clientX - slideStartX.value) / width) * 100
  sliderPercent.value = Math.min(100, Math.max(0, slideStartPercent.value + delta))
}
async function onSliderEnd() {
  sliding.value = false
  window.removeEventListener('pointermove', onSliderMove)
  window.removeEventListener('pointerup', onSliderEnd)
  if (sliderPercent.value >= 92) {
    sliderPercent.value = 100
    try {
      await verifySliderCaptcha(captchaId.value, 100)
      sliderOk.value = true
      form.sliderOk = true
      formRef.value?.clearValidate('sliderOk')
    } catch {
      resetSlider()
      await refreshCaptcha()
    }
  } else {
    resetSlider()
  }
}
async function loadPageConfig() {
  try {
    const res = await getActive()
    const cfg = res.data
    if (!cfg) return
    captchaEnabled.value = !!cfg.captchaEnabled
    captchaType.value = cfg.captchaType || null
    if (captchaEnabled.value) {
      await refreshCaptcha()
    }
  } catch {
    // 无配置或接口失败时不启用验证码
  }
}
async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const data = await userStore.login(form.username, form.password, {
        captchaId: captchaEnabled.value ? captchaId.value : undefined,
        captchaCode:
          captchaEnabled.value && captchaType.value === 'IMAGE' ? form.captcha : undefined,
      })
      if (data.user?.mustChangePassword) {
        ElMessage.warning('请先修改密码后再使用系统')
        router.push({ path: '/profile', query: { forcePwd: '1' } })
      } else {
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }
    } catch {
      if (captchaEnabled.value) {
        await refreshCaptcha()
      }
    } finally {
      loading.value = false
    }
  })
}
onMounted(() => {
  document.documentElement.classList.add('login-no-scroll')
  document.body.classList.add('login-no-scroll')
  loadPageConfig()
})
onUnmounted(() => {
  document.documentElement.classList.remove('login-no-scroll')
  document.body.classList.remove('login-no-scroll')
  window.removeEventListener('pointermove', onSliderMove)
  window.removeEventListener('pointerup', onSliderEnd)
})
</script>

<style>
html.login-no-scroll,
body.login-no-scroll {
  overflow: hidden !important;
  height: 100%;
  overscroll-behavior: none;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');

.login-page {
  --xn-navy: #0b2a4a;
  --xn-navy-deep: #071c33;
  --xn-teal: #1a8f91;
  --xn-teal-bright: #2bb3b0;
  --xn-accent: #c17a45;
  --xn-accent-soft: rgba(193, 122, 69, 0.18);
  --xn-ink: #12263a;
  --xn-muted: #5b6b7c;

  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'Outfit', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(ellipse 80% 60% at 12% 18%, rgba(43, 179, 176, 0.22), transparent 55%),
    radial-gradient(ellipse 70% 50% at 88% 82%, rgba(193, 122, 69, 0.12), transparent 50%),
    linear-gradient(145deg, #071c33 0%, #0b2a4a 42%, #0f4a5c 72%, #14616a 100%);
  color: var(--xn-ink);
}

.login-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.mesh {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 75%);
}

.circuit {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background:
    radial-gradient(
      circle at 18% 72%,
      transparent 0 5px,
      rgba(43, 179, 176, 0.45) 5px 6px,
      transparent 7px
    ),
    radial-gradient(
      circle at 78% 28%,
      transparent 0 4px,
      rgba(193, 122, 69, 0.5) 4px 5px,
      transparent 6px
    ),
    radial-gradient(
      circle at 62% 78%,
      transparent 0 3px,
      rgba(43, 179, 176, 0.35) 3px 4px,
      transparent 5px
    );
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: float 12s ease-in-out infinite;
}

.orb-a {
  width: 340px;
  height: 340px;
  left: -80px;
  top: -60px;
  background: rgba(43, 179, 176, 0.35);
}

.orb-b {
  width: 280px;
  height: 280px;
  right: -40px;
  bottom: 10%;
  background: rgba(11, 42, 74, 0.55);
  animation-delay: -4s;
}

.orb-c {
  width: 180px;
  height: 180px;
  left: 42%;
  bottom: -40px;
  background: rgba(193, 122, 69, 0.22);
  animation-delay: -7s;
}

@keyframes float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -22px, 0) scale(1.06);
  }
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  width: min(1080px, 100%);
  height: min(640px, 100%);
  max-height: 100%;
  min-height: 0;
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 30px 80px rgba(3, 16, 32, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  animation: shell-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes shell-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-brand {
  position: relative;
  padding: 36px 40px 24px;
  color: #eef6f8;
  background:
    linear-gradient(160deg, rgba(7, 28, 51, 0.55) 0%, rgba(15, 74, 92, 0.35) 100%),
    linear-gradient(180deg, transparent 60%, rgba(7, 28, 51, 0.35));
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.brand-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  right: -60px;
  top: -40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(43, 179, 176, 0.35), transparent 70%);
  pointer-events: none;
}

.brand-inner {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: brand-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

@keyframes brand-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-logo-plate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  max-width: 100%;
  padding: 12px 16px;
  margin-bottom: 18px;
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 16px 40px rgba(3, 16, 32, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.35);
}

.brand-logo {
  width: min(200px, 100%);
  height: auto;
  max-height: 88px;
  object-fit: contain;
  display: block;
}

.brand-slogan {
  margin: 0 0 8px;
  flex-shrink: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.35;
  background: linear-gradient(90deg, #f4fbfb 0%, #9fd9d7 55%, #e8b58a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-desc {
  margin: 0 0 16px;
  flex-shrink: 0;
  max-width: 38em;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(232, 242, 245, 0.78);
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.brand-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
}

.brand-features li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: feature-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(0.22s + var(--i) * 0.08s);
}

@keyframes feature-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #9fe3e0;
  background: linear-gradient(145deg, rgba(43, 179, 176, 0.28), rgba(11, 42, 74, 0.35));
  border: 1px solid rgba(43, 179, 176, 0.28);
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.feature-text strong {
  font-size: 14px;
  font-weight: 600;
  color: #f5fbfb;
}

.feature-text em {
  font-style: normal;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(220, 232, 236, 0.68);
}

.brand-foot {
  position: relative;
  flex-shrink: 0;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(232, 242, 245, 0.55);
}

.brand-foot .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--xn-accent);
  box-shadow: 0 0 0 3px var(--xn-accent-soft);
}

.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  padding: 32px 36px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, #f7fafb 100%);
}

.login-card {
  width: 100%;
  max-width: 360px;
  animation: panel-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: 22px;
  text-align: left;
}

.welcome {
  margin: 0 0 6px;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--xn-teal);
  font-weight: 600;
}

.login-header h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--xn-navy);
  line-height: 1.25;
}

.hint {
  margin: 0;
  font-size: 14px;
  color: var(--xn-muted);
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 14px;
  box-shadow: 0 0 0 1px rgba(11, 42, 74, 0.1) inset;
  background: rgba(255, 255, 255, 0.9);
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(26, 143, 145, 0.35) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--xn-teal) inset,
    0 0 0 3px rgba(26, 143, 145, 0.15) !important;
}

.login-action {
  margin-bottom: 0 !important;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.28em;
  background: linear-gradient(120deg, var(--xn-teal) 0%, #14707c 48%, var(--xn-navy) 100%);
  box-shadow: 0 12px 28px rgba(20, 112, 124, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.login-btn:hover,
.login-btn:focus {
  filter: brightness(1.06);
  box-shadow: 0 14px 32px rgba(20, 112, 124, 0.42);
  transform: translateY(-1px);
  background: linear-gradient(120deg, var(--xn-teal-bright) 0%, #14707c 48%, var(--xn-navy) 100%);
}

.login-btn:active {
  transform: translateY(0);
}

.login-foot {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: #8a97a6;
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-canvas {
  width: 110px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(11, 42, 74, 0.12);
  flex-shrink: 0;
  object-fit: cover;
}

.captcha-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef4f6;
  color: #909399;
  font-size: 13px;
}

.slider-wrap {
  position: relative;
  width: 100%;
  height: 42px;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}

.slider-track {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: #eef3f5;
  overflow: hidden;
  border: 1px solid rgba(11, 42, 74, 0.1);
}

.slider-progress {
  height: 100%;
  background: linear-gradient(90deg, rgba(43, 179, 176, 0.25), rgba(26, 143, 145, 0.45));
  transition: width 0.05s linear;
}

.slider-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #8a97a6;
  pointer-events: none;
}

.slider-thumb {
  position: absolute;
  top: 1px;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #fff;
  border: 1px solid rgba(11, 42, 74, 0.12);
  box-shadow: 0 4px 12px rgba(7, 28, 51, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--xn-teal);
  font-weight: 600;
  z-index: 1;
}

@media (max-height: 760px) {
  .brand-logo {
    max-height: 72px;
    width: min(170px, 100%);
  }

  .brand-desc {
    display: none;
  }

  .brand-features li em {
    display: none;
  }

  .brand-features li {
    align-items: center;
    padding: 7px 10px;
  }

  .login-header {
    margin-bottom: 16px;
  }

  .login-header h1 {
    font-size: 22px;
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .login-foot {
    margin-top: 12px;
  }
}

@media (max-height: 640px) {
  .brand-features {
    display: none;
  }

  .brand-slogan {
    font-size: 18px;
  }

  .brand-logo-plate {
    padding: 8px 12px;
    margin-bottom: 12px;
  }

  .brand-logo {
    max-height: 56px;
  }
}

@media (max-width: 920px) {
  .login-page {
    padding: 12px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    height: 100%;
    border-radius: 22px;
  }

  .login-brand {
    padding: 20px 22px 12px;
    flex: 0 0 auto;
  }

  .brand-logo-plate {
    padding: 10px 12px;
    margin-bottom: 10px;
  }

  .brand-logo {
    width: min(160px, 56vw);
    max-height: 64px;
  }

  .brand-slogan {
    font-size: 18px;
    margin-bottom: 0;
  }

  .brand-desc,
  .brand-features,
  .brand-foot {
    display: none;
  }

  .login-panel {
    padding: 20px 22px 18px;
    flex: 1;
  }

  .login-header h1 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0;
  }

  .login-shell {
    border-radius: 0;
    height: 100%;
    border: none;
  }
}
</style>
