<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWebAppMainButton, useWebAppPopup, useWebAppViewport } from 'vue-tg';
import Decimal from 'decimal.js';

const { showAlert } = useWebAppPopup();
const webAppViewport = useWebAppViewport();
const mainButton = useWebAppMainButton();

const theme = ref<any>({});

// Поля ввода
const firstMonth = ref<number | null>(null);
const secondMonth = ref<number | null>(null);
const thirdMonth = ref<number | null>(null);
const firstFactDays = ref<number | null>(null);
const secondFactDays = ref<number | null>(null);
const thirdFactDays = ref<number | null>(null);
const seniority = ref<number | null>(null);
const sickLeaveDays = ref<number | null>(null);

// Ошибка и результат
const error = ref<string>('');
const result = ref<{
  monthTotal: string;
  factDaysTotal: string;
  averageSalaryPerDay: string;
  sickLeavePayment: string;
  coef: string;
} | null>(null);

// Вспомогательные функции расчёта
const calculateTotal = (a: number, b: number, c: number) => new Decimal(a).plus(b).plus(c);
const calculateAverageSalaryPerDay = (total: Decimal, factDays: Decimal) =>
    factDays.equals(0) ? new Decimal(0) : total.dividedBy(factDays).toDecimalPlaces(2, Decimal.ROUND_UP);
const calculateSickLeavePayment = (avg: Decimal, factor: number, days: number) =>
    avg.times(new Decimal(factor * days)).toDecimalPlaces(2, Decimal.ROUND_UP);

// Основная функция расчёта
const calculateSickLeave = () => {
  error.value = '';
  result.value = null;

  // Валидация
  if (
      [
        firstMonth.value,
        secondMonth.value,
        thirdMonth.value,
        firstFactDays.value,
        secondFactDays.value,
        thirdFactDays.value,
        seniority.value,
        sickLeaveDays.value,
      ].some(v => v === null)
  ) {
    error.value = 'Заполните все поля';
    return;
  }

  try {
    mainButton.showMainButtonProgress(true);

    // Расчёт
    const monthTotal = calculateTotal(firstMonth.value!, secondMonth.value!, thirdMonth.value!);
    const factDaysTotal = calculateTotal(
        firstFactDays.value!,
        secondFactDays.value!,
        thirdFactDays.value!
    );
    const avg = calculateAverageSalaryPerDay(monthTotal, factDaysTotal);
    const payment = calculateSickLeavePayment(avg, seniority.value!, sickLeaveDays.value!);

    result.value = {
      monthTotal: monthTotal.toString(),
      factDaysTotal: factDaysTotal.toString(),
      averageSalaryPerDay: avg.toString(),
      sickLeavePayment: payment.toString(),
      coef: seniority.value!.toString(),
    };

    mainButton.setMainButtonText('✅ Готово');
    setTimeout(() => mainButton.setMainButtonText('Рассчитать'), 1500);
  } catch {
    showAlert('Ошибка при расчёте');
  } finally {
    mainButton.showMainButtonProgress(false);
  }
};

// Копирование в буфер обмена
// const copyResult = async () => {
//   if (!result.value) return;
//   try {
//     await window.Telegram.WebApp.writeTextToClipboard(result.value.sickLeavePayment);
//     showAlert('Сумма скопирована в буфер');
//   } catch {
//     showAlert('Не удалось скопировать');
//   }
// };

// Отправка результата боту
const sendToBot = () => {
  if (!result.value) return;
  window.Telegram.WebApp.sendData(
      JSON.stringify({ type: 'sickLeave', value: result.value.sickLeavePayment })
  );
};

// Инициализация после mount
onMounted(() => {
  // Расширяем WebApp под всю высоту
  if (!webAppViewport.isExpanded.value) webAppViewport.expand();

  // Читаем тему
  theme.value = window.Telegram.WebApp.themeParams;
  document.body.style.backgroundColor = theme.value.bg_color || '#ffffff';

  // Настраиваем BackButton
  window.Telegram.WebApp.BackButton.show();
  window.Telegram.WebApp.BackButton.onClick(() => {
    window.Telegram.WebApp.close();
  });

  // Настроим MainButton
  mainButton.setMainButtonText('Рассчитать');
  mainButton.onMainButtonClicked(calculateSickLeave);
  mainButton.showMainButton(); // <-- добавили показ кнопки
});
</script>

<template>
  <div
      class="container"
      :style="{ color: theme.text_color || '#000', fontFamily: 'Arial, sans-serif' }"
  >
    <h1>Калькулятор больничного</h1>

    <!-- Поля ввода -->
    <div class="form-group">
      <label>Зарплата за 1 месяц</label>
      <input
          type="number"
          v-model.number="firstMonth"
          placeholder="например, 25000"
          required
      />
    </div>
    <div class="form-group">
      <label>Зарплата за 2 месяц</label>
      <input
          type="number"
          v-model.number="secondMonth"
          placeholder="например, 30000"
          required
      />
    </div>
    <div class="form-group">
      <label>Зарплата за 3 месяц</label>
      <input
          type="number"
          v-model.number="thirdMonth"
          placeholder="например, 27000"
          required
      />
    </div>

    <div class="form-group">
      <label>Фактически отработанные дни (1 месяц)</label>
      <input
          type="number"
          v-model.number="firstFactDays"
          placeholder="например, 20"
          required
      />
    </div>
    <div class="form-group">
      <label>Фактически отработанные дни (2 месяц)</label>
      <input
          type="number"
          v-model.number="secondFactDays"
          placeholder="например, 22"
          required
      />
    </div>
    <div class="form-group">
      <label>Фактически отработанные дни (3 месяц)</label>
      <input
          type="number"
          v-model.number="thirdFactDays"
          placeholder="например, 18"
          required
      />
    </div>

    <div class="form-group">
      <label>Стаж</label>
      <select v-model.number="seniority" required>
        <option :value="null" disabled>Выберите стаж</option>
        <option :value="0.6">Стаж до 5 лет</option>
        <option :value="0.8">Стаж от 5 до 8 лет</option>
        <option :value="1.0">Стаж от 8 лет</option>
      </select>
    </div>

    <div class="form-group">
      <label>Количество больничных дней</label>
      <input
          type="number"
          v-model.number="sickLeaveDays"
          placeholder="например, 5"
          required
      />
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Блок результата -->
    <div class="result" v-if="result">
      <h2>Результаты</h2>
      <p>Зарплата за 3 мес: {{ result.monthTotal }}</p>
      <p>Факт. дней: {{ result.factDaysTotal }}</p>
      <p>Средний за день: {{ result.averageSalaryPerDay }}</p>
      <p>Коэф. стажа: {{ result.coef }}</p>
      <p><b>К выплате: {{ result.sickLeavePayment }}</b></p>

      <!-- Кнопки взаимодействия -->
<!--      <button class="action-btn" @click="copyResult">Копировать сумму</button>-->
      <button class="action-btn" @click="sendToBot">Отправить боту</button>
    </div>

    <!-- MainButton автоматически встроится Telegram и будет виден внизу -->
  </div>
</template>

<style scoped>
.container {
  padding: 1rem;
  max-width: 400px;
  margin: auto;
}
h1 {
  font-size: 1.4rem;
  text-align: center;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 0.75rem;
}
label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
input,
select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}
.error {
  color: #d32f2f;
  margin: 0.5rem 0;
  font-weight: 500;
}
.result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}
.result p {
  margin: 0.25rem 0;
}
.action-btn {
  width: 48%;
  padding: 0.5rem;
  margin: 0.5rem 1%;
  font-size: 0.95rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.action-btn:hover {
  background-color: #369d6e;
}
</style>
