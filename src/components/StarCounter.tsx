import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export const StarCounter = () => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/neckolis/delovable');
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  if (loading) {
    return <span>Stars</span>;
  }

  return (
    <span className="flex items-center gap-1">
      <Star className="w-4 h-4" />
      {stars !== null ? stars : '0'}
    </span>
  );
};
