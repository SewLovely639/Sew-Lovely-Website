import { readContent } from "@sew-lovely/cms";
import { CustomerInfoPage } from "../components/customer-info-page";

export const metadata = { title: "Sizing Guide | Sew Lovely", description: "How to measure yourself and use Sew Lovely’s indicative clothing size guide." };
export const dynamic = "force-dynamic";

export default async function SizingGuidePage() {
  const { site, products } = await readContent();
  return <CustomerInfoPage site={site} products={products} title="Sizing guide" intro="Use this guide as a starting point. Fit varies by design, fabric, cut and intended ease, so always check the size options and fit notes on the individual product page." sections={[
    { title: "Indicative body measurements", paragraphs: ["The measurements below are a general women’s ready-to-wear reference in centimetres, not garment measurements. Sew Lovely product sizing may differ, especially for Indian occasion wear, relaxed silhouettes and unstitched pieces."], bullets: ["S: bust 84–88 cm · waist 66–70 cm · hips 92–96 cm", "M: bust 89–93 cm · waist 71–75 cm · hips 97–101 cm", "L: bust 94–99 cm · waist 76–81 cm · hips 102–107 cm", "XL: bust 100–106 cm · waist 82–88 cm · hips 108–114 cm", "XXL: bust 107–114 cm · waist 89–96 cm · hips 115–122 cm"] },
    { title: "How to measure", paragraphs: ["Use a flexible tape measure over light clothing, keep it level, and avoid pulling it tight. Ask someone to help for more consistent results."], bullets: ["Bust: measure around the fullest part of your chest, keeping the tape parallel to the floor.", "Waist: measure around your natural waist, usually the narrowest point of your torso.", "Hips: measure around the fullest part of your hips and seat, with feet together.", "For length or sleeve fit, compare a well-fitting garment with the product details or contact us before ordering."] },
    { title: "Choosing a size", paragraphs: ["Compare your body measurements with the product’s size information. If you fall between sizes, consider the garment’s cut, fabric and fit notes; for a fitted or non-stretch style, the larger size may provide more ease. Do not rely on the letter size alone because sizing is not identical across brands or designs."] },
    { title: "Custom and unstitched pieces", paragraphs: ["For made-to-measure or alteration requests, confirm which measurements are needed with our team before work begins. Follow the instructions for the specific garment and provide current, accurate measurements. If you are unsure, contact us and we’ll help you decide what to measure."] },
  ]} />;
}
