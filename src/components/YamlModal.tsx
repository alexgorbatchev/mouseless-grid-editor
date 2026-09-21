import { useState } from "react";

type YamlModalProps = {
  isOpen: boolean;
  onClose: () => void;
  yamlContent: string;
};

export function YamlModal({ isOpen, onClose, yamlContent }: YamlModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy YAML:", error);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([yamlContent], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grid_configs.yaml";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Mouseless grid_configs YAML</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg px-2 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          Paste this block into your <code className="text-blue-300 bg-[#2a2a2a] px-1 py-0.5 rounded">config.yaml</code>{" "}
          under the <code className="text-blue-300 bg-[#2a2a2a] px-1 py-0.5 rounded">grid_configs:</code> section:
        </p>
        <pre className="bg-[#121212] p-4 rounded border border-[#2e2e2e] text-green-400 font-mono text-xs overflow-x-auto max-h-80 select-all mb-4">
          {yamlContent}
        </pre>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] hover:border-gray-500 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Download .yaml
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-[#646cff] hover:bg-[#535bf2] text-white rounded text-sm font-medium transition-colors cursor-pointer"
          >
            {copied ? "✓ Copied to Clipboard" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
