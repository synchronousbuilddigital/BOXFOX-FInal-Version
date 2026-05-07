import dbConnect from '@/lib/mongodb';
import BoxCategory from '@/models/BoxCategory';
import BoxProductGroup from '@/models/BoxProductGroup';
import BoxProduct from '@/models/BoxProduct';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const categories = await BoxCategory.find().lean();
    const groups = await BoxProductGroup.find().lean();
    const products = await BoxProduct.find().lean();
    
    const data = categories.map(c => {
      const cGroups = groups.filter(g => g.categoryId.toString() === c._id.toString()).map(g => {
        const gProducts = products.filter(p => p.groupId.toString() === g._id.toString());
        return { ...g, products: gProducts };
      });
      return { ...c, groups: cGroups };
    });
    
    return NextResponse.json({ success: true, data });
  } catch(e) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
