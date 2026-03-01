import React from 'react';
import Hero from '../components/Hero';
import FeaturedDestination from '../components/FeaturedDestination';
import ExclusiveOffers from '../components/ExclusiveOffers';
import Testimonial from '../components/Testimonial';
import NewsLetter from '../components/NewsLetter';
import RecommendedHotel from '../components/RecommendedHotel';

const Home = () => {
  return (
    <div>
      <Hero />
      <RecommendedHotel />
      <FeaturedDestination />
      <ExclusiveOffers />
      <Testimonial />
      <NewsLetter/>
    </div>
  )
}

export default Home