import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  readTime: string;
  featured: boolean;
}

export default function HealthNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All News', icon: 'fas fa-newspaper' },
    { id: 'nutrition', name: 'Nutrition', icon: 'fas fa-apple-alt' },
    { id: 'fitness', name: 'Fitness', icon: 'fas fa-running' },
    { id: 'mental-health', name: 'Mental Health', icon: 'fas fa-brain' },
    { id: 'medicine', name: 'Medicine', icon: 'fas fa-pills' },
    { id: 'prevention', name: 'Prevention', icon: 'fas fa-shield-alt' },
    { id: 'research', name: 'Research', icon: 'fas fa-microscope' }
  ];

  const sampleNews: NewsArticle[] = [
    {
      id: '1',
      title: 'New Study Reveals Benefits of Daily 30-Minute Walks',
      summary: 'Recent research shows that just 30 minutes of daily walking can significantly reduce the risk of heart disease and improve mental health.',
      category: 'fitness',
      date: '2024-03-10',
      source: 'Health Research Institute',
      readTime: '3 min read',
      featured: true
    },
    {
      id: '2',
      title: 'Understanding Diabetes: Prevention and Management Tips',
      summary: 'Comprehensive guide on preventing diabetes through lifestyle changes and managing the condition effectively with diet and exercise.',
      category: 'prevention',
      date: '2024-03-09',
      source: 'Indian Medical Association',
      readTime: '5 min read',
      featured: true
    },
    {
      id: '3',
      title: 'Mental Health Awareness: Recognizing Early Warning Signs',
      summary: 'Learn to identify early signs of mental health issues and discover resources for getting help and support.',
      category: 'mental-health',
      date: '2024-03-08',
      source: 'WHO Health Updates',
      readTime: '4 min read',
      featured: false
    },
    {
      id: '4',
      title: 'Breakthrough in Cancer Treatment: New Immunotherapy Approach',
      summary: 'Scientists develop a new immunotherapy method that shows promising results in treating various types of cancer.',
      category: 'research',
      date: '2024-03-07',
      source: 'Medical Research Journal',
      readTime: '6 min read',
      featured: false
    },
    {
      id: '5',
      title: 'Nutrition Guide: Foods That Boost Your Immune System',
      summary: 'Discover which foods can help strengthen your immune system and protect against infections and diseases.',
      category: 'nutrition',
      date: '2024-03-06',
      source: 'Nutrition Today',
      readTime: '4 min read',
      featured: false
    },
    {
      id: '6',
      title: 'Hypertension Management: Lifestyle Changes That Work',
      summary: 'Effective strategies for managing high blood pressure through diet, exercise, and stress reduction techniques.',
      category: 'medicine',
      date: '2024-03-05',
      source: 'Cardiology Association',
      readTime: '5 min read',
      featured: false
    }
  ];

  const filteredNews = sampleNews.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredNews = sampleNews.filter(article => article.featured);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      nutrition: 'bg-green-100 text-green-800 border-green-300',
      fitness: 'bg-orange-100 text-orange-800 border-orange-300',
      'mental-health': 'bg-purple-100 text-purple-800 border-purple-300',
      medicine: 'bg-blue-100 text-blue-800 border-blue-300',
      prevention: 'bg-red-100 text-red-800 border-red-300',
      research: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-newspaper text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health News & Updates</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest health news, medical breakthroughs, and wellness tips
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search health news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-search-news"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 ${
                      selectedCategory === category.id ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                    data-testid={`filter-${category.id}`}
                  >
                    <i className={category.icon}></i>
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured News */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              Featured News
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(article.category)}>
                        {categories.find(c => c.id === article.category)?.name}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{article.summary}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {formatDate(article.date)}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {article.readTime}
                        </span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All News */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Latest News' : `${categories.find(c => c.id === selectedCategory)?.name} News`}
            </h2>
            <div className="text-sm text-gray-500">
              {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow" data-testid={`news-article-${article.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(article.category)}>
                        {categories.find(c => c.id === article.category)?.name}
                      </Badge>
                      {article.featured && (
                        <i className="fas fa-star text-yellow-500"></i>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 text-sm">{article.summary}</p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {formatDate(article.date)}
                      </span>
                      <span>
                        <i className="fas fa-clock mr-1"></i>
                        {article.readTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        <i className="fas fa-newspaper mr-1"></i>
                        {article.source}
                      </span>
                      <Button size="sm" variant="outline">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500 mb-2">No news articles found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search terms or selecting a different category
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Health Tips */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <i className="fas fa-lightbulb"></i>
              <span>Daily Health Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">💧 Stay Hydrated</h4>
                <p className="text-sm text-green-700">Drink at least 8 glasses of water daily for optimal health</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">🥗 Eat Balanced</h4>
                <p className="text-sm text-green-700">Include fruits, vegetables, and whole grains in your diet</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">😴 Sleep Well</h4>
                <p className="text-sm text-green-700">Get 7-9 hours of quality sleep every night</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">🏃 Stay Active</h4>
                <p className="text-sm text-green-700">Exercise for at least 30 minutes daily</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}