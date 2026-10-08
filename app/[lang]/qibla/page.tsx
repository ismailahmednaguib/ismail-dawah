'use client';

import { useState, useEffect, useCallback } from 'react';

// إحداثيات الكعبة المشرفة
const KAABA = { lat: 21.422487, lng: 39.826206 };

// حساب اتجاه القبلة رياضياً
function calculateQiblaDirection(lat: number, lng: number): number {
  const phiK = (KAABA.lat * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const deltaLambda = ((KAABA.lng - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  const qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

// المدن الشهيرة (وضع يدوي)
const CITIES: Record<string, { lat: number; lng: number; name: string }> = {
  cairo: { lat: 30.0444, lng: 31.2357, name: 'القاهرة' },
  riyadh: { lat: 24.7136, lng: 46.6753, name: 'الرياض' },
  jeddah: { lat: 21.4858, lng: 39.1925, name: 'جدة' },
  dubai: { lat: 25.2048, lng: 55.2708, name: 'دبي' },
  istanbul: { lat: 41.0082, lng: 28.9784, name: 'إسطنبول' },
  kuala_lumpur: { lat: 3.139, lng: 101.6869, name: 'كوالالمبور' },
  jakarta: { lat: -6.2088, lng: 106.8456, name: 'جاكرتا' },
  london: { lat: 51.5074, lng: -0.1278, name: 'لندن' },
  paris: { lat: 48.8566, lng: 2.3522, name: 'باريس' },
  new_york: { lat: 40.7128, lng: -74.006, name: 'نيويورك' },
  toronto: { lat: 43.6532, lng: -79.3832, name: 'تورونتو' },
  lagos: { lat: 6.5244, lng: 3.3792, name: 'لاغوس' },
};

export default function QiblaPage() {
  const [mode, setMode] = useState<'gps' | 'manual'>('gps');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [selectedCity, setSelectedCity] = useState('cairo');

  // الحصول على الموقع عبر GPS
  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('متصفحك لا يدعم تحديد الموقع. جرب الوضع اليدوي 👇');
      setLoading(false);
      setMode('manual');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setQibla(calculateQiblaDirection(latitude, longitude));
        setLoading(false);
      },
      () => {
        setError('تعذّر الوصول للموقع. تأكد من تفعيل الـ GPS أو جرب الوضع اليدوي 👇');
        setLoading(false);
        setMode('manual');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // تفعيل بوصلة الجهاز (iOS يحتاج إذن)
  const enableCompass = async () => {
    try {
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === 'function') {
        const permission = await DOE.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', (e: any) => {
            if (e.webkitCompassHeading !== undefined) {
              setHeading(e.webkitCompassHeading);
            } else if (e.alpha !== null) {
              setHeading(360 - e.alpha);
            }
          });
          setNeedsPermission(false);
        }
      } else {
        setNeedsPermission(false);
      }
    } catch {
      setNeedsPermission(false);
    }
  };

  // الاستماع للبوصلة (للأجهزة اللي مش محتاجة إذن)
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const anyE = e as any;
      if (anyE.webkitCompassHeading !== undefined) {
        setHeading(anyE.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };

    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      setNeedsPermission(true);
    } else if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handler);
    }

    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  // حساب القبلة عند اختيار مدينة
  useEffect(() => {
    if (mode === 'manual' && CITIES[selectedCity]) {
      const city = CITIES[selectedCity];
      setCoords({ lat: city.lat, lng: city.lng });
      setQibla(calculateQiblaDirection(city.lat, city.lng));
      setError(null);
    }
  }, [mode, selectedCity]);

  // محاولة أول مرة
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const isAligned = heading !== null && qibla !== null &&
    Math.abs(((qibla - heading + 540) % 360) - 180) > 175;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#0b2e22] via-[#0f3a2b] to-[#1a4a35] text-white py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* الهيدر */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕋</div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-l from-[#c9a227] to-[#e8c84a] bg-clip-text text-transparent">
            تحديد القبلة
          </h1>
          <p className="text-lg text-white/70">اتجاه القبلة من أي مكان في العالم</p>

          <div className="mt-6 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-[#c9a227]/30">
            <p className="text-xl leading-relaxed" style={{ fontFamily: 'Amiri, serif' }}>
              ﴿فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ﴾
            </p>
            <p className="text-sm text-white/60 mt-2">سورة البقرة — الآية 144</p>
          </div>
        </div>

        {/* اختيار الوضع */}
        <div className="flex gap-3 mb-8 bg-white/5 p-2 rounded-2xl">
          <button
            onClick={() => { setMode('gps'); getLocation(); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === 'gps'
                ? 'bg-[#c9a227] text-[#0b2e22] shadow-lg'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            📡 تحديد تلقائي (GPS)
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              mode === 'manual'
                ? 'bg-[#c9a227] text-[#0b2e22] shadow-lg'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            🏙️ اختر مدينتك
          </button>
        </div>

        {/* رسالة الخطأ */}
        {error && mode === 'gps' && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-5 mb-6 text-center">
            <p className="text-lg mb-4">⚠️ {error}</p>
            <button
              onClick={getLocation}
              className="px-6 py-2 bg-[#c9a227] text-[#0b2e22] rounded-xl font-bold hover:scale-105 transition"
            >
              🔄 إعادة المحاولة
            </button>
          </div>
        )}

        {/* اختيار المدينة */}
        {mode === 'manual' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <label className="block mb-3 font-bold text-[#c9a227]">اختر مدينتك:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0b2e22] border-2 border-[#c9a227]/50 text-white text-lg focus:border-[#c9a227] outline-none"
            >
              {Object.entries(CITIES).map(([key, city]) => (
                <option key={key} value={key}>{city.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* التحميل */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-5xl animate-spin mb-4">🕌</div>
            <p className="text-xl">جاري تحديد موقعك...</p>
          </div>
        )}

        {/* البوصلة */}
        {!loading && qibla !== null && (
          <>
            <div className="relative w-72 h-72 mx-auto mb-8">
              {/* حلقة البوصلة */}
              <div className="absolute inset-0 rounded-full border-8 border-[#c9a227]/40 bg-white/5 backdrop-blur"></div>

              {/* علامات الاتجاهات */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-[#c9a227]">ش</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xl font-bold text-white/40">غ</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xl font-bold text-white/40">ج</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xl font-bold text-white/40">ق</span>

              {/* سهم القبلة */}
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="absolute top-1/2 left-1/2 w-1.5 h-24 bg-gradient-to-t from-transparent to-[#c9a227] rounded-full origin-bottom"
                  style={{ transform: 'translate(-50%, -100%)' }}></div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-3xl">🕋</div>
              </div>

              {/* مؤشر اتجاه الهاتف */}
              {heading !== null && (
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `rotate(${heading}deg)` }}
                >
                  <div className="absolute top-1/2 left-1/2 w-1 h-28 bg-red-400/60 rounded-full origin-bottom"
                    style={{ transform: 'translate(-50%, -100%)' }}></div>
                </div>
              )}

              {/* المركز */}
              <div className="absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-[#c9a227] rounded-full shadow-lg"></div>
            </div>

            {/* المعلومات */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 text-center border border-[#c9a227]/30">
                <p className="text-sm text-white/60 mb-1">🧭 اتجاه القبلة</p>
                <p className="text-3xl font-bold text-[#c9a227]">{qibla.toFixed(1)}°</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 text-center border border-white/20">
                <p className="text-sm text-white/60 mb-1">📱 اتجاه هاتفك</p>
                <p className="text-3xl font-bold">
                  {heading !== null ? `${heading.toFixed(0)}°` : '—'}
                </p>
              </div>
            </div>

            {/* زر تفعيل البوصلة للآيفون */}
            {needsPermission && (
              <button
                onClick={enableCompass}
                className="w-full py-4 mb-6 bg-[#c9a227] text-[#0b2e22] rounded-2xl font-bold text-lg hover:scale-[1.02] transition shadow-xl"
              >
                🧭 تفعيل البوصلة
              </button>
            )}

            {/* رسالة المحاذاة */}
            {isAligned && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 text-center animate-pulse">
                <p className="text-2xl font-bold">✅ أنت الآن باتجاه القبلة!</p>
              </div>
            )}

            {heading === null && !needsPermission && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl p-4 text-center text-sm text-white/80">
                💡 افتح الصفحة من الموبايل عشان تشتغل البوصلة الحية
              </div>
            )}
          </>
        )}

        {/* زر الرجوع */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/20"
          >
            → العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}