import { GoldInfo } from "@/lib/api/products";

interface GoldInfoCardProps {
  goldInfo: GoldInfo;
  productType: "coin" | "melted_gold";
}

export default function GoldInfoCard({
  goldInfo,
  productType,
}: GoldInfoCardProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-4">
      <h3 className="text-lg font-semibold text-amber-900 mb-3">
        {productType === "coin" ? "🪙 مشخصات سکه" : "📊 مشخصات شمش"}
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* ✨ نوع سکه (denomination) - فقط برای سکه */}
        {productType === "coin" && goldInfo.denomination && (
          <div className="col-span-2">
            <span className="text-gray-600">نوع:</span>
            <span className="font-medium mr-2 bg-amber-100 text-amber-800 px-2 py-1 rounded">
              {goldInfo.denomination}
            </span>
          </div>
        )}

        {goldInfo.weight && (
          <div>
            <span className="text-gray-600">وزن:</span>
            <span className="font-medium mr-2">{goldInfo.weight} گرم</span>
          </div>
        )}

        {goldInfo.purity && (
          <div>
            <span className="text-gray-600">خلوص:</span>
            <span className="font-medium mr-2">{goldInfo.purity}</span>
          </div>
        )}

        {goldInfo.mintYear && (
          <div>
            <span className="text-gray-600">سال ضرب:</span>
            <span className="font-medium mr-2">{goldInfo.mintYear}</span>
          </div>
        )}

        {goldInfo.certificate && (
          <div className="col-span-2">
            <span className="text-gray-600">شماره گواهی:</span>
            <span className="font-medium mr-2 font-mono">
              {goldInfo.certificate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

