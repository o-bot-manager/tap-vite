<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MainButton, useWebAppPopup, useWebAppViewport } from 'vue-tg'
import Decimal from 'decimal.js';

const { showAlert } = useWebAppPopup()
const webAppViewport = useWebAppViewport()

const firstMonth = ref(0)
const secondMonth = ref(0)
const thirdMonth = ref(0)
const vacationDays = ref(0)
const result = ref<any>(null)

const SOCIAL_TAX_RATE = new Decimal(0.1)
const INCOME_TAX_RATE = new Decimal(0.1)
const DAYS_IN_MONTH = new Decimal(29.6)
const MONTHS_COUNT = new Decimal(3)

const calculateTotal = (firstMonth: number, secondMonth: number, thirdMonth: number) => {
  return new Decimal(firstMonth).plus(secondMonth).plus(thirdMonth)
}

const calculateAverageSalaryPerDay = (total: Decimal) => {
  return total.dividedBy(DAYS_IN_MONTH.times(MONTHS_COUNT)).toDecimalPlaces(2, Decimal.ROUND_CEIL)
}

const calculatePayment = (averageSalaryPerDay: Decimal, vacationDays: number) => {
  return averageSalaryPerDay.times(new Decimal(vacationDays)).toDecimalPlaces(2, Decimal.ROUND_CEIL)
}

const calculateSocialTax = (vacationPayment: Decimal) => {
  return vacationPayment.times(SOCIAL_TAX_RATE).toDecimalPlaces(2, Decimal.ROUND_CEIL)
}

const calculateIncomeTax = (vacationPayment: Decimal, socialTax: Decimal) => {
  const taxableAmount = vacationPayment.minus(socialTax)
  return taxableAmount.times(INCOME_TAX_RATE).toDecimalPlaces(2, Decimal.ROUND_CEIL)
}

const calculatePayAfterTax = (vacationPayment: Decimal, socialTax: Decimal, incomeTax: Decimal) => {
  return vacationPayment.minus(socialTax).minus(incomeTax)
}

const calculateVacationPayment = () => {
  try {
    const total = calculateTotal(firstMonth.value, secondMonth.value, thirdMonth.value)
    const averageSalaryPerDay = calculateAverageSalaryPerDay(total)
    const vacationPayment = calculatePayment(averageSalaryPerDay, vacationDays.value)
    const socialTax = calculateSocialTax(vacationPayment)
    const incomeTax = calculateIncomeTax(vacationPayment, socialTax)
    const vacationPayAfterTax = calculatePayAfterTax(vacationPayment, socialTax, incomeTax)

    result.value = {
      averageSalaryPerDay: averageSalaryPerDay.toString(),
      vacationPayment: vacationPayment.toString(),
      socialTax: socialTax.toString(),
      incomeTax: incomeTax.toString(),
      vacationPayAfterTax: vacationPayAfterTax.toString()
    }
  } catch (error) {
    showAlert('Произошла ошибка. Попробуйте еще раз.')
  }
}

onMounted(() => {
  if (!webAppViewport.isExpanded.value) {
    webAppViewport.expand()
  }
})
</script>


<template>
  <div class="container">
    <h1>Калькулятор отпускных</h1>
    <form @submit.prevent="calculateVacationPayment">
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
        <label for="vacationDays">Количество отпускных дней:</label>
        <input type="number" v-model.number="vacationDays" required />
      </div>
      <main-button class="main-button" text-color="#000000" @click="calculateVacationPayment" text="Рассчитать">Рассчитать</main-button>
    </form>
    <div v-if="result">
      <h2>Результаты расчета</h2>
      <p>Средняя зарплата за день: {{ result.averageSalaryPerDay }}</p>
      <p>Сумма отпускных: {{ result.vacationPayment }}</p>
      <p>Социальный налог: {{ result.socialTax }}</p>
      <p>Подоходный налог: {{ result.incomeTax }}</p>
      <p>Отпускные после вычета налогов: {{ result.vacationPayAfterTax }}</p>
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

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
</style>

