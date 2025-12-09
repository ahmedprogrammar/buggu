import React, { useRef } from 'react';
import { LucideIcon, UploadCloud, X } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: LucideIcon; action?: React.ReactNode }> = ({ children, className = '', title, icon: Icon, action }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden ${className}`}>
    {title && (
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
           {Icon && <Icon className="w-5 h-5 text-gold-600" />}
           {title}
        </h3>
        {action}
      </div>
    )}
    <div className="p-5">
      {children}
    </div>
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/20 border border-transparent",
    secondary: "bg-gold-500 text-white hover:bg-gold-600 shadow-lg shadow-gold-500/20 border border-transparent",
    outline: "bg-transparent border-2 border-navy-900 text-navy-900 hover:bg-navy-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <span className="animate-spin text-xl">⏳</span> : children}
    </button>
  );
};

// --- Input ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: LucideIcon }> = ({ label, icon: Icon, className = '', ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-semibold text-slate-600">{label}</label>}
    <div className="relative">
        {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
        <input 
            className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all placeholder:text-slate-400 ${Icon ? 'pr-12' : ''}`}
            {...props}
        />
    </div>
  </div>
);

// --- Select ---
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: {value: string, label: string}[] }> = ({ label, options, className = '', ...props }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-600">{label}</label>}
      <div className="relative">
          <select 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 appearance-none transition-all"
              {...props}
          >
              {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
          </div>
      </div>
    </div>
);

// --- File Upload ---
export const FileUpload: React.FC<{ 
    label?: string; 
    accept?: string; 
    onFileSelect: (file: File) => void;
    selectedFile?: File | null;
    onClear?: () => void;
}> = ({ label, accept, onFileSelect, selectedFile, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-semibold text-slate-600">{label}</label>}
            
            {!selectedFile ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-gold-500 transition-all text-slate-500"
                >
                    <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm font-medium">اضغط لرفع ملف</span>
                    <span className="text-xs text-slate-400 mt-1">{accept ? accept.replace(/,/g, ' ') : 'صور أو فيديو'}</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept={accept} 
                        onChange={handleFileChange} 
                    />
                </div>
            ) : (
                <div className="relative bg-slate-100 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-500 font-bold shrink-0">
                            {selectedFile.type.split('/')[1].toUpperCase().slice(0, 4)}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    {onClear && (
                        <button onClick={onClear} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'gold' | 'purple' }> = ({ children, color = 'blue' }) => {
    const colors = {
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-rose-100 text-rose-700 border-rose-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gold: 'bg-amber-100 text-amber-700 border-amber-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colors[color]}`}>
            {children}
        </span>
    );
};