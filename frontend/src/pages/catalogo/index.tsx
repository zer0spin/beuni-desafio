import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  Package
} from 'lucide-react';

import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  colors?: string[];
}

export default function CatalogoPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = [
    'Todos',
    'Garrafas Térmicas',
    'Camisetas',
    'Mochilas',
    'Ecobags',
    'Canetas',
    'Cadernos',
    'Acessórios Tech',
    'Kits Corporativos'
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Garrafa Térmica Personalizada',
      category: 'Garrafas Térmicas',
      price: 'R$ 89,90',
      image: '/images/products/garrafa-laranja.png',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      colors: ['#FF5600', '#000000', '#0066CC']
    },
    {
      id: '2',
      name: 'Camiseta Premium Cotton',
      category: 'Camisetas',
      price: 'R$ 59,90',
      image: '/images/products/camiseta-laranja.png',
      rating: 4.9,
      reviews: 89,
      inStock: true,
      colors: ['#FF5600', '#FFFFFF', '#000000']
    },
    {
      id: '3',
      name: 'Mochila Executiva',
      category: 'Mochilas',
      price: 'R$ 249,90',
      image: '/images/products/mochila-marrom.png',
      rating: 4.7,
      reviews: 156,
      inStock: true,
      colors: ['#8B4513', '#000000']
    },
    {
      id: '4',
      name: 'Ecobag Sustentável',
      category: 'Ecobags',
      price: 'R$ 34,90',
      image: '/images/products/ecobag-laranja.png',
      rating: 4.6,
      reviews: 203,
      inStock: true,
      colors: ['#FF5600', '#00AA00', '#0066CC']
    },
    {
      id: '5',
      name: 'Kit Colaborador Completo',
      category: 'Kits Corporativos',
      price: 'R$ 159,90',
      image: '/images/kits/kit-colaboradores.png',
      rating: 5.0,
      reviews: 67,
      inStock: true
    },
    {
      id: '6',
      name: 'Kit Para Eventos',
      category: 'Kits Corporativos',
      price: 'R$ 179,90',
      image: '/images/kits/kit-eventos.png',
      rating: 4.9,
      reviews: 45,
      inStock: true
    },
    {
      id: '7',
      name: 'Kit Cliente Premium',
      category: 'Kits Corporativos',
      price: 'R$ 199,90',
      image: '/images/kits/kit-clientes.png',
      rating: 4.8,
      reviews: 78,
      inStock: true
    },
    {
      id: '8',
      name: 'Kit Diversos',
      category: 'Kits Corporativos',
      price: 'R$ 139,90',
      image: '/images/kits/kit-diversos.png',
      rating: 4.7,
      reviews: 92,
      inStock: false
    }
  ];

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'Todos' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-beuni-text flex items-center">
                <ShoppingBag className="h-8 w-8 mr-3 text-beuni-orange-600" />
                Catálogo de Produtos
              </h1>
              <p className="text-beuni-text/60 mt-1">
                Explore nossa seleção de brindes corporativos personalizados
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-beuni-orange-500 text-white'
                    : 'bg-white text-beuni-text/60 hover:bg-beuni-orange-50'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-beuni-orange-500 text-white'
                    : 'bg-white text-beuni-text/60 hover:bg-beuni-orange-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-beuni-text/40" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-beuni-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-beuni-orange-500 text-white shadow-md'
                      : 'bg-white text-beuni-text hover:bg-beuni-orange-50 border border-beuni-orange-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 p-6 aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Esgotado
                    </div>
                  )}
                  <button className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-beuni-orange-500 hover:text-white transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-beuni-orange-600 font-semibold uppercase mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-beuni-text mb-2 group-hover:text-beuni-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-beuni-text/60">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Colors */}
                  {product.colors && (
                    <div className="flex items-center space-x-2 mb-3">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-beuni-orange-100">
                    <span className="text-xl font-bold text-beuni-orange-600">
                      {product.price}
                    </span>
                    <button className="p-2 bg-beuni-orange-500 text-white rounded-lg hover:bg-beuni-orange-600 transition-colors">
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6 hover:shadow-md transition-shadow cursor-pointer flex items-center"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-xl p-4 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 ml-6">
                  <p className="text-xs text-beuni-orange-600 font-semibold uppercase mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-beuni-text mb-2">{product.name}</h3>
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-beuni-text/60">
                      {product.rating} ({product.reviews} avaliações)
                    </span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-beuni-orange-600">{product.price}</p>
                    <p className="text-xs text-beuni-text/60">
                      {product.inStock ? 'Em estoque' : 'Esgotado'}
                    </p>
                  </div>
                  <button
                    disabled={!product.inStock}
                    className="px-6 py-3 bg-beuni-orange-500 text-white rounded-xl hover:bg-beuni-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-beuni-text/30 mx-auto mb-4" />
            <p className="text-lg text-beuni-text/60">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </Layout>
  );
}