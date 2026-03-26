import { X } from 'lucide-react';

export default function PartnerDetailsModal({ partner, onClose }) {
  if (!partner) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-slate-200 text-3xl font-black text-slate-500 flex items-center justify-center">
            {partner.photoURL ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" /> : partner.name.charAt(0)}
          </div>
          <h3 className="text-2xl font-black text-slate-900">{partner.name}</h3>
          <p className="text-slate-500 font-medium">{partner.email}</p>
          <p className="text-slate-500 font-medium">{partner.phone}</p>
          <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${partner.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {partner.status}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
          <div className="flex">
            <span className="w-24 font-bold text-slate-500">Address:</span>
            <span className="flex-1 text-slate-700 font-medium">{partner.address}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-bold text-slate-500">Joined:</span>
            <span className="flex-1 text-slate-700 font-medium">{new Date(partner.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}