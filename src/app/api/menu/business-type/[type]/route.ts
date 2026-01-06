import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  return proxyGet(request, `/menu/items?business_type=${type}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : [];
        const transformedItems = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          action: item.action,
          icon: item.icon,
          color: item.color,
          bg_color: item.bg_color,
          business_type: item.business_type,
          requires_feature: item.requires_feature,
          user_roles: item.user_roles || [],
          sort_order: item.sort_order,
          is_active: item.is_active,
          category_id: item.category_id,
          category: item.category || item.menu_categories?.[0],
        }));

        const itemsByCategory = transformedItems.reduce((acc: any, item: any) => {
          const categoryName = item.category?.name || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(item);
          return acc;
        }, {} as Record<string, typeof transformedItems>);

        return {
          success: true,
          menu: {
            businessType: {
              business_type: type,
              name: type.charAt(0).toUpperCase() + type.slice(1),
              description: `${type} business configuration`,
              icon: 'Building2',
              color: 'text-gray-600',
              bg_color: 'bg-gray-50',
            },
            items: transformedItems,
            itemsByCategory,
          },
        };
      }
      return data;
    },
  });
}
