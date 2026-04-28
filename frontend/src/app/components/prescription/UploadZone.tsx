import { useState } from "react";

export function UploadZone({ onImageUpload }: { onImageUpload: (imageUrl: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[800px] w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-4 border-dashed rounded-2xl p-16 text-center transition-all ${
          isDragging
            ? "border-[#E85D2A] bg-[#E85D2A]/5"
            : "border-gray-300 bg-white/50"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="text-7xl">📋</div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Upload prescription image
            </h3>
            <p className="text-gray-600">
              Supports handwritten Indian doctor slips
            </p>
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="bg-[#E9C46A] px-8 py-4 rounded-xl border border-[#d4b25f] shadow-sm hover:bg-[#dbb860] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all font-semibold">
              Upload Image
            </div>
          </label>

          <p className="text-sm text-gray-500">
            Or drag and drop your prescription here
          </p>
        </div>
      </div>
    </div>
  );
}
