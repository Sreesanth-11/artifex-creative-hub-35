import { TrendingUp, Users, Download, DollarSign } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      id: 1,
      icon: TrendingUp,
      value: "100k+",
      label: "Design Assets",
    },
    {
      id: 2,
      icon: Users,
      value: "25k+",
      label: "Active Designers",
    },
    {
      id: 3,
      icon: Download,
      value: "2.5M+",
      label: "Monthly Downloads",
    },
    {
      id: 4,
      icon: DollarSign,
      value: "$2M+",
      label: "Paid to Creators",
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by Creative Professionals
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of designers earning from their creativity
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;