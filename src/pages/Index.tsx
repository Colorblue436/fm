import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to main app - the app handles its own routing internally
    navigate('/');
  }, [navigate]);

  return null;
};

export default Index;
