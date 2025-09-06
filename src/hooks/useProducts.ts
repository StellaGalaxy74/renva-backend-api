import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand?: string;
  location?: string;
  is_available: boolean;
  images: string[];
  views_count: number;
  created_at: string;
  seller_id: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export const useProducts = (searchQuery?: string, categoryId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive"
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const incrementViews = async (productId: string) => {
    try {
      // First get current views count
      const { data: currentProduct } = await supabase
        .from('products')
        .select('views_count')
        .eq('id', productId)
        .single();

      if (currentProduct) {
        const { error } = await supabase
          .from('products')
          .update({ 
            views_count: (currentProduct.views_count || 0) + 1
          })
          .eq('id', productId);

        if (error) {
          console.error('Error incrementing views:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery, categoryId]);

  // Set up real-time subscription for products
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery, categoryId]);

  return {
    products,
    categories,
    loading,
    refetch: fetchProducts,
    incrementViews
  };
};