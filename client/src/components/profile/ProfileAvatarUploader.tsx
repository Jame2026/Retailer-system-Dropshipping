import React, { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

export interface ProfileAvatarUploaderProps {
  avatarUrl: string | null;
  displayName: string;
  uploading: boolean;
  onFilePicked: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileAvatarUploader: React.FC<ProfileAvatarUploaderProps> = ({
  avatarUrl,
  displayName,
  uploading,
  onFilePicked,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group w-24 h-24 sm:w-28 sm:h-28 shrink-0">
      <div className="w-full h-full rounded-2xl overflow-hidden ring-4 ring-white shadow-md bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/80 border border-teal-200/80 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl sm:text-4xl font-extrabold text-teal-700">
            {displayName[0]?.toUpperCase() || 'A'}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Upload a new photo"
        className="absolute inset-0 rounded-2xl bg-teal-950/40 opacity-0 group-hover:opacity-100 focus:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity disabled:cursor-wait"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <>
            <Camera className="w-5 h-5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Change
            </span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onFilePicked}
      />
    </div>
  );
};
