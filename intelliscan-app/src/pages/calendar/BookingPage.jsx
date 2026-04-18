import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { Clock, Calendar, Globe, CheckCircle2, Loader2, ChevronLeft, ChevronRight, User, Mail, MessageSquare } from 'lucide-react';

export default function BookingPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState('date'); // 'date' | 'details' | 'success'
  const [bookingStatus, setBookingStatus] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookingData();
  }, [slug]);

  const fetchBookingData = async () => {
    try {
      const res = await fetch(`/api/calendar/booking/${slug}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error('Failed to fetch booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingStatus('booking');
    try {
      // Simulate booking API call
      await new Promise(r => setTimeout(r, 1500));
      setStep('success');
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBookingStatus(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <Loader2 className="animate-spin text-brand-500" size={48} />
    </div>
  );

  if (!data?.booking_link) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-6 text-center">
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">404 - Link Not Found</h1>
      <p className="text-gray-400 mb-8 max-w-sm">This booking link is invalid or has been deactivated by the host.</p>
      <Link to="/" className="px-8 py-3 bg-brand-600 rounded-2xl font-black uppercase text-sm">Back to Home</Link>
    </div>
  );

  const { booking_link, host } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#dde2f3] flex items-center justify-center p-4 selection:bg-brand-600">
      <div className="w-full max-w-5xl bg-[#0e131f] border border-gray-800 rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] animate-in zoom-in-95 duration-500">
        
        {/* Left Section: Host Info */}
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 p-10 bg-gradient-to-br from-[#0e131f] to-[#151c2c]">
          <div className="w-16 h-16 rounded-3xl bg-brand-600 flex items-center justify-center mb-8 shadow-xl shadow-brand-500/20">
            <span className="text-2xl font-black text-white">{host.name.charAt(0)}</span>
          </div>
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{host.name}</h2>
          <h1 className="text-3xl font-black text-white leading-tight mb-8">{booking_link.title}</h1>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
              <Clock size={18} className="text-brand-500" />
              <span>{booking_link.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
              <Globe size={18} className="text-brand-500" />
              <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
              {booking_link.description || "Pick a time that works for you. I'm looking forward to our meeting!"}
            </p>
          </div>
        </div>

        {/* Right Section: Scheduler */}
        <div className="flex-1 p-10 flex flex-col">
          {step === 'date' && (
            <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
              <h2 className="text-2xl font-black text-white mb-8">Select Date & Time</h2>
              <div className="flex flex-col md:flex-row gap-10 h-full">
                {/* Simple Calendar View */}
                <div className="flex-1">
                  <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {['S','M','T','W','T','F','S'].map(d => (
                      <span key={d} className="text-[10px] font-black text-gray-500 uppercase">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const day = addDays(new Date(), i);
                      const isSelected = isSameDay(day, selectedDate);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(day)}
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                            isSelected ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/20 scale-110' : 'hover:bg-gray-800 text-gray-400'
                          }`}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="w-full md:w-56 h-full overflow-y-auto style-scrollbar pr-2">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Available Slots</h3>
                  <div className="space-y-3">
                    {['09:00', '10:00', '11:30', '13:00', '14:30', '16:00'].map(time => (
                      <button
                        key={time}
                        onClick={() => { setSelectedSlot(time); setStep('details'); }}
                        className="w-full py-4 text-center bg-gray-900 border border-gray-800 rounded-2xl text-sm font-black hover:border-brand-500 hover:text-brand-400 transition-all active:scale-95 group"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => setStep('date')}
                className="flex items-center gap-2 text-xs font-black text-brand-500 uppercase tracking-widest mb-8 hover:text-brand-400 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Selection
              </button>
              <h2 className="text-2xl font-black text-white mb-2">Confirm Details</h2>
              <p className="text-sm font-bold text-brand-500 mb-8 uppercase tracking-widest">
                {format(selectedDate, 'eeee, MMMM do')} at {selectedSlot}
              </p>

              <form onSubmit={handleBook} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <User size={12} className="text-brand-600" /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-6 py-4 bg-[#0a0a0f] border border-gray-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <Mail size={12} className="text-brand-600" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-6 py-4 bg-[#0a0a0f] border border-gray-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} className="text-brand-600" /> Meeting Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-6 py-4 bg-[#0a0a0f] border border-gray-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                    placeholder="Topic of discussion..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingStatus === 'booking'}
                  className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {bookingStatus === 'booking' ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Booking'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center mb-8">
                 <CheckCircle2 size={48} className="text-emerald-500" />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4">You're Booked!</h1>
               <p className="text-gray-400 text-lg font-medium max-w-sm mb-8 leading-relaxed">
                 A calendar invitation has been sent to <strong>{form.email}</strong>. We're looking forward to seeing you.
               </p>
               <div className="p-6 bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm text-center">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Meeting Confirmed For</p>
                 <p className="text-xl font-bold text-white mb-1">{format(selectedDate, 'eeee, MMMM do')}</p>
                 <p className="text- brand-500 font-bold">{selectedSlot} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
