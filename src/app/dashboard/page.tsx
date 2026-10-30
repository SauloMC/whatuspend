// src/app/dashboard/page.tsx
import React from 'react';
import { getCurrentUserAction } from '@/app/actions/user';
import { getPersonalExpensesAction } from '@/app/actions/expenses';
import { getCompaniesAction } from '@/app/actions/companies';
import { getCategoriesAction } from '@/app/actions/categories';
import { demoStore } from '@/domain/demo/demo-store';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch authenticated user or active demo persona
  const currentUser = await getCurrentUserAction();

  // 2. Fetch Personal Expenses
  const expensesRes = await getPersonalExpensesAction(currentUser.id);
  const personalExpenses = expensesRes.data || [];

  // 3. Fetch Companies
  const companiesRes = await getCompaniesAction(currentUser.id);
  const companies = companiesRes.data || [];

  // 4. Fetch Categories
  const categoriesRes = await getCategoriesAction(currentUser.id);
  const categories = categoriesRes.data || [];

  // 5. Fetch Subscriptions, Goals, Alerts & Company Expenses
  const subscriptions = demoStore.subscriptions;
  const goals = demoStore.goals;
  const alerts = demoStore.alerts;
  const companyExpenses = demoStore.companyExpenses;

  return (
    <DashboardView
      user={currentUser}
      initialExpenses={personalExpenses}
      initialCompanies={companies}
      initialCompanyExpenses={companyExpenses}
      categories={categories}
      subscriptions={subscriptions}
      goals={goals}
      alerts={alerts}
    />
  );
}

