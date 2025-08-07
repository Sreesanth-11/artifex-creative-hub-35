import { Palette, Image, Type, Shapes, Smartphone, Globe } from "lucide-react";

const CategoriesSection = () => {
  const categories = [
    {
      id: 1,
      name: "Logos",
      icon: Palette,
      count: "12.5k",
    },
    {
      id: 2,
      name: "Illustrations",
      icon: Image,
      count: "8.9k",
    },
    {
      id: 3,
      name: "Typography",
      icon: Type,
      count: "5.4k",
    },
    {
      id: 4,
      name: "Icons",
      icon: Shapes,
      count: "15.2k",
    },
    {
      id: 5,
      name: "UI Kits",
      icon: Smartphone,
      count: "3.7k",
    },
    {
      id: 6,
      name: "Templates",
      icon: Globe,
      count: "6.1k",
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Browse Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need across different design categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.id} 
                className="group cursor-pointer bg-background rounded-2xl p-8 text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} items
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;