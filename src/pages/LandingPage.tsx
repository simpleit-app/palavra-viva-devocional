
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';
import { TestimonialType } from '@/components/landing/types';
import { toast } from "sonner";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [reflectionsCount, setReflectionsCount] = useState<number>(0);
  const [versesReadCount, setVersesReadCount] = useState<number>(0);
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get active subscribers count (where subscribed = true)
        const { data: subscribersData, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('subscribed', true);
        
        if (subscribersError) throw subscribersError;
        console.log('Subscribers data:', subscribersData);
        setSubscribersCount(subscribersData?.length || 0);
        
        // Get total reflections count
        const { data: reflectionsData, error: reflectionsError } = await supabase
          .from('reflections')
          .select('*');
        
        if (reflectionsError) throw reflectionsError;
        console.log('Reflections data:', reflectionsData);
        setReflectionsCount(reflectionsData?.length || 0);
        
        // Get total verses read count
        const { data: versesReadData, error: versesReadError } = await supabase
          .from('read_verses')
          .select('*');
        
        if (versesReadError) throw versesReadError;
        console.log('Verses read data:', versesReadData);
        setVersesReadCount(versesReadData?.length || 0);
        
        // Get testimonials
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (testimonialsError) throw testimonialsError;
        setTestimonials(testimonialsData || []);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-celestial-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />
      <Hero 
        loading={loading}
        subscribersCount={subscribersCount}
        reflectionsCount={reflectionsCount}
        versesReadCount={versesReadCount}
      />
      <Features />
      <Pricing />
      <Testimonials testimonials={testimonials} />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default LandingPage;
