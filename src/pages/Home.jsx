import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Category from '../components/Category';
import SpecialOffers from '../components/SpecialOffers';
import Ratings from '../components/Ratings';
import Team from '../components/Team';

export default function Home() {
  return (
    <>
      <Header />
      <About />
      <Category />
      <SpecialOffers />
      <Ratings />
      <Team />
    </>
  );
}
