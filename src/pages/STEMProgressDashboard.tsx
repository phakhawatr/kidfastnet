import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Award, TrendingUp, Clock, Target, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSTEMProgress } from "@/hooks/useSTEMProgress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const STEMProgressDashboard = () => {
  const { t } = useTranslation("stemprogress");
  const navigate = useNavigate();
  const { activities, badges, dailyStats, summary, isLoading } = useSTEMProgress();

  // Prepare data for charts
  const categoryData = [
    { name: t("categories.science"), value: summary.scienceActivities, color: "#10b981" },
    { name: t("categories.technology"), value: summary.technologyActivities, color: "#3b82f6" },
    { name: t("categories.engineering"), value: summary.engineeringActivities, color: "#f97316" },
    { name: t("categories.mathematics"), value: summary.mathematicsActivities, color: "#a855f7" },
  ];

  const weeklyData = dailyStats?.slice(0, 7).reverse().map((stat) => ({
    date: new Date(stat.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
    points: stat.total_points,
    time: Math.round(stat.total_time_spent / 60), // Convert to minutes
    activities: stat.activities_completed,
  })) || [];

  const badgesByCategory = {
    science: badges?.filter(b => b.badge_category === "science").length || 0,
    technology: badges?.filter(b => b.badge_category === "technology").length || 0,
    engineering: badges?.filter(b => b.badge_category === "engineering").length || 0,
    mathematics: badges?.filter(b => b.badge_category === "mathematics").length || 0,
    overall: badges?.filter(b => b.badge_category === "overall").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-lg">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/stem")} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back_to_stem")}
          </Button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-lg text-white/90">{t("subtitle")}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Target className="h-10 w-10 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{summary.totalActivities}</div>
              <p className="text-white/80 text-sm">{t("stats.total_activities")}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Star className="h-10 w-10 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{summary.totalPoints}</div>
              <p className="text-white/80 text-sm">{t("stats.total_points")}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Clock className="h-10 w-10 text-blue-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{Math.round(summary.totalTime / 60)}</div>
              <p className="text-white/80 text-sm">{t("stats.total_minutes")}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <Award className="h-10 w-10 text-purple-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{summary.badgesEarned}</div>
              <p className="text-white/80 text-sm">{t("stats.badges_earned")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activities by Category - Pie Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">{t("charts.activities_by_category")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Progress - Line Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">{t("charts.weekly_progress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="points" stroke="#fbbf24" strokeWidth={2} name={t("charts.points")} />
                  <Line type="monotone" dataKey="activities" stroke="#3b82f6" strokeWidth={2} name={t("charts.activities")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">{t("category_progress.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryData.map((category) => (
                <div key={category.name} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{category.name}</h3>
                    <Badge className="bg-white/20 text-white border-0">
                      {category.value} {t("category_progress.activities")}
                    </Badge>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(category.value / Math.max(...categoryData.map(c => c.value), 1)) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-white/70">
                    <span>{t("category_progress.badges")}: {badgesByCategory[category.name.toLowerCase() as keyof typeof badgesByCategory]}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges Collection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-6 w-6" />
              {t("badges.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white/10 rounded-lg p-4 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-4xl mb-2">
                      {badge.badge_category === "science" && "🔬"}
                      {badge.badge_category === "technology" && "💻"}
                      {badge.badge_category === "engineering" && "🏗️"}
                      {badge.badge_category === "mathematics" && "🔢"}
                      {badge.badge_category === "overall" && "🏆"}
                    </div>
                    <p className="text-white text-xs font-medium">{badge.badge_code}</p>
                    <p className="text-white/60 text-[10px]">
                      {new Date(badge.earned_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{t("badges.empty")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              {t("recent_activities.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {activity.category === "science" && "🔬"}
                        {activity.category === "technology" && "💻"}
                        {activity.category === "engineering" && "🏗️"}
                        {activity.category === "mathematics" && "🔢"}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{activity.activity_name}</h4>
                        <p className="text-white/60 text-sm">
                          {t(`categories.${activity.category}`)} • {activity.activity_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-white font-bold">+{activity.points_earned}</span>
                      </div>
                      <p className="text-white/60 text-xs">
                        {new Date(activity.created_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{t("recent_activities.empty")}</p>
                <Button
                  onClick={() => navigate("/stem")}
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white"
                >
                  {t("recent_activities.start_learning")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default STEMProgressDashboard;
