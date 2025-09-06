import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  location?: string;
  images: string[];
  views_count: number;
  created_at: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      'new': 'bg-green-500',
      'like_new': 'bg-green-400',
      'good': 'bg-yellow-500',
      'fair': 'bg-orange-500',
      'poor': 'bg-red-500'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-500';
  };

  const imageUrl = product.images && product.images[0] 
    ? `https://qgdncciriipkiqbesgsl.supabase.co/storage/v1/object/public/product-images/${product.images[0]}`
    : '/placeholder.svg';

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`${getConditionColor(product.condition)} text-white`}
            >
              {product.condition.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary">
            {product.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{product.location || 'Location not specified'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <Eye className="h-4 w-4 mr-1" />
              <span>{product.views_count || 0}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0">
          {product.categories && (
            <Badge variant="outline">{product.categories.name}</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;