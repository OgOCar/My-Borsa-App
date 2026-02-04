
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Info, ExternalLink, Activity, Target, ShieldCheck, Clock } from 'lucide-react';
import { analyzeStock } from './services/geminiService';
import { StockAnalysis } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeStock(query);
      if (result) {
        setAnalysis(result);
      } else {
        setError("عذراً، لم نتمكن من تحليل هذا السهم. تأكد من كتابة الاسم أو الرمز بشكل صحيح.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'SELL': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    }
  };

  const getRecText = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'شراء';
      case 'SELL': return 'بيع';
      case 'HOLD': return 'احتفاظ';
      case 'WAIT': return 'انتظار';
      default: return rec;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-xl">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black gradient-text tracking-tight">بورصة إكسبيرت</h1>
        </div>
        <div className="text-xs bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
          البورصة المصرية EGX
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8 space-y-6">
        {/* Search Bar */}
        <div className="glass-card p-4 rounded-3xl shadow-2xl">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث برمز السهم (مثل COMI) أو اسم الشركة..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : "تحليل السهم الآن"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-2xl text-center text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-slate-800 rounded-3xl"></div>
            <div className="h-24 bg-slate-800 rounded-3xl"></div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Main Stats */}
            <div className="glass-card p-6 rounded-3xl space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{analysis.companyName}</h2>
                  <span className="text-slate-500 font-mono">{analysis.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{analysis.currentPrice}</div>
                  <div className={`text-sm font-bold ${analysis.changePercent.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {analysis.changePercent}
                  </div>
                </div>
              </div>

              {/* Recommendation Badge */}
              <div className={`border p-4 rounded-2xl flex items-center justify-between ${getRecColor(analysis.recommendation)}`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={24} />
                  <div>
                    <div className="text-xs opacity-70">نصيحة الخبير</div>
                    <div className="font-bold text-lg leading-tight">قرار: {getRecText(analysis.recommendation)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-black/20 px-3 py-1.5 rounded-full">
                  <Clock size={14} />
                  {analysis.duration === 'SHORT' ? 'مدى قريب' : analysis.duration === 'LONG' ? 'مدى بعيد' : 'مراقبة'}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-300 italic border-r-2 border-emerald-500 pr-3 py-1">
                "{analysis.rationale}"
              </p>
            </div>

            {/* Technical Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-3xl border-b-2 border-blue-500/30">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Target size={14} />
                  <span>دعم ومقاومة</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-rose-400 text-sm">مقاومة: <span className="font-bold">{analysis.resistanceLevel}</span></div>
                  <div className="text-emerald-400 text-sm">دعم: <span className="font-bold">{analysis.supportLevel}</span></div>
                </div>
              </div>

              <div className="glass-card p-4 rounded-3xl border-b-2 border-purple-500/30">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Activity size={14} />
                  <span>مؤشر RSI</span>
                </div>
                <div className={`font-bold ${analysis.rsiStatus === 'Overbought' ? 'text-rose-400' : analysis.rsiStatus === 'Oversold' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {analysis.rsiStatus === 'Overbought' ? 'تشبع شرائي' : analysis.rsiStatus === 'Oversold' ? 'تشبع بيعي' : 'متعادل'}
                </div>
              </div>

              <div className="glass-card p-4 rounded-3xl border-b-2 border-emerald-500/30">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Target size={14} />
                  <span>القيمة العادلة</span>
                </div>
                <div className="font-black text-lg text-emerald-400">{analysis.fairValue}</div>
              </div>

              <div className="glass-card p-4 rounded-3xl border-b-2 border-amber-500/30">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Info size={14} />
                  <span>التوقعات</span>
                </div>
                <div className="text-xs text-slate-300 leading-tight">{analysis.prediction}</div>
              </div>
            </div>

            {/* News Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold px-1 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                أحدث الأخبار والإفصاحات
              </h3>
              {analysis.news.map((n, i) => (
                <a 
                  key={i} 
                  href={n.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass-card p-4 rounded-2xl flex justify-between items-center hover:bg-slate-800 transition-colors group border-r-4 border-r-blue-600/50"
                >
                  <div className="flex-1 ml-4">
                    <div className="text-xs text-blue-400 mb-1 font-semibold">{n.source}</div>
                    <div className="text-sm font-medium text-slate-100 line-clamp-2">{n.title}</div>
                  </div>
                  <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="text-center py-20 space-y-4">
            <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4">
              <TrendingUp size={48} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">ابدأ البحث عن سهم</h3>
            <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
              ادخل اسم الشركة أو الكود المختصر لتحصل على تحليل شامل وتوصيات ذكية في ثوانٍ.
            </p>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-slate-600 text-[10px] space-y-2 pb-8">
        <p>البيانات والتحليلات هي لأغراض استرشادية فقط وليست دعوة للشراء أو البيع</p>
        <p>مدعوم بتقنيات Gemini AI و Google Search Grounding</p>
      </footer>
    </div>
  );
};

export default App;
