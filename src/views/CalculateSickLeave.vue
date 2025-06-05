<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MainButton, useWebAppPopup, useWebAppViewport } from 'vue-tg';
import Decimal from 'decimal.js';

const { showAlert } = useWebAppPopup();
const webAppViewport = useWebAppViewport();

webAppViewport.expand();

const firstMonth = ref(0);
const secondMonth = ref(0);
const thirdMonth = ref(0);
const firstFactDays = ref(0);
const secondFactDays = ref(0);
const thirdFactDays = ref(0);
const seniority = ref(0);
const sickLeaveDays = ref(0);
const result = ref<any>(null);

const calculateTotal = (first: number, second: number, third: number) => {
  return new Decimal(first).plus(second).plus(third);
};

const calculateAverageSalaryPerDay = (monthTotal: Decimal, factDaysTotal: Decimal) => {
  if (factDaysTotal.equals(0)) {
    return new Decimal(0);
  }
  return monthTotal.dividedBy(factDaysTotal).toDecimalPlaces(2, Decimal.ROUND_UP);
};

const calculateSickLeavePayment = (averageSalaryPerDay: Decimal, seniorityFactor: number, sickLeaveDays: number) => {
  return averageSalaryPerDay
      .times(new Decimal(seniorityFactor * sickLeaveDays))
      .toDecimalPlaces(2, Decimal.ROUND_UP);
};

const calculateSickLeave = () => {
  try {
    const monthTotal = calculateTotal(firstMonth.value, secondMonth.value, thirdMonth.value);
    const factDaysTotal = calculateTotal(firstFactDays.value, secondFactDays.value, thirdFactDays.value);
    const averageSalaryPerDay = calculateAverageSalaryPerDay(monthTotal, factDaysTotal);
    const seniorityFactor = parseFloat(seniority.value.toString());
    const sickLeavePayment = calculateSickLeavePayment(averageSalaryPerDay, seniorityFactor, sickLeaveDays.value);

    result.value = {
      monthTotal: monthTotal.toString(),
      factDaysTotal: factDaysTotal.toString(),
      averageSalaryPerDay: averageSalaryPerDay.toString(),
      sickLeavePayment: sickLeavePayment.toString(),
      coeficient: seniority.value.toString()
    };
  } catch (error) {
    showAlert('Убедитесь, что данные введены в правильном формате.');
  }
}

onMounted(() => {
  if (!webAppViewport.isExpanded.value) {
    webAppViewport.expand();
  }
});
</script>

<template>
  <div class="container">
    <h1>Калькулятор больничного</h1>
    <form @submit.prevent="calculateSickLeave">
      <div class="form-group">
        <label for="firstMonth">Зарплата за первый месяц:</label>
        <input type="number" v-model.number="firstMonth" required />
      </div>
      <div class="form-group">
        <label for="secondMonth">Зарплата за второй месяц:</label>
        <input type="number" v-model.number="secondMonth" required />
      </div>
      <div class="form-group">
        <label for="thirdMonth">Зарплата за третий месяц:</label>
        <input type="number" v-model.number="thirdMonth" required />
      </div>
      <div class="form-group">
        <label for="firstFactDays">Фактически отработанные дни за первый месяц:</label>
        <input type="number" v-model.number="firstFactDays" required />
      </div>
      <div class="form-group">
        <label for="secondFactDays">Фактически отработанные дни за второй месяц:</label>
        <input type="number" v-model.number="secondFactDays" required />
      </div>
      <div class="form-group">
        <label for="thirdFactDays">Фактически отработанные дни за третий месяц:</label>
        <input type="number" v-model.number="thirdFactDays" required />
      </div>
      <div class="form-group">
        <label for="seniority">Стаж:</label>
        <select v-model="seniority" class="styled-select" required>
          <option value="" disabled selected>Выберите стаж</option>
          <option value="0.6">Стаж до 5 лет</option>
          <option value="0.8">Стаж от 5 лет до 8 лет</option>
          <option value="1.0">Стаж от 8 лет</option>
        </select>
      </div>
      <div class="form-group">
        <label for="sickLeaveDays">Количество больничных дней:</label>
        <input type="number" v-model.number="sickLeaveDays" required />
      </div>
      <main-button class="main-button" text-color="#000000" @click="calculateSickLeave" text="Рассчитать">Рассчитать</main-button>
    </form>
    <div v-if="result">
      <h2>Результаты расчета</h2>
      <p>Итого заработная плата за три месяца: {{ result.monthTotal }}</p>
      <p>Сумма фактических дней: {{ result.factDaysTotal }}</p>
      <p>Средний дневной заработок: {{ result.averageSalaryPerDay }}</p>
      <p>Коэффициент стажа: {{ result.coeficient }}</p>
      <p><b>Итого за больничные дни: {{ result.sickLeavePayment }}</b></p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  max-width: 100%;
}

h1 {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  width: 100%;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input,
select.styled-select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

select.styled-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: #fff;
  background-image: url('data:image/svg+xml;utf8,<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5H7z" fill="black"/></svg>');
  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 50%;
  padding-right: 2rem;
}

.main-button {
  display: block;
  width: 100%;
  background-color: #ffffff;
  color: #000000;
  padding: 10px;
  border: 1px solid #000000;
  cursor: pointer;
  text-align: center;
  margin-top: 1rem;
}

.main-button:focus {
  outline: none;
}

h2 {
  font-size: 1.2rem;
  text-align: center;
  margin-top: 1rem;
}

p {
  font-size: 1rem;
  margin: 0.5rem 0;
  text-align: center;
}

/* Media queries for mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0.5rem;
  }

  h1 {
    font-size: 1.2rem;
  }

  form {
    max-width: 100%;
    padding: 0 1rem;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  label {
    font-size: 0.9rem;
  }

  input,
  select.styled-select {
    font-size: 0.9rem;
    padding: 0.4rem;
  }

  .main-button {
    padding: 8px;
    font-size: 0.9rem;
  }

  h2 {
    font-size: 1rem;
  }

  p {
    font-size: 0.9rem;
  }
}
</style>
