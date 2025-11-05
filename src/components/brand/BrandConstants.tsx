import { Brand, BrandFormData } from '@/types';

export const BRAND_FORM_FIELDS = {
  name: { label: 'Brand Name', required: true, placeholder: 'Enter brand name' },
  description: { label: 'Description', required: false, placeholder: 'Enter brand description' },
  website: { label: 'Website', required: false, placeholder: 'Enter website URL' },
  contact_person: { label: 'Contact Person', required: false, placeholder: 'Enter contact person name' },
  contact_email: { label: 'Contact Email', required: false, placeholder: 'Enter contact email' },
  contact_phone: { label: 'Contact Phone', required: false, placeholder: 'Enter contact phone' }
};

export const BRAND_TABLE_COLUMNS = [
  {
    header: 'Logo',
    accessorKey: 'logo',
    width: '80px',
    minWidth: '80px',
    maxWidth: '80px',
    cell: (brand: Brand) => (
      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
        {brand.logo_url ? (
          <img 
            src={brand.logo_url} 
            alt={brand.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center text-gray-400 text-xs ${brand.logo_url ? 'hidden' : ''}`}>
          <span className="text-xs text-gray-500 font-medium">LOGO</span>
        </div>
      </div>
    )
  },
  {
    header: 'Name',
    accessorKey: 'name',
    width: '250px',
    minWidth: '200px',
    maxWidth: '300px',
    cell: (brand: Brand) => (
      <div className="min-w-0 max-w-full">
        <div className="font-medium break-words line-clamp-1">{brand.name}</div>
        {brand.description && (
          <div className="text-sm text-muted-foreground break-words line-clamp-1 mt-1">{brand.description}</div>
        )}
      </div>
    )
  },
  {
    header: 'Contact',
    accessorKey: 'contact',
    width: '200px',
    minWidth: '150px',
    cell: (brand: Brand) => (
      <div className="text-sm min-w-0">
        {brand.contact_person && <div className="break-words line-clamp-1">{brand.contact_person}</div>}
        {brand.contact_email && <div className="text-muted-foreground break-words line-clamp-1">{brand.contact_email}</div>}
        {brand.contact_phone && <div className="text-muted-foreground break-words line-clamp-1">{brand.contact_phone}</div>}
      </div>
    )
  },
  {
    header: 'Website',
    accessorKey: 'website',
    width: '200px',
    minWidth: '150px',
    cell: (brand: Brand) => brand.website ? (
      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words line-clamp-1 block">
        {brand.website}
      </a>
    ) : null
  },
  {
    header: 'Created',
    accessorKey: 'created_at',
    width: '120px',
    minWidth: '120px',
    maxWidth: '120px',
    cell: (brand: Brand) => new Date(brand.created_at).toLocaleDateString()
  }
];

export const INITIAL_BRAND_FORM_DATA: BrandFormData = {
  name: '',
  description: '',
  logo_url: '',
  website: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  business_id: ''
};