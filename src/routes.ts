import { createRouter, createWebHashHistory } from 'vue-router';
import CalculateVacation from './views/CalculateVacation.vue';
import CalculateSickLeave from './views/CalculateSickLeave.vue';

const routes = [
    {
        path: '/calc-vacation',
        component: CalculateVacation,
    },
    {
        path: '/calc-sick-leave',
        component: CalculateSickLeave,
    },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});