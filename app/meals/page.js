import { Suspense } from 'react';
import Link from 'next/link';
import classes from './page.module.css';
export const metadata = {
  title: 'All Meals',
  description: 'Browse the delicious meals, shared by our food-loving community.',
};

import MealsGrid from '@/components/meals/meals-grid';
import {getMeals} from '@/lib/meals';

async function Meals(){  
  const meals = await getMeals();
  return <MealsGrid meals={meals} />;
}

export default function MealsPage(){
  return(
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created{''} <span classname={classes.highlight}>by you</span>
        </h1>
        <p>Choose your favourite recipe and cook it yourself. It is easy and fun.</p>
        <p className={classes.cta}>
          <Link href="/meals/share">
            Share Your Favourite Recipe
          </Link>
        </p>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<p className={classes.loading}>Fetching Data...</p>}>
          <Meals />
        </Suspense>
      </main>
    </>
  );
}
