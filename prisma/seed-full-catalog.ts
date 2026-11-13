// Full-catalog seed for Nandhini Tex — populates the DB with all 105 products
// extracted from the uploaded catalog (upload/Pasted Content_1794548420617.txt).
// Replaces the starter seed data in prisma/seed.ts.
//
// Run: bun run db:seed-full

import { PrismaClient } from "@prisma/client";
import seedImages from "../seed-images.json";

const db = new PrismaClient();

type ImgKey = keyof typeof seedImages;
const IMG = seedImages as Record<ImgKey, string[]>;

// ---------------------------------------------------------------------------
// Catalog data — 105 products extracted from the uploaded catalog file.
// ---------------------------------------------------------------------------
type CatalogProduct = {
  id: number;
  sku: string;
  title: string;
  category: string;
  subcategory: string;
  fabric: string;
  color: string;
  price_inr: number;
  blouse_included: boolean;
  bulk_available: boolean;
};

const CATALOG_PRODUCTS: CatalogProduct[] = /* 105 items extracted from upload/Pasted Content_1794548420617.txt */[{"id":1,"sku":"SNTDWS01","title":"Tissue Soft Silk Saree with Rich Zari Buttas & Grand Pallu","category":"Silk Varieties","subcategory":"Tissue Soft Silk","fabric":"Tissue Soft Silk","color":"Gold & Maroon","price_inr":850,"blouse_included":true,"bulk_available":false},{"id":2,"sku":"SNTPSK102","title":"Premium Semi Kanchi Silk Saree - Magenta Pink with Lavender Border","category":"Silk Varieties","subcategory":"Semi Kanchi Silk","fabric":"Semi Kanchi Silk","color":"Magenta Pink","price_inr":699,"blouse_included":true,"bulk_available":false},{"id":3,"sku":"SNTELS01","title":"Elampillai Silk Saree for Festive & Wedding Wear","category":"Silk Varieties","subcategory":"Elampillai Silk","fabric":"Elampillai Silk","color":"Royal Blue","price_inr":699,"blouse_included":true,"bulk_available":true},{"id":4,"sku":"SNTKSS002","title":"Premium Kanchi Soft Silk Saree - Peacock Green & Rani Pink","category":"Silk Varieties","subcategory":"Kanchi Silk Saree","fabric":"Kanchi Soft Silk","color":"Peacock Green","price_inr":750,"blouse_included":true,"bulk_available":false},{"id":5,"sku":"SNTWAS88","title":"Premium Warm Silk Saree in Pastel Shades","category":"Silk Varieties","subcategory":"Warm Silk","fabric":"Warm Silk","color":"Pastel Peach","price_inr":650,"blouse_included":true,"bulk_available":false},{"id":6,"sku":"SNTESP001","title":"Premium Elampillai Subhamugurtha Pattu Saree - Ivory & Bridal Pink","category":"Bridal & Pattu","subcategory":"Subhamugurtha Pattu","fabric":"Bridal Pattu","color":"Ivory Cream","price_inr":1300,"blouse_included":true,"bulk_available":false},{"id":7,"sku":"SNTESP001A","title":"Premium Elampillai Subhalakshana Pattu Saree - Rose Pink & Temple Green","category":"Bridal & Pattu","subcategory":"Subhalakshana Pattu","fabric":"Bridal Pattu","color":"Rose Pink","price_inr":1350,"blouse_included":true,"bulk_available":false},{"id":8,"sku":"NTKC001","title":"Khadi Cotton Pallu Jari Saree","category":"Cotton Collections","subcategory":"Khadi Cotton","fabric":"Khadi Cotton","color":"Mustard Yellow","price_inr":349,"blouse_included":true,"bulk_available":true},{"id":9,"sku":"NTKC002","title":"Half-and-Half Striped Khadi Cotton Saree","category":"Cotton Collections","subcategory":"Khadi Cotton","fabric":"Khadi Cotton","color":"Teal & Cream","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":10,"sku":"NTKC003","title":"Checked Pattern Full Jari Khadi Cotton Saree","category":"Cotton Collections","subcategory":"Khadi Cotton","fabric":"Khadi Cotton","color":"Emerald Green","price_inr":449,"blouse_included":true,"bulk_available":true},{"id":11,"sku":"NTKL001","title":"Traditional Kollam Uniform Saree","category":"Cotton Collections","subcategory":"Kollam Sarees","fabric":"Cotton Blend","color":"Maroon & Gold","price_inr":479,"blouse_included":true,"bulk_available":true},{"id":12,"sku":"NTFP001","title":"Festive Foil Print Saree","category":"Fancy & Printed","subcategory":"Foil Print","fabric":"Softy Cotton","color":"Navy Blue","price_inr":349,"blouse_included":true,"bulk_available":true},{"id":13,"sku":"NTFS001","title":"Rust Orange Festive Woven Saree","category":"Silk Varieties","subcategory":"Festive Silk","fabric":"Soft Silk Blend","color":"Rust Orange","price_inr":549,"blouse_included":true,"bulk_available":true},{"id":14,"sku":"SNTSMP01","title":"Samudhrikha Pattu Bridal Saree - Crimson Red & Gold Zari","category":"Bridal & Pattu","subcategory":"Samudhrikha Pattu","fabric":"Elampillai Pattu","color":"Crimson Red","price_inr":1450,"blouse_included":true,"bulk_available":false},{"id":15,"sku":"SNTSMP02","title":"Samudhrikha Pattu Bridal Saree - Bottle Green & Mustard","category":"Bridal & Pattu","subcategory":"Samudhrikha Pattu","fabric":"Elampillai Pattu","color":"Bottle Green","price_inr":1450,"blouse_included":true,"bulk_available":false},{"id":16,"sku":"SNTSMP03","title":"Samudhrikha Pattu Bridal Saree - Royal Purple & Silver Zari","category":"Bridal & Pattu","subcategory":"Samudhrikha Pattu","fabric":"Elampillai Pattu","color":"Royal Purple","price_inr":1499,"blouse_included":true,"bulk_available":false},{"id":17,"sku":"SNTSMP04","title":"Samudhrikha Pattu Bridal Saree - Deep Maroon & Copper","category":"Bridal & Pattu","subcategory":"Samudhrikha Pattu","fabric":"Elampillai Pattu","color":"Deep Maroon","price_inr":1499,"blouse_included":true,"bulk_available":false},{"id":18,"sku":"SNTMYL01","title":"Elampillai Mayil Pattu Peacock Motif Saree - Turquoise Blue","category":"Bridal & Pattu","subcategory":"Peacock Bridal","fabric":"Bridal Silk","color":"Turquoise Blue","price_inr":1250,"blouse_included":true,"bulk_available":false},{"id":19,"sku":"SNTMYL02","title":"Elampillai Mayil Pattu Peacock Motif Saree - Rani Pink","category":"Bridal & Pattu","subcategory":"Peacock Bridal","fabric":"Bridal Silk","color":"Rani Pink","price_inr":1250,"blouse_included":true,"bulk_available":false},{"id":20,"sku":"SNTMYL03","title":"Elampillai Mayil Pattu Peacock Motif Saree - Golden Yellow","category":"Bridal & Pattu","subcategory":"Peacock Bridal","fabric":"Bridal Silk","color":"Golden Yellow","price_inr":1299,"blouse_included":true,"bulk_available":false},{"id":21,"sku":"SNTSLV01","title":"Silver Bridal Zari Pattu Saree - Lavender Mist","category":"Bridal & Pattu","subcategory":"Silver Bridal Sarees","fabric":"Bridal Pattu","color":"Lavender","price_inr":1550,"blouse_included":true,"bulk_available":false},{"id":22,"sku":"SNTSLV02","title":"Silver Bridal Zari Pattu Saree - Mint Green","category":"Bridal & Pattu","subcategory":"Silver Bridal Sarees","fabric":"Bridal Pattu","color":"Mint Green","price_inr":1550,"blouse_included":true,"bulk_available":false},{"id":23,"sku":"SNTSLV03","title":"Silver Bridal Zari Pattu Saree - Midnight Blue","category":"Bridal & Pattu","subcategory":"Silver Bridal Sarees","fabric":"Bridal Pattu","color":"Midnight Blue","price_inr":1599,"blouse_included":true,"bulk_available":false},{"id":24,"sku":"SNT1GM01","title":"One Gram Gold Zari Bridal Saree - Temple Red","category":"Bridal & Pattu","subcategory":"One Gram Sarees","fabric":"One Gram Silk","color":"Temple Red","price_inr":1650,"blouse_included":true,"bulk_available":false},{"id":25,"sku":"SNT1GM02","title":"One Gram Gold Zari Bridal Saree - Emerald & Pink","category":"Bridal & Pattu","subcategory":"One Gram Sarees","fabric":"One Gram Silk","color":"Emerald Green","price_inr":1650,"blouse_included":true,"bulk_available":false},{"id":26,"sku":"SNT2GM01","title":"Two Gram Grand Bridal Silk Saree - Ruby Maroon","category":"Bridal & Pattu","subcategory":"2 Gram Bridal Saree","fabric":"Two Gram Silk","color":"Ruby Maroon","price_inr":2150,"blouse_included":true,"bulk_available":false},{"id":27,"sku":"SNT2GM02","title":"Two Gram Grand Bridal Silk Saree - Burnt Orange & Gold","category":"Bridal & Pattu","subcategory":"2 Gram Bridal Saree","fabric":"Two Gram Silk","color":"Burnt Orange","price_inr":2150,"blouse_included":true,"bulk_available":false},{"id":28,"sku":"SNTMUL01","title":"Mulberry Bridal Soft Silk Saree - Wine Purple","category":"Bridal & Pattu","subcategory":"Mulberry Bridal","fabric":"Mulberry Silk Blend","color":"Wine Purple","price_inr":1750,"blouse_included":true,"bulk_available":false},{"id":29,"sku":"SNTMUL02","title":"Mulberry Bridal Soft Silk Saree - Sandalwood Cream","category":"Bridal & Pattu","subcategory":"Mulberry Bridal","fabric":"Mulberry Silk Blend","color":"Sandalwood","price_inr":1750,"blouse_included":true,"bulk_available":false},{"id":30,"sku":"SNTVIV01","title":"VIVAAHA Bridal Couple Combo - Pattu Saree & Vesti Shirt Set (Gold/Maroon)","category":"Ethnic Sets & Combos","subcategory":"VIVAAHA Bridal","fabric":"Bridal Silk & Cotton","color":"Gold & Maroon","price_inr":1999,"blouse_included":true,"bulk_available":false},{"id":31,"sku":"SNTVIV02","title":"VIVAAHA Bridal Couple Combo - Pattu Saree & Vesti Shirt Set (Off-White/Red)","category":"Ethnic Sets & Combos","subcategory":"VIVAAHA Bridal","fabric":"Bridal Silk & Cotton","color":"Off-White & Red","price_inr":1999,"blouse_included":true,"bulk_available":false},{"id":32,"sku":"SNTVIV03","title":"VIVAAHA Bridal Couple Combo - Pattu Saree & Vesti Shirt Set (Peacock Blue)","category":"Ethnic Sets & Combos","subcategory":"VIVAAHA Bridal","fabric":"Bridal Silk & Cotton","color":"Peacock Blue","price_inr":2099,"blouse_included":true,"bulk_available":false},{"id":33,"sku":"SNTKUB01","title":"Kubera Pattu Pochampalli Border Saree - Magenta","category":"Silk Varieties","subcategory":"Kubera Pattu Saree","fabric":"Kubera Pattu","color":"Magenta","price_inr":799,"blouse_included":true,"bulk_available":true},{"id":34,"sku":"SNTKUB02","title":"Kubera Pattu Pochampalli Border Saree - Parrot Green","category":"Silk Varieties","subcategory":"Kubera Pattu Saree","fabric":"Kubera Pattu","color":"Parrot Green","price_inr":799,"blouse_included":true,"bulk_available":true},{"id":35,"sku":"SNTKUB03","title":"Kubera Pattu Pochampalli Border Saree - Royal Blue","category":"Silk Varieties","subcategory":"Kubera Pattu Saree","fabric":"Kubera Pattu","color":"Royal Blue","price_inr":799,"blouse_included":true,"bulk_available":true},{"id":36,"sku":"SNTKUB04","title":"Kubera Pattu Pochampalli Border Saree - Mustard Gold","category":"Silk Varieties","subcategory":"Kubera Pattu Saree","fabric":"Kubera Pattu","color":"Mustard Gold","price_inr":825,"blouse_included":true,"bulk_available":true},{"id":37,"sku":"SNTBNR01","title":"Banarasi Mashru Silk Saree - Deep Wine","category":"Silk Varieties","subcategory":"Banarasi Mashru Silk","fabric":"Mashru Silk","color":"Deep Wine","price_inr":1050,"blouse_included":true,"bulk_available":false},{"id":38,"sku":"SNTBNR02","title":"Banarasi Mashru Silk Saree - Teal Green","category":"Silk Varieties","subcategory":"Banarasi Mashru Silk","fabric":"Mashru Silk","color":"Teal Green","price_inr":1050,"blouse_included":true,"bulk_available":false},{"id":39,"sku":"SNTBNR03","title":"Banarasi Mashru Silk Saree - Antique Gold","category":"Silk Varieties","subcategory":"Banarasi Mashru Silk","fabric":"Mashru Silk","color":"Antique Gold","price_inr":1050,"blouse_included":true,"bulk_available":false},{"id":40,"sku":"SNTBNR04","title":"Banarasi Mashru Silk Saree - Coral Pink","category":"Silk Varieties","subcategory":"Banarasi Mashru Silk","fabric":"Mashru Silk","color":"Coral Pink","price_inr":1050,"blouse_included":true,"bulk_available":false},{"id":41,"sku":"SNTTHB01","title":"Premium Thousand Buttas Soft Silk Saree - Crimson","category":"Silk Varieties","subcategory":"Thousand Buttas","fabric":"Soft Silk","color":"Crimson","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":42,"sku":"SNTTHB02","title":"Premium Thousand Buttas Soft Silk Saree - Navy Blue","category":"Silk Varieties","subcategory":"Thousand Buttas","fabric":"Soft Silk","color":"Navy Blue","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":43,"sku":"SNTTHB03","title":"Premium Thousand Buttas Soft Silk Saree - Olive Green","category":"Silk Varieties","subcategory":"Thousand Buttas","fabric":"Soft Silk","color":"Olive Green","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":44,"sku":"SNTVRO01","title":"Traditional Vairaoosi Striped Silk Saree - Mango Yellow","category":"Silk Varieties","subcategory":"VairaOosi Sarees","fabric":"Vairaoosi Silk","color":"Mango Yellow","price_inr":950,"blouse_included":true,"bulk_available":false},{"id":45,"sku":"SNTVRO02","title":"Traditional Vairaoosi Striped Silk Saree - Ruby Red","category":"Silk Varieties","subcategory":"VairaOosi Sarees","fabric":"Vairaoosi Silk","color":"Ruby Red","price_inr":950,"blouse_included":true,"bulk_available":false},{"id":46,"sku":"SNTVRO03","title":"Traditional Vairaoosi Striped Silk Saree - Emerald","category":"Silk Varieties","subcategory":"VairaOosi Sarees","fabric":"Vairaoosi Silk","color":"Emerald","price_inr":950,"blouse_included":true,"bulk_available":false},{"id":47,"sku":"SNTNLM01","title":"Neelambari Silk Saree with Temple Border - Indigo","category":"Silk Varieties","subcategory":"Neelambari Silk Saree","fabric":"Neelambari Silk","color":"Indigo","price_inr":780,"blouse_included":true,"bulk_available":false},{"id":48,"sku":"SNTNLM02","title":"Neelambari Silk Saree with Temple Border - Plum","category":"Silk Varieties","subcategory":"Neelambari Silk Saree","fabric":"Neelambari Silk","color":"Plum","price_inr":780,"blouse_included":true,"bulk_available":false},{"id":49,"sku":"SNTMYR01","title":"Mayura Silk Saree with Woven Floral Pallu - Peach","category":"Silk Varieties","subcategory":"Mayura Silk Sarees","fabric":"Mayura Silk","color":"Peach","price_inr":720,"blouse_included":true,"bulk_available":false},{"id":50,"sku":"SNTMYR02","title":"Mayura Silk Saree with Woven Floral Pallu - Sky Blue","category":"Silk Varieties","subcategory":"Mayura Silk Sarees","fabric":"Mayura Silk","color":"Sky Blue","price_inr":720,"blouse_included":true,"bulk_available":false},{"id":51,"sku":"SNTSNG01","title":"Madurai Sungudi Cotton Saree - Maroon & Mustard","category":"Cotton Collections","subcategory":"Sungudi Cotton","fabric":"Sungudi Cotton","color":"Maroon","price_inr":299,"blouse_included":false,"bulk_available":true},{"id":52,"sku":"SNTSNG02","title":"Madurai Sungudi Cotton Saree - Green & Red Border","category":"Cotton Collections","subcategory":"Sungudi Cotton","fabric":"Sungudi Cotton","color":"Dark Green","price_inr":299,"blouse_included":false,"bulk_available":true},{"id":53,"sku":"SNTSNG03","title":"Madurai Sungudi Cotton Saree with Zari Border - Navy Blue","category":"Cotton Collections","subcategory":"Sungudi Cotton","fabric":"Sungudi Cotton","color":"Navy Blue","price_inr":350,"blouse_included":true,"bulk_available":true},{"id":54,"sku":"SNTSNG04","title":"Madurai Sungudi Cotton Saree with Zari Border - Black & Red","category":"Cotton Collections","subcategory":"Sungudi Cotton","fabric":"Sungudi Cotton","color":"Black","price_inr":350,"blouse_included":true,"bulk_available":true},{"id":55,"sku":"SNTNRP01","title":"Narayanapet Cotton Saree with Temple Zari Border - Coffee Brown","category":"Cotton Collections","subcategory":"Narayanapet Cotton","fabric":"Narayanapet Cotton","color":"Coffee Brown","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":56,"sku":"SNTNRP02","title":"Narayanapet Cotton Saree with Temple Zari Border - Brick Red","category":"Cotton Collections","subcategory":"Narayanapet Cotton","fabric":"Narayanapet Cotton","color":"Brick Red","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":57,"sku":"SNTNRP03","title":"Narayanapet Cotton Saree with Temple Zari Border - Violet","category":"Cotton Collections","subcategory":"Narayanapet Cotton","fabric":"Narayanapet Cotton","color":"Violet","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":58,"sku":"SNTNRP04","title":"Narayanapet Cotton Saree with Temple Zari Border - Forest Green","category":"Cotton Collections","subcategory":"Narayanapet Cotton","fabric":"Narayanapet Cotton","color":"Forest Green","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":59,"sku":"SNTKLY01","title":"Kalyani Cotton Saree with Contrast Korvai Border - Off-White & Red","category":"Cotton Collections","subcategory":"Kalyani Cotton","fabric":"Kalyani Cotton","color":"Off-White","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":60,"sku":"SNTKLY02","title":"Kalyani Cotton Saree with Contrast Korvai Border - Grey & Pink","category":"Cotton Collections","subcategory":"Kalyani Cotton","fabric":"Kalyani Cotton","color":"Grey","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":61,"sku":"SNTKLY03","title":"Kalyani Cotton Saree with Contrast Korvai Border - Yellow & Green","category":"Cotton Collections","subcategory":"Kalyani Cotton","fabric":"Kalyani Cotton","color":"Yellow","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":62,"sku":"SNTMHS01","title":"Maheshwari Cotton Silk Saree with Zari Checks - Lavender","category":"Cotton Collections","subcategory":"Maheshwari Cotton","fabric":"Maheshwari Cotton","color":"Lavender","price_inr":520,"blouse_included":true,"bulk_available":true},{"id":63,"sku":"SNTMHS02","title":"Maheshwari Cotton Silk Saree with Zari Checks - Peach","category":"Cotton Collections","subcategory":"Maheshwari Cotton","fabric":"Maheshwari Cotton","color":"Peach","price_inr":520,"blouse_included":true,"bulk_available":true},{"id":64,"sku":"SNTMHS03","title":"Maheshwari Cotton Silk Saree with Zari Checks - Sage Green","category":"Cotton Collections","subcategory":"Maheshwari Cotton","fabric":"Maheshwari Cotton","color":"Sage Green","price_inr":520,"blouse_included":true,"bulk_available":true},{"id":65,"sku":"SNTTRD01","title":"Daily Wear Traditional Cotton Saree - Blue Floral","category":"Cotton Collections","subcategory":"Cotton Sarees","fabric":"Pure Cotton","color":"Blue","price_inr":199,"blouse_included":false,"bulk_available":true},{"id":66,"sku":"SNTTRD02","title":"Daily Wear Traditional Cotton Saree - Red Geometric","category":"Cotton Collections","subcategory":"Cotton Sarees","fabric":"Pure Cotton","color":"Red","price_inr":199,"blouse_included":false,"bulk_available":true},{"id":67,"sku":"SNTTRD03","title":"Daily Wear Traditional Cotton Saree - Green Stripes","category":"Cotton Collections","subcategory":"Cotton Sarees","fabric":"Pure Cotton","color":"Green","price_inr":249,"blouse_included":true,"bulk_available":true},{"id":68,"sku":"SNTLNN01","title":"Shimmer Linen Cotton Saree with Silver Zari - Rose Gold","category":"Cotton Collections","subcategory":"Linen Cotton","fabric":"Linen Cotton","color":"Rose Gold","price_inr":420,"blouse_included":true,"bulk_available":true},{"id":69,"sku":"SNTLNN02","title":"Shimmer Linen Cotton Saree with Silver Zari - Ice Blue","category":"Cotton Collections","subcategory":"Linen Cotton","fabric":"Linen Cotton","color":"Ice Blue","price_inr":420,"blouse_included":true,"bulk_available":true},{"id":70,"sku":"SNTLNN03","title":"Shimmer Linen Cotton Saree with Silver Zari - Lilac","category":"Cotton Collections","subcategory":"Linen Cotton","fabric":"Linen Cotton","color":"Lilac","price_inr":420,"blouse_included":true,"bulk_available":true},{"id":71,"sku":"SNTSPC01","title":"Space Silk Festive Saree with Embossed Buttas - Copper","category":"Silk Varieties","subcategory":"Space Silk","fabric":"Space Silk","color":"Copper","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":72,"sku":"SNTSPC02","title":"Space Silk Festive Saree with Embossed Buttas - Teal","category":"Silk Varieties","subcategory":"Space Silk","fabric":"Space Silk","color":"Teal","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":73,"sku":"SNTSPC03","title":"Space Silk Festive Saree with Embossed Buttas - Magenta","category":"Silk Varieties","subcategory":"Space Silk","fabric":"Space Silk","color":"Magenta","price_inr":399,"blouse_included":true,"bulk_available":true},{"id":74,"sku":"SNTBTR01","title":"Butterfly Cut Work Designer Saree - Onion Pink","category":"Fancy & Printed","subcategory":"Fancy Sarees","fabric":"Georgette Silk","color":"Onion Pink","price_inr":499,"blouse_included":true,"bulk_available":false},{"id":75,"sku":"SNTBTR02","title":"Butterfly Cut Work Designer Saree - Sea Green","category":"Fancy & Printed","subcategory":"Fancy Sarees","fabric":"Georgette Silk","color":"Sea Green","price_inr":499,"blouse_included":true,"bulk_available":false},{"id":76,"sku":"SNTBTR03","title":"Butterfly Cut Work Designer Saree - Wine","category":"Fancy & Printed","subcategory":"Fancy Sarees","fabric":"Georgette Silk","color":"Wine","price_inr":499,"blouse_included":true,"bulk_available":false},{"id":77,"sku":"SNTNCK01","title":"Necklace Design Zari Woven Soft Silk Saree - Rama Green","category":"Silk Varieties","subcategory":"Soft Silk","fabric":"Soft Silk","color":"Rama Green","price_inr":750,"blouse_included":true,"bulk_available":false},{"id":78,"sku":"SNTNCK02","title":"Necklace Design Zari Woven Soft Silk Saree - Ruby Pink","category":"Silk Varieties","subcategory":"Soft Silk","fabric":"Soft Silk","color":"Ruby Pink","price_inr":750,"blouse_included":true,"bulk_available":false},{"id":79,"sku":"SNTNCK03","title":"Necklace Design Zari Woven Soft Silk Saree - Peacock Blue","category":"Silk Varieties","subcategory":"Soft Silk","fabric":"Soft Silk","color":"Peacock Blue","price_inr":750,"blouse_included":true,"bulk_available":false},{"id":80,"sku":"SNTDGS01","title":"Digital Softy Floral Print Saree - Cream & Rose","category":"Fancy & Printed","subcategory":"Digital Softy Saree","fabric":"Digital Softy","color":"Cream","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":81,"sku":"SNTDGS02","title":"Digital Softy Floral Print Saree - Mint & Peach","category":"Fancy & Printed","subcategory":"Digital Softy Saree","fabric":"Digital Softy","color":"Mint","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":82,"sku":"SNTDGS03","title":"Digital Softy Floral Print Saree - Powder Blue","category":"Fancy & Printed","subcategory":"Digital Softy Saree","fabric":"Digital Softy","color":"Powder Blue","price_inr":450,"blouse_included":true,"bulk_available":true},{"id":83,"sku":"SNTGRG01","title":"Georgette Fancy Saree with Satin Border - Black","category":"Fancy & Printed","subcategory":"Georgette Fancy Saree","fabric":"Georgette","color":"Black","price_inr":480,"blouse_included":true,"bulk_available":false},{"id":84,"sku":"SNTGRG02","title":"Georgette Fancy Saree with Satin Border - Maroon","category":"Fancy & Printed","subcategory":"Georgette Fancy Saree","fabric":"Georgette","color":"Maroon","price_inr":480,"blouse_included":true,"bulk_available":false},{"id":85,"sku":"SNTGRG03","title":"Georgette Fancy Saree with Satin Border - Emerald","category":"Fancy & Printed","subcategory":"Georgette Fancy Saree","fabric":"Georgette","color":"Emerald","price_inr":480,"blouse_included":true,"bulk_available":false},{"id":86,"sku":"SNTCLB01","title":"Celebrity Inspired Nita Ambani Style Tissue Saree - Gold","category":"Celebrity Collections","subcategory":"Nita Ambani Inspired","fabric":"Tissue Silk","color":"Gold","price_inr":1150,"blouse_included":true,"bulk_available":false},{"id":87,"sku":"SNTCLB02","title":"Celebrity Inspired Jyothika Style Linen Cotton Saree - Mustard","category":"Celebrity Collections","subcategory":"Jyothika Inspired","fabric":"Linen Cotton","color":"Mustard","price_inr":599,"blouse_included":true,"bulk_available":false},{"id":88,"sku":"SNTCLB03","title":"Celebrity Inspired Jyothika Style Linen Cotton Saree - Teal","category":"Celebrity Collections","subcategory":"Jyothika Inspired","fabric":"Linen Cotton","color":"Teal","price_inr":599,"blouse_included":true,"bulk_available":false},{"id":89,"sku":"SNTHLF01","title":"Traditional Elampillai Half Saree Set - Silver Grey & Black","category":"Ethnic Sets & Combos","subcategory":"Half Sarees","fabric":"Art Silk","color":"Silver Grey","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":90,"sku":"SNTHLF02","title":"Traditional Elampillai Half Saree Set - Parrot Green & Pink","category":"Ethnic Sets & Combos","subcategory":"Half Sarees","fabric":"Art Silk","color":"Parrot Green","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":91,"sku":"SNTHLF03","title":"Traditional Elampillai Half Saree Set - Royal Blue & Gold","category":"Ethnic Sets & Combos","subcategory":"Half Sarees","fabric":"Art Silk","color":"Royal Blue","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":92,"sku":"SNTHLF04","title":"Traditional Elampillai Half Saree Set - Crimson & Cream","category":"Ethnic Sets & Combos","subcategory":"Half Sarees","fabric":"Art Silk","color":"Crimson","price_inr":899,"blouse_included":true,"bulk_available":false},{"id":93,"sku":"SNTVST01","title":"Traditional Cotton Vesti & Matching Shirt Combo - Cream Gold Border","category":"Ethnic Sets & Combos","subcategory":"Vesti Shirt","fabric":"Pure Cotton","color":"Cream & Gold","price_inr":650,"blouse_included":false,"bulk_available":true},{"id":94,"sku":"SNTVST02","title":"Traditional Tissue Vesti & Matching Shirt Combo - Sandal Gold","category":"Ethnic Sets & Combos","subcategory":"Vesti Shirt","fabric":"Tissue Cotton","color":"Sandal Gold","price_inr":750,"blouse_included":false,"bulk_available":true},{"id":95,"sku":"SNTVST03","title":"Color Matching Silk Cotton Vesti & Shirt Set - Maroon Border","category":"Ethnic Sets & Combos","subcategory":"Vesti Shirt","fabric":"Silk Cotton","color":"Off-White & Maroon","price_inr":799,"blouse_included":false,"bulk_available":true},{"id":96,"sku":"SNTSEM01","title":"Semi Kancheepuram Soft Cotton Saree - Temple Green","category":"Cotton Collections","subcategory":"Semi Kancheepuram Cotton","fabric":"Silk Cotton","color":"Temple Green","price_inr":550,"blouse_included":true,"bulk_available":true},{"id":97,"sku":"SNTSEM02","title":"Semi Kancheepuram Soft Cotton Saree - Mustard & Maroon","category":"Cotton Collections","subcategory":"Semi Kancheepuram Cotton","fabric":"Silk Cotton","color":"Mustard","price_inr":550,"blouse_included":true,"bulk_available":true},{"id":98,"sku":"SNTSEM03","title":"Semi Kancheepuram Soft Cotton Saree - Navy & Pink","category":"Cotton Collections","subcategory":"Semi Kancheepuram Cotton","fabric":"Silk Cotton","color":"Navy Blue","price_inr":550,"blouse_included":true,"bulk_available":true},{"id":99,"sku":"NTKC004","title":"Khadi Cotton Temple Border Uniform Saree - Sandal & Red","category":"Cotton Collections","subcategory":"Khadi Cotton","fabric":"Khadi Cotton","color":"Sandal","price_inr":379,"blouse_included":true,"bulk_available":true},{"id":100,"sku":"NTKC005","title":"Khadi Cotton Floral Printed Saree - Sky Blue","category":"Cotton Collections","subcategory":"Khadi Cotton","fabric":"Khadi Cotton","color":"Sky Blue","price_inr":369,"blouse_included":true,"bulk_available":true},{"id":101,"sku":"NTKL002","title":"Onam Special Kerala Kasavu Kollam Saree - Off-White & Gold","category":"Cotton Collections","subcategory":"Kollam Sarees","fabric":"Kasavu Cotton","color":"Off-White & Gold","price_inr":499,"blouse_included":true,"bulk_available":true},{"id":102,"sku":"NTKL003","title":"Kerala Kasavu Mural Print Saree - Cream & Green","category":"Cotton Collections","subcategory":"Kollam Sarees","fabric":"Kasavu Cotton","color":"Cream","price_inr":549,"blouse_included":true,"bulk_available":true},{"id":103,"sku":"SNTSTN01","title":"Stone Work Border Soft Silk Saree - Ruby Red","category":"Silk Varieties","subcategory":"Stone Work Silk","fabric":"Soft Silk","color":"Ruby Red","price_inr":499,"blouse_included":true,"bulk_available":false},{"id":104,"sku":"SNTSTN02","title":"Stone Work Border Soft Silk Saree - Peacock Green","category":"Silk Varieties","subcategory":"Stone Work Silk","fabric":"Soft Silk","color":"Peacock Green","price_inr":499,"blouse_included":true,"bulk_available":false},{"id":105,"sku":"SNTRYT01","title":"Women's Ethnic Printed Rayon Kurti Top - Indigo","category":"Ethnic Sets & Combos","subcategory":"Rayon Tops","fabric":"Rayon","color":"Indigo","price_inr":299,"blouse_included":false,"bulk_available":true}];

// ---------------------------------------------------------------------------
// Category mapping — catalog "category" values → slugs, copy & image keys.
// ---------------------------------------------------------------------------
const CATEGORY_META: Record<string, { slug: string; desc: string; imgKey: ImgKey }> = {
  "Silk Varieties": {
    slug: "silk-varieties",
    desc: "A rich palette of handwoven silk sarees from Elampillai — soft silk, Kubera Pattu, Vairaoosi, Banarasi Mashru, Neelambari and more.",
    imgKey: "softSilk",
  },
  "Bridal & Pattu": {
    slug: "bridal",
    desc: "Grand bridal pattu sarees with rich zari work — Samudhrikha Pattu, Mayil Pattu, Silver Bridal, One Gram and Two Gram silks woven for your big day.",
    imgKey: "bridal",
  },
  "Cotton Collections": {
    slug: "cotton-sarees",
    desc: "Breathable handloom cotton sarees — Khadi, Sungudi, Narayanapet, Kalyani, Maheshwari and Kerala Kasavu — for daily elegance and festive comfort.",
    imgKey: "cotton",
  },
  "Fancy & Printed": {
    slug: "designer",
    desc: "Trendy fancy and printed sarees — butterfly cut work, digital softy prints and georgette drapes with a modern flair.",
    imgKey: "designer",
  },
  "Ethnic Sets & Combos": {
    slug: "combos",
    desc: "Ready-to-celebrate ethnic sets — VIVAAHA bridal couple combos, traditional half saree sets, vesti & shirt sets and everyday kurtis.",
    imgKey: "couple",
  },
  "Celebrity Collections": {
    slug: "celebrity",
    desc: "Celebrity-inspired weaves recreated by Elampillai weavers — Nita Ambani style tissue and Jyothika style linen cotton sarees.",
    imgKey: "designer",
  },
};
const CATEGORY_ORDER = ["Silk Varieties", "Bridal & Pattu", "Cotton Collections", "Fancy & Printed", "Ethnic Sets & Combos", "Celebrity Collections"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function discountPct(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function pick(arr: string[], i: number): string {
  return arr[i % arr.length];
}

function twoImages(arr: string[], i: number): string[] {
  return [pick(arr, i), pick(arr, i + 1)];
}

// Deterministic PRNG (mulberry32) so repeated seeds produce identical data.
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20250601);

// Pre-drawn random selections: "New Arrival" tag on 15 random products,
// "Bestseller" tag on 20 random products (independent of the every-Nth flags).
const shuffled = CATALOG_PRODUCTS.map((_, i) => i);
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const NEW_ARRIVAL_TAG_SET = new Set(shuffled.slice(0, 15));
const BESTSELLER_TAG_SET = new Set(shuffled.slice(15, 35));

// ---------------------------------------------------------------------------
// Color handling — split color field, map to hex
// ---------------------------------------------------------------------------
function splitColors(color: string): string[] {
  return color
    .split(/\s*[&,]\s*/)
    .map((c) => c.trim())
    .filter(Boolean);
}

const COLOR_HEX: Record<string, string> = {
  gold: "#D4AF37",
  "antique gold": "#A07E16",
  "mustard gold": "#C9A227",
  "rose gold": "#B76E79",
  maroon: "#7A1F2B",
  "deep maroon": "#5C1420",
  "ruby maroon": "#6B1220",
  pink: "#E8B7C4",
  "magenta pink": "#B32D6B",
  "rose pink": "#C2587A",
  "rani pink": "#D4346B",
  "ruby pink": "#C2366B",
  "coral pink": "#F37D6A",
  "onion pink": "#DE8CA5",
  peach: "#F3B39A",
  "pastel peach": "#F5C6AC",
  blue: "#1E3A6B",
  "royal blue": "#1E3A6B",
  navy: "#081B3A",
  "navy blue": "#081B3A",
  "midnight blue": "#13294B",
  "sky blue": "#7EB3E0",
  "ice blue": "#A8D3EE",
  "powder blue": "#9FC4E8",
  "peacock blue": "#1E5F74",
  "turquoise blue": "#1C9BB5",
  indigo: "#26415E",
  green: "#3F6B4A",
  emerald: "#0F5F5C",
  "emerald green": "#0F5F2E",
  teal: "#0F5F5C",
  "teal green": "#0F5F5C",
  "dark green": "#1B4D2E",
  "bottle green": "#1E4620",
  "forest green": "#1E4620",
  "parrot green": "#5DA03F",
  "rama green": "#3E8E5A",
  "sage green": "#8FAE8B",
  mint: "#8FCDA8",
  "mint green": "#8FCDA8",
  "sea green": "#3F8E8C",
  "olive green": "#5C6B3B",
  "temple green": "#2E5E4E",
  red: "#B3261E",
  crimson: "#B3261E",
  "crimson red": "#A31C1C",
  "temple red": "#A31C1C",
  "ruby red": "#9B1B30",
  "brick red": "#A03A20",
  purple: "#5B2A6B",
  "royal purple": "#5B2A6B",
  wine: "#6B2140",
  "wine purple": "#5C2040",
  "deep wine": "#5C2040",
  violet: "#7A3E9D",
  plum: "#7A3B5E",
  lavender: "#B57EDC",
  "lavender mist": "#C9B6E4",
  lilac: "#B99BC9",
  yellow: "#E0BE4A",
  "golden yellow": "#E0BE4A",
  "mango yellow": "#F5A623",
  mustard: "#C9A227",
  "mustard yellow": "#C9A227",
  orange: "#E65100",
  "burnt orange": "#C45213",
  rust: "#B7410E",
  "rust orange": "#B7410E",
  copper: "#B06537",
  white: "#F3EDE2",
  "off-white": "#F3EDE2",
  cream: "#F0E6D2",
  ivory: "#F3EDE2",
  "ivory cream": "#F3EDE2",
  sandal: "#E8D5B0",
  sandalwood: "#E8D5B0",
  "sandal gold": "#E3CDA4",
  black: "#292929",
  grey: "#8B8680",
  gray: "#8B8680",
  "silver grey": "#A9A9A9",
  magenta: "#C2587A",
};

// Fallback keywords (checked longest-first) for color names not in the exact map.
const COLOR_KEYS_BY_LENGTH = Object.keys(COLOR_HEX).sort((a, b) => b.length - a.length);

function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - (s * Math.min(l, 1 - l)) * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return hslToHex(h % 360, 0.45 + (h % 25) / 100, 0.35 + (h % 20) / 100);
}

function colorHex(name: string): string {
  const key = name.toLowerCase().trim();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  for (const k of COLOR_KEYS_BY_LENGTH) {
    if (key.includes(k)) return COLOR_HEX[k];
  }
  return hashColor(key);
}

// ---------------------------------------------------------------------------
// Product field derivation
// ---------------------------------------------------------------------------
function weaveOriginFor(p: CatalogProduct): string {
  // Covers both "Kanchi..." and "Kancheepuram..." spellings in titles.
  return /kanch(i|ee)/i.test(p.title) ? "Kanchipuram" : "Elampillai";
}

function weaveDaysFor(p: CatalogProduct): number {
  if (p.title.toLowerCase().includes("kanchi") || p.category === "Bridal & Pattu") return 7;
  if (p.fabric.toLowerCase().includes("cotton")) return 3;
  return 5;
}

function zariTypeFor(p: CatalogProduct): string {
  if (p.price_inr > 5000) return "Real zari";
  if (p.fabric.toLowerCase().includes("cotton") && p.price_inr < 500) return "Gold print";
  return "Tested zari";
}

function imagesFor(p: CatalogProduct, i: number): string[] {
  if (p.category === "Silk Varieties") {
    const isKanchi = p.title.toLowerCase().includes("kanchi");
    return twoImages(isKanchi ? IMG.kanchipuram : IMG.softSilk, i);
  }
  const meta = CATEGORY_META[p.category];
  return twoImages(IMG[meta ? meta.imgKey : "softSilk"], i);
}

function buildDescription(p: CatalogProduct, zari: string, blouse: boolean): string {
  const colors = splitColors(p.color);
  const c1 = colors[0] ?? "vivid";
  const c2 = colors[1] ?? "";
  const fabric = p.fabric;
  const title = p.title.toLowerCase();

  // Menswear sets
  if (/vesti|shirt/i.test(p.title)) {
    return `Handwoven in Elampillai, this ${fabric.toLowerCase()} vesti and shirt set comes in an elegant ${c1.toLowerCase()} tone with a contrasting woven border. The breathable weave keeps you comfortable through long muhurtham mornings and reception evenings. A coordinated classic for weddings, festivals and auspicious occasions.`;
  }
  // Kurti tops
  if (title.includes("kurti")) {
    return `A breezy ${fabric} kurti in a lovely ${c1.toLowerCase()} shade, printed and finished by the Nandhini Tex studio in Elampillai. Cut for all-day comfort, it pairs effortlessly with leggings, palazzos or jeans. A versatile everyday pick for office, college and casual festive outings.`;
  }

  const withAccents = c2 ? ` with ${c2.toLowerCase()} accents` : "";
  const s1 = [
    `Handwoven on traditional looms in Elampillai, this ${p.subcategory} in ${c1.toLowerCase()}${withAccents} showcases the finest ${fabric} craftsmanship.`,
    `Woven by the master weavers of Elampillai, this ${fabric} beauty pairs a captivating ${c1.toLowerCase()} colourway with a richly detailed border and pallu.`,
    `A true expression of South Indian handloom heritage, this ${fabric} drape is woven over several days on traditional pit looms in Elampillai.`,
  ][p.id % 3];

  const s2 = [
    `Rich ${zari.toLowerCase()} work traces elegant motifs across the body and pallu, catching the light with every graceful movement.`,
    `The intricate ${zari.toLowerCase()} border lends a regal finish, while the soft, flowing weave drapes beautifully on every silhouette.`,
    `Subtle ${zari.toLowerCase()} detailing adds depth and shimmer, giving this piece an understated, heirloom-quality elegance.`,
  ][(p.id + 1) % 3];

  const s3 = blouse
    ? [
        "Lightweight and easy to drape, it is a natural choice for weddings, festive gatherings and temple visits — a matching 0.8 m blouse piece is included.",
        "Perfect for weddings, receptions and family functions, this saree ships with a matching 0.8 m running blouse piece for a ready-to-wear finish.",
        "Dress it up with jewellery for a grand occasion or keep it simple for a pooja at home — the accompanying 0.8 m blouse piece completes the look.",
      ][p.id % 3]
    : [
        "Easy to care for and effortless to style, it is a smart pick for daily wear, office wear and casual festive occasions (blouse piece not included).",
        "A budget-friendly, low-maintenance drape for everyday elegance — note that this saree does not include a blouse piece.",
        "Comfortable through long days, this saree suits school, office and daily errands alike; blouse piece sold separately.",
      ][p.id % 3];

  return `${s1} ${s2} ${s3}`;
}

// ---------------------------------------------------------------------------
// Review / testimonial / FAQ / coupon seed data (carried over from seed.ts)
// ---------------------------------------------------------------------------
const reviewSeeds = [
  { author: "Priya Ramanathan", city: "Chennai", rating: 5, title: "Stunning weave and colour", body: "The saree exceeded my expectations. The zari work is gorgeous and it draped beautifully for my sister's wedding. Received so many compliments!", verified: true, featured: true },
  { author: "Lakshmi Narayanan", city: "Bengaluru", rating: 5, title: "Authentic Kanchipuram quality", body: "You can feel the quality of pure silk. The blouse piece matched perfectly. Will definitely buy again for my daughter's wedding.", verified: true, featured: true },
  { author: "Sneha Krishnan", city: "Coimbatore", rating: 4, title: "Lovely saree, fast delivery", body: "Beautiful colour and the fabric is soft. Delivery was quick and packaging was elegant. Took off one star only because I wished for more colour options.", verified: true, featured: false },
  { author: "Deepa Senthil", city: "Madurai", rating: 5, title: "Perfect bridal saree", body: "This was my wedding saree and it was everything I dreamed of. The gold zari shimmered beautifully in every photo. Thank you Nandhini Tex!", verified: true, featured: true },
  { author: "Anitha Ram", city: "Salem", rating: 5, title: "Great value for soft silk", body: "For the price, the quality is excellent. Wore it for a family function and it was comfortable all day. Highly recommend.", verified: true, featured: false },
  { author: "Kavitha Murthy", city: "Trichy", rating: 4, title: "Beautiful, slight colour variation", body: "The saree is lovely and well-woven. The shade was a touch different from the photo but still beautiful. Blouse piece was included as promised.", verified: true, featured: false },
  { author: "Revathi Subramaniam", city: "Erode", rating: 5, title: "Heirloom quality", body: "This is a saree I will pass down to my daughter. The craftsmanship is evident in every motif. Worth every rupee.", verified: true, featured: true },
  { author: "Divya Anand", city: "Vellore", rating: 5, title: "Exactly as shown", body: "Colour, border, zari — all exactly as in the photos. COD option made it stress-free to order. Very happy!", verified: true, featured: false },
];

const testimonials = [
  { name: "Meenakshi Iyer", city: "Chennai", quote: "Nandhini Tex sarees are my go-to for every family function. The weaves are authentic and the colours are exactly as shown.", rating: 5, featured: true },
  { name: "Saravanan & Kavitha", city: "Salem", quote: "Bought our entire wedding set from Nandhini Tex — bridal saree, dhoti, and combo. Quality and service were outstanding.", rating: 5, featured: true },
  { name: "Geetha Ramesh", city: "Coimbatore", quote: "I've been their customer for 3 years. Never disappointed. The COD option and 7-day returns give so much peace of mind.", rating: 5, featured: true },
  { name: "Vijaya Lakshmi", city: "Madurai", quote: "The Kanchipuram saree I bought for my daughter's wedding was the talk of the function. Thank you for the heirloom piece!", rating: 5, featured: true },
  { name: "Sundaram Pillai", city: "Trichy", quote: "Bought silk dhotis and shirts for my son's wedding. Excellent fit and finish. Will recommend to everyone.", rating: 5, featured: false },
  { name: "Rajalakshmi", city: "Erode", quote: "Beautiful soft silk sarees at honest prices. The blouse piece was included and matched perfectly.", rating: 5, featured: false },
];

const faqs = [
  { question: "Do you ship across India?", answer: "Yes! We ship pan-India via Delhivery, DTDC, and India Post. Free shipping on orders above ₹999. Most pincodes are serviceable for both prepaid and COD.", category: "Shipping", order: 1 },
  { question: "Is Cash on Delivery (COD) available?", answer: "Yes, COD is available across most serviceable pincodes. A nominal ₹40 surcharge applies on COD orders to cover handling. You can check COD availability for your pincode on the product page.", category: "COD", order: 2 },
  { question: "What is your return & exchange policy?", answer: "We offer 7-day returns on unused sarees with original tags and packaging intact. Bridal and offer sarees are eligible for exchange only. Initiate a return from your account or by calling our support line.", category: "Returns", order: 3 },
  { question: "What payment methods do you accept?", answer: "We accept UPI (GPay, PhonePe, Paytm), all major credit/debit cards, net banking, and Cash on Delivery. All prepaid payments are secured via our payment gateway.", category: "Payments", order: 4 },
  { question: "Does every saree come with a blouse piece?", answer: "Yes — every saree ships with an approximately 0.8 metre matching running blouse piece, unless explicitly mentioned otherwise. This is included at no extra cost.", category: "Sarees", order: 5 },
  { question: "How do I know the saree is authentic silk?", answer: "All our Kanchipuram and soft silk sarees are handwoven on traditional looms in Elampillai, Kanchipuram, and Arani. Pure silk sarees come with a Silk Mark assurance. Fabric and zari details are listed on each product page.", category: "Sarees", order: 6 },
  { question: "How should I care for my silk saree?", answer: "Dry clean only for the first wash. Store wrapped in a muslin cloth in a cool, dry place. Avoid direct sunlight and perfumes. Air the saree every few months and refold to prevent zari from snapping.", category: "Care", order: 7 },
  { question: "How long does weaving and delivery take?", answer: "In-stock sarees ship within 24–48 hours. Made-to-order and bridal sarees take 3–7 weaving days. Delivery typically takes 3–6 business days post-dispatch depending on your location.", category: "Shipping", order: 8 },
];

const coupons = [
  { code: "WELCOME10", description: "10% off on your first order", type: "percent", value: 10, minCartValue: 1500, usageLimit: 1000, perUserLimit: 1, active: true, expiresAt: new Date("2026-12-31") },
  { code: "FESTIVE15", description: "15% off on festive collection", type: "percent", value: 15, minCartValue: 3000, usageLimit: 500, perUserLimit: 2, active: true, expiresAt: new Date("2026-03-31") },
  { code: "FLAT500", description: "Flat ₹500 off on orders above ₹5000", type: "flat", value: 500, minCartValue: 5000, usageLimit: 300, perUserLimit: 1, active: true, expiresAt: new Date("2026-06-30") },
  { code: "BRIDAL25", description: "25% off on bridal collection", type: "percent", value: 25, minCartValue: 20000, usageLimit: 100, perUserLimit: 1, active: true, expiresAt: new Date("2026-12-31") },
];

const cities = ["Chennai", "Bengaluru", "Coimbatore", "Madurai", "Salem", "Trichy", "Erode", "Vellore", "Pondicherry", "Tirunelveli"];
const customerNames = ["Priya Ramanathan", "Lakshmi Narayanan", "Sneha Krishnan", "Deepa Senthil", "Anitha Ram", "Kavitha Murthy", "Revathi Subramaniam", "Divya Anand", "Saravanan Pillai", "Geetha Ramesh", "Vijaya Lakshmi", "Sundaram Pillai", "Rajalakshmi", "Meenakshi Iyer"];

function randPhone(): string {
  let p = "+91 9";
  for (let i = 0; i < 9; i++) p += Math.floor(Math.random() * 10);
  return p;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Seeding full catalog: ${CATALOG_PRODUCTS.length} products expected...`);
  if (CATALOG_PRODUCTS.length !== 105) {
    throw new Error(`Catalog data must contain 105 products, found ${CATALOG_PRODUCTS.length}`);
  }

  console.log("Clearing existing data...");
  await db.review.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.testimonial.deleteMany();
  await db.faq.deleteMany();
  await db.coupon.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.newsletterSubscriber.deleteMany();

  console.log("Creating categories...");
  const catIdMap: Record<string, string> = {};
  for (const catName of CATEGORY_ORDER) {
    const meta = CATEGORY_META[catName];
    if (!meta) throw new Error(`Missing CATEGORY_META for "${catName}"`);
    const created = await db.category.create({
      data: {
        name: catName,
        slug: meta.slug,
        description: meta.desc,
        bannerImage: pick(IMG[meta.imgKey], 0),
        sortOrder: CATEGORY_ORDER.indexOf(catName),
        productCount: 0,
      },
    });
    catIdMap[catName] = created.id;
  }

  console.log("Creating products, variants & reviews...");
  const usedSlugs = new Set<string>();
  let variantCount = 0;
  let reviewTotal = 0;
  let outOfStockProducts = 0;
  let lowStockProducts = 0;

  for (let i = 0; i < CATALOG_PRODUCTS.length; i++) {
    const p = CATALOG_PRODUCTS[i];

    // Slug (deduplicated for safety)
    let slug = slugify(p.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${p.sku.toLowerCase()}`;
    usedSlugs.add(slug);

    const zari = zariTypeFor(p);
    const description = buildDescription(p, zari, p.blouse_included);
    const mrpMultiplier = 1.4 + ((i * 7) % 5) * 0.05; // cycles 1.40 / 1.45 / 1.50 / 1.55 / 1.60
    const mrp = Math.round((p.price_inr * mrpMultiplier) / 10) * 10;
    const disc = discountPct(p.price_inr, mrp);
    const images = imagesFor(p, i);

    const tags: string[] = [p.category, "Handwoven"];
    if (NEW_ARRIVAL_TAG_SET.has(i)) tags.push("New Arrival");
    if (BESTSELLER_TAG_SET.has(i)) tags.push("Bestseller");
    if (p.bulk_available) tags.push("Bulk Available");

    const product = await db.product.create({
      data: {
        slug,
        title: p.title,
        description,
        shortDescription: description.split(". ")[0] + ".",
        categoryId: catIdMap[p.category],
        status: "published",
        basePrice: p.price_inr,
        mrp,
        discountPct: disc,
        fabricType: p.fabric,
        weaveOrigin: weaveOriginFor(p),
        weaveDays: weaveDaysFor(p),
        zariType: zari,
        careInstructions: "Dry clean only for the first wash. Store wrapped in muslin cloth in a cool, dry place. Avoid direct sunlight and perfumes. Refold periodically to keep the zari intact.",
        blouseIncluded: p.blouse_included,
        blouseLengthM: 0.8,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
        isBestseller: i % 5 === 0, // ~20 products
        isNew: i % 7 === 0, // ~15 products
        isFeatured: i % 10 === 0, // ~10 products
        rating: Math.round((4.2 + rng() * 0.7) * 10) / 10, // 4.2–4.9
        reviewCount: 15 + Math.floor(rng() * 136), // 15–150
        metaTitle: `${p.title} — Nandhini Tex`,
        metaDescription: description.slice(0, 150),
      },
    });

    // Variants — one per color parsed from the catalog color field.
    const colors = splitColors(p.color);
    // Stock policy: ~10% of products out of stock, ~15% low stock (1–4), rest 5–50.
    const outOfStock = i % 10 === 3;
    const lowStock = !outOfStock && (i % 20 === 4 || i % 20 === 9 || i % 20 === 14);
    if (outOfStock) outOfStockProducts++;
    if (lowStock) lowStockProducts++;

    for (const color of colors) {
      const stockQty = outOfStock ? 0 : lowStock ? 1 + Math.floor(rng() * 4) : 5 + Math.floor(rng() * 46);
      await db.variant.create({
        data: {
          productId: product.id,
          color,
          colorHex: colorHex(color),
          sku: `${p.sku}-${color.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
          stockQty,
        },
      });
      variantCount++;
    }

    // Reviews — 2-4 per product, drawn from the shared review seeds.
    const numReviews = 2 + (i % 3);
    for (let r = 0; r < numReviews; r++) {
      const rv = reviewSeeds[(i + r) % reviewSeeds.length];
      await db.review.create({
        data: {
          productId: product.id,
          authorName: rv.author,
          authorCity: rv.city,
          rating: rv.rating,
          title: rv.title,
          body: rv.body,
          status: "approved",
          verified: rv.verified,
          featured: rv.featured && r === 0,
          helpfulCount: Math.floor(rng() * 30),
        },
      });
      reviewTotal++;
    }

    // Update category count
    await db.category.update({ where: { id: catIdMap[p.category] }, data: { productCount: { increment: 1 } } });
  }

  console.log("Creating testimonials...");
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  console.log("Creating FAQs...");
  for (const f of faqs) {
    await db.faq.create({ data: { question: f.question, answer: f.answer, category: f.category, sortOrder: f.order } });
  }

  console.log("Creating coupons...");
  for (const c of coupons) {
    await db.coupon.create({ data: c });
  }

  console.log("Creating sample customers...");
  const customerIds: string[] = [];
  for (const name of customerNames) {
    const c = await db.customer.create({
      data: {
        name,
        phone: randPhone(),
        email: name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        city: cities[Math.floor(Math.random() * cities.length)],
        totalOrders: 1 + Math.floor(Math.random() * 8),
        totalSpent: 2000 + Math.floor(Math.random() * 45000),
        segment: Math.random() > 0.7 ? "vip" : Math.random() > 0.85 ? "bridal_lead" : "regular",
      },
    });
    customerIds.push(c.id);
  }

  console.log("Creating sample orders...");
  const orderStatuses = ["delivered", "delivered", "delivered", "shipped", "confirmed", "pending", "out_for_delivery", "cancelled"];
  const paymentMethods = ["cod", "upi", "card", "upi"];
  for (let i = 0; i < 24; i++) {
    const custName = customerNames[i % customerNames.length];
    const city = cities[i % cities.length];
    const status = orderStatuses[i % orderStatuses.length];
    const pay = paymentMethods[i % paymentMethods.length];
    const subtotal = 1500 + Math.floor(Math.random() * 30000);
    const discount = Math.random() > 0.6 ? Math.floor(subtotal * 0.1) : 0;
    const shipping = subtotal > 999 ? 0 : 60;
    const cod = pay === "cod" ? 40 : 0;
    const grand = subtotal - discount + shipping + cod;
    const daysAgo = Math.floor(Math.random() * 30);
    const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const orderNum = `NTX${created.getFullYear()}${String(1000 + i).padStart(4, "0")}`;

    await db.order.create({
      data: {
        orderNumber: orderNum,
        customerName: custName,
        customerPhone: randPhone(),
        customerEmail: custName.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        shippingAddress: JSON.stringify({ name: custName, line1: `${10 + i} ${city === "Chennai" ? "T Nagar" : "Gandhi Road"}`, city, state: "Tamil Nadu", pincode: `6000${10 + i}`, phone: randPhone() }),
        items: JSON.stringify([{ title: "Soft Silk Saree", variant: "Peacock Blue", qty: 1, price: subtotal, image: IMG.softSilk[0] }]),
        status,
        paymentStatus: status === "delivered" ? "paid" : status === "cancelled" ? "failed" : "pending",
        paymentMethod: pay,
        subtotal,
        discount,
        shippingFee: shipping,
        codSurcharge: cod,
        tax: 0,
        grandTotal: grand,
        couponCode: discount > 0 ? "WELCOME10" : null,
        courier: JSON.stringify(status === "delivered" || status === "shipped" || status === "out_for_delivery" ? { name: "Delhivery", awb: `DLV${Date.now()}${i}`, trackingUrl: "https://delhivery.com/track" } : {}),
        timeline: JSON.stringify([{ status: "pending", timestamp: created.toISOString(), note: "Order placed" }, ...(status !== "pending" ? [{ status: "confirmed", timestamp: new Date(created.getTime() + 3600000).toISOString(), note: "Order confirmed" }] : []), ...(status === "delivered" || status === "shipped" || status === "out_for_delivery" ? [{ status: "shipped", timestamp: new Date(created.getTime() + 86400000).toISOString(), note: "Dispatched via Delhivery" }] : []), ...(status === "delivered" ? [{ status: "delivered", timestamp: new Date(created.getTime() + 259200000).toISOString(), note: "Delivered" }] : [])]),
        createdAt: created,
      },
    });
  }

  console.log("Creating newsletter subscribers...");
  for (const name of ["anitha.r", "meena.k", "deepa.s", "kavi.m"]) {
    await db.newsletterSubscriber.create({ data: { email: name + "@gmail.com" } });
  }

  console.log("Full-catalog seed complete!");
  const counts = {
    categories: await db.category.count(),
    products: await db.product.count(),
    variants: await db.variant.count(),
    reviews: await db.review.count(),
    testimonials: await db.testimonial.count(),
    faqs: await db.faq.count(),
    coupons: await db.coupon.count(),
    orders: await db.order.count(),
    customers: await db.customer.count(),
    newsletterSubscribers: await db.newsletterSubscriber.count(),
  };
  console.log(counts);
  console.log(`Bestsellers: ${await db.product.count({ where: { isBestseller: true } })} | New arrivals: ${await db.product.count({ where: { isNew: true } })} | Featured: ${await db.product.count({ where: { isFeatured: true } })}`);
  console.log(`Out-of-stock products: ${outOfStockProducts} | Low-stock products: ${lowStockProducts}`);

  const byCat = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true, productCount: true } });
  console.log("Category breakdown:", byCat);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
